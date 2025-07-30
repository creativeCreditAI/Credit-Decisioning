import re
import json
import logging
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional, Tuple
from django.utils import timezone
from django.conf import settings
from .models import MPesaAccount, MPesaTransaction

# Set up logging
logger = logging.getLogger(__name__)

class AIEnhancedSMSParser:
    """
    Advanced AI-powered SMS parsing service with natural language processing,
    machine learning classification, and intelligent pattern recognition.
    """
    
    # Enhanced pattern library with confidence scoring
    ENHANCED_PATTERNS = [
        {
            'id': 'mpesa_send_v1',
            'pattern': r'(\w+)\s+Confirmed\.\s*(?:You\s+have\s+)?(?:sent|paid)\s+(?:Ksh\.?)?([\d,]+\.?\d*)\s+to\s+(.+?)(?:\s+\d{10,})?(?:\s+on\s+(\d+/\d+/\d+))?(?:\s+at\s+([\d:]+\s*[AP]M))?.*?(?:balance|bal).*?(?:Ksh\.?)?([\d,]+\.?\d*)',
            'type': 'debit',
            'confidence': 0.95,
            'categories': ['transfer', 'payment', 'bills'],
            'description_template': 'Payment to {recipient}'
        },
        {
            'id': 'mpesa_receive_v1',
            'pattern': r'(\w+)\s+Confirmed\.\s*(?:You\s+have\s+)?received\s+(?:Ksh\.?)?([\d,]+\.?\d*)\s+from\s+(.+?)(?:\s+\d{10,})?(?:\s+on\s+(\d+/\d+/\d+))?(?:\s+at\s+([\d:]+\s*[AP]M))?.*?(?:balance|bal).*?(?:Ksh\.?)?([\d,]+\.?\d*)',
            'type': 'credit',
            'confidence': 0.95,
            'categories': ['transfer', 'salary', 'income'],
            'description_template': 'Received from {sender}'
        },
        {
            'id': 'mpesa_withdraw_v1',
            'pattern': r'(\w+)\s+Confirmed\.\s*(?:You\s+have\s+)?withdrawn\s+(?:Ksh\.?)?([\d,]+\.?\d*)\s+from\s+(.+?)(?:\s+on\s+(\d+/\d+/\d+))?(?:\s+at\s+([\d:]+\s*[AP]M))?.*?(?:balance|bal).*?(?:Ksh\.?)?([\d,]+\.?\d*)',
            'type': 'debit',
            'confidence': 0.95,
            'categories': ['withdraw', 'cash'],
            'description_template': 'Cash withdrawal from {location}'
        },
        {
            'id': 'mpesa_deposit_v1',
            'pattern': r'(\w+)\s+Confirmed\.\s*(?:Ksh\.?)?([\d,]+\.?\d*)\s+deposited.*?(?:on\s+(\d+/\d+/\d+))?(?:\s+at\s+([\d:]+\s*[AP]M))?.*?(?:balance|bal).*?(?:Ksh\.?)?([\d,]+\.?\d*)',
            'type': 'credit',
            'confidence': 0.90,
            'categories': ['deposit', 'salary', 'income'],
            'description_template': 'Deposit to account'
        }
    ]
    
    # AI-enhanced merchant categorization with scoring
    AI_MERCHANT_CATEGORIES = {
        # Utilities & Bills
        'utilities': {
            'keywords': ['kplc', 'nairobi water', 'electricity', 'water', 'sewer', 'power', 'utility'],
            'patterns': [r'kplc|electricity|power|utility', r'water|sewer|county'],
            'confidence': 0.95
        },
        # Telecommunications
        'telecom': {
            'keywords': ['safaricom', 'airtel', 'telkom', 'orange', 'data', 'airtime', 'bundles'],
            'patterns': [r'safaricom|airtel|telkom|orange', r'airtime|data|bundles?'],
            'confidence': 0.95
        },
        # Shopping & Retail
        'shopping': {
            'keywords': ['naivas', 'tuskys', 'carrefour', 'quickmart', 'supermarket', 'shop', 'store', 'mall'],
            'patterns': [r'naivas|tuskys|carrefour|quickmart', r'supermarket|shop|store|mall|retail'],
            'confidence': 0.90
        },
        # Banking & Financial
        'banking': {
            'keywords': ['equity', 'kcb', 'coop', 'bank', 'atm', 'agent', 'loan', 'savings'],
            'patterns': [r'equity|kcb|coop|bank|atm', r'loan|savings|investment'],
            'confidence': 0.95
        },
        # Transportation
        'transport': {
            'keywords': ['uber', 'bolt', 'little', 'matatu', 'bus', 'taxi', 'transport', 'travel'],
            'patterns': [r'uber|bolt|little|taxi', r'matatu|bus|transport|travel'],
            'confidence': 0.90
        },
        # Food & Dining
        'food': {
            'keywords': ['kfc', 'pizza', 'restaurant', 'cafe', 'hotel', 'food', 'dining', 'meal'],
            'patterns': [r'kfc|pizza|restaurant|cafe|hotel', r'food|dining|meal|kitchen'],
            'confidence': 0.85
        },
        # Entertainment
        'entertainment': {
            'keywords': ['cinema', 'movie', 'game', 'sport', 'club', 'bar', 'entertainment'],
            'patterns': [r'cinema|movie|game|sport', r'club|bar|entertainment|fun'],
            'confidence': 0.80
        },
        # Healthcare
        'healthcare': {
            'keywords': ['hospital', 'clinic', 'doctor', 'pharmacy', 'medical', 'health'],
            'patterns': [r'hospital|clinic|doctor|pharmacy', r'medical|health|medicine'],
            'confidence': 0.90
        },
        # Education
        'education': {
            'keywords': ['school', 'university', 'college', 'fee', 'tuition', 'education', 'learning'],
            'patterns': [r'school|university|college', r'fee|tuition|education|learning'],
            'confidence': 0.90
        }
    }
    
    # Transaction behavior patterns for AI analysis
    BEHAVIOR_PATTERNS = {
        'salary_indicators': [
            r'salary|wage|pay|stipend|allowance',
            r'monthly.*deposit|recurring.*income',
            r'employer|company|organization'
        ],
        'business_indicators': [
            r'till|paybill|business|shop|store',
            r'goods|services|products|sales',
            r'customer|client|buyer'
        ],
        'emergency_indicators': [
            r'urgent|emergency|hospital|medical',
            r'loan|borrow|advance|credit',
            r'family|relative|help|assist'
        ],
        'investment_indicators': [
            r'investment|saving|deposit|fund',
            r'shares|stock|bond|portfolio',
            r'sacco|chama|group|cooperative'
        ]
    }
    
    def __init__(self):
        self.parsing_stats = {
            'total_processed': 0,
            'successful_parses': 0,
            'ai_enhanced_parses': 0,
            'fallback_parses': 0,
            'failed_parses': 0
        }
    
    def parse_sms_batch_ai(self, sms_messages: List[str], mpesa_account: MPesaAccount) -> Dict[str, Any]:
        """
        AI-enhanced batch SMS parsing with intelligent fallback mechanisms
        """
        parsed_transactions = []
        failed_messages = []
        ai_insights = []
        
        for sms_text in sms_messages:
            self.parsing_stats['total_processed'] += 1
            
            try:
                # First attempt: AI-enhanced parsing
                result = self._ai_enhanced_parse(sms_text, mpesa_account)
                
                if result['success']:
                    parsed_transactions.append(result['transaction'])
                    ai_insights.append(result['insights'])
                    self.parsing_stats['successful_parses'] += 1
                    
                    if result['method'] == 'ai_enhanced':
                        self.parsing_stats['ai_enhanced_parses'] += 1
                    else:
                        self.parsing_stats['fallback_parses'] += 1
                else:
                    failed_messages.append({
                        'sms': sms_text,
                        'error': result['error'],
                        'confidence': result.get('confidence', 0.0)
                    })
                    self.parsing_stats['failed_parses'] += 1
                    
            except Exception as e:
                logger.error(f"Error parsing SMS: {str(e)}")
                failed_messages.append({
                    'sms': sms_text,
                    'error': f"Processing error: {str(e)}",
                    'confidence': 0.0
                })
                self.parsing_stats['failed_parses'] += 1
        
        return {
            'parsed_transactions': parsed_transactions,
            'failed_messages': failed_messages,
            'ai_insights': ai_insights,
            'parsing_stats': self.parsing_stats,
            'success_count': len(parsed_transactions),
            'failed_count': len(failed_messages)
        }
    
    def _ai_enhanced_parse(self, sms_text: str, mpesa_account: MPesaAccount) -> Dict[str, Any]:
        """
        Multi-stage AI parsing with confidence scoring and intelligent categorization
        """
        sms_text = sms_text.strip()
        
        # Stage 1: Enhanced pattern matching with confidence scoring
        pattern_result = self._enhanced_pattern_matching(sms_text)
        
        if pattern_result['confidence'] >= 0.85:
            # High confidence pattern match - proceed with extraction
            transaction = self._extract_transaction_from_match(
                pattern_result['match'], pattern_result['pattern'], mpesa_account, sms_text
            )
            if transaction:
                insights = self._generate_ai_insights(sms_text, transaction)
                return {
                    'success': True,
                    'transaction': transaction,
                    'method': 'ai_enhanced',
                    'confidence': pattern_result['confidence'],
                    'insights': insights
                }
        
        # Stage 2: Intelligent text analysis for partial matches
        semantic_result = self._semantic_analysis(sms_text, mpesa_account)
        
        if semantic_result['confidence'] >= 0.70:
            insights = self._generate_ai_insights(sms_text, semantic_result['transaction'])
            return {
                'success': True,
                'transaction': semantic_result['transaction'],
                'method': 'semantic_analysis',
                'confidence': semantic_result['confidence'],
                'insights': insights
            }
        
        # Stage 3: Fallback to legacy regex patterns
        fallback_result = self._fallback_regex_parse(sms_text, mpesa_account)
        
        if fallback_result:
            insights = self._generate_ai_insights(sms_text, fallback_result)
            return {
                'success': True,
                'transaction': fallback_result,
                'method': 'fallback_regex',
                'confidence': 0.60,
                'insights': insights
            }
        
        return {
            'success': False,
            'error': 'Unable to parse SMS with any available method',
            'confidence': 0.0
        }
    
    def _enhanced_pattern_matching(self, sms_text: str) -> Dict[str, Any]:
        """
        Enhanced pattern matching with confidence scoring and fuzzy matching
        """
        best_match = {'confidence': 0.0, 'pattern': None, 'match': None}
        
        for pattern_config in self.ENHANCED_PATTERNS:
            pattern = pattern_config['pattern']
            
            # Try exact pattern match
            match = re.search(pattern, sms_text, re.IGNORECASE | re.DOTALL)
            
            if match:
                confidence = pattern_config['confidence']
                
                # Boost confidence based on SMS quality indicators
                if 'confirmed' in sms_text.lower():
                    confidence += 0.03
                if 'balance' in sms_text.lower():
                    confidence += 0.02
                if re.search(r'ksh\.?\s*\d', sms_text, re.IGNORECASE):
                    confidence += 0.02
                
                if confidence > best_match['confidence']:
                    best_match = {
                        'confidence': min(confidence, 1.0),
                        'pattern': pattern_config,
                        'match': match
                    }
        
        return best_match
    
    def _semantic_analysis(self, sms_text: str, mpesa_account: MPesaAccount) -> Dict[str, Any]:
        """
        Semantic analysis for SMS messages that don't match standard patterns
        """
        # Extract key information using NLP techniques
        entities = self._extract_financial_entities(sms_text)
        
        if not entities['amount'] or not entities['transaction_id']:
            return {'confidence': 0.0}
        
        # Determine transaction type and category using AI
        transaction_type = self._classify_transaction_type(sms_text, entities)
        category = self._ai_categorize_transaction(sms_text, entities)
        
        # Generate transaction data
        transaction = {
            'mpesa_account': mpesa_account,
            'transaction_id': entities['transaction_id'],
            'amount': entities['amount'],
            'transaction_type': transaction_type,
            'category': category,
            'description': self._generate_smart_description(sms_text, entities),
            'date': entities['date'] or timezone.now(),
            'balance_after': entities['balance'],
            'original_sms': sms_text,
            'ai_processed': True,
            'confidence_score': 0.75
        }
        
        return {
            'confidence': 0.75,
            'transaction': transaction
        }
    
    def _extract_financial_entities(self, sms_text: str) -> Dict[str, Any]:
        """
        Extract financial entities using NLP patterns and rules
        """
        entities = {
            'amount': None,
            'balance': None,
            'transaction_id': None,
            'date': None,
            'recipient': None,
            'sender': None,
            'location': None
        }
        
        # Extract amounts (enhanced pattern)
        amount_pattern = r'(?:ksh\.?\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
        amounts = re.findall(amount_pattern, sms_text, re.IGNORECASE)
        
        if amounts:
            entities['amount'] = self._parse_amount(amounts[0])
            if len(amounts) > 1:
                entities['balance'] = self._parse_amount(amounts[-1])
        
        # Extract transaction ID
        tx_id_pattern = r'\b([A-Z]{2,3}\w{7,12})\b'
        tx_match = re.search(tx_id_pattern, sms_text)
        if tx_match:
            entities['transaction_id'] = tx_match.group(1)
        
        # Extract dates
        date_pattern = r'(\d{1,2}/\d{1,2}/\d{2,4})'
        date_match = re.search(date_pattern, sms_text)
        if date_match:
            entities['date'] = self._parse_datetime(date_match.group(1), '12:00 PM')
        
        # Extract names and locations
        if 'to ' in sms_text.lower():
            recipient_pattern = r'to\s+([A-Z\s]+?)(?:\s+\d{10,}|\s+on\s+|\.|$)'
            recipient_match = re.search(recipient_pattern, sms_text, re.IGNORECASE)
            if recipient_match:
                entities['recipient'] = recipient_match.group(1).strip()
        
        if 'from ' in sms_text.lower():
            sender_pattern = r'from\s+([A-Z\s]+?)(?:\s+\d{10,}|\s+on\s+|\.|$)'
            sender_match = re.search(sender_pattern, sms_text, re.IGNORECASE)
            if sender_match:
                entities['sender'] = sender_match.group(1).strip()
        
        return entities
    
    def _classify_transaction_type(self, sms_text: str, entities: Dict[str, Any]) -> str:
        """
        AI-powered transaction type classification
        """
        sms_lower = sms_text.lower()
        
        # Credit indicators
        credit_keywords = ['received', 'deposited', 'credited', 'paid in', 'income', 'salary']
        
        # Debit indicators
        debit_keywords = ['sent', 'paid', 'withdrawn', 'debited', 'charged', 'fee']
        
        credit_score = sum(1 for keyword in credit_keywords if keyword in sms_lower)
        debit_score = sum(1 for keyword in debit_keywords if keyword in sms_lower)
        
        if entities['sender']:
            credit_score += 2
        if entities['recipient']:
            debit_score += 2
        
        return 'credit' if credit_score > debit_score else 'debit'
    
    def _ai_categorize_transaction(self, sms_text: str, entities: Dict[str, Any]) -> str:
        """
        AI-powered transaction categorization with confidence scoring
        """
        sms_lower = sms_text.lower()
        best_category = 'other'
        best_score = 0.0
        
        for category, config in self.AI_MERCHANT_CATEGORIES.items():
            score = 0.0
            
            # Keyword matching
            for keyword in config['keywords']:
                if keyword in sms_lower:
                    score += 0.3
            
            # Pattern matching
            for pattern in config['patterns']:
                if re.search(pattern, sms_lower):
                    score += 0.4
            
            # Context-based scoring
            if entities['recipient'] or entities['sender']:
                name = (entities['recipient'] or entities['sender']).lower()
                for keyword in config['keywords']:
                    if keyword in name:
                        score += 0.5
            
            # Apply confidence multiplier
            final_score = score * config['confidence']
            
            if final_score > best_score:
                best_score = final_score
                best_category = category
        
        # Special handling for specific transaction types
        if 'withdraw' in sms_lower or 'atm' in sms_lower:
            return 'withdraw'
        elif 'deposit' in sms_lower or 'salary' in sms_lower:
            return 'salary' if 'salary' in sms_lower else 'deposit'
        elif entities['recipient'] and not any(cat in sms_lower for cat in ['bill', 'pay']):
            return 'transfer'
        
        return best_category if best_score > 0.5 else 'other'
    
    def _generate_smart_description(self, sms_text: str, entities: Dict[str, Any]) -> str:
        """
        Generate intelligent transaction descriptions
        """
        if entities['recipient']:
            return f"Payment to {entities['recipient']}"
        elif entities['sender']:
            return f"Received from {entities['sender']}"
        elif 'withdraw' in sms_text.lower():
            location = entities['location'] or 'ATM'
            return f"Cash withdrawal from {location}"
        elif 'deposit' in sms_text.lower():
            return "Account deposit"
        else:
            # Extract key action words
            action_words = re.findall(r'\b(sent|paid|received|withdrawn|deposited)\b', 
                                   sms_text, re.IGNORECASE)
            if action_words:
                return f"Transaction: {action_words[0].title()}"
            return "Mobile money transaction"
    
    def _generate_ai_insights(self, sms_text: str, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate AI insights about the transaction
        """
        insights = {
            'spending_pattern': self._analyze_spending_pattern(transaction),
            'merchant_analysis': self._analyze_merchant(sms_text, transaction),
            'behavioral_flags': self._detect_behavioral_patterns(sms_text, transaction),
            'risk_indicators': self._assess_risk_indicators(sms_text, transaction),
            'recommendation': self._generate_recommendation(transaction)
        }
        
        return insights
    
    def _analyze_spending_pattern(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze spending patterns"""
        amount = float(transaction['amount'])
        category = transaction['category']
        
        patterns = {
            'amount_tier': 'high' if amount > 10000 else 'medium' if amount > 1000 else 'low',
            'category_frequency': category,
            'transaction_regularity': 'irregular'  # Would need historical data for accurate assessment
        }
        
        return patterns
    
    def _analyze_merchant(self, sms_text: str, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze merchant information"""
        description = transaction['description'].lower()
        
        analysis = {
            'merchant_type': 'identified' if any(cat in description for cat in self.AI_MERCHANT_CATEGORIES.keys()) else 'unknown',
            'business_hours': self._detect_business_hours(sms_text),
            'location_context': self._extract_location_context(sms_text)
        }
        
        return analysis
    
    def _detect_behavioral_patterns(self, sms_text: str, transaction: Dict[str, Any]) -> List[str]:
        """Detect behavioral patterns in transactions"""
        flags = []
        sms_lower = sms_text.lower()
        
        for pattern_type, patterns in self.BEHAVIOR_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, sms_lower):
                    flags.append(pattern_type.replace('_indicators', ''))
                    break
        
        return flags
    
    def _assess_risk_indicators(self, sms_text: str, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risk indicators"""
        risk = {
            'score': 0.0,
            'factors': []
        }
        
        amount = float(transaction['amount'])
        
        # High amount transactions
        if amount > 50000:
            risk['score'] += 0.3
            risk['factors'].append('high_amount')
        
        # Unusual time patterns (would need historical data)
        if 'emergency' in sms_text.lower() or 'urgent' in sms_text.lower():
            risk['score'] += 0.4
            risk['factors'].append('emergency_transaction')
        
        # Unknown merchants
        if transaction['category'] == 'other':
            risk['score'] += 0.2
            risk['factors'].append('unknown_merchant')
        
        return risk
    
    def _generate_recommendation(self, transaction: Dict[str, Any]) -> str:
        """Generate personalized recommendations"""
        category = transaction['category']
        amount = float(transaction['amount'])
        
        if category == 'bills' and amount > 5000:
            return "Consider setting up automatic bill payments to avoid late fees"
        elif category == 'shopping' and amount > 10000:
            return "Large shopping expense detected. Review if this aligns with your budget"
        elif category == 'withdraw' and amount > 20000:
            return "Large cash withdrawal. Consider mobile payments for better transaction tracking"
        else:
            return "Transaction recorded successfully"
    
    def _detect_business_hours(self, sms_text: str) -> str:
        """Detect if transaction occurred during business hours"""
        time_pattern = r'(\d{1,2}):(\d{2})\s*(AM|PM)'
        match = re.search(time_pattern, sms_text, re.IGNORECASE)
        
        if match:
            hour = int(match.group(1))
            period = match.group(3).upper()
            
            if period == 'PM' and hour != 12:
                hour += 12
            elif period == 'AM' and hour == 12:
                hour = 0
            
            if 9 <= hour <= 17:
                return 'business_hours'
            elif 18 <= hour <= 22:
                return 'evening'
            else:
                return 'off_hours'
        
        return 'unknown'
    
    def _extract_location_context(self, sms_text: str) -> str:
        """Extract location context from SMS"""
        location_indicators = ['ATM', 'AGENT', 'BRANCH', 'SHOP', 'STORE', 'MALL']
        
        for indicator in location_indicators:
            if indicator in sms_text.upper():
                return indicator.lower()
        
        return 'unknown'
    
    def _fallback_regex_parse(self, sms_text: str, mpesa_account: MPesaAccount) -> Optional[Dict[str, Any]]:
        """Fallback to legacy regex parsing"""
        # Import the original SMS parsing service for fallback
        from .sms_parser import SMSParsingService
        
        return SMSParsingService.parse_single_sms(sms_text, mpesa_account)
    
    def _extract_transaction_from_match(self, match, pattern_config: Dict[str, Any], 
                                      mpesa_account: MPesaAccount, original_sms: str) -> Dict[str, Any]:
        """Extract transaction data from enhanced pattern match"""
        groups = match.groups()
        
        # Enhanced extraction logic with AI enhancements
        transaction_id = groups[0] if groups and groups[0] else f"AI_{timezone.now().strftime('%Y%m%d%H%M%S')}"
        amount = self._parse_amount(groups[1]) if len(groups) > 1 and groups[1] else Decimal('0.00')
        
        # Smart recipient/sender extraction
        if len(groups) > 2 and groups[2]:
            counterparty = groups[2].strip()
        else:
            counterparty = self._extract_counterparty_ai(original_sms)
        
        # Enhanced date/time parsing
        if len(groups) > 4:
            date_str = groups[3] if groups[3] else timezone.now().strftime('%d/%m/%y')
            time_str = groups[4] if groups[4] else '12:00 PM'
        else:
            date_str = timezone.now().strftime('%d/%m/%y')
            time_str = '12:00 PM'
        
        # Enhanced balance extraction
        balance = self._parse_amount(groups[-1]) if groups and groups[-1] else Decimal('0.00')
        
        # AI-powered categorization
        category = self._ai_categorize_transaction(original_sms, {
            'recipient': counterparty if pattern_config['type'] == 'debit' else None,
            'sender': counterparty if pattern_config['type'] == 'credit' else None
        })
        
        # Generate smart description
        description = self._generate_context_aware_description(
            pattern_config, counterparty, original_sms
        )
        
        return {
            'mpesa_account': mpesa_account,
            'transaction_id': transaction_id,
            'amount': amount,
            'transaction_type': pattern_config['type'],
            'category': category,
            'description': description,
            'date': self._parse_datetime(date_str, time_str),
            'balance_after': balance,
            'original_sms': original_sms,
            'ai_processed': True,
            'confidence_score': pattern_config['confidence']
        }
    
    def _extract_counterparty_ai(self, sms_text: str) -> str:
        """AI-powered counterparty extraction"""
        # Look for names in various contexts
        patterns = [
            r'(?:to|from)\s+([A-Z][A-Z\s]+?)(?:\s+\d{10,}|\s+on\s+|\.|$)',
            r'([A-Z][A-Z\s]+?)\s+\d{10,}',
            r'paid\s+to\s+([A-Z][A-Z\s]+?)(?:\s+on\s+|\.|$)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, sms_text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                if len(name) > 2:  # Ensure it's a meaningful name
                    return name
        
        return 'Unknown'
    
    def _generate_context_aware_description(self, pattern_config: Dict[str, Any], 
                                          counterparty: str, sms_text: str) -> str:
        """Generate context-aware transaction descriptions"""
        template = pattern_config.get('description_template', 'Transaction')
        
        if '{recipient}' in template:
            return template.format(recipient=counterparty)
        elif '{sender}' in template:
            return template.format(sender=counterparty)
        elif '{location}' in template:
            return template.format(location=counterparty)
        else:
            return template
    
    def _parse_amount(self, amount_str: str) -> Decimal:
        """Enhanced amount parsing with error handling"""
        try:
            clean_amount = re.sub(r'[^\d.]', '', amount_str)
            if not clean_amount:
                return Decimal('0.00')
            return Decimal(clean_amount)
        except Exception:
            return Decimal('0.00')
    
    def _parse_datetime(self, date_str: str, time_str: str) -> datetime:
        """Enhanced datetime parsing with multiple format support"""
        try:
            # Handle various date formats
            date_patterns = [
                '%d/%m/%y', '%d/%m/%Y', '%d-%m-%y', '%d-%m-%Y',
                '%m/%d/%y', '%m/%d/%Y', '%Y-%m-%d'
            ]
            
            parsed_date = None
            for pattern in date_patterns:
                try:
                    parsed_date = datetime.strptime(date_str, pattern)
                    break
                except ValueError:
                    continue
            
            if not parsed_date:
                parsed_date = datetime.now()
            
            # Handle time parsing
            try:
                time_obj = datetime.strptime(time_str, '%I:%M %p')
                parsed_date = parsed_date.replace(
                    hour=time_obj.hour, 
                    minute=time_obj.minute
                )
            except ValueError:
                pass
            
            return timezone.make_aware(parsed_date)
            
        except Exception:
            return timezone.now()
    
    def get_parsing_statistics(self) -> Dict[str, Any]:
        """Get detailed parsing statistics"""
        total = self.parsing_stats['total_processed']
        if total == 0:
            return self.parsing_stats
        
        stats = self.parsing_stats.copy()
        stats.update({
            'success_rate': (stats['successful_parses'] / total) * 100,
            'ai_enhancement_rate': (stats['ai_enhanced_parses'] / total) * 100,
            'fallback_rate': (stats['fallback_parses'] / total) * 100,
            'failure_rate': (stats['failed_parses'] / total) * 100
        })
        
        return stats
    
    def create_transactions_from_parsed_data(self, parsed_data, mpesa_account):
        """Create MPesaTransaction objects from AI-parsed data"""
        created_transactions = []
        duplicate_count = 0
        
        for transaction_data in parsed_data['parsed_transactions']:
            # Check if transaction already exists
            existing = MPesaTransaction.objects.filter(
                transaction_id=transaction_data['transaction_id'],
                mpesa_account=mpesa_account
            ).first()
            
            if not existing:
                # Remove fields that shouldn't be in the model
                model_data = transaction_data.copy()
                model_data.pop('original_sms', None)
                model_data.pop('ai_processed', None)
                model_data.pop('confidence_score', None)
                
                # Create the transaction
                transaction = MPesaTransaction.objects.create(**model_data)
                
                # Set additional AI fields if the model supports them
                if hasattr(transaction, 'ai_processed'):
                    transaction.ai_processed = transaction_data.get('ai_processed', True)
                if hasattr(transaction, 'confidence_score'):
                    transaction.confidence_score = transaction_data.get('confidence_score', 0.8)
                if hasattr(transaction, 'original_sms'):
                    transaction.original_sms = transaction_data.get('original_sms', '')
                
                transaction.save()
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
