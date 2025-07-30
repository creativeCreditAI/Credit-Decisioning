from decimal import Decimal
from .models import FinancialData, CreditScore, User

class CreditScoringService:
    """Service class for calculating credit scores"""
    
    BASE_SCORE = 500
    MAX_SCORE = 900
    MIN_SCORE = 300
    
    @classmethod
    def calculate_score(cls, user_id, financial_data=None):
        """Calculate credit score for a user"""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ValueError(f"User with id {user_id} does not exist")
        
        # Get or create financial data
        if financial_data:
            fin_data, created = FinancialData.objects.get_or_create(
                user=user,
                defaults=financial_data
            )
            if not created:
                # Update existing data
                for key, value in financial_data.items():
                    setattr(fin_data, key, value)
                fin_data.save()
        else:
            fin_data, created = FinancialData.objects.get_or_create(user=user)
        
        # Calculate score components
        transaction_freq_points = cls._calculate_transaction_frequency_points(fin_data.transaction_frequency)
        balance_points = cls._calculate_average_balance_points(fin_data.average_balance)
        income_regularity_points = cls._calculate_income_regularity_points(fin_data.income_consistency)
        payment_history_points = cls._calculate_payment_history_points(fin_data.payment_history_score)
        overdraft_penalty = cls._calculate_overdraft_penalty(fin_data.overdraft_count)
        
        # Calculate final score
        final_score = (
            cls.BASE_SCORE +
            transaction_freq_points +
            balance_points +
            income_regularity_points +
            payment_history_points -
            overdraft_penalty
        )
        
        # Ensure score is within valid range
        final_score = max(cls.MIN_SCORE, min(cls.MAX_SCORE, final_score))
        
        # Determine rating
        rating = cls._get_rating(final_score)
        
        # Create factors breakdown
        factors = {
            'transaction_frequency': transaction_freq_points,
            'average_balance': balance_points,
            'income_regularity': income_regularity_points,
            'payment_history': payment_history_points,
            'overdraft_penalty': -overdraft_penalty
        }
        
        # Generate improvement tips
        improvement_tips = cls._generate_improvement_tips(fin_data, factors)
        
        # Save credit score
        credit_score = CreditScore.objects.create(
            user=user,
            score=final_score,
            rating=rating,
            base_score=cls.BASE_SCORE,
            transaction_frequency_points=transaction_freq_points,
            average_balance_points=balance_points,
            income_regularity_points=income_regularity_points,
            payment_history_points=payment_history_points,
            overdraft_penalty=overdraft_penalty,
            factors=factors,
            improvement_tips=improvement_tips
        )
        
        return credit_score
    
    @classmethod
    def _calculate_transaction_frequency_points(cls, frequency):
        """Calculate points for transaction frequency (0-100 points)"""
        if frequency >= 50:
            return 100
        elif frequency >= 30:
            return 85
        elif frequency >= 20:
            return 70
        elif frequency >= 10:
            return 50
        elif frequency >= 5:
            return 30
        else:
            return 10
    
    @classmethod
    def _calculate_average_balance_points(cls, balance):
        """Calculate points for average balance (0-150 points)"""
        balance = float(balance) if balance else 0
        
        if balance >= 100000:
            return 150
        elif balance >= 50000:
            return 130
        elif balance >= 25000:
            return 110
        elif balance >= 10000:
            return 90
        elif balance >= 5000:
            return 70
        elif balance >= 1000:
            return 50
        elif balance >= 500:
            return 30
        else:
            return 10
    
    @classmethod
    def _calculate_income_regularity_points(cls, consistency):
        """Calculate points for income regularity (0-100 points)"""
        if consistency >= 0.9:
            return 100
        elif consistency >= 0.8:
            return 85
        elif consistency >= 0.7:
            return 70
        elif consistency >= 0.6:
            return 55
        elif consistency >= 0.5:
            return 40
        elif consistency >= 0.3:
            return 25
        else:
            return 10
    
    @classmethod
    def _calculate_payment_history_points(cls, payment_score):
        """Calculate points for payment history (0-150 points)"""
        if payment_score >= 95:
            return 150
        elif payment_score >= 85:
            return 130
        elif payment_score >= 75:
            return 110
        elif payment_score >= 65:
            return 90
        elif payment_score >= 50:
            return 70
        elif payment_score >= 30:
            return 50
        else:
            return 20
    
    @classmethod
    def _calculate_overdraft_penalty(cls, overdraft_count):
        """Calculate penalty for overdrafts (0-50 points penalty)"""
        return min(50, overdraft_count * 10)
    
    @classmethod
    def _get_rating(cls, score):
        """Get rating based on score"""
        if score >= 850:
            return 'Excellent'
        elif score >= 750:
            return 'Very Good'
        elif score >= 650:
            return 'Good'
        elif score >= 550:
            return 'Fair'
        else:
            return 'Poor'
    
    @classmethod
    def _generate_improvement_tips(cls, financial_data, factors):
        """Generate improvement tips based on financial data"""
        tips = []
        
        if factors['transaction_frequency'] < 50:
            tips.append("Increase your transaction frequency to show active account usage")
        
        if factors['average_balance'] < 90:
            tips.append("Maintain a higher average account balance")
        
        if factors['income_regularity'] < 70:
            tips.append("Maintain consistent monthly income")
        
        if factors['payment_history'] < 100:
            tips.append("Improve your payment history by making timely payments")
        
        if factors['overdraft_penalty'] < 0:
            tips.append("Avoid overdrafts to prevent score penalties")
        
        if financial_data.monthly_income < 50000:
            tips.append("Consider ways to increase your monthly income")
        
        return tips
