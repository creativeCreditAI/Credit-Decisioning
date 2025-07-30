from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .models import (
    FinancialData, CreditScore, MPesaAccount, MPesaTransaction,
    FundingApplication, FundingApplicationDocument, FundingApplicationMedia,
    ApplicationReview, FundingApplicationNote
)
from decimal import Decimal
import os

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'phone', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.request, email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password.')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'phone', 'date_joined', 'is_active')
        read_only_fields = ('id', 'date_joined', 'is_active')

class FinancialDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialData
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class CreditScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditScore
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class ScoreCalculationRequestSerializer(serializers.Serializer):
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    average_balance = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    transaction_frequency = serializers.IntegerField(required=False)
    overdraft_count = serializers.IntegerField(required=False)
    payment_history_score = serializers.IntegerField(min_value=0, max_value=100, required=False)
    income_consistency = serializers.FloatField(min_value=0.0, max_value=1.0, required=False)

class MPesaAccountLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = MPesaAccount
        fields = ('phone_number', 'account_name')
    
    def validate_phone_number(self, value):
        # Basic Kenyan phone number validation
        if not value.startswith('+254') and not value.startswith('254') and not value.startswith('0'):
            raise serializers.ValidationError('Please enter a valid Kenyan phone number')
        return value

class MPesaAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = MPesaAccount
        fields = ('id', 'phone_number', 'account_name', 'is_linked', 'linked_at', 'last_sync')
        read_only_fields = ('id', 'is_linked', 'linked_at', 'last_sync')

class MPesaTransactionSerializer(serializers.ModelSerializer):
    ai_confidence_percentage = serializers.SerializerMethodField()
    processing_method = serializers.SerializerMethodField()
    
    class Meta:
        model = MPesaTransaction
        fields = '__all__'
        read_only_fields = ('mpesa_account', 'created_at')
    
    def get_ai_confidence_percentage(self, obj):
        """Get confidence score as percentage"""
        if obj.confidence_score:
            return f"{float(obj.confidence_score) * 100:.1f}%"
        return "N/A"
    
    def get_processing_method(self, obj):
        """Get processing method used"""
        return "AI Enhanced" if obj.ai_processed else "Legacy Regex"

class AITransactionAnalysisSerializer(serializers.Serializer):
    """Serializer for AI transaction analysis requests"""
    transaction_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of transaction IDs to analyze. If empty, analyzes all transactions."
    )
    analysis_depth = serializers.ChoiceField(
        choices=['basic', 'detailed', 'comprehensive'],
        default='detailed',
        help_text="Depth of AI analysis to perform"
    )

class SMSParsingRequestSerializer(serializers.Serializer):
    """Serializer for SMS parsing requests"""
    sms_messages = serializers.ListField(
        child=serializers.CharField(max_length=500),
        min_length=1,
        help_text="List of SMS messages to parse"
    )
    use_ai_enhancement = serializers.BooleanField(
        default=True,
        help_text="Whether to use AI-enhanced parsing"
    )
    confidence_threshold = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
        min_value=Decimal('0.0'),
        max_value=Decimal('1.0'),
        default=Decimal('0.6'),
        help_text="Minimum confidence threshold for AI parsing"
    )


# ============================================================================
# FUNDING APPLICATION SERIALIZERS
# ============================================================================

class FundingApplicationDocumentSerializer(serializers.ModelSerializer):
    """Serializer for funding application documents"""
    
    class Meta:
        model = FundingApplicationDocument
        fields = [
            'id', 'document_type', 'file', 'original_filename', 'file_size',
            'description', 'ai_analysis_status', 'ai_extracted_data', 'ai_insights',
            'uploaded_at'
        ]
        read_only_fields = ['id', 'file_size', 'ai_analysis_status', 'ai_extracted_data', 'ai_insights', 'uploaded_at']

class FundingApplicationMediaSerializer(serializers.ModelSerializer):
    """Serializer for funding application media files"""
    
    class Meta:
        model = FundingApplicationMedia
        fields = [
            'id', 'media_type', 'file', 'thumbnail', 'original_filename', 'file_size',
            'duration', 'description', 'processing_status', 'uploaded_at'
        ]
        read_only_fields = ['id', 'thumbnail', 'file_size', 'processing_status', 'uploaded_at']

class FundingApplicationNoteSerializer(serializers.ModelSerializer):
    """Serializer for funding application notes"""
    author_email = serializers.CharField(source='author.email', read_only=True)
    
    class Meta:
        model = FundingApplicationNote
        fields = [
            'id', 'note_type', 'title', 'content', 'is_important',
            'author_email', 'created_at'
        ]
        read_only_fields = ['id', 'author_email', 'created_at']

class ApplicationReviewSerializer(serializers.ModelSerializer):
    """Serializer for application reviews"""
    reviewer_email = serializers.CharField(source='reviewer.email', read_only=True)
    average_score = serializers.ReadOnlyField()
    
    class Meta:
        model = ApplicationReview
        fields = [
            'id', 'business_model_score', 'market_opportunity_score', 'team_strength_score',
            'financial_health_score', 'scalability_score', 'overall_score', 'decision',
            'strengths', 'weaknesses', 'recommendations', 'internal_notes', 'status',
            'reviewer_email', 'average_score', 'review_started_at', 'review_completed_at'
        ]
        read_only_fields = ['id', 'reviewer_email', 'average_score', 'review_started_at']

class FundingApplicationSerializer(serializers.ModelSerializer):
    """Main serializer for funding applications"""
    
    # Related objects
    documents = FundingApplicationDocumentSerializer(many=True, read_only=True)
    media_files = FundingApplicationMediaSerializer(many=True, read_only=True)
    notes = FundingApplicationNoteSerializer(many=True, read_only=True)
    review = ApplicationReviewSerializer(read_only=True)
    
    # Computed fields
    completion_percentage = serializers.ReadOnlyField()
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    
    # Display fields for choices
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    funding_stage_display = serializers.CharField(source='get_funding_stage_display', read_only=True)
    business_stage_display = serializers.CharField(source='get_business_stage_display', read_only=True)
    industry_display = serializers.CharField(source='get_industry_display', read_only=True)
    
    class Meta:
        model = FundingApplication
        fields = [
            # Basic info
            'id', 'applicant_email', 'created_at', 'updated_at',
            
            # Business information
            'business_name', 'business_description', 'industry', 'industry_display',
            'business_stage', 'business_stage_display',
            
            # Funding details
            'funding_stage', 'funding_stage_display', 'funding_amount_requested',
            'equity_offered', 'use_of_funds',
            
            # Online presence
            'instagram_profile', 'youtube_profile', 'portfolio_website', 'linkedin_profile',
            
            # Team and experience
            'team_size', 'founder_experience',
            
            # Financial metrics
            'monthly_revenue', 'monthly_burn_rate', 'runway_months',
            
            # Application status
            'status', 'status_display', 'submission_date', 'completion_percentage',
            
            # AI analysis
            'creditworthiness_score', 'business_viability_score', 'risk_assessment',
            
            # Related objects
            'documents', 'media_files', 'notes', 'review'
        ]
        read_only_fields = [
            'id', 'applicant_email', 'created_at', 'updated_at', 'completion_percentage',
            'creditworthiness_score', 'business_viability_score', 'risk_assessment',
            'documents', 'media_files', 'notes', 'review'
        ]
    
    def validate_funding_amount_requested(self, value):
        """Validate funding amount is reasonable"""
        if value <= 0:
            raise serializers.ValidationError("Funding amount must be greater than 0")
        if value > 1000000000:  # 1 billion KES
            raise serializers.ValidationError("Funding amount seems unreasonably high")
        return value
    
    def validate_equity_offered(self, value):
        """Validate equity percentage"""
        if value <= 0 or value > 100:
            raise serializers.ValidationError("Equity offered must be between 0 and 100 percent")
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # Ensure business stage aligns with funding stage
        business_stage = data.get('business_stage')
        funding_stage = data.get('funding_stage')
        
        if business_stage == 'idea' and funding_stage in ['series_a', 'series_b', 'series_c']:
            raise serializers.ValidationError(
                "Idea stage companies typically don't qualify for Series A+ funding"
            )
        
        return data

class FundingApplicationCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating funding applications"""
    
    class Meta:
        model = FundingApplication
        fields = [
            'business_name', 'business_description', 'industry', 'business_stage',
            'funding_stage', 'funding_amount_requested', 'equity_offered', 'use_of_funds',
            'instagram_profile', 'youtube_profile', 'portfolio_website', 'linkedin_profile',
            'team_size', 'founder_experience', 'monthly_revenue', 'monthly_burn_rate', 'runway_months'
        ]

class FundingApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing applications"""
    
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    funding_stage_display = serializers.CharField(source='get_funding_stage_display', read_only=True)
    completion_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = FundingApplication
        fields = [
            'id', 'business_name', 'industry', 'funding_amount_requested',
            'status', 'status_display', 'funding_stage', 'funding_stage_display',
            'applicant_email', 'completion_percentage', 'created_at', 'submission_date'
        ]

class DocumentUploadSerializer(serializers.Serializer):
    """Serializer for document upload requests"""
    document_type = serializers.ChoiceField(choices=FundingApplicationDocument.DOCUMENT_TYPES)
    file = serializers.FileField()
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_file(self, value):
        """Validate uploaded file"""
        # Check file size (max 50MB)
        if value.size > 50 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 50MB")
        
        # Check file extension
        allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg']
        file_extension = os.path.splitext(value.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not supported. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value

class MediaUploadSerializer(serializers.Serializer):
    """Serializer for media upload requests"""
    media_type = serializers.ChoiceField(choices=FundingApplicationMedia.MEDIA_TYPES)
    file = serializers.FileField()
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_file(self, value):
        """Validate uploaded media file"""
        # Check file size (max 500MB for videos)
        if value.size > 500 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 500MB")
        
        # Check file extension
        allowed_extensions = ['.mp4', '.mov', '.avi', '.pdf', '.ppt', '.pptx', '.png', '.jpg', '.jpeg']
        file_extension = os.path.splitext(value.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not supported. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value

class ApplicationAnalyticsSerializer(serializers.Serializer):
    """Serializer for application analytics data"""
    total_applications = serializers.IntegerField()
    applications_by_status = serializers.DictField()
    applications_by_industry = serializers.DictField()
    applications_by_funding_stage = serializers.DictField()
    average_funding_requested = serializers.DecimalField(max_digits=15, decimal_places=2)
    average_completion_rate = serializers.FloatField()
    recent_applications = FundingApplicationListSerializer(many=True)

class DataSyncRequestSerializer(serializers.Serializer):
    days = serializers.IntegerField(min_value=1, max_value=365, default=30)
    force_sync = serializers.BooleanField(default=False)
