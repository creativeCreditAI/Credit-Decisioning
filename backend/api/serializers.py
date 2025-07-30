from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .models import FinancialData, CreditScore, MPesaAccount, MPesaTransaction

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
    class Meta:
        model = MPesaTransaction
        fields = '__all__'
        read_only_fields = ('mpesa_account', 'created_at')

class DataSyncRequestSerializer(serializers.Serializer):
    days = serializers.IntegerField(min_value=1, max_value=365, default=30)
    force_sync = serializers.BooleanField(default=False)
