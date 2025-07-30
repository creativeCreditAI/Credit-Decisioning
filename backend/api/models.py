
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

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
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.transaction_type.title()} {self.amount} - {self.description}"
