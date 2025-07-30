"""
AI Business Analyzer for Funding Applications

This module provides comprehensive AI-powered analysis of funding applications,
including business viability assessment, creditworthiness scoring, risk analysis,
and personalized recommendations for founders seeking investment.
"""

import re
import json
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Any, Optional
from django.utils import timezone

logger = logging.getLogger(__name__)

class AIBusinessAnalyzer:
    """
    Advanced AI analyzer for comprehensive business and funding application evaluation
    """
    
    # Industry scoring factors
    INDUSTRY_RISK_FACTORS = {
        'fintech': {'risk_multiplier': 1.2, 'growth_potential': 0.9, 'market_size': 0.8},
        'healthtech': {'risk_multiplier': 1.1, 'growth_potential': 0.8, 'market_size': 0.7},
        'edtech': {'risk_multiplier': 1.0, 'growth_potential': 0.7, 'market_size': 0.6},
        'agritech': {'risk_multiplier': 0.8, 'growth_potential': 0.8, 'market_size': 0.9},
        'logistics': {'risk_multiplier': 0.9, 'growth_potential': 0.7, 'market_size': 0.8},
        'ecommerce': {'risk_multiplier': 1.1, 'growth_potential': 0.8, 'market_size': 0.9},
        'saas': {'risk_multiplier': 1.0, 'growth_potential': 0.9, 'market_size': 0.7},
        'marketplace': {'risk_multiplier': 1.3, 'growth_potential': 0.9, 'market_size': 0.8},
        'social': {'risk_multiplier': 0.7, 'growth_potential': 0.6, 'market_size': 0.5},
        'clean_energy': {'risk_multiplier': 0.9, 'growth_potential': 0.8, 'market_size': 0.7},
        'manufacturing': {'risk_multiplier': 0.8, 'growth_potential': 0.6, 'market_size': 0.8},
        'retail': {'risk_multiplier': 1.0, 'growth_potential': 0.6, 'market_size': 0.8},
        'other': {'risk_multiplier': 1.0, 'growth_potential': 0.5, 'market_size': 0.5}
    }
    
    # Business stage scoring
    BUSINESS_STAGE_SCORES = {
        'idea': {'viability': 0.3, 'risk': 0.9, 'funding_readiness': 0.2},
        'prototype': {'viability': 0.5, 'risk': 0.8, 'funding_readiness': 0.4},
        'beta': {'viability': 0.6, 'risk': 0.7, 'funding_readiness': 0.6},
        'early_revenue': {'viability': 0.7, 'risk': 0.6, 'funding_readiness': 0.7},
        'growth': {'viability': 0.8, 'risk': 0.5, 'funding_readiness': 0.8},
        'expansion': {'viability': 0.9, 'risk': 0.4, 'funding_readiness': 0.9},
        'mature': {'viability': 0.95, 'risk': 0.3, 'funding_readiness': 0.95}
    }
    
    # Funding stage alignment
    FUNDING_STAGE_ALIGNMENT = {
        'pre_seed': ['idea', 'prototype'],
        'seed': ['prototype', 'beta', 'early_revenue'],
        'series_a': ['early_revenue', 'growth'],
        'series_b': ['growth', 'expansion'],
        'series_c': ['expansion', 'mature'],
        'bridge': ['early_revenue', 'growth', 'expansion'],
        'other': ['idea', 'prototype', 'beta', 'early_revenue', 'growth']
    }
    
    def __init__(self):
        self.analysis_results = {}
        
    def analyze_funding_application(self, application) -> Dict[str, Any]:
        """
        Comprehensive AI analysis of funding application
        """
        try:
            # Perform individual analyses
            business_analysis = self._analyze_business_viability(application)
            financial_analysis = self._analyze_financial_health(application)
            risk_analysis = self._analyze_risk_factors(application)
            team_analysis = self._analyze_team_strength(application)
            market_analysis = self._analyze_market_opportunity(application)
            
            # Calculate composite scores
            creditworthiness_score = self._calculate_creditworthiness(application, financial_analysis)
            business_viability_score = self._calculate_business_viability(business_analysis, market_analysis, team_analysis)
            
            # Generate comprehensive risk assessment
            risk_assessment = self._generate_risk_assessment(risk_analysis, application)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(application, business_analysis, financial_analysis, risk_analysis)
            
            # Identify strengths and improvement areas
            strengths = self._identify_strengths(application, business_analysis, financial_analysis, team_analysis)
            areas_for_improvement = self._identify_improvement_areas(application, business_analysis, financial_analysis, risk_analysis)
            
            return {
                'creditworthiness_score': creditworthiness_score,
                'business_viability_score': business_viability_score,
                'risk_assessment': risk_assessment,
                'recommendations': recommendations,
                'strengths': strengths,
                'areas_for_improvement': areas_for_improvement,
                'detailed_analysis': {
                    'business_analysis': business_analysis,
                    'financial_analysis': financial_analysis,
                    'risk_analysis': risk_analysis,
                    'team_analysis': team_analysis,
                    'market_analysis': market_analysis
                }
            }
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return self._get_fallback_analysis(application)
    
    def _analyze_business_viability(self, application) -> Dict[str, Any]:
        """Analyze business model viability"""
        analysis = {
            'score': 0.0,
            'factors': {},
            'insights': []
        }
        
        # Business description quality
        description_score = self._analyze_text_quality(application.business_description, min_length=100)
        analysis['factors']['description_quality'] = description_score
        
        if description_score > 0.8:
            analysis['insights'].append("Well-articulated business description shows clear vision")
        elif description_score < 0.5:
            analysis['insights'].append("Business description needs more detail and clarity")
        
        # Industry viability
        industry_factors = self.INDUSTRY_RISK_FACTORS.get(application.industry, self.INDUSTRY_RISK_FACTORS['other'])
        industry_score = (industry_factors['growth_potential'] + industry_factors['market_size']) / 2
        analysis['factors']['industry_viability'] = industry_score
        
        # Business stage alignment
        stage_scores = self.BUSINESS_STAGE_SCORES.get(application.business_stage, self.BUSINESS_STAGE_SCORES['idea'])
        analysis['factors']['stage_maturity'] = stage_scores['viability']
        
        # Funding stage alignment
        funding_alignment = self._check_funding_stage_alignment(application)
        analysis['factors']['funding_alignment'] = funding_alignment
        
        if funding_alignment < 0.5:
            analysis['insights'].append("Funding stage may not align well with current business stage")
        
        # Use of funds clarity
        funds_score = self._analyze_text_quality(application.use_of_funds, min_length=50)
        analysis['factors']['funds_clarity'] = funds_score
        
        # Calculate overall business viability score
        weights = {
            'description_quality': 0.2,
            'industry_viability': 0.25,
            'stage_maturity': 0.25,
            'funding_alignment': 0.2,
            'funds_clarity': 0.1
        }
        
        analysis['score'] = sum(
            analysis['factors'][factor] * weight 
            for factor, weight in weights.items()
        )
        
        return analysis
    
    def _analyze_financial_health(self, application) -> Dict[str, Any]:
        """Analyze financial health and metrics"""
        analysis = {
            'score': 0.0,
            'factors': {},
            'insights': [],
            'red_flags': []
        }
        
        # Revenue analysis
        monthly_revenue = float(application.monthly_revenue or 0)
        revenue_score = min(monthly_revenue / 1000000, 1.0)  # Normalize to max 1M monthly
        analysis['factors']['revenue_strength'] = revenue_score
        
        if monthly_revenue > 500000:
            analysis['insights'].append("Strong revenue generation indicates market validation")
        elif monthly_revenue == 0 and application.business_stage in ['early_revenue', 'growth']:
            analysis['red_flags'].append("No revenue despite claiming early revenue stage")
        
        # Burn rate analysis
        monthly_burn = float(application.monthly_burn_rate or 0)
        if monthly_revenue > 0 and monthly_burn > 0:
            burn_multiple = monthly_burn / monthly_revenue
            if burn_multiple > 2:
                analysis['red_flags'].append("High burn rate relative to revenue")
                burn_score = 0.3
            elif burn_multiple > 1:
                burn_score = 0.6
            else:
                burn_score = 1.0
                analysis['insights'].append("Healthy burn rate relative to revenue")
        else:
            burn_score = 0.5  # Neutral if no data
        
        analysis['factors']['burn_efficiency'] = burn_score
        
        # Runway analysis
        runway_months = application.runway_months or 0
        if runway_months >= 18:
            runway_score = 1.0
            analysis['insights'].append("Excellent runway provides stability for growth")
        elif runway_months >= 12:
            runway_score = 0.8
        elif runway_months >= 6:
            runway_score = 0.6
        elif runway_months > 0:
            runway_score = 0.4
            analysis['red_flags'].append("Limited runway may require urgent funding")
        else:
            runway_score = 0.2
            analysis['red_flags'].append("No clear runway information provided")
        
        analysis['factors']['runway_adequacy'] = runway_score
        
        # Funding amount reasonableness
        funding_requested = float(application.funding_amount_requested)
        if monthly_burn > 0:
            months_of_funding = funding_requested / monthly_burn
            if months_of_funding >= 18:
                funding_score = 1.0
            elif months_of_funding >= 12:
                funding_score = 0.8
            else:
                funding_score = 0.6
                analysis['insights'].append("Consider requesting funding for longer runway")
        else:
            # Evaluate based on business stage and industry norms
            if funding_requested > 100000000:  # 100M+
                funding_score = 0.3
                analysis['red_flags'].append("Funding request seems excessive for stage")
            elif funding_requested > 10000000:  # 10M+
                funding_score = 0.7 if application.business_stage in ['growth', 'expansion'] else 0.4
            else:
                funding_score = 0.8
        
        analysis['factors']['funding_reasonableness'] = funding_score
        
        # Calculate overall financial health score
        weights = {
            'revenue_strength': 0.3,
            'burn_efficiency': 0.25,
            'runway_adequacy': 0.25,
            'funding_reasonableness': 0.2
        }
        
        analysis['score'] = sum(
            analysis['factors'][factor] * weight 
            for factor, weight in weights.items()
        )
        
        return analysis
    
    def _analyze_risk_factors(self, application) -> Dict[str, Any]:
        """Comprehensive risk analysis"""
        analysis = {
            'overall_risk': 0.0,
            'risk_categories': {},
            'risk_flags': [],
            'mitigation_suggestions': []
        }
        
        # Market risk
        industry_risk = self.INDUSTRY_RISK_FACTORS.get(application.industry, self.INDUSTRY_RISK_FACTORS['other'])
        market_risk = industry_risk['risk_multiplier']
        analysis['risk_categories']['market_risk'] = market_risk
        
        if market_risk > 1.1:
            analysis['risk_flags'].append(f"High market risk in {application.industry} industry")
            analysis['mitigation_suggestions'].append("Develop strong competitive advantages and market differentiation")
        
        # Stage risk
        stage_risk = self.BUSINESS_STAGE_SCORES.get(application.business_stage, self.BUSINESS_STAGE_SCORES['idea'])['risk']
        analysis['risk_categories']['stage_risk'] = stage_risk
        
        if stage_risk > 0.7:
            analysis['risk_flags'].append("High execution risk due to early business stage")
            analysis['mitigation_suggestions'].append("Focus on achieving key milestones and product validation")
        
        # Financial risk
        financial_risk = 1.0
        if application.monthly_revenue == 0 and application.business_stage in ['early_revenue', 'growth']:
            financial_risk = 1.3
            analysis['risk_flags'].append("Revenue claims don't match reported figures")
        
        if application.runway_months < 6:
            financial_risk = max(financial_risk, 1.2)
            analysis['risk_flags'].append("Short runway creates funding pressure")
            analysis['mitigation_suggestions'].append("Secure bridge funding or reduce burn rate")
        
        analysis['risk_categories']['financial_risk'] = financial_risk
        
        # Team risk (simplified analysis)
        team_risk = 1.0
        if application.team_size < 2:
            team_risk = 1.1
            analysis['risk_flags'].append("Single founder increases execution risk")
            analysis['mitigation_suggestions'].append("Consider bringing on co-founders or key hires")
        
        founder_exp_score = self._analyze_text_quality(application.founder_experience, min_length=50)
        if founder_exp_score < 0.5:
            team_risk = max(team_risk, 1.1)
            analysis['risk_flags'].append("Limited founder experience documentation")
        
        analysis['risk_categories']['team_risk'] = team_risk
        
        # Online presence risk
        online_presence_score = self._analyze_online_presence(application)
        if online_presence_score < 0.3:
            analysis['risk_flags'].append("Weak online presence may indicate limited market traction")
            analysis['mitigation_suggestions'].append("Strengthen digital presence and thought leadership")
        
        # Calculate overall risk score
        risk_weights = {
            'market_risk': 0.3,
            'stage_risk': 0.25,
            'financial_risk': 0.3,
            'team_risk': 0.15
        }
        
        analysis['overall_risk'] = sum(
            analysis['risk_categories'][category] * weight 
            for category, weight in risk_weights.items()
        )
        
        return analysis
    
    def _analyze_team_strength(self, application) -> Dict[str, Any]:
        """Analyze team composition and experience"""
        analysis = {
            'score': 0.0,
            'factors': {},
            'insights': []
        }
        
        # Team size analysis
        team_size = application.team_size
        if team_size >= 3:
            size_score = 1.0
            analysis['insights'].append("Good team size for execution and diverse skills")
        elif team_size == 2:
            size_score = 0.8
        else:
            size_score = 0.5
            analysis['insights'].append("Consider expanding team for better execution capability")
        
        analysis['factors']['team_size'] = size_score
        
        # Founder experience analysis
        exp_score = self._analyze_text_quality(application.founder_experience, min_length=50)
        analysis['factors']['founder_experience'] = exp_score
        
        if exp_score > 0.8:
            analysis['insights'].append("Strong founder experience increases execution probability")
        elif exp_score < 0.5:
            analysis['insights'].append("More detailed founder experience would strengthen application")
        
        # Overall team score
        analysis['score'] = (analysis['factors']['team_size'] * 0.4 + 
                           analysis['factors']['founder_experience'] * 0.6)
        
        return analysis
    
    def _analyze_market_opportunity(self, application) -> Dict[str, Any]:
        """Analyze market opportunity and positioning"""
        analysis = {
            'score': 0.0,
            'factors': {},
            'insights': []
        }
        
        # Industry market size and growth
        industry_factors = self.INDUSTRY_RISK_FACTORS.get(application.industry, self.INDUSTRY_RISK_FACTORS['other'])
        market_size_score = industry_factors['market_size']
        growth_potential_score = industry_factors['growth_potential']
        
        analysis['factors']['market_size'] = market_size_score
        analysis['factors']['growth_potential'] = growth_potential_score
        
        if growth_potential_score > 0.8:
            analysis['insights'].append("Industry shows strong growth potential")
        elif growth_potential_score < 0.5:
            analysis['insights'].append("Consider market expansion or pivot opportunities")
        
        # Business description market positioning
        description_quality = self._analyze_text_quality(application.business_description, min_length=100)
        market_understanding = self._extract_market_insights(application.business_description)
        
        analysis['factors']['market_positioning'] = (description_quality + market_understanding) / 2
        
        # Overall market opportunity score
        weights = {
            'market_size': 0.3,
            'growth_potential': 0.4,
            'market_positioning': 0.3
        }
        
        analysis['score'] = sum(
            analysis['factors'][factor] * weight 
            for factor, weight in weights.items()
        )
        
        return analysis
    
    def _calculate_creditworthiness(self, application, financial_analysis) -> Decimal:
        """Calculate creditworthiness score (0-100)"""
        base_score = 50
        
        # Financial health contributes heavily
        financial_contribution = financial_analysis['score'] * 30
        
        # Business stage maturity
        stage_scores = self.BUSINESS_STAGE_SCORES.get(application.business_stage, self.BUSINESS_STAGE_SCORES['idea'])
        stage_contribution = stage_scores['funding_readiness'] * 15
        
        # Revenue strength
        monthly_revenue = float(application.monthly_revenue or 0)
        revenue_contribution = min(monthly_revenue / 1000000, 1.0) * 20  # Max 20 points
        
        # Runway and burn efficiency
        runway_contribution = min(application.runway_months / 18, 1.0) * 10  # Max 10 points
        
        # Industry factors
        industry_factors = self.INDUSTRY_RISK_FACTORS.get(application.industry, self.INDUSTRY_RISK_FACTORS['other'])
        industry_contribution = (2 - industry_factors['risk_multiplier']) * 5  # Max 5 points
        
        total_score = (base_score + financial_contribution + stage_contribution + 
                      revenue_contribution + runway_contribution + industry_contribution)
        
        return Decimal(str(min(max(total_score, 0), 100)))
    
    def _calculate_business_viability(self, business_analysis, market_analysis, team_analysis) -> Decimal:
        """Calculate business viability score (0-100)"""
        base_score = 30
        
        # Business model strength
        business_contribution = business_analysis['score'] * 35
        
        # Market opportunity
        market_contribution = market_analysis['score'] * 25
        
        # Team strength
        team_contribution = team_analysis['score'] * 10
        
        total_score = base_score + business_contribution + market_contribution + team_contribution
        
        return Decimal(str(min(max(total_score, 0), 100)))
    
    def _generate_risk_assessment(self, risk_analysis, application) -> Dict[str, Any]:
        """Generate comprehensive risk assessment"""
        overall_risk = risk_analysis['overall_risk']
        
        if overall_risk <= 0.7:
            risk_level = "Low"
            risk_description = "This application shows strong fundamentals with manageable risks."
        elif overall_risk <= 1.0:
            risk_level = "Medium"
            risk_description = "This application has moderate risks that should be monitored."
        elif overall_risk <= 1.3:
            risk_level = "High"
            risk_description = "This application carries significant risks requiring careful evaluation."
        else:
            risk_level = "Very High"
            risk_description = "This application has substantial risks that may outweigh potential returns."
        
        return {
            'risk_level': risk_level,
            'risk_score': overall_risk,
            'description': risk_description,
            'risk_categories': risk_analysis['risk_categories'],
            'risk_flags': risk_analysis['risk_flags'],
            'mitigation_suggestions': risk_analysis['mitigation_suggestions']
        }
    
    def _generate_recommendations(self, application, business_analysis, financial_analysis, risk_analysis) -> List[Dict[str, Any]]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Business recommendations
        if business_analysis['score'] < 0.6:
            recommendations.append({
                'category': 'Business Model',
                'priority': 'High',
                'recommendation': 'Strengthen business model description and value proposition clarity',
                'action_items': [
                    'Provide more detailed market analysis',
                    'Clarify competitive advantages',
                    'Define clear customer segments'
                ]
            })
        
        # Financial recommendations
        if financial_analysis['score'] < 0.5:
            recommendations.append({
                'category': 'Financial Health',
                'priority': 'High',
                'recommendation': 'Improve financial planning and metrics',
                'action_items': [
                    'Extend runway through cost optimization',
                    'Develop clear revenue projections',
                    'Optimize burn rate efficiency'
                ]
            })
        
        # Risk mitigation recommendations
        if risk_analysis['overall_risk'] > 1.2:
            recommendations.append({
                'category': 'Risk Management',
                'priority': 'High',
                'recommendation': 'Address key risk factors before funding',
                'action_items': risk_analysis['mitigation_suggestions'][:3]
            })
        
        # Funding strategy recommendations
        funding_requested = float(application.funding_amount_requested)
        if funding_requested > 50000000 and application.business_stage in ['idea', 'prototype']:
            recommendations.append({
                'category': 'Funding Strategy',
                'priority': 'Medium',
                'recommendation': 'Consider staged funding approach',
                'action_items': [
                    'Request smaller initial amount for validation',
                    'Define clear milestones for follow-on funding',
                    'Focus on proving product-market fit first'
                ]
            })
        
        return recommendations
    
    def _identify_strengths(self, application, business_analysis, financial_analysis, team_analysis) -> List[str]:
        """Identify application strengths"""
        strengths = []
        
        if business_analysis['score'] > 0.7:
            strengths.append("Strong business model and clear value proposition")
        
        if financial_analysis['score'] > 0.7:
            strengths.append("Solid financial health and planning")
        
        if team_analysis['score'] > 0.7:
            strengths.append("Experienced team with relevant background")
        
        if application.monthly_revenue > 100000:
            strengths.append("Proven revenue generation and market validation")
        
        if application.runway_months >= 18:
            strengths.append("Adequate runway provides execution stability")
        
        # Check for strong online presence
        online_score = self._analyze_online_presence(application)
        if online_score > 0.6:
            strengths.append("Strong online presence and digital footprint")
        
        return strengths
    
    def _identify_improvement_areas(self, application, business_analysis, financial_analysis, risk_analysis) -> List[str]:
        """Identify areas needing improvement"""
        areas = []
        
        if business_analysis['score'] < 0.5:
            areas.append("Business model clarity and market positioning")
        
        if financial_analysis['score'] < 0.5:
            areas.append("Financial planning and metrics transparency")
        
        if len(risk_analysis['risk_flags']) > 2:
            areas.append("Risk mitigation and contingency planning")
        
        if application.completion_percentage < 80:
            areas.append("Application completeness and documentation")
        
        # Check for missing online presence
        online_score = self._analyze_online_presence(application)
        if online_score < 0.3:
            areas.append("Digital presence and thought leadership")
        
        return areas
    
    # ============================================================================
    # HELPER METHODS
    # ============================================================================
    
    def _analyze_text_quality(self, text: str, min_length: int = 50) -> float:
        """Analyze text quality and completeness"""
        if not text:
            return 0.0
        
        text = text.strip()
        if len(text) < min_length:
            return 0.3
        
        # Check for meaningful content (not just filler words)
        words = text.split()
        if len(words) < min_length // 10:  # Rough words per length ratio
            return 0.4
        
        # Check for structured content (sentences, punctuation)
        sentences = text.split('.')
        if len(sentences) < 3:
            return 0.6
        
        # High quality text indicators
        quality_score = 0.7
        
        if len(text) > min_length * 2:
            quality_score += 0.1
        
        if any(keyword in text.lower() for keyword in ['market', 'customer', 'revenue', 'growth']):
            quality_score += 0.1
        
        if len(words) > 50:
            quality_score += 0.1
        
        return min(quality_score, 1.0)
    
    def _check_funding_stage_alignment(self, application) -> float:
        """Check if funding stage aligns with business stage"""
        aligned_stages = self.FUNDING_STAGE_ALIGNMENT.get(application.funding_stage, [])
        
        if application.business_stage in aligned_stages:
            return 1.0
        elif any(stage in aligned_stages for stage in [application.business_stage]):
            return 0.7
        else:
            return 0.3
    
    def _analyze_online_presence(self, application) -> float:
        """Analyze online presence strength"""
        presence_score = 0.0
        
        if application.portfolio_website:
            presence_score += 0.4
        
        if application.linkedin_profile:
            presence_score += 0.2
        
        if application.instagram_profile:
            presence_score += 0.2
        
        if application.youtube_profile:
            presence_score += 0.2
        
        return presence_score
    
    def _extract_market_insights(self, description: str) -> float:
        """Extract market understanding from business description"""
        if not description:
            return 0.0
        
        description_lower = description.lower()
        
        market_keywords = [
            'market', 'customer', 'target audience', 'competition', 'competitive advantage',
            'market size', 'market opportunity', 'customer problem', 'solution'
        ]
        
        keyword_score = sum(1 for keyword in market_keywords if keyword in description_lower)
        return min(keyword_score / len(market_keywords), 1.0)
    
    def _get_fallback_analysis(self, application) -> Dict[str, Any]:
        """Provide fallback analysis if AI analysis fails"""
        return {
            'creditworthiness_score': Decimal('50.0'),
            'business_viability_score': Decimal('50.0'),
            'risk_assessment': {
                'risk_level': 'Medium',
                'risk_score': 1.0,
                'description': 'Analysis could not be completed. Manual review recommended.',
                'risk_categories': {},
                'risk_flags': ['AI analysis unavailable'],
                'mitigation_suggestions': ['Conduct manual review']
            },
            'recommendations': [{
                'category': 'System',
                'priority': 'High',
                'recommendation': 'Manual review required due to analysis system error',
                'action_items': ['Contact support for detailed evaluation']
            }],
            'strengths': ['Application submitted for review'],
            'areas_for_improvement': ['Complete AI analysis pending'],
            'detailed_analysis': {}
        }
