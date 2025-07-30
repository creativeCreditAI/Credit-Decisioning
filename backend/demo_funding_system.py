#!/usr/bin/env python
"""
Funding Application System Demo

This script demonstrates the complete funding application workflow including:
- Creating funding applications
- Uploading documents and media
- AI-powered business analysis
- Credit scoring and risk assessment
- Generating personalized recommendations
"""

import os
import sys
import django
from decimal import Decimal

# Add the project directory to the Python path
sys.path.append('/home/clencyc/Dev/Credit-Decisioning/backend')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import FundingApplication, FundingApplicationDocument, FundingApplicationMedia
from api.ai_business_analyzer import AIBusinessAnalyzer
from api.serializers import FundingApplicationSerializer

User = get_user_model()

def create_demo_user():
    """Create a demo user for testing"""
    user, created = User.objects.get_or_create(
        email='founder@example.com',
        defaults={
            'phone': '+254712345678'
        }
    )
    if created:
        user.set_password('demo123')
        user.save()
        print(f"✅ Created demo user: {user.email}")
    else:
        print(f"✅ Using existing demo user: {user.email}")
    return user

def create_demo_applications():
    """Create various demo funding applications"""
    user = create_demo_user()
    
    applications_data = [
        {
            'business_name': 'EcoFarm Kenya',
            'business_description': '''EcoFarm Kenya is an innovative agritech platform that connects small-scale farmers 
            directly with urban consumers and restaurants. Our technology-driven approach includes IoT sensors for crop 
            monitoring, predictive analytics for optimal harvest timing, and a mobile marketplace that eliminates 
            middlemen. We serve over 2,000 farmers across Central Kenya and have partnerships with 50+ restaurants 
            in Nairobi. Our solution increases farmer income by 40% while providing fresh, traceable produce to 
            consumers. The platform also offers weather forecasting, farming tips, and micro-loan facilitation.''',
            'industry': 'agritech',
            'business_stage': 'early_revenue',
            'funding_stage': 'seed',
            'funding_amount_requested': Decimal('5000000'),  # 5M KES
            'use_of_funds': '''Funding will be allocated as follows: 40% for technology development and mobile app 
            enhancement, 25% for farmer onboarding and training programs, 20% for marketing and customer acquisition, 
            10% for working capital, and 5% for regulatory compliance and certifications.''',
            'team_size': 4,
            'founder_experience': '''CEO has 8 years in agricultural development with USAID and Kenya Agricultural 
            Research Institute. CTO is a software engineer with 6 years at Safaricom. CFO has 5 years in 
            microfinance. Head of Operations managed supply chains for 3 years at Twiga Foods.''',
            'monthly_revenue': Decimal('800000'),  # 800K KES
            'monthly_burn_rate': Decimal('400000'),  # 400K KES
            'runway_months': 18,
            'equity_offered': Decimal('15.0'),
            'portfolio_website': 'https://ecofarm.co.ke',
            'linkedin_profile': 'https://linkedin.com/in/jane-founder',
            'instagram_profile': 'https://instagram.com/ecofarmkenya',
            'youtube_profile': 'https://youtube.com/ecofarmkenya'
        },
        {
            'business_name': 'HealthLink Mobile',
            'business_description': '''HealthLink Mobile is a telemedicine platform designed for rural Kenya, 
            providing remote healthcare consultations via mobile phones and basic smartphones. Our platform connects 
            patients with licensed doctors through voice calls, SMS, and simple app interfaces. We've conducted 
            over 10,000 consultations and work with 200+ community health workers across 5 counties. The service 
            includes prescription delivery through local pharmacies and health record management.''',
            'industry': 'healthtech',
            'business_stage': 'growth',
            'funding_stage': 'series_a',
            'funding_amount_requested': Decimal('12000000'),  # 12M KES
            'use_of_funds': '''50% for geographic expansion to 10 new counties, 30% for platform development and 
            AI-powered diagnosis assistance, 15% for regulatory approvals and medical partnerships, 5% for 
            team expansion.''',
            'team_size': 6,
            'founder_experience': '''CEO is a medical doctor with 10 years in public health and 3 years in health 
            tech startups. CTO has 8 years in mobile development at major telecom companies.''',
            'monthly_revenue': Decimal('1500000'),  # 1.5M KES
            'monthly_burn_rate': Decimal('800000'),  # 800K KES
            'runway_months': 15,
            'equity_offered': Decimal('20.0'),
            'portfolio_website': 'https://healthlink.co.ke',
            'linkedin_profile': 'https://linkedin.com/in/dr-healthfounder'
        },
        {
            'business_name': 'EduTech Solutions',
            'business_description': '''A digital learning platform providing affordable online courses and tutoring 
            for Kenyan students. We offer curriculum-aligned content for primary and secondary education with 
            offline capability for areas with poor internet connectivity.''',
            'industry': 'edtech',
            'business_stage': 'prototype',
            'funding_stage': 'pre_seed',
            'funding_amount_requested': Decimal('2000000'),  # 2M KES
            'use_of_funds': '''60% for product development, 30% for content creation, 10% for initial marketing.''',
            'team_size': 2,
            'founder_experience': '''Founder is a former teacher with 5 years of classroom experience and basic 
            programming knowledge. Co-founder has 3 years in content development.''',
            'monthly_revenue': Decimal('0'),
            'monthly_burn_rate': Decimal('150000'),  # 150K KES
            'runway_months': 8,
            'equity_offered': Decimal('25.0'),
            'portfolio_website': 'https://edutech.co.ke'
        }
    ]
    
    created_applications = []
    
    for app_data in applications_data:
        app_data['applicant'] = user
        application = FundingApplication.objects.create(**app_data)
        created_applications.append(application)
        print(f"✅ Created application: {application.business_name}")
    
    return created_applications

def demonstrate_ai_analysis():
    """Demonstrate AI business analysis on funding applications"""
    print("\n🤖 AI BUSINESS ANALYSIS DEMONSTRATION")
    print("=" * 60)
    
    applications = FundingApplication.objects.all()
    analyzer = AIBusinessAnalyzer()
    
    for application in applications:
        print(f"\n📊 Analyzing: {application.business_name}")
        print("-" * 40)
        
        # Perform AI analysis
        analysis_result = analyzer.analyze_funding_application(application)
        
        # Update application with results
        application.creditworthiness_score = analysis_result['creditworthiness_score']
        application.business_viability_score = analysis_result['business_viability_score']
        application.risk_assessment = analysis_result['risk_assessment']
        application.save()
        
        # Display results
        print(f"🏆 Creditworthiness Score: {analysis_result['creditworthiness_score']}/100")
        print(f"📈 Business Viability Score: {analysis_result['business_viability_score']}/100")
        print(f"⚠️  Risk Level: {analysis_result['risk_assessment']['risk_level']}")
        print(f"📝 Risk Description: {analysis_result['risk_assessment']['description']}")
        
        print(f"\n💪 Strengths ({len(analysis_result['strengths'])}):")
        for strength in analysis_result['strengths']:
            print(f"  • {strength}")
        
        print(f"\n🔧 Areas for Improvement ({len(analysis_result['areas_for_improvement'])}):")
        for area in analysis_result['areas_for_improvement']:
            print(f"  • {area}")
        
        print(f"\n🎯 Top Recommendations ({len(analysis_result['recommendations'][:2])}):")
        for rec in analysis_result['recommendations'][:2]:
            print(f"  • {rec['recommendation']} (Priority: {rec['priority']})")

def demonstrate_categorization():
    """Demonstrate application categorization and insights"""
    print("\n📊 APPLICATION PORTFOLIO ANALYSIS")
    print("=" * 50)
    
    # Industry distribution
    from django.db.models import Count
    industry_stats = FundingApplication.objects.values('industry').annotate(count=Count('industry')).order_by('-count')
    
    print("🏭 Industry Distribution:")
    for stat in industry_stats:
        print(f"  • {stat['industry'].title()}: {stat['count']} applications")
    
    # Stage distribution
    stage_stats = FundingApplication.objects.values('business_stage').annotate(count=Count('business_stage')).order_by('-count')
    
    print("\n🚀 Business Stage Distribution:")
    for stat in stage_stats:
        print(f"  • {stat['business_stage'].replace('_', ' ').title()}: {stat['count']} applications")
    
    # Average metrics
    from django.db.models import Avg
    avg_metrics = FundingApplication.objects.aggregate(
        avg_funding=Avg('funding_amount_requested'),
        avg_revenue=Avg('monthly_revenue'),
        avg_team_size=Avg('team_size'),
        avg_runway=Avg('runway_months')
    )
    
    print("\n📈 Portfolio Averages:")
    print(f"  • Average Funding Requested: KES {avg_metrics['avg_funding']:,.0f}")
    print(f"  • Average Monthly Revenue: KES {avg_metrics['avg_revenue']:,.0f}")
    print(f"  • Average Team Size: {avg_metrics['avg_team_size']:.1f} people")
    print(f"  • Average Runway: {avg_metrics['avg_runway']:.1f} months")
    
    # Top performers
    print("\n🏆 Top Performing Applications:")
    top_apps = FundingApplication.objects.exclude(
        creditworthiness_score__isnull=True
    ).order_by('-creditworthiness_score')[:3]
    
    for i, app in enumerate(top_apps, 1):
        print(f"  {i}. {app.business_name} - Score: {app.creditworthiness_score}/100")

def demonstrate_risk_analysis():
    """Demonstrate risk analysis across applications"""
    print("\n⚠️  RISK ANALYSIS SUMMARY")
    print("=" * 40)
    
    applications = FundingApplication.objects.exclude(risk_assessment__isnull=True)
    
    risk_levels = {}
    total_risk_flags = 0
    
    for app in applications:
        risk_data = app.risk_assessment
        risk_level = risk_data.get('risk_level', 'Unknown')
        
        if risk_level not in risk_levels:
            risk_levels[risk_level] = 0
        risk_levels[risk_level] += 1
        
        risk_flags = risk_data.get('risk_flags', [])
        total_risk_flags += len(risk_flags)
    
    print("📊 Risk Level Distribution:")
    for level, count in risk_levels.items():
        print(f"  • {level} Risk: {count} applications")
    
    print(f"\n🚩 Total Risk Flags Identified: {total_risk_flags}")
    print(f"📊 Average Risk Flags per Application: {total_risk_flags/len(applications):.1f}")
    
    # Show common risk factors
    all_risk_flags = []
    for app in applications:
        risk_data = app.risk_assessment
        all_risk_flags.extend(risk_data.get('risk_flags', []))
    
    from collections import Counter
    common_risks = Counter(all_risk_flags).most_common(3)
    
    print(f"\n🔴 Most Common Risk Factors:")
    for risk, count in common_risks:
        print(f"  • {risk}: {count} occurrences")

def demonstrate_funding_recommendations():
    """Demonstrate personalized funding recommendations"""
    print("\n🎯 FUNDING RECOMMENDATIONS")
    print("=" * 40)
    
    applications = FundingApplication.objects.all()
    
    for app in applications:
        print(f"\n📋 {app.business_name}")
        print(f"💰 Requested: KES {app.funding_amount_requested:,}")
        print(f"🎯 Stage: {app.funding_stage.replace('_', ' ').title()}")
        
        # Funding readiness assessment
        if app.creditworthiness_score:
            score = float(app.creditworthiness_score)
            if score >= 80:
                readiness = "🟢 Highly Ready"
            elif score >= 60:
                readiness = "🟡 Moderately Ready"
            else:
                readiness = "🔴 Needs Improvement"
            
            print(f"🚦 Funding Readiness: {readiness} ({score:.0f}/100)")
        
        # Estimated valuation (simplified)
        monthly_revenue = float(app.monthly_revenue or 0)
        if monthly_revenue > 0:
            # Simple revenue multiple (varies by industry and stage)
            revenue_multiple = 30 if app.industry in ['fintech', 'saas'] else 20
            estimated_valuation = monthly_revenue * 12 * revenue_multiple
            print(f"💎 Estimated Valuation: KES {estimated_valuation:,.0f}")

def run_demo():
    """Run the complete funding application demo"""
    print("🚀 FUNDING APPLICATION SYSTEM DEMO")
    print("=" * 50)
    print("Testing comprehensive AI-powered funding application analysis...")
    
    # Create demo applications
    applications = create_demo_applications()
    print(f"\n✅ Created {len(applications)} demo applications")
    
    # Run AI analysis
    demonstrate_ai_analysis()
    
    # Show categorization insights
    demonstrate_categorization()
    
    # Show risk analysis
    demonstrate_risk_analysis()
    
    # Show funding recommendations
    demonstrate_funding_recommendations()
    
    print("\n🎉 DEMO COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print("🌟 The funding application system demonstrates:")
    print("  ✅ Comprehensive AI business analysis")
    print("  ✅ Multi-factor credit scoring")
    print("  ✅ Intelligent risk assessment")
    print("  ✅ Personalized recommendations")
    print("  ✅ Portfolio analytics and insights")
    print("  ✅ Ready for production use!")

if __name__ == "__main__":
    run_demo()
