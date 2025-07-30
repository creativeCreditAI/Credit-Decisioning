
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid
import os

def upload_business_document(instance, filename):
    """Upload business documents to organized folders"""
    return f"funding_applications/{instance.application.id}/documents/{filename}"

def upload_pitch_media(instance, filename):
    """Upload pitch videos/decks to organized folders"""
    return f"funding_applications/{instance.application.id}/pitch/{filename}"

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, phone=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, phone=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, phone, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone']

    objects = UserManager()

    def __str__(self):
        return self.email

class FinancialData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='financial_data')
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transaction_frequency = models.IntegerField(default=0)  # transactions per month
    overdraft_count = models.IntegerField(default=0)  # number of overdrafts
    payment_history_score = models.IntegerField(default=0)  # 0-100 based on payment patterns
    income_consistency = models.FloatField(default=0.0)  # 0.0-1.0 consistency score
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Financial Data for {self.user.email}"

class CreditScore(models.Model):
    RATING_CHOICES = [
        ('Excellent', 'Excellent (850-900)'),
        ('Very Good', 'Very Good (750-849)'),
        ('Good', 'Good (650-749)'),
        ('Fair', 'Fair (550-649)'),
        ('Poor', 'Poor (300-549)'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_scores')
    score = models.IntegerField()
    rating = models.CharField(max_length=20, choices=RATING_CHOICES)
    
    # Score breakdown
    base_score = models.IntegerField(default=500)
    transaction_frequency_points = models.IntegerField(default=0)
    average_balance_points = models.IntegerField(default=0)
    income_regularity_points = models.IntegerField(default=0)
    payment_history_points = models.IntegerField(default=0)
    overdraft_penalty = models.IntegerField(default=0)
    
    factors = models.JSONField(default=dict)
    improvement_tips = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Credit Score {self.score} for {self.user.email}"

class MPesaAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mpesa_account')
    phone_number = models.CharField(max_length=15)
    account_name = models.CharField(max_length=100, blank=True)
    is_linked = models.BooleanField(default=True)
    linked_at = models.DateTimeField(auto_now_add=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"M-Pesa Account {self.phone_number} for {self.user.email}"

class MPesaTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    ]
    
    CATEGORIES = [
        ('salary', 'Salary'),
        ('business', 'Business Income'),
        ('bills', 'Bills Payment'),
        ('shopping', 'Shopping'),
        ('transport', 'Transport'),
        ('food', 'Food & Dining'),
        ('utilities', 'Utilities'),
        ('transfer', 'Money Transfer'),
        ('withdraw', 'Cash Withdrawal'),
        ('airtime', 'Airtime Purchase'),
        ('loan', 'Loan Payment'),
        ('savings', 'Savings'),
        ('other', 'Other'),
    ]

    mpesa_account = models.ForeignKey(MPesaAccount, on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.CharField(max_length=20, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='other')
    description = models.CharField(max_length=200)
    date = models.DateTimeField()
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    
    # AI-enhanced fields
    original_sms = models.TextField(blank=True, null=True, help_text="Original SMS message")
    ai_processed = models.BooleanField(default=False, help_text="Whether transaction was processed with AI")
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, help_text="AI confidence score (0-1)")
    ai_insights = models.JSONField(default=dict, blank=True, help_text="AI-generated insights and analysis")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.transaction_type.title()} {self.amount} - {self.description}"


# ============================================================================
# FUNDING APPLICATION MODELS
# ============================================================================

class FundingApplication(models.Model):
    """Main funding application model for founders seeking investment"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('due_diligence', 'Due Diligence'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('on_hold', 'On Hold'),
    ]
    
    FUNDING_STAGE_CHOICES = [
        ('pre_seed', 'Pre-Seed'),
        ('seed', 'Seed'),
        ('series_a', 'Series A'),
        ('series_b', 'Series B'),
        ('series_c', 'Series C'),
        ('bridge', 'Bridge'),
        ('other', 'Other'),
    ]
    
    BUSINESS_STAGE_CHOICES = [
        ('idea', 'Idea Stage'),
        ('prototype', 'Prototype/MVP'),
        ('beta', 'Beta Testing'),
        ('early_revenue', 'Early Revenue'),
        ('growth', 'Growth Stage'),
        ('expansion', 'Expansion'),
        ('mature', 'Mature'),
    ]
    
    INDUSTRY_CHOICES = [
        ('fintech', 'Financial Technology'),
        ('healthtech', 'Health Technology'),
        ('edtech', 'Education Technology'),
        ('agritech', 'Agriculture Technology'),
        ('logistics', 'Logistics & Supply Chain'),
        ('ecommerce', 'E-commerce'),
        ('saas', 'Software as a Service'),
        ('marketplace', 'Marketplace'),
        ('social', 'Social Impact'),
        ('clean_energy', 'Clean Energy'),
        ('manufacturing', 'Manufacturing'),
        ('retail', 'Retail'),
        ('other', 'Other'),
    ]
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='funding_applications')
    
    # Business Information
    business_name = models.CharField(max_length=200)
    business_description = models.TextField(max_length=1000, help_text="Brief description of your business")
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES)
    business_stage = models.CharField(max_length=50, choices=BUSINESS_STAGE_CHOICES)
    
    # Funding Details
    funding_stage = models.CharField(max_length=50, choices=FUNDING_STAGE_CHOICES)
    funding_amount_requested = models.DecimalField(max_digits=15, decimal_places=2, help_text="Amount in KES")
    equity_offered = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage of equity offered")
    use_of_funds = models.TextField(max_length=1000, help_text="How will you use the funding?")
    
    # Online Presence
    instagram_profile = models.URLField(blank=True, null=True, help_text="Instagram profile URL")
    youtube_profile = models.URLField(blank=True, null=True, help_text="YouTube channel URL")
    portfolio_website = models.URLField(blank=True, null=True, help_text="Company website or portfolio")
    linkedin_profile = models.URLField(blank=True, null=True, help_text="LinkedIn profile URL")
    
    # Team Information
    team_size = models.PositiveIntegerField(default=1)
    founder_experience = models.TextField(max_length=1000, help_text="Founder's relevant experience")
    
    # Financial Metrics
    monthly_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Current monthly revenue")
    monthly_burn_rate = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Monthly expenses")
    runway_months = models.PositiveIntegerField(default=0, help_text="Current runway in months")
    
    # Application Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submission_date = models.DateTimeField(null=True, blank=True)
    
    # AI-Powered Analysis
    creditworthiness_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="AI-calculated creditworthiness score")
    business_viability_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="AI-calculated business viability score")
    risk_assessment = models.JSONField(default=dict, blank=True, help_text="AI risk assessment results")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.business_name} - {self.applicant.email}"
    
    @property
    def completion_percentage(self):
        """Calculate application completion percentage"""
        required_fields = [
            'business_name', 'business_description', 'industry', 'business_stage',
            'funding_stage', 'funding_amount_requested', 'equity_offered', 'use_of_funds',
            'founder_experience'
        ]
        
        completed = sum(1 for field in required_fields if getattr(self, field))
        return (completed / len(required_fields)) * 100


class FundingApplicationDocument(models.Model):
    """Document uploads for funding applications"""
    
    DOCUMENT_TYPES = [
        ('balance_sheet', 'Balance Sheet'),
        ('income_statement', 'Income Statement'),
        ('cash_flow', 'Cash Flow Statement'),
        ('tax_returns', 'Tax Returns'),
        ('business_plan', 'Business Plan'),
        ('financial_projections', 'Financial Projections'),
        ('bank_statements', 'Bank Statements'),
        ('incorporation_cert', 'Certificate of Incorporation'),
        ('kra_pin', 'KRA PIN Certificate'),
        ('business_permit', 'Business Permit'),
        ('pitch_deck', 'Pitch Deck'),
        ('product_demo', 'Product Demo'),
        ('market_research', 'Market Research'),
        ('legal_agreements', 'Legal Agreements'),
        ('other', 'Other'),
    ]
    
    application = models.ForeignKey(FundingApplication, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to=upload_business_document)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    description = models.CharField(max_length=500, blank=True, help_text="Optional description")
    
    # AI Document Analysis
    ai_analysis_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ])
    ai_extracted_data = models.JSONField(default=dict, blank=True, help_text="AI-extracted financial data")
    ai_insights = models.JSONField(default=dict, blank=True, help_text="AI-generated insights from document")
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['application', 'document_type', 'original_filename']
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.application.business_name}"
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            if not self.original_filename:
                self.original_filename = self.file.name
        super().save(*args, **kwargs)


class FundingApplicationMedia(models.Model):
    """Media files for funding applications (pitch videos, presentations)"""
    
    MEDIA_TYPES = [
        ('pitch_video', 'Pitch Video'),
        ('demo_video', 'Product Demo Video'),
        ('presentation', 'Presentation Slides'),
        ('prototype_images', 'Prototype Images'),
        ('team_photo', 'Team Photo'),
        ('product_screenshots', 'Product Screenshots'),
        ('other', 'Other'),
    ]
    
    application = models.ForeignKey(FundingApplication, on_delete=models.CASCADE, related_name='media_files')
    media_type = models.CharField(max_length=50, choices=MEDIA_TYPES)
    file = models.FileField(upload_to=upload_pitch_media)
    thumbnail = models.ImageField(upload_to=upload_pitch_media, blank=True, null=True)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    duration = models.PositiveIntegerField(null=True, blank=True, help_text="Duration in seconds for videos")
    description = models.CharField(max_length=500, blank=True)
    
    # Media processing status
    processing_status = models.CharField(max_length=20, default='uploaded', choices=[
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ])
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_media_type_display()} - {self.application.business_name}"
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            if not self.original_filename:
                self.original_filename = self.file.name
        super().save(*args, **kwargs)


class ApplicationReview(models.Model):
    """Review and evaluation of funding applications"""
    
    REVIEW_STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('requires_info', 'Requires Additional Information'),
    ]
    
    DECISION_CHOICES = [
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('conditional', 'Conditional Approval'),
        ('more_info', 'Request More Information'),
    ]
    
    application = models.OneToOneField(FundingApplication, on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviewed_applications')
    
    # Review Scores (1-10 scale)
    business_model_score = models.PositiveIntegerField(null=True, blank=True, help_text="1-10 rating")
    market_opportunity_score = models.PositiveIntegerField(null=True, blank=True, help_text="1-10 rating")
    team_strength_score = models.PositiveIntegerField(null=True, blank=True, help_text="1-10 rating")
    financial_health_score = models.PositiveIntegerField(null=True, blank=True, help_text="1-10 rating")
    scalability_score = models.PositiveIntegerField(null=True, blank=True, help_text="1-10 rating")
    
    # Overall Assessment
    overall_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text="Overall score out of 10")
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES, null=True, blank=True)
    
    # Review Comments
    strengths = models.TextField(blank=True, help_text="Application strengths")
    weaknesses = models.TextField(blank=True, help_text="Areas of concern")
    recommendations = models.TextField(blank=True, help_text="Recommendations for improvement")
    internal_notes = models.TextField(blank=True, help_text="Internal reviewer notes")
    
    # Review Status
    status = models.CharField(max_length=20, choices=REVIEW_STATUS_CHOICES, default='pending')
    review_started_at = models.DateTimeField(auto_now_add=True)
    review_completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Review: {self.application.business_name} by {self.reviewer.email}"
    
    @property
    def average_score(self):
        """Calculate average score from all review criteria"""
        scores = [
            self.business_model_score,
            self.market_opportunity_score,
            self.team_strength_score,
            self.financial_health_score,
            self.scalability_score
        ]
        valid_scores = [score for score in scores if score is not None]
        return sum(valid_scores) / len(valid_scores) if valid_scores else 0


class FundingApplicationNote(models.Model):
    """Internal notes and communication log for funding applications"""
    
    NOTE_TYPES = [
        ('internal', 'Internal Note'),
        ('communication', 'Communication Log'),
        ('meeting', 'Meeting Notes'),
        ('due_diligence', 'Due Diligence'),
        ('follow_up', 'Follow-up Required'),
    ]
    
    application = models.ForeignKey(FundingApplication, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    note_type = models.CharField(max_length=20, choices=NOTE_TYPES, default='internal')
    title = models.CharField(max_length=200)
    content = models.TextField()
    is_important = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.application.business_name}"
