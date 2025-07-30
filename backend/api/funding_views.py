"""
Funding Application Views

This module contains all the API endpoints for managing founder funding applications,
including document uploads, media handling, application reviews, and AI-powered analysis.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Avg, Q
from django.utils import timezone
from decimal import Decimal
import logging

from .ai_business_analyzer import AIBusinessAnalyzer

from .models import (
    FundingApplication, FundingApplicationDocument, FundingApplicationMedia,
    ApplicationReview, FundingApplicationNote, User
)
from .serializers import (
    FundingApplicationSerializer, FundingApplicationCreateSerializer,
    FundingApplicationListSerializer, FundingApplicationDocumentSerializer,
    FundingApplicationMediaSerializer, DocumentUploadSerializer,
    MediaUploadSerializer, ApplicationReviewSerializer,
    FundingApplicationNoteSerializer, ApplicationAnalyticsSerializer
)
from .services import CreditScoringService
from .ai_business_analyzer import AIBusinessAnalyzer

logger = logging.getLogger(__name__)

# ============================================================================
# FUNDING APPLICATION MANAGEMENT
# ============================================================================

@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def funding_applications(request):
    """
    GET: List user's funding applications
    POST: Create new funding application
    """
    if request.method == 'GET':
        applications = FundingApplication.objects.filter(applicant=request.user)
        
        # Filter by status if provided
        status_filter = request.GET.get('status')
        if status_filter:
            applications = applications.filter(status=status_filter)
        
        # Search by business name
        search = request.GET.get('search')
        if search:
            applications = applications.filter(business_name__icontains=search)
        
        serializer = FundingApplicationListSerializer(applications, many=True)
        return Response({
            'message': 'Funding applications retrieved successfully.',
            'applications': serializer.data,
            'total_count': applications.count()
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = FundingApplicationCreateSerializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save(applicant=request.user)
            
            # Return full application data
            full_serializer = FundingApplicationSerializer(application)
            return Response({
                'message': 'Funding application created successfully.',
                'application': full_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'error': 'Invalid application data.',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def funding_application_detail(request, application_id):
    """
    GET: Retrieve funding application details
    PUT: Update funding application
    DELETE: Delete funding application (only if draft)
    """
    try:
        application = get_object_or_404(FundingApplication, id=application_id, applicant=request.user)
    except FundingApplication.DoesNotExist:
        return Response({
            'error': 'Funding application not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = FundingApplicationSerializer(application)
        return Response({
            'message': 'Application details retrieved successfully.',
            'application': serializer.data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        # Only allow updates if application is in draft or requires more info
        if application.status not in ['draft', 'requires_info']:
            return Response({
                'error': 'Cannot update application in current status.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = FundingApplicationCreateSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            updated_application = serializer.save()
            
            # Trigger AI analysis if significant changes
            if 'funding_amount_requested' in request.data or 'business_description' in request.data:
                analyze_application_with_ai.delay(application.id)
            
            full_serializer = FundingApplicationSerializer(updated_application)
            return Response({
                'message': 'Application updated successfully.',
                'application': full_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Invalid update data.',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if application.status != 'draft':
            return Response({
                'error': 'Can only delete draft applications.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        application.delete()
        return Response({
            'message': 'Application deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_funding_application(request, application_id):
    """Submit funding application for review"""
    try:
        application = get_object_or_404(FundingApplication, id=application_id, applicant=request.user)
    except FundingApplication.DoesNotExist:
        return Response({
            'error': 'Funding application not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if application.status != 'draft':
        return Response({
            'error': 'Application has already been submitted.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check minimum completion requirements
    if application.completion_percentage < 80:
        return Response({
            'error': 'Application must be at least 80% complete before submission.',
            'current_completion': f"{application.completion_percentage:.1f}%"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check for required documents
    required_docs = ['business_plan', 'financial_projections']
    uploaded_doc_types = list(application.documents.values_list('document_type', flat=True))
    missing_docs = [doc for doc in required_docs if doc not in uploaded_doc_types]
    
    if missing_docs:
        return Response({
            'error': 'Missing required documents.',
            'missing_documents': missing_docs
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Submit application
    application.status = 'submitted'
    application.submission_date = timezone.now()
    application.save()
    
    # Trigger AI analysis
    analyze_application_with_ai.delay(application.id)
    
    serializer = FundingApplicationSerializer(application)
    return Response({
        'message': 'Application submitted successfully. You will receive updates on the review process.',
        'application': serializer.data
    }, status=status.HTTP_200_OK)

# ============================================================================
# DOCUMENT MANAGEMENT
# ============================================================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_application_document(request, application_id):
    """Upload documents for funding application"""
    try:
        application = get_object_or_404(FundingApplication, id=application_id, applicant=request.user)
    except FundingApplication.DoesNotExist:
        return Response({
            'error': 'Funding application not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if application.status not in ['draft', 'requires_info']:
        return Response({
            'error': 'Cannot upload documents for application in current status.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = DocumentUploadSerializer(data=request.data)
    if serializer.is_valid():
        # Create document record
        document = FundingApplicationDocument.objects.create(
            application=application,
            document_type=serializer.validated_data['document_type'],
            file=serializer.validated_data['file'],
            description=serializer.validated_data.get('description', ''),
            original_filename=serializer.validated_data['file'].name
        )
        
        # Trigger AI document analysis
        analyze_document_with_ai.delay(document.id)
        
        doc_serializer = FundingApplicationDocumentSerializer(document)
        return Response({
            'message': 'Document uploaded successfully.',
            'document': doc_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Invalid document upload.',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def application_document_detail(request, application_id, document_id):
    """Get or delete specific application document"""
    try:
        application = get_object_or_404(FundingApplication, id=application_id, applicant=request.user)
        document = get_object_or_404(FundingApplicationDocument, id=document_id, application=application)
    except (FundingApplication.DoesNotExist, FundingApplicationDocument.DoesNotExist):
        return Response({
            'error': 'Document not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = FundingApplicationDocumentSerializer(document)
        return Response({
            'document': serializer.data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        if application.status not in ['draft', 'requires_info']:
            return Response({
                'error': 'Cannot delete documents for application in current status.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        document.delete()
        return Response({
            'message': 'Document deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)

# ============================================================================
# MEDIA MANAGEMENT
# ============================================================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_application_media(request, application_id):
    """Upload media files (pitch videos, presentations) for funding application"""
    try:
        application = get_object_or_404(FundingApplication, id=application_id, applicant=request.user)
    except FundingApplication.DoesNotExist:
        return Response({
            'error': 'Funding application not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if application.status not in ['draft', 'requires_info']:
        return Response({
            'error': 'Cannot upload media for application in current status.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = MediaUploadSerializer(data=request.data)
    if serializer.is_valid():
        # Create media record
        media = FundingApplicationMedia.objects.create(
            application=application,
            media_type=serializer.validated_data['media_type'],
            file=serializer.validated_data['file'],
            description=serializer.validated_data.get('description', ''),
            original_filename=serializer.validated_data['file'].name
        )
        
        # Trigger media processing (thumbnail generation, etc.)
        process_media_file.delay(media.id)
        
        media_serializer = FundingApplicationMediaSerializer(media)
        return Response({
            'message': 'Media uploaded successfully.',
            'media': media_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Invalid media upload.',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def application_media_detail(request, application_id, media_id):
    """Get or delete specific application media"""
    try:
        application = get_object_or_404(FundingApplication, id=application_id, applicant=request.user)
        media = get_object_or_404(FundingApplicationMedia, id=media_id, application=application)
    except (FundingApplication.DoesNotExist, FundingApplicationMedia.DoesNotExist):
        return Response({
            'error': 'Media not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = FundingApplicationMediaSerializer(media)
        return Response({
            'media': serializer.data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        if application.status not in ['draft', 'requires_info']:
            return Response({
                'error': 'Cannot delete media for application in current status.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        media.delete()
        return Response({
            'message': 'Media deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)

# ============================================================================
# AI ANALYSIS AND INSIGHTS
# ============================================================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_application_ai(request, application_id):
    """Trigger AI analysis of funding application"""
    try:
        application = get_object_or_404(FundingApplication, id=application_id, applicant=request.user)
    except FundingApplication.DoesNotExist:
        return Response({
            'error': 'Funding application not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Initialize AI analyzer
        analyzer = AIBusinessAnalyzer()
        
        # Perform comprehensive analysis
        analysis_result = analyzer.analyze_funding_application(application)
        
        # Update application with AI insights
        application.creditworthiness_score = analysis_result['creditworthiness_score']
        application.business_viability_score = analysis_result['business_viability_score']
        application.risk_assessment = analysis_result['risk_assessment']
        application.save()
        
        return Response({
            'message': 'AI analysis completed successfully.',
            'analysis': {
                'creditworthiness_score': analysis_result['creditworthiness_score'],
                'business_viability_score': analysis_result['business_viability_score'],
                'risk_assessment': analysis_result['risk_assessment'],
                'recommendations': analysis_result['recommendations'],
                'strengths': analysis_result['strengths'],
                'areas_for_improvement': analysis_result['areas_for_improvement']
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"AI analysis failed for application {application_id}: {str(e)}")
        return Response({
            'error': 'AI analysis failed. Please try again later.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_insights(request, application_id):
    """Get AI-generated insights for funding application"""
    try:
        application = get_object_or_404(FundingApplication, id=application_id, applicant=request.user)
    except FundingApplication.DoesNotExist:
        return Response({
            'error': 'Funding application not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Combine application data with user's financial profile
    insights = {
        'application_insights': {
            'creditworthiness_score': application.creditworthiness_score,
            'business_viability_score': application.business_viability_score,
            'risk_assessment': application.risk_assessment,
            'completion_status': {
                'percentage': application.completion_percentage,
                'missing_elements': get_missing_application_elements(application)
            }
        },
        'financial_profile': None,
        'recommendations': []
    }
    
    # Get user's credit score if available
    try:
        from .models import CreditScore
        credit_score = CreditScore.objects.filter(user=request.user).first()
        if credit_score:
            insights['financial_profile'] = {
                'credit_score': credit_score.score,
                'rating': credit_score.rating,
                'factors': credit_score.factors,
                'last_updated': credit_score.calculated_at.isoformat()
            }
            
            # Generate personalized recommendations
            insights['recommendations'] = generate_personalized_recommendations(application, credit_score)
    except Exception as e:
        logger.warning(f"Could not retrieve credit score for user {request.user.id}: {str(e)}")
    
    return Response({
        'message': 'Application insights retrieved successfully.',
        'insights': insights
    }, status=status.HTTP_200_OK)

# ============================================================================
# ADMIN VIEWS (Review and Management)
# ============================================================================

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_applications_list(request):
    """Admin view: List all funding applications with filtering"""
    applications = FundingApplication.objects.all().select_related('applicant')
    
    # Filter by status
    status_filter = request.GET.get('status')
    if status_filter:
        applications = applications.filter(status=status_filter)
    
    # Filter by industry
    industry_filter = request.GET.get('industry')
    if industry_filter:
        applications = applications.filter(industry=industry_filter)
    
    # Filter by funding stage
    funding_stage_filter = request.GET.get('funding_stage')
    if funding_stage_filter:
        applications = applications.filter(funding_stage=funding_stage_filter)
    
    # Search
    search = request.GET.get('search')
    if search:
        applications = applications.filter(
            Q(business_name__icontains=search) |
            Q(business_description__icontains=search) |
            Q(applicant__email__icontains=search)
        )
    
    # Ordering
    order_by = request.GET.get('order_by', '-created_at')
    applications = applications.order_by(order_by)
    
    serializer = FundingApplicationListSerializer(applications, many=True)
    return Response({
        'message': 'Applications retrieved successfully.',
        'applications': serializer.data,
        'total_count': applications.count()
    }, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAdminUser])
def funding_analytics(request):
    """Admin view: Get funding application analytics"""
    try:
        # Basic statistics
        total_applications = FundingApplication.objects.count()
        
        # Applications by status
        status_stats = FundingApplication.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        applications_by_status = {stat['status']: stat['count'] for stat in status_stats}
        
        # Applications by industry
        industry_stats = FundingApplication.objects.values('industry').annotate(
            count=Count('id')
        ).order_by('-count')
        applications_by_industry = {stat['industry']: stat['count'] for stat in industry_stats}
        
        # Applications by funding stage
        funding_stage_stats = FundingApplication.objects.values('funding_stage').annotate(
            count=Count('id')
        ).order_by('-count')
        applications_by_funding_stage = {stat['funding_stage']: stat['count'] for stat in funding_stage_stats}
        
        # Financial metrics
        funding_stats = FundingApplication.objects.aggregate(
            avg_funding_requested=Avg('funding_amount_requested'),
            total_funding_requested=Count('funding_amount_requested')
        )
        
        # Recent applications
        recent_applications = FundingApplication.objects.order_by('-created_at')[:10]
        
        analytics_data = {
            'total_applications': total_applications,
            'applications_by_status': applications_by_status,
            'applications_by_industry': applications_by_industry,
            'applications_by_funding_stage': applications_by_funding_stage,
            'average_funding_requested': funding_stats['avg_funding_requested'] or 0,
            'average_completion_rate': calculate_average_completion_rate(),
            'recent_applications': FundingApplicationListSerializer(recent_applications, many=True).data
        }
        
        serializer = ApplicationAnalyticsSerializer(analytics_data)
        return Response({
            'message': 'Analytics retrieved successfully.',
            'analytics': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error retrieving funding analytics: {str(e)}")
        return Response({
            'error': 'Error retrieving analytics.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_missing_application_elements(application):
    """Identify missing elements in funding application"""
    missing = []
    
    if not application.business_description or len(application.business_description) < 100:
        missing.append("Detailed business description")
    
    if not application.founder_experience or len(application.founder_experience) < 50:
        missing.append("Founder experience details")
    
    if not application.use_of_funds or len(application.use_of_funds) < 50:
        missing.append("Use of funds explanation")
    
    if not application.portfolio_website:
        missing.append("Portfolio/company website")
    
    if application.monthly_revenue == 0 and application.business_stage in ['early_revenue', 'growth']:
        missing.append("Revenue information")
    
    # Check for required documents
    doc_types = list(application.documents.values_list('document_type', flat=True))
    if 'business_plan' not in doc_types:
        missing.append("Business plan document")
    
    if 'financial_projections' not in doc_types:
        missing.append("Financial projections")
    
    return missing

def generate_personalized_recommendations(application, credit_score):
    """Generate personalized recommendations based on application and credit score"""
    recommendations = []
    
    # Credit score based recommendations
    if credit_score.score < 600:
        recommendations.append({
            'type': 'credit_improvement',
            'message': 'Consider improving your credit score before applying for larger funding amounts',
            'priority': 'high'
        })
    
    # Funding amount recommendations
    if application.funding_amount_requested > 10000000 and application.monthly_revenue < 100000:
        recommendations.append({
            'type': 'funding_amount',
            'message': 'Consider requesting a smaller amount initially and scaling up as revenue grows',
            'priority': 'medium'
        })
    
    # Business stage recommendations
    if application.business_stage == 'idea' and application.funding_stage != 'pre_seed':
        recommendations.append({
            'type': 'funding_stage',
            'message': 'For idea-stage companies, pre-seed funding might be more appropriate',
            'priority': 'medium'
        })
    
    return recommendations

def calculate_average_completion_rate():
    """Calculate average completion rate across all applications"""
    applications = FundingApplication.objects.all()
    if not applications.exists():
        return 0
    
    total_completion = sum(app.completion_percentage for app in applications)
    return total_completion / applications.count()

# ============================================================================
# CELERY TASKS (Placeholder - would be implemented with Celery)
# ============================================================================

def analyze_application_with_ai(application_id):
    """Celery task: Analyze funding application with AI"""
    try:
        from .models import FundingApplication
        application = FundingApplication.objects.get(id=application_id)
        
        # Initialize AI analyzer
        analyzer = AIBusinessAnalyzer()
        
        # Perform comprehensive analysis
        analysis_result = analyzer.analyze_funding_application(application)
        
        # Update application with AI insights
        application.creditworthiness_score = analysis_result['creditworthiness_score']
        application.business_viability_score = analysis_result['business_viability_score']
        application.risk_assessment = analysis_result['risk_assessment']
        application.ai_recommendations = analysis_result['recommendations']
        application.save()
        
        logger.info(f"AI analysis completed for application {application_id}")
        
    except Exception as e:
        logger.error(f"Celery AI analysis failed for application {application_id}: {str(e)}")

def analyze_document_with_ai(document_id):
    """Celery task: Analyze uploaded document with AI"""
    try:
        from .models import FundingApplicationDocument
        document = FundingApplicationDocument.objects.get(id=document_id)
        
        # AI document analysis would go here
        # For now, just mark as processed
        logger.info(f"Document {document_id} analyzed with AI")
        
    except Exception as e:
        logger.error(f"Document AI analysis failed for document {document_id}: {str(e)}")

def process_media_file(media_id):
    """Celery task: Process uploaded media file"""
    try:
        from .models import FundingApplicationMedia
        media = FundingApplicationMedia.objects.get(id=media_id)
        
        # Media processing (thumbnails, transcription, etc.) would go here
        # For now, just mark as processed
        logger.info(f"Media {media_id} processed")
        
    except Exception as e:
        logger.error(f"Media processing failed for media {media_id}: {str(e)}")
