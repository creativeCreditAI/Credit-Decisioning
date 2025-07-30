import random
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from django.db import models
from .models import MPesaAccount, MPesaTransaction

class MPesaMockService:
    """Service class for generating mock M-Pesa data"""
    
    TRANSACTION_CATEGORIES = {
        'credit': [
            ('salary', 'Salary payment from COMPANY LTD'),
            ('business', 'Business payment from Customer'),
            ('transfer', 'Money transfer from'),
            ('savings', 'Savings withdrawal'),
            ('business', 'Payment received'),
        ],
        'debit': [
            ('bills', 'KPLC - Electricity bill'),
            ('bills', 'Safaricom - Phone bill'),
            ('bills', 'NAIROBI WATER - Water bill'),
            ('shopping', 'NAIVAS SUPERMARKET'),
            ('shopping', 'TUSKYS SUPERMARKET'),
            ('transport', 'Matatu fare'),
            ('transport', 'Uber ride'),
            ('food', 'Restaurant payment'),
            ('withdraw', 'Agent cash withdrawal'),
            ('airtime', 'Airtime purchase'),
            ('utilities', 'Internet payment'),
            ('loan', 'Loan repayment'),
            ('transfer', 'Send money to'),
        ]
    }
    
    @classmethod
    def generate_mock_transactions(cls, mpesa_account, days=30):
        """Generate realistic mock transactions for a given account"""
        transactions = []
        current_balance = Decimal(random.uniform(5000, 50000))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Generate 3-8 transactions per day on average
        total_transactions = random.randint(days * 2, days * 8)
        
        for i in range(total_transactions):
            # Random date within the range
            random_days = random.uniform(0, days)
            transaction_date = start_date + timedelta(days=random_days)
            
            # Determine transaction type (70% debit, 30% credit)
            transaction_type = 'debit' if random.random() < 0.7 else 'credit'
            
            # Get random category and description
            category, base_description = random.choice(cls.TRANSACTION_CATEGORIES[transaction_type])
            
            # Generate amount based on category
            amount = cls._generate_amount_by_category(category, transaction_type)
            
            # Update balance
            if transaction_type == 'credit':
                current_balance += amount
                description = f"{base_description} - KES {amount:,.2f}"
            else:
                current_balance -= amount
                description = f"{base_description} - KES {amount:,.2f}"
                
            # Ensure balance doesn't go too negative
            if current_balance < -5000:
                current_balance = Decimal(random.uniform(1000, 10000))
            
            # Generate unique transaction ID
            transaction_id = f"MPK{random.randint(100000, 999999)}{i}"
            
            transactions.append({
                'mpesa_account': mpesa_account,
                'transaction_id': transaction_id,
                'amount': amount,
                'transaction_type': transaction_type,
                'category': category,
                'description': description,
                'date': transaction_date,
                'balance_after': current_balance,
            })
        
        # Sort by date (oldest first)
        transactions.sort(key=lambda x: x['date'])
        
        # Recalculate balances in chronological order
        running_balance = Decimal(random.uniform(10000, 30000))
        for transaction in transactions:
            if transaction['transaction_type'] == 'credit':
                running_balance += transaction['amount']
            else:
                running_balance -= transaction['amount']
            transaction['balance_after'] = max(running_balance, Decimal('0'))
            running_balance = transaction['balance_after']
        
        return transactions
    
    @classmethod
    def _generate_amount_by_category(cls, category, transaction_type):
        """Generate realistic amounts based on category"""
        amount_ranges = {
            'salary': (30000, 150000),
            'business': (5000, 100000),
            'bills': (500, 15000),
            'shopping': (200, 10000),
            'transport': (50, 2000),
            'food': (100, 5000),
            'withdraw': (1000, 20000),
            'airtime': (50, 1000),
            'utilities': (1000, 8000),
            'loan': (5000, 50000),
            'transfer': (500, 30000),
            'savings': (10000, 100000),
            'other': (100, 5000),
        }
        
        min_amount, max_amount = amount_ranges.get(category, (100, 5000))
        
        # Add some randomness to make amounts more realistic
        if category == 'salary':
            # Salaries tend to be round numbers
            amount = random.choice([30000, 45000, 60000, 75000, 100000, 120000])
        elif category in ['bills', 'utilities']:
            # Bills tend to be somewhat regular
            base_amount = random.uniform(min_amount, max_amount)
            amount = round(base_amount / 100) * 100  # Round to nearest 100
        else:
            amount = random.uniform(min_amount, max_amount)
            
        return Decimal(str(round(amount, 2)))
    
    @classmethod
    def create_mock_transactions(cls, mpesa_account, days=30, force_sync=False):
        """Create and save mock transactions to the database"""
        # Check if transactions already exist and force_sync is False
        if not force_sync and mpesa_account.transactions.exists():
            return mpesa_account.transactions.order_by('-date')[:100]
        
        # Generate mock data
        mock_transactions = cls.generate_mock_transactions(mpesa_account, days)
        
        # Clear existing transactions if force_sync
        if force_sync:
            mpesa_account.transactions.all().delete()
        
        # Create transaction objects
        transaction_objects = []
        for transaction_data in mock_transactions:
            transaction_objects.append(MPesaTransaction(**transaction_data))
        
        # Bulk create transactions
        MPesaTransaction.objects.bulk_create(transaction_objects)
        
        # Update last sync time
        mpesa_account.last_sync = timezone.now()
        mpesa_account.save()
        
        return mpesa_account.transactions.order_by('-date')
    
    @classmethod
    def get_account_summary(cls, mpesa_account, days=30):
        """Get account summary with statistics"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        transactions = mpesa_account.transactions.filter(
            date__gte=start_date,
            date__lte=end_date
        )
        
        total_credits = transactions.filter(transaction_type='credit').aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0')
        
        total_debits = transactions.filter(transaction_type='debit').aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0')
        
        net_flow = total_credits - total_debits
        
        # Get latest balance
        latest_transaction = transactions.order_by('-date').first()
        current_balance = latest_transaction.balance_after if latest_transaction else Decimal('0')
        
        return {
            'current_balance': float(current_balance),
            'total_credits': float(total_credits),
            'total_debits': float(total_debits),
            'net_flow': float(net_flow),
            'transaction_count': transactions.count(),
            'period_days': days,
        }
