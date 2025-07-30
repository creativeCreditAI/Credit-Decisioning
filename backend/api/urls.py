
from django.urls import path
from .views import (
    register_view, 
    login_view, 
    me_view,
    calculate_credit_score,
    calculate_my_credit_score,
    get_credit_score,
    get_my_credit_score,
    get_score_explanation,
    get_my_score_explanation,
    link_mpesa_account,
    get_mpesa_transactions,
    sync_mpesa_data,
    parse_sms_messages,
    preview_sms_parsing,
    get_demo_sms_messages,
    get_onboarding_info
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register', register_view, name='register'),
    path('auth/login', login_view, name='login'),
    path('auth/me', me_view, name='me'),
    
    # Credit scoring endpoints (with user_id)
    path('scoring/calculate/<int:user_id>', calculate_credit_score, name='calculate_credit_score'),
    path('scoring/score/<int:user_id>', get_credit_score, name='get_credit_score'),
    path('scoring/explanation/<int:user_id>', get_score_explanation, name='get_score_explanation'),
    
    # Convenience endpoints (for authenticated user)
    path('scoring/calculate', calculate_my_credit_score, name='calculate_my_credit_score'),
    path('scoring/score', get_my_credit_score, name='get_my_credit_score'),
    path('scoring/explanation', get_my_score_explanation, name='get_my_score_explanation'),
    
    # M-Pesa Mock Integration endpoints
    path('data/mpesa/link', link_mpesa_account, name='link_mpesa_account'),
    path('data/mpesa/transactions', get_mpesa_transactions, name='get_mpesa_transactions'),
    path('data/sync', sync_mpesa_data, name='sync_mpesa_data'),
    
    # SMS Parsing endpoints
    path('data/sms/parse', parse_sms_messages, name='parse_sms_messages'),
    path('data/sms/preview', preview_sms_parsing, name='preview_sms_parsing'),
    path('data/sms/demo', get_demo_sms_messages, name='get_demo_sms_messages'),
    
    # Onboarding endpoints
    path('onboarding/info', get_onboarding_info, name='get_onboarding_info'),
]
