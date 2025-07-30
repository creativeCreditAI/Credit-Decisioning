
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
    get_onboarding_info,
    ai_parse_sms_messages,
    ai_preview_sms_parsing,
    smart_categorize_transactions,
    get_ai_parsing_analytics
)

# Import funding application views
from .funding_views import (
    funding_applications,
    funding_application_detail,
    submit_funding_application,
    upload_application_document,
    application_document_detail,
    upload_application_media,
    application_media_detail,
    analyze_application_ai,
    application_insights,
    admin_applications_list,
    funding_analytics
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
    
    # AI-Enhanced SMS Parsing endpoints
    path('data/sms/ai-parse', ai_parse_sms_messages, name='ai_parse_sms_messages'),
    path('data/sms/ai-preview', ai_preview_sms_parsing, name='ai_preview_sms_parsing'),
    path('data/transactions/smart-categorize', smart_categorize_transactions, name='smart_categorize_transactions'),
    path('data/analytics/ai-parsing', get_ai_parsing_analytics, name='get_ai_parsing_analytics'),
    
    # Onboarding endpoints
    path('onboarding/info', get_onboarding_info, name='get_onboarding_info'),
    
    # ============================================================================
    # FUNDING APPLICATION ENDPOINTS
    # ============================================================================
    
    # Core funding application management
    path('funding/applications', funding_applications, name='funding_applications'),
    path('funding/applications/<int:application_id>', funding_application_detail, name='funding_application_detail'),
    path('funding/applications/<int:application_id>/submit', submit_funding_application, name='submit_funding_application'),
    
    # Document management
    path('funding/applications/<int:application_id>/documents', upload_application_document, name='upload_application_document'),
    path('funding/applications/<int:application_id>/documents/<int:document_id>', application_document_detail, name='application_document_detail'),
    
    # Media management
    path('funding/applications/<int:application_id>/media', upload_application_media, name='upload_application_media'),
    path('funding/applications/<int:application_id>/media/<int:media_id>', application_media_detail, name='application_media_detail'),
    
    # AI Analysis
    path('funding/applications/<int:application_id>/analyze', analyze_application_ai, name='analyze_application_ai'),
    path('funding/applications/<int:application_id>/insights', application_insights, name='application_insights'),
    
    # Admin endpoints
    path('funding/admin/applications', admin_applications_list, name='admin_applications_list'),
    path('funding/admin/analytics', funding_analytics, name='funding_analytics'),
]
