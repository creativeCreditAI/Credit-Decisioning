import re
import json
from datetime import datetime
from decimal import Decimal
from django.utils import timezone
from .models import MPesaAccount, MPesaTransaction

class SMSParsingService:
    """Service for parsing M-Pesa SMS messages and extracting transaction data"""
    
    # Common M-Pesa SMS patterns
    SMS_PATTERNS = [
        # Format: "MPK123456789 Confirmed. Ksh500.00 sent to JOHN DOE 254712345678 on 15/7/25 at 2:30 PM New M-PESA balance is Ksh2,500.00"
        {
            'pattern': r'(\w+)\s+Confirmed\.\s+Ksh([\d,]+\.\d{2})\s+sent\s+to\s+(.+?)\s+(\d+)\s+on\s+(\d+/\d+/\d+)\s+at\s+([\d:]+\s+[AP]M).*?balance\s+is\s+Ksh([\d,]+\.\d{2})',
            'type': 'debit',
            'category': 'transfer'
        },
        # Format: "MPK123456789 Confirmed. Ksh1,000.00 received from JANE DOE 254712345678 on 15/7/25 at 2:30 PM New M-PESA balance is Ksh3,500.00"
        {
            'pattern': r'(\w+)\s+Confirmed\.\s+Ksh([\d,]+\.\d{2})\s+received\s+from\s+(.+?)\s+(\d+)\s+on\s+(\d+/\d+/\d+)\s+at\s+([\d:]+\s+[AP]M).*?balance\s+is\s+Ksh([\d,]+\.\d{2})',
            'type': 'credit',
            'category': 'transfer'
        },
        # Format: "MPK123456789 Confirmed. Ksh200.00 paid to SAFARICOM on 15/7/25 at 2:30 PM New M-PESA balance is Ksh2,300.00"
        {
            'pattern': r'(\w+)\s+Confirmed\.\s+Ksh([\d,]+\.\d{2})\s+paid\s+to\s+(.+?)\s+on\s+(\d+/\d+/\d+)\s+at\s+([\d:]+\s+[AP]M).*?balance\s+is\s+Ksh([\d,]+\.\d{2})',
            'type': 'debit',
            'category': 'bills'
        },
        # Format: "MPK123456789 Confirmed. You have withdrawn Ksh1,000.00 from EQUITY BANK ATM on 15/7/25 at 2:30 PM New balance is Ksh2,000.00"
        {
            'pattern': r'(\w+)\s+Confirmed\.\s+You\s+have\s+withdrawn\s+Ksh([\d,]+\.\d{2})\s+from\s+(.+?)\s+on\s+(\d+/\d+/\d+)\s+at\s+([\d:]+\s+[AP]M).*?balance\s+is\s+Ksh([\d,]+\.\d{2})',
            'type': 'debit',
            'category': 'withdraw'
        },
        # Format: "MPK123456789 Confirmed. Ksh50,000.00 deposited to your account on 15/7/25 at 2:30 PM New balance is Ksh52,000.00"
        {
            'pattern': r'(\w+)\s+Confirmed\.\s+Ksh([\d,]+\.\d{2})\s+deposited\s+to\s+your\s+account\s+on\s+(\d+/\d+/\d+)\s+at\s+([\d:]+\s+[AP]M).*?balance\s+is\s+Ksh([\d,]+\.\d{2})',
            'type': 'credit',
            'category': 'salary'
        }
    ]
    
    MERCHANT_CATEGORIES = {
        'SAFARICOM': 'bills',
        'KPLC': 'bills',
        'NAIROBI WATER': 'bills',
        'NAIVAS': 'shopping',
        'TUSKYS': 'shopping',
        'EQUITY BANK': 'withdraw',
        'KCB': 'withdraw',
        'COOP BANK': 'withdraw',
        'UBER': 'transport',
        'BOLT': 'transport',
        'JUMIA': 'shopping',
    }
    
    @classmethod
    def parse_sms_batch(cls, sms_messages, mpesa_account):
        """Parse a batch of SMS messages and extract transactions"""
        parsed_transactions = []
        failed_messages = []
        
        for sms_text in sms_messages:
            try:
                transaction = cls.parse_single_sms(sms_text, mpesa_account)
                if transaction:
                    parsed_transactions.append(transaction)
                else:
                    failed_messages.append({
                        'sms': sms_text,
                        'error': 'No matching pattern found'
                    })
            except Exception as e:
                failed_messages.append({
                    'sms': sms_text,
                    'error': str(e)
                })
        
        return {
            'parsed_transactions': parsed_transactions,
            'failed_messages': failed_messages,
            'success_count': len(parsed_transactions),
            'failed_count': len(failed_messages)
        }
    
    @classmethod
    def parse_single_sms(cls, sms_text, mpesa_account):
        """Parse a single SMS message"""
        sms_text = sms_text.strip()
        
        for pattern_config in cls.SMS_PATTERNS:
            pattern = pattern_config['pattern']
            match = re.search(pattern, sms_text, re.IGNORECASE)
            
            if match:
                return cls._extract_transaction_from_match(
                    match, pattern_config, mpesa_account, sms_text
                )
        
        return None
    
    @classmethod
    def _extract_transaction_from_match(cls, match, pattern_config, mpesa_account, original_sms):
        """Extract transaction data from regex match"""
        groups = match.groups()
        
        # Common extraction logic based on pattern type
        if pattern_config['type'] == 'debit' and 'sent to' in original_sms.lower():
            # Transfer pattern
            transaction_id = groups[0]
            amount = cls._parse_amount(groups[1])
            recipient = groups[2].strip()
            date_str = groups[4]
            time_str = groups[5]
            balance = cls._parse_amount(groups[6])
            description = f"Money sent to {recipient}"
            
        elif pattern_config['type'] == 'credit' and 'received from' in original_sms.lower():
            # Receive pattern
            transaction_id = groups[0]
            amount = cls._parse_amount(groups[1])
            sender = groups[2].strip()
            date_str = groups[4]
            time_str = groups[5]
            balance = cls._parse_amount(groups[6])
            description = f"Money received from {sender}"
            
        elif 'paid to' in original_sms.lower():
            # Payment pattern
            transaction_id = groups[0]
            amount = cls._parse_amount(groups[1])
            merchant = groups[2].strip()
            date_str = groups[3]
            time_str = groups[4]
            balance = cls._parse_amount(groups[5])
            description = f"Payment to {merchant}"
            
        elif 'withdrawn' in original_sms.lower():
            # Withdrawal pattern
            transaction_id = groups[0]
            amount = cls._parse_amount(groups[1])
            location = groups[2].strip()
            date_str = groups[3]
            time_str = groups[4]
            balance = cls._parse_amount(groups[5])
            description = f"Cash withdrawal from {location}"
            
        elif 'deposited' in original_sms.lower():
            # Deposit pattern
            transaction_id = groups[0]
            amount = cls._parse_amount(groups[1])
            date_str = groups[2]
            time_str = groups[3]
            balance = cls._parse_amount(groups[4])
            description = "Deposit to account"
            
        else:
            return None
        
        # Parse date and time
        transaction_date = cls._parse_datetime(date_str, time_str)
        
        # Determine category
        category = cls._determine_category(description, pattern_config['category'])
        
        return {
            'mpesa_account': mpesa_account,
            'transaction_id': transaction_id,
            'amount': amount,
            'transaction_type': pattern_config['type'],
            'category': category,
            'description': description,
            'date': transaction_date,
            'balance_after': balance,
            'original_sms': original_sms
        }
    
    @classmethod
    def _parse_amount(cls, amount_str):
        """Parse amount string and return Decimal"""
        # Remove commas and convert to Decimal
        clean_amount = amount_str.replace(',', '')
        return Decimal(clean_amount)
    
    @classmethod
    def _parse_datetime(cls, date_str, time_str):
        """Parse date and time strings"""
        try:
            # Convert format like "15/7/25" to "2025-07-15"
            day, month, year = date_str.split('/')
            if len(year) == 2:
                year = f"20{year}"
            
            # Convert 12-hour format to 24-hour
            time_obj = datetime.strptime(time_str, '%I:%M %p')
            time_24 = time_obj.strftime('%H:%M')
            
            # Combine date and time
            datetime_str = f"{year}-{month.zfill(2)}-{day.zfill(2)} {time_24}:00"
            dt = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
            
            # Make timezone-aware
            return timezone.make_aware(dt)
            
        except Exception as e:
            # Fallback to current time if parsing fails
            return timezone.now()
    
    @classmethod
    def _determine_category(cls, description, default_category):
        """Determine transaction category based on description"""
        description_upper = description.upper()
        
        for merchant, category in cls.MERCHANT_CATEGORIES.items():
            if merchant in description_upper:
                return category
        
        # Additional logic for common patterns
        if any(word in description_upper for word in ['SUPERMARKET', 'SHOP', 'STORE']):
            return 'shopping'
        elif any(word in description_upper for word in ['MATATU', 'BUS', 'TRANSPORT']):
            return 'transport'
        elif any(word in description_upper for word in ['RESTAURANT', 'CAFE', 'FOOD']):
            return 'food'
        elif any(word in description_upper for word in ['ATM', 'AGENT', 'WITHDRAW']):
            return 'withdraw'
        elif any(word in description_upper for word in ['SALARY', 'WAGE', 'PAY']):
            return 'salary'
        
        return default_category
    
    @classmethod
    def create_transactions_from_parsed_data(cls, parsed_data, mpesa_account):
        """Create MPesaTransaction objects from parsed data"""
        created_transactions = []
        duplicate_count = 0
        
        for transaction_data in parsed_data['parsed_transactions']:
            # Check if transaction already exists
            existing = MPesaTransaction.objects.filter(
                transaction_id=transaction_data['transaction_id'],
                mpesa_account=mpesa_account
            ).first()
            
            if not existing:
                # Remove original_sms from data before creating model instance
                model_data = transaction_data.copy()
                model_data.pop('original_sms', None)
                
                transaction = MPesaTransaction.objects.create(**model_data)
                created_transactions.append(transaction)
            else:
                duplicate_count += 1
        
        # Update last sync time
        mpesa_account.last_sync = timezone.now()
        mpesa_account.save()
        
        return {
            'created_transactions': created_transactions,
            'created_count': len(created_transactions),
            'duplicate_count': duplicate_count,
            'failed_count': parsed_data['failed_count']
        }
    
    @classmethod
    def generate_demo_sms_messages(cls):
        """Generate demo SMS messages for testing"""
        demo_messages = [
            "MPK1234567890 Confirmed. Ksh50,000.00 deposited to your account on 15/7/25 at 9:00 AM New M-PESA balance is Ksh52,500.00",
            "MPK1234567891 Confirmed. Ksh500.00 sent to JOHN DOE 254712345678 on 15/7/25 at 2:30 PM New M-PESA balance is Ksh52,000.00",
            "MPK1234567892 Confirmed. Ksh200.00 paid to SAFARICOM on 16/7/25 at 10:15 AM New M-PESA balance is Ksh51,800.00",
            "MPK1234567893 Confirmed. Ksh1,500.00 paid to KPLC on 16/7/25 at 3:45 PM New M-PESA balance is Ksh50,300.00",
            "MPK1234567894 Confirmed. You have withdrawn Ksh5,000.00 from EQUITY BANK ATM on 17/7/25 at 11:00 AM New balance is Ksh45,300.00",
            "MPK1234567895 Confirmed. Ksh2,000.00 received from JANE DOE 254798765432 on 17/7/25 at 6:20 PM New M-PESA balance is Ksh47,300.00",
            "MPK1234567896 Confirmed. Ksh800.00 paid to NAIVAS SUPERMARKET on 18/7/25 at 7:30 PM New M-PESA balance is Ksh46,500.00"
        ]
        return demo_messages
