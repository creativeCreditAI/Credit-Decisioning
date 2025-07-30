
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, authenticate
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer,
    CreditScoreSerializer,
    ScoreCalculationRequestSerializer,
    MPesaAccountLinkSerializer,
    MPesaAccountSerializer,
    MPesaTransactionSerializer,
    DataSyncRequestSerializer
)
from .models import User, CreditScore, MPesaAccount, MPesaTransaction
from .services import CreditScoringService
from .mpesa_service import MPesaMockService
from .sms_parser import SMSParsingService

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create token for the new user
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'User registered successfully.',
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Email and password are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Authenticate user
    user = authenticate(request, email=email, password=password)
    if user:
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user)
        return Response({
            'message': 'Login successful.',
            'token': token.key,
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Invalid credentials.'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Credit Scoring Views
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_credit_score(request, user_id):
    """Calculate credit score for a user"""
    # Check if user exists
    user = get_object_or_404(User, id=user_id)
    
    # Only allow users to calculate their own score or admins
    if request.user.id != int(user_id) and not request.user.is_staff:
        return Response(
            {'error': 'You can only calculate your own credit score.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Validate input data
    serializer = ScoreCalculationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Calculate credit score
        financial_data = serializer.validated_data if serializer.validated_data else None
        credit_score = CreditScoringService.calculate_score(user_id, financial_data)
        
        # Prepare response
        response_data = {
            'user_id': str(user_id),
            'score': credit_score.score,
            'rating': credit_score.rating,
            'factors': credit_score.factors,
            'improvement_tips': credit_score.improvement_tips,
            'calculated_at': credit_score.created_at.isoformat()
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {'error': 'An error occurred while calculating the score.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_my_credit_score(request):
    """Calculate credit score for the authenticated user"""
    # Validate input data
    serializer = ScoreCalculationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Calculate credit score for the authenticated user
        financial_data = serializer.validated_data if serializer.validated_data else None
        credit_score = CreditScoringService.calculate_score(request.user.id, financial_data)
        
        # Prepare response
        response_data = {
            'user_id': str(request.user.id),
            'score': credit_score.score,
            'rating': credit_score.rating,
            'factors': credit_score.factors,
            'improvement_tips': credit_score.improvement_tips,
            'calculated_at': credit_score.created_at.isoformat()
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {'error': 'An error occurred while calculating the score.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_credit_score(request, user_id):
    """Get the most recent credit score for a user"""
    user = get_object_or_404(User, id=user_id)
    
    # Only allow users to view their own score or admins
    if request.user.id != int(user_id) and not request.user.is_staff:
        return Response(
            {'error': 'You can only view your own credit score.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get the most recent credit score
    try:
        credit_score = CreditScore.objects.filter(user=user).first()
        if not credit_score:
            return Response(
                {'error': 'No credit score found. Please calculate a score first.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        response_data = {
            'user_id': str(user_id),
            'score': credit_score.score,
            'rating': credit_score.rating,
            'calculated_at': credit_score.created_at.isoformat(),
            'last_updated': credit_score.updated_at.isoformat()
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'An error occurred while retrieving the score.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_credit_score(request):
    """Get the most recent credit score for the authenticated user"""
    try:
        credit_score = CreditScore.objects.filter(user=request.user).first()
        if not credit_score:
            return Response(
                {'error': 'No credit score found. Please calculate a score first.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        response_data = {
            'user_id': str(request.user.id),
            'score': credit_score.score,
            'rating': credit_score.rating,
            'calculated_at': credit_score.created_at.isoformat(),
            'last_updated': credit_score.updated_at.isoformat()
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'An error occurred while retrieving the score.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_score_explanation(request, user_id):
    """Get detailed score breakdown and explanation"""
    user = get_object_or_404(User, id=user_id)
    
    # Only allow users to view their own score explanation or admins
    if request.user.id != int(user_id) and not request.user.is_staff:
        return Response(
            {'error': 'You can only view your own score explanation.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        credit_score = CreditScore.objects.filter(user=user).first()
        if not credit_score:
            return Response(
                {'error': 'No credit score found. Please calculate a score first.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        response_data = {
            'user_id': str(user_id),
            'score': credit_score.score,
            'rating': credit_score.rating,
            'breakdown': {
                'base_score': credit_score.base_score,
                'transaction_frequency_points': credit_score.transaction_frequency_points,
                'average_balance_points': credit_score.average_balance_points,
                'income_regularity_points': credit_score.income_regularity_points,
                'payment_history_points': credit_score.payment_history_points,
                'overdraft_penalty': credit_score.overdraft_penalty,
            },
            'factors': credit_score.factors,
            'improvement_tips': credit_score.improvement_tips,
            'score_range': {
                'minimum': 300,
                'maximum': 900,
                'your_score': credit_score.score
            },
            'calculated_at': credit_score.created_at.isoformat()
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'An error occurred while retrieving the score explanation.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_score_explanation(request):
    """Get detailed score breakdown and explanation for the authenticated user"""
    try:
        credit_score = CreditScore.objects.filter(user=request.user).first()
        if not credit_score:
            return Response(
                {'error': 'No credit score found. Please calculate a score first.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        response_data = {
            'user_id': str(request.user.id),
            'score': credit_score.score,
            'rating': credit_score.rating,
            'breakdown': {
                'base_score': credit_score.base_score,
                'transaction_frequency_points': credit_score.transaction_frequency_points,
                'average_balance_points': credit_score.average_balance_points,
                'income_regularity_points': credit_score.income_regularity_points,
                'payment_history_points': credit_score.payment_history_points,
                'overdraft_penalty': credit_score.overdraft_penalty,
            },
            'factors': credit_score.factors,
            'improvement_tips': credit_score.improvement_tips,
            'score_range': {
                'minimum': 300,
                'maximum': 900,
                'your_score': credit_score.score
            },
            'calculated_at': credit_score.created_at.isoformat()
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'An error occurred while retrieving the score explanation.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# M-Pesa Mock Integration Views
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def link_mpesa_account(request):
    """Link M-Pesa account to user profile"""
    try:
        existing_account = MPesaAccount.objects.filter(user=request.user).first()
        if existing_account:
            return Response({
                'error': 'M-Pesa account already linked.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = MPesaAccountLinkSerializer(data=request.data)
        if serializer.is_valid():
            mpesa_account = MPesaAccount.objects.create(
                user=request.user,
                phone_number=serializer.validated_data['phone_number'],
                account_name=serializer.validated_data.get('account_name', ''),
            )
            
            MPesaMockService.create_mock_transactions(mpesa_account, days=90)
            
            return Response({
                'message': 'M-Pesa account linked successfully.',
                'account': MPesaAccountSerializer(mpesa_account).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': 'An error occurred while linking M-Pesa account.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mpesa_transactions(request):
    """Get M-Pesa transactions"""
    try:
        mpesa_account = MPesaAccount.objects.filter(user=request.user).first()
        if not mpesa_account:
            return Response({
                'error': 'No M-Pesa account linked.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        days = int(request.GET.get('days', 30))
        limit = int(request.GET.get('limit', 50))
        
        transactions = mpesa_account.transactions.all()[:limit]
        summary = MPesaMockService.get_account_summary(mpesa_account, days)
        
        return Response({
            'transactions': MPesaTransactionSerializer(transactions, many=True).data,
            'summary': summary
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'An error occurred while retrieving transactions.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_mpesa_data(request):
    """Sync M-Pesa data"""
    try:
        mpesa_account = MPesaAccount.objects.filter(user=request.user).first()
        if not mpesa_account:
            return Response({
                'error': 'No M-Pesa account linked.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        days = request.data.get('days', 30)
        force_sync = request.data.get('force_sync', False)
        
        transactions = MPesaMockService.create_mock_transactions(
            mpesa_account, days=days, force_sync=force_sync
        )
        
        return Response({
            'message': 'Data sync completed successfully.',
            'transactions_synced': transactions.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'An error occurred during data sync.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# SMS Parsing Endpoints
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_sms_messages(request):
    """Parse SMS messages and extract M-Pesa transactions"""
    try:
        # Get user's M-Pesa account
        mpesa_account = get_object_or_404(MPesaAccount, user=request.user)
        
        # Get SMS messages from request
        sms_messages = request.data.get('sms_messages', [])
        if not sms_messages:
            return Response({
                'error': 'No SMS messages provided.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse SMS messages
        parsing_result = SMSParsingService.parse_sms_batch(sms_messages, mpesa_account)
        
        # Create transactions from parsed data
        creation_result = SMSParsingService.create_transactions_from_parsed_data(
            parsing_result, mpesa_account
        )
        
        return Response({
            'message': 'SMS messages processed successfully.',
            'parsing_summary': {
                'total_messages': len(sms_messages),
                'successfully_parsed': parsing_result['success_count'],
                'failed_to_parse': parsing_result['failed_count'],
                'transactions_created': creation_result['created_count'],
                'duplicates_skipped': creation_result['duplicate_count']
            },
            'created_transactions': MPesaTransactionSerializer(
                creation_result['created_transactions'], many=True
            ).data,
            'failed_messages': parsing_result['failed_messages']
        }, status=status.HTTP_200_OK)
        
    except MPesaAccount.DoesNotExist:
        return Response({
            'error': 'M-Pesa account not linked. Please link your account first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'An error occurred while parsing SMS messages.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_sms_parsing(request):
    """Preview SMS parsing without saving transactions"""
    try:
        # Get user's M-Pesa account
        mpesa_account = get_object_or_404(MPesaAccount, user=request.user)
        
        # Get SMS messages from request
        sms_messages = request.data.get('sms_messages', [])
        if not sms_messages:
            return Response({
                'error': 'No SMS messages provided.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse SMS messages (preview only)
        parsing_result = SMSParsingService.parse_sms_batch(sms_messages, mpesa_account)
        
        return Response({
            'message': 'SMS parsing preview completed.',
            'preview_summary': {
                'total_messages': len(sms_messages),
                'successfully_parsed': parsing_result['success_count'],
                'failed_to_parse': parsing_result['failed_count']
            },
            'parsed_transactions': parsing_result['parsed_transactions'],
            'failed_messages': parsing_result['failed_messages']
        }, status=status.HTTP_200_OK)
        
    except MPesaAccount.DoesNotExist:
        return Response({
            'error': 'M-Pesa account not linked. Please link your account first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'An error occurred while previewing SMS parsing.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_demo_sms_messages(request):
    """Get demo SMS messages for testing"""
    demo_messages = SMSParsingService.generate_demo_sms_messages()
    
    return Response({
        'message': 'Demo SMS messages retrieved.',
        'demo_sms_messages': demo_messages,
        'count': len(demo_messages)
    }, status=status.HTTP_200_OK)

# User Onboarding Endpoints
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_onboarding_info(request):
    """Get onboarding information for user"""
    
    # Check if user has completed key onboarding steps
    has_mpesa_account = MPesaAccount.objects.filter(user=request.user).exists()
    has_transactions = False
    has_credit_score = CreditScore.objects.filter(user=request.user).exists()
    
    if has_mpesa_account:
        mpesa_account = MPesaAccount.objects.get(user=request.user)
        has_transactions = MPesaTransaction.objects.filter(mpesa_account=mpesa_account).exists()
    
    onboarding_status = {
        'step_1_registration': True,  # If they're authenticated, they've registered
        'step_2_mpesa_linked': has_mpesa_account,
        'step_3_data_uploaded': has_transactions,
        'step_4_score_generated': has_credit_score,
        'current_step': 2 if not has_mpesa_account else (3 if not has_transactions else (4 if not has_credit_score else 5))
    }
    
    return Response({
        'message': 'Welcome! Here\'s how to get your credit score:',
        'onboarding_info': {
            'title': 'Get Your Credit Score in Minutes',
            'subtitle': 'Upload your M-Pesa SMS messages to get started',
            'steps': [
                {
                    'step': 1,
                    'title': 'Link M-Pesa Account',
                    'description': 'Connect your M-Pesa account to analyze your financial data',
                    'completed': has_mpesa_account
                },
                {
                    'step': 2,
                    'title': 'Upload SMS Messages',
                    'description': 'Paste your M-Pesa SMS messages or use demo data',
                    'completed': has_transactions
                },
                {
                    'step': 3,
                    'title': 'Generate Credit Score',
                    'description': 'AI analyzes your transactions and generates your score',
                    'completed': has_credit_score
                },
                {
                    'step': 4,
                    'title': 'View Results',
                    'description': 'See your score breakdown and improvement tips',
                    'completed': has_credit_score
                }
            ],
            'data_options': [
                {
                    'option': 'paste_sms',
                    'title': 'Paste SMS Messages',
                    'description': 'Manually paste your M-Pesa SMS messages',
                    'endpoint': '/api/data/sms/parse'
                },
                {
                    'option': 'demo_data',
                    'title': 'Use Demo Data',
                    'description': 'Try with sample M-Pesa transactions',
                    'endpoint': '/api/data/sms/demo'
                },
                {
                    'option': 'mock_sync',
                    'title': 'Generate Mock Data',
                    'description': 'Create realistic transaction history',
                    'endpoint': '/api/data/sync'
                }
            ]
        },
        'onboarding_status': onboarding_status,
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)
