
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
from .ai_sms_parser import AIEnhancedSMSParser

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

# AI-Enhanced SMS Parsing Endpoints
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_parse_sms_messages(request):
    """AI-enhanced SMS parsing with advanced analysis and insights"""
    try:
        # Get user's M-Pesa account
        mpesa_account = get_object_or_404(MPesaAccount, user=request.user)
        
        # Get SMS messages from request
        sms_messages = request.data.get('sms_messages', [])
        if not sms_messages:
            return Response({
                'error': 'No SMS messages provided.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize AI-enhanced parser
        ai_parser = AIEnhancedSMSParser()
        
        # Parse SMS messages with AI enhancement
        parsing_result = ai_parser.parse_sms_batch_ai(sms_messages, mpesa_account)
        
        # Create transactions from parsed data
        creation_result = ai_parser.create_transactions_from_parsed_data(
            parsing_result, mpesa_account
        )
        
        # Get parsing statistics
        parsing_stats = ai_parser.get_parsing_statistics()
        
        return Response({
            'message': 'AI-enhanced SMS parsing completed successfully.',
            'ai_summary': {
                'total_messages': len(sms_messages),
                'successfully_parsed': parsing_result['success_count'],
                'failed_to_parse': parsing_result['failed_count'],
                'transactions_created': creation_result['created_count'],
                'duplicates_skipped': creation_result['duplicate_count'],
                'ai_enhancements_applied': parsing_stats.get('ai_enhanced_parses', 0),
                'success_rate': f"{parsing_stats.get('success_rate', 0):.1f}%"
            },
            'created_transactions': MPesaTransactionSerializer(
                creation_result['created_transactions'], many=True
            ).data,
            'ai_insights': parsing_result['ai_insights'],
            'parsing_statistics': parsing_stats,
            'failed_messages': parsing_result['failed_messages']
        }, status=status.HTTP_200_OK)
        
    except MPesaAccount.DoesNotExist:
        return Response({
            'error': 'M-Pesa account not linked. Please link your account first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'An error occurred during AI-enhanced SMS parsing.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_preview_sms_parsing(request):
    """AI-enhanced SMS parsing preview with detailed analysis"""
    try:
        # Get user's M-Pesa account
        mpesa_account = get_object_or_404(MPesaAccount, user=request.user)
        
        # Get SMS messages from request
        sms_messages = request.data.get('sms_messages', [])
        if not sms_messages:
            return Response({
                'error': 'No SMS messages provided.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize AI-enhanced parser
        ai_parser = AIEnhancedSMSParser()
        
        # Parse SMS messages (preview only - no database operations)
        parsing_result = ai_parser.parse_sms_batch_ai(sms_messages, mpesa_account)
        
        # Get parsing statistics
        parsing_stats = ai_parser.get_parsing_statistics()
        
        # Analyze transaction patterns
        pattern_analysis = analyze_transaction_patterns(parsing_result['parsed_transactions'])
        
        return Response({
            'message': 'AI-enhanced SMS parsing preview completed.',
            'preview_summary': {
                'total_messages': len(sms_messages),
                'successfully_parsed': parsing_result['success_count'],
                'failed_to_parse': parsing_result['failed_count'],
                'ai_enhancements_applied': parsing_stats.get('ai_enhanced_parses', 0),
                'success_rate': f"{parsing_stats.get('success_rate', 0):.1f}%",
                'confidence_distribution': calculate_confidence_distribution(parsing_result['parsed_transactions'])
            },
            'parsed_transactions': parsing_result['parsed_transactions'],
            'ai_insights': parsing_result['ai_insights'],
            'pattern_analysis': pattern_analysis,
            'parsing_statistics': parsing_stats,
            'failed_messages': parsing_result['failed_messages'],
            'recommendations': generate_data_quality_recommendations(parsing_result)
        }, status=status.HTTP_200_OK)
        
    except MPesaAccount.DoesNotExist:
        return Response({
            'error': 'M-Pesa account not linked. Please link your account first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'An error occurred during AI-enhanced SMS preview.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def smart_categorize_transactions(request):
    """AI-powered transaction categorization and insights"""
    try:
        # Get user's M-Pesa account
        mpesa_account = get_object_or_404(MPesaAccount, user=request.user)
        
        # Get transaction IDs or use all transactions
        transaction_ids = request.data.get('transaction_ids', [])
        
        if transaction_ids:
            transactions = MPesaTransaction.objects.filter(
                mpesa_account=mpesa_account,
                id__in=transaction_ids
            )
        else:
            # Analyze all user transactions
            transactions = MPesaTransaction.objects.filter(
                mpesa_account=mpesa_account
            ).order_by('-date')[:100]  # Limit to recent 100 transactions
        
        if not transactions.exists():
            return Response({
                'error': 'No transactions found for analysis.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize AI parser for categorization
        ai_parser = AIEnhancedSMSParser()
        
        # Analyze each transaction
        categorized_results = []
        spending_insights = {}
        
        for transaction in transactions:
            # Re-categorize using AI
            if hasattr(transaction, 'original_sms') and transaction.original_sms:
                entities = ai_parser._extract_financial_entities(transaction.original_sms)
                new_category = ai_parser._ai_categorize_transaction(transaction.original_sms, entities)
                ai_insights = ai_parser._generate_ai_insights(transaction.original_sms, {
                    'amount': transaction.amount,
                    'category': new_category,
                    'description': transaction.description
                })
            else:
                # Fallback analysis based on existing data
                new_category = transaction.category
                ai_insights = {
                    'spending_pattern': {'amount_tier': 'medium'},
                    'merchant_analysis': {'merchant_type': 'identified'},
                    'behavioral_flags': [],
                    'risk_indicators': {'score': 0.1, 'factors': []},
                    'recommendation': 'Transaction categorized based on existing data'
                }
            
            categorized_results.append({
                'transaction_id': transaction.id,
                'original_category': transaction.category,
                'ai_suggested_category': new_category,
                'confidence': 0.85,
                'amount': float(transaction.amount),
                'description': transaction.description,
                'ai_insights': ai_insights
            })
            
            # Update spending insights
            if new_category not in spending_insights:
                spending_insights[new_category] = {'count': 0, 'total_amount': 0}
            spending_insights[new_category]['count'] += 1
            spending_insights[new_category]['total_amount'] += float(transaction.amount)
        
        # Generate comprehensive spending analysis
        comprehensive_analysis = generate_comprehensive_spending_analysis(categorized_results)
        
        return Response({
            'message': 'AI-powered transaction categorization completed.',
            'analysis_summary': {
                'transactions_analyzed': len(categorized_results),
                'categories_identified': len(spending_insights),
                'high_confidence_categorizations': sum(1 for r in categorized_results if r['confidence'] > 0.8),
                'total_spending_analyzed': sum(r['amount'] for r in categorized_results)
            },
            'categorized_transactions': categorized_results,
            'spending_by_category': spending_insights,
            'comprehensive_analysis': comprehensive_analysis,
            'personalized_recommendations': generate_personalized_recommendations(categorized_results)
        }, status=status.HTTP_200_OK)
        
    except MPesaAccount.DoesNotExist:
        return Response({
            'error': 'M-Pesa account not linked. Please link your account first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'An error occurred during smart categorization.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ai_parsing_analytics(request):
    """Get AI parsing analytics and performance metrics"""
    try:
        # Get user's M-Pesa account
        mpesa_account = get_object_or_404(MPesaAccount, user=request.user)
        
        # Get transactions with AI processing flags
        ai_processed_transactions = MPesaTransaction.objects.filter(
            mpesa_account=mpesa_account,
            ai_processed=True
        )
        
        legacy_processed_transactions = MPesaTransaction.objects.filter(
            mpesa_account=mpesa_account,
            ai_processed=False
        )
        
        # Calculate analytics
        analytics = {
            'processing_overview': {
                'total_transactions': MPesaTransaction.objects.filter(mpesa_account=mpesa_account).count(),
                'ai_processed': ai_processed_transactions.count(),
                'legacy_processed': legacy_processed_transactions.count(),
                'ai_adoption_rate': f"{(ai_processed_transactions.count() / max(1, MPesaTransaction.objects.filter(mpesa_account=mpesa_account).count())) * 100:.1f}%"
            },
            'ai_performance_metrics': {
                'average_confidence': calculate_average_confidence(ai_processed_transactions),
                'category_accuracy': calculate_category_accuracy(ai_processed_transactions),
                'processing_efficiency': calculate_processing_efficiency(ai_processed_transactions)
            },
            'data_quality_insights': generate_data_quality_insights(mpesa_account),
            'improvement_suggestions': generate_improvement_suggestions(mpesa_account)
        }
        
        return Response({
            'message': 'AI parsing analytics retrieved successfully.',
            'analytics': analytics,
            'last_updated': mpesa_account.last_sync.isoformat() if mpesa_account.last_sync else None
        }, status=status.HTTP_200_OK)
        
    except MPesaAccount.DoesNotExist:
        return Response({
            'error': 'M-Pesa account not linked. Please link your account first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'An error occurred while retrieving analytics.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Helper functions for AI analytics
def analyze_transaction_patterns(transactions):
    """Analyze patterns in parsed transactions"""
    patterns = {
        'transaction_types': {},
        'categories': {},
        'amount_ranges': {'small': 0, 'medium': 0, 'large': 0},
        'time_patterns': {}
    }
    
    for transaction in transactions:
        # Transaction type distribution
        tx_type = transaction.get('transaction_type', 'unknown')
        patterns['transaction_types'][tx_type] = patterns['transaction_types'].get(tx_type, 0) + 1
        
        # Category distribution
        category = transaction.get('category', 'other')
        patterns['categories'][category] = patterns['categories'].get(category, 0) + 1
        
        # Amount ranges
        amount = float(transaction.get('amount', 0))
        if amount < 1000:
            patterns['amount_ranges']['small'] += 1
        elif amount < 10000:
            patterns['amount_ranges']['medium'] += 1
        else:
            patterns['amount_ranges']['large'] += 1
    
    return patterns

def calculate_confidence_distribution(transactions):
    """Calculate confidence score distribution"""
    confidence_scores = [t.get('confidence_score', 0.6) for t in transactions]
    
    if not confidence_scores:
        return {'average': 0, 'high_confidence': 0, 'medium_confidence': 0, 'low_confidence': 0}
    
    average = sum(confidence_scores) / len(confidence_scores)
    high_confidence = sum(1 for score in confidence_scores if score >= 0.8)
    medium_confidence = sum(1 for score in confidence_scores if 0.6 <= score < 0.8)
    low_confidence = sum(1 for score in confidence_scores if score < 0.6)
    
    return {
        'average': round(average, 2),
        'high_confidence': high_confidence,
        'medium_confidence': medium_confidence,
        'low_confidence': low_confidence
    }

def generate_data_quality_recommendations(parsing_result):
    """Generate recommendations for improving data quality"""
    recommendations = []
    
    if parsing_result['failed_count'] > 0:
        recommendations.append({
            'type': 'parsing_improvement',
            'message': f"{parsing_result['failed_count']} messages failed to parse. Consider reviewing SMS format consistency.",
            'priority': 'medium'
        })
    
    if parsing_result['success_count'] > 0:
        recommendations.append({
            'type': 'data_completeness',
            'message': f"Successfully parsed {parsing_result['success_count']} messages. Continue uploading for better analysis.",
            'priority': 'low'
        })
    
    return recommendations

def generate_comprehensive_spending_analysis(categorized_results):
    """Generate comprehensive spending analysis"""
    total_spending = sum(r['amount'] for r in categorized_results)
    category_totals = {}
    
    for result in categorized_results:
        category = result['ai_suggested_category']
        if category not in category_totals:
            category_totals[category] = 0
        category_totals[category] += result['amount']
    
    # Calculate percentages
    category_percentages = {
        category: (amount / total_spending * 100) if total_spending > 0 else 0
        for category, amount in category_totals.items()
    }
    
    return {
        'total_spending': total_spending,
        'category_breakdown': category_totals,
        'spending_distribution': category_percentages,
        'top_categories': sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:5],
        'spending_insights': generate_spending_insights(category_percentages)
    }

def generate_personalized_recommendations(categorized_results):
    """Generate personalized financial recommendations"""
    recommendations = []
    
    # Analyze spending patterns
    total_amount = sum(r['amount'] for r in categorized_results)
    category_spending = {}
    
    for result in categorized_results:
        category = result['ai_suggested_category']
        if category not in category_spending:
            category_spending[category] = 0
        category_spending[category] += result['amount']
    
    # Generate specific recommendations
    if category_spending.get('shopping', 0) > total_amount * 0.3:
        recommendations.append({
            'type': 'spending_optimization',
            'category': 'shopping',
            'message': 'Shopping represents a large portion of your spending. Consider budgeting for non-essential purchases.',
            'action': 'Set a monthly shopping budget'
        })
    
    if category_spending.get('withdraw', 0) > total_amount * 0.2:
        recommendations.append({
            'type': 'payment_optimization',
            'category': 'withdraw',
            'message': 'High cash withdrawal frequency detected. Mobile payments offer better tracking and security.',
            'action': 'Use mobile payments when possible'
        })
    
    return recommendations

def calculate_average_confidence(transactions):
    """Calculate average confidence score for AI-processed transactions"""
    confidence_scores = [
        float(t.confidence_score) for t in transactions 
        if hasattr(t, 'confidence_score') and t.confidence_score
    ]
    
    if not confidence_scores:
        return 0.0
    
    return round(sum(confidence_scores) / len(confidence_scores), 2)

def calculate_category_accuracy(transactions):
    """Calculate category accuracy metrics"""
    # This would typically require manual validation data
    # For now, return estimated accuracy based on confidence scores
    high_confidence_count = sum(
        1 for t in transactions 
        if hasattr(t, 'confidence_score') and float(t.confidence_score or 0) > 0.8
    )
    
    total_count = transactions.count()
    
    if total_count == 0:
        return 0.0
    
    return round((high_confidence_count / total_count) * 100, 1)

def calculate_processing_efficiency(transactions):
    """Calculate processing efficiency metrics"""
    ai_processed_count = transactions.filter(ai_processed=True).count()
    total_count = transactions.count()
    
    if total_count == 0:
        return 0.0
    
    return round((ai_processed_count / total_count) * 100, 1)

def generate_data_quality_insights(mpesa_account):
    """Generate data quality insights"""
    transactions = MPesaTransaction.objects.filter(mpesa_account=mpesa_account)
    
    insights = {
        'completeness': {
            'transactions_with_descriptions': transactions.exclude(description='').count(),
            'transactions_with_original_sms': transactions.exclude(original_sms='').count(),
            'total_transactions': transactions.count()
        },
        'consistency': {
            'consistent_categories': transactions.exclude(category='other').count(),
            'transactions_needing_review': transactions.filter(category='other').count()
        }
    }
    
    return insights

def generate_improvement_suggestions(mpesa_account):
    """Generate suggestions for improving AI parsing"""
    suggestions = []
    
    transactions = MPesaTransaction.objects.filter(mpesa_account=mpesa_account)
    
    if transactions.filter(category='other').count() > transactions.count() * 0.2:
        suggestions.append({
            'type': 'categorization',
            'message': 'Many transactions are uncategorized. Upload more detailed SMS messages for better categorization.',
            'priority': 'medium'
        })
    
    if transactions.filter(ai_processed=False).count() > 0:
        suggestions.append({
            'type': 'ai_upgrade',
            'message': 'Some transactions were processed with legacy parsing. Re-process with AI for better insights.',
            'priority': 'low'
        })
    
    return suggestions

def generate_spending_insights(category_percentages):
    """Generate insights based on spending distribution"""
    insights = []
    
    if category_percentages.get('bills', 0) > 40:
        insights.append("Bills represent a significant portion of your spending - good financial responsibility!")
    
    if category_percentages.get('shopping', 0) > 30:
        insights.append("Consider reviewing your shopping habits for potential savings opportunities.")
    
    if category_percentages.get('food', 0) > 20:
        insights.append("Food expenses are substantial - meal planning could help optimize this category.")
    
    return insights
