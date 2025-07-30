"""
AI-Enhanced SMS Parsing Demo

This script demonstrates the advanced AI capabilities of the SMS parsing system,
including natural language processing, machine learning classification, and 
intelligent transaction categorization.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append('/home/clencyc/Dev/Credit-Decisioning/backend')
django.setup()

from api.ai_sms_parser import AIEnhancedSMSParser
from api.models import User, MPesaAccount, MPesaTransaction
from django.contrib.auth import get_user_model
import json
from decimal import Decimal

def demo_ai_sms_parsing():
    """Comprehensive demo of AI-enhanced SMS parsing capabilities"""
    
    print("🤖 AI-Enhanced SMS Parsing Demonstration")
    print("=" * 60)
    
    # Demo SMS messages with various formats and complexities
    demo_sms_messages = [
        # Standard M-Pesa format
        "MPK1234567890 Confirmed. Ksh50,000.00 deposited to your account on 15/7/25 at 9:00 AM New M-PESA balance is Ksh52,500.00",
        
        # Slightly malformed format (missing punctuation)
        "MPK1234567891 Confirmed Ksh500 sent to JOHN DOE 254712345678 on 15/7/25 at 2:30 PM New M-PESA balance is Ksh52000",
        
        # Different merchant format
        "MPK1234567892 Confirmed. Ksh200.00 paid to SAFARICOM LIMITED on 16/7/25 at 10:15 AM Transaction cost Ksh5.00 New M-PESA balance is Ksh51,795.00",
        
        # Withdrawal with location
        "MPK1234567893 Confirmed. You have withdrawn Ksh5,000.00 from EQUITY BANK ATM WESTLANDS on 17/7/25 at 11:00 AM Transaction cost Ksh33.00 New balance is Ksh46,762.00",
        
        # Transfer with phone number
        "MPK1234567894 Confirmed. Ksh2,000.00 received from JANE DOE 254798765432 on 17/7/25 at 6:20 PM Transaction cost Ksh0.00 New M-PESA balance is Ksh48,762.00",
        
        # Bill payment
        "MPK1234567895 Confirmed. Ksh1,500.00 paid to KPLC PREPAID on 18/7/25 at 7:30 PM Transaction cost Ksh25.00 New M-PESA balance is Ksh47,237.00",
        
        # Shopping transaction
        "MPK1234567896 Confirmed. Ksh800.00 paid to NAIVAS SUPERMARKET KAREN on 19/7/25 at 8:45 AM Transaction cost Ksh0.00 New M-PESA balance is Ksh46,437.00",
        
        # Unusual format - partial information
        "Transaction MPK1234567897: Ksh300 to UBER TRIP payment successful. Balance: Ksh46,137",
        
        # Very informal format
        "M-Pesa: Sent 1000 to mama on 20/7/25. New balance 45137",
        
        # Complex merchant name
        "MPK1234567898 Confirmed. Ksh12,500.00 paid to AGA KHAN UNIVERSITY HOSPITAL LTD on 21/7/25 at 10:30 AM New M-PESA balance is Ksh33,637.00"
    ]
    
    # Create demo user and M-Pesa account
    User = get_user_model()
    demo_user, created = User.objects.get_or_create(
        email="ai_demo@example.com",
        defaults={'phone': '254700000000'}
    )
    
    mpesa_account, created = MPesaAccount.objects.get_or_create(
        user=demo_user,
        defaults={
            'phone_number': '254700000000',
            'account_name': 'AI Demo Account',
            'is_linked': True
        }
    )
    
    print(f"📱 Demo Account: {mpesa_account.account_name} ({mpesa_account.phone_number})")
    print(f"📝 Processing {len(demo_sms_messages)} SMS messages...\n")
    
    # Initialize AI parser
    ai_parser = AIEnhancedSMSParser()
    
    # Process each SMS individually to show detailed analysis
    print("🔍 INDIVIDUAL SMS ANALYSIS")
    print("-" * 40)
    
    for i, sms in enumerate(demo_sms_messages, 1):
        print(f"\n📨 SMS {i}:")
        print(f"Raw: {sms[:80]}..." if len(sms) > 80 else f"Raw: {sms}")
        
        # Parse individual SMS
        result = ai_parser._ai_enhanced_parse(sms, mpesa_account)
        
        if result['success']:
            transaction = result['transaction']
            print(f"✅ Parsed successfully (Method: {result['method']})")
            print(f"   💰 Amount: Ksh {transaction['amount']}")
            print(f"   📝 Type: {transaction['transaction_type'].title()}")
            print(f"   🏷️  Category: {transaction['category'].title()}")
            print(f"   📄 Description: {transaction['description']}")
            print(f"   🎯 Confidence: {result['confidence']:.2f}")
            
            if 'insights' in result:
                insights = result['insights']
                print(f"   🧠 AI Insights:")
                print(f"      - Spending Pattern: {insights.get('spending_pattern', {}).get('amount_tier', 'N/A')}")
                print(f"      - Risk Score: {insights.get('risk_indicators', {}).get('score', 0):.2f}")
                print(f"      - Behavioral Flags: {', '.join(insights.get('behavioral_flags', []))}")
        else:
            print(f"❌ Failed to parse: {result['error']}")
    
    # Batch processing demo
    print(f"\n\n🔄 BATCH PROCESSING ANALYSIS")
    print("-" * 40)
    
    batch_result = ai_parser.parse_sms_batch_ai(demo_sms_messages, mpesa_account)
    
    print(f"📊 Batch Processing Results:")
    print(f"   Total Messages: {len(demo_sms_messages)}")
    print(f"   Successfully Parsed: {batch_result['success_count']}")
    print(f"   Failed to Parse: {batch_result['failed_count']}")
    print(f"   Success Rate: {(batch_result['success_count']/len(demo_sms_messages)*100):.1f}%")
    
    # Get parsing statistics
    stats = ai_parser.get_parsing_statistics()
    print(f"\n📈 AI Performance Metrics:")
    print(f"   AI Enhanced Parses: {stats.get('ai_enhanced_parses', 0)}")
    print(f"   Fallback Parses: {stats.get('fallback_parses', 0)}")
    print(f"   AI Enhancement Rate: {stats.get('ai_enhancement_rate', 0):.1f}%")
    
    # Transaction pattern analysis
    print(f"\n\n📊 TRANSACTION PATTERN ANALYSIS")
    print("-" * 40)
    
    transactions = batch_result['parsed_transactions']
    
    # Category distribution
    categories = {}
    total_amount = Decimal('0')
    
    for transaction in transactions:
        category = transaction['category']
        amount = transaction['amount']
        
        if category not in categories:
            categories[category] = {'count': 0, 'total': Decimal('0')}
        
        categories[category]['count'] += 1
        categories[category]['total'] += amount
        total_amount += amount
    
    print("💳 Spending by Category:")
    for category, data in sorted(categories.items(), key=lambda x: x[1]['total'], reverse=True):
        percentage = (data['total'] / total_amount * 100) if total_amount > 0 else 0
        print(f"   {category.title()}: Ksh {data['total']:,.2f} ({data['count']} transactions, {percentage:.1f}%)")
    
    # AI insights summary
    print(f"\n\n🧠 AI INSIGHTS SUMMARY")
    print("-" * 40)
    
    ai_insights = batch_result['ai_insights']
    
    # Aggregate insights
    high_risk_transactions = 0
    emergency_transactions = 0
    business_transactions = 0
    
    for insight in ai_insights:
        risk_score = insight.get('risk_indicators', {}).get('score', 0)
        if risk_score > 0.5:
            high_risk_transactions += 1
        
        flags = insight.get('behavioral_flags', [])
        if 'emergency' in flags:
            emergency_transactions += 1
        if 'business' in flags:
            business_transactions += 1
    
    print(f"🚨 High Risk Transactions: {high_risk_transactions}")
    print(f"🚑 Emergency Transactions: {emergency_transactions}")
    print(f"💼 Business Transactions: {business_transactions}")
    
    # Merchant analysis
    print(f"\n📈 Merchant Intelligence:")
    merchants = {}
    for transaction in transactions:
        description = transaction['description']
        if 'to ' in description.lower():
            merchant = description.split('to ')[1].split(' ')[0]
            merchants[merchant] = merchants.get(merchant, 0) + 1
    
    for merchant, count in sorted(merchants.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"   {merchant}: {count} transactions")
    
    # Generate personalized recommendations
    print(f"\n\n💡 PERSONALIZED RECOMMENDATIONS")
    print("-" * 40)
    
    recommendations = generate_ai_recommendations(transactions, categories, total_amount)
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec}")
    
    print(f"\n\n🎯 CONFIDENCE & ACCURACY ANALYSIS")
    print("-" * 40)
    
    confidence_scores = [t.get('confidence_score', 0.8) for t in transactions]
    avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
    
    high_confidence = sum(1 for score in confidence_scores if score >= 0.8)
    medium_confidence = sum(1 for score in confidence_scores if 0.6 <= score < 0.8)
    low_confidence = sum(1 for score in confidence_scores if score < 0.6)
    
    print(f"📊 Confidence Distribution:")
    print(f"   Average Confidence: {avg_confidence:.2f}")
    print(f"   High Confidence (≥0.8): {high_confidence} transactions")
    print(f"   Medium Confidence (0.6-0.8): {medium_confidence} transactions")
    print(f"   Low Confidence (<0.6): {low_confidence} transactions")
    
    return {
        'batch_result': batch_result,
        'stats': stats,
        'categories': categories,
        'recommendations': recommendations
    }

def generate_ai_recommendations(transactions, categories, total_amount):
    """Generate AI-powered financial recommendations"""
    recommendations = []
    
    # Analyze spending patterns
    if 'shopping' in categories and categories['shopping']['total'] > total_amount * 0.3:
        recommendations.append("🛒 Shopping expenses are high (>30%). Consider creating a monthly shopping budget.")
    
    if 'withdraw' in categories and categories['withdraw']['count'] > len(transactions) * 0.3:
        recommendations.append("💳 High cash withdrawal frequency detected. Mobile payments offer better tracking.")
    
    if 'bills' in categories and categories['bills']['total'] > 0:
        recommendations.append("📅 Set up automatic bill payments to avoid late fees and improve credit history.")
    
    # Analyze transaction frequency
    if len(transactions) > 50:
        recommendations.append("📊 High transaction volume detected. Regular financial review recommended.")
    
    # Analyze amounts
    large_transactions = sum(1 for t in transactions if t['amount'] > 10000)
    if large_transactions > 0:
        recommendations.append(f"💰 {large_transactions} large transactions (>10K) found. Ensure these align with your budget.")
    
    if not recommendations:
        recommendations.append("✅ Your spending patterns look healthy! Continue monitoring regularly.")
    
    return recommendations

def demo_natural_language_processing():
    """Demonstrate NLP capabilities"""
    
    print(f"\n\n🗣️  NATURAL LANGUAGE PROCESSING DEMO")
    print("=" * 60)
    
    # Example of difficult/ambiguous SMS messages
    challenging_messages = [
        "Money sent 500 bob to John yesterday",
        "Paid rent 25k via mpesa code ABC123",
        "Received salary deposit KSh 45,000",
        "Withdrew cash 2k from agent",
        "Bill payment KPLC 1500 successful",
        "Transfer to mama 3000 complete"
    ]
    
    print("🧠 Processing challenging/ambiguous messages:")
    
    ai_parser = AIEnhancedSMSParser()
    
    for msg in challenging_messages:
        print(f"\n📝 Input: '{msg}'")
        
        # Extract financial entities
        entities = ai_parser._extract_financial_entities(msg)
        print(f"   💰 Extracted Amount: {entities['amount'] or 'Not found'}")
        print(f"   🆔 Transaction ID: {entities['transaction_id'] or 'Generated'}")
        print(f"   👥 Counterparty: {entities['recipient'] or entities['sender'] or 'Unknown'}")
        
        # Classify transaction type
        tx_type = ai_parser._classify_transaction_type(msg, entities)
        print(f"   📊 Type: {tx_type}")
        
        # Categorize
        category = ai_parser._ai_categorize_transaction(msg, entities)
        print(f"   🏷️  Category: {category}")

if __name__ == "__main__":
    try:
        # Run main demo
        results = demo_ai_sms_parsing()
        
        # Run NLP demo
        demo_natural_language_processing()
        
        print(f"\n\n🎉 AI-Enhanced SMS Parsing Demo Complete!")
        print("=" * 60)
        print("Key Features Demonstrated:")
        print("✅ Advanced pattern recognition with confidence scoring")
        print("✅ Natural language processing for entity extraction")
        print("✅ Intelligent transaction categorization")
        print("✅ Behavioral pattern analysis")
        print("✅ Risk assessment and fraud detection")
        print("✅ Personalized financial recommendations")
        print("✅ Multi-stage parsing with fallback mechanisms")
        print("✅ Comprehensive analytics and insights")
        
    except Exception as e:
        print(f"❌ Error during demo: {str(e)}")
        import traceback
        traceback.print_exc()
