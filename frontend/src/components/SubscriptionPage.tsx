import { Check, CreditCard, Star, Zap, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { subscriptionPlans } from '../data/mockData';
import { SubscriptionPlan } from '../types';

interface SubscriptionPageProps {
  onNavigate: (page: string) => void;
}

export function SubscriptionPage({ onNavigate }: SubscriptionPageProps) {
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // In a real app, this would integrate with Razorpay
    console.log('Selected plan:', plan);
    // For demo purposes, we'll just show an alert
    alert(`Selected ${plan.name} - ₹${plan.price.toLocaleString()}`);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'plan-1':
        return <CreditCard className="w-6 h-6" />;
      case 'plan-2':
        return <Zap className="w-6 h-6" />;
      case 'plan-3':
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'plan-1':
        return 'border-blue-200 hover:border-blue-300';
      case 'plan-2':
        return 'border-green-200 hover:border-green-300';
      case 'plan-3':
        return 'border-purple-200 hover:border-purple-300';
      default:
        return 'border-gray-200 hover:border-gray-300';
    }
  };

  const getPlanBadge = (planId: string) => {
    switch (planId) {
      case 'plan-1':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Basic</Badge>;
      case 'plan-2':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Popular</Badge>;
      case 'plan-3':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Premium</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect subscription plan for your hiring needs. All plans include verified candidate access and basic analytics.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`relative p-8 transition-all duration-300 hover:shadow-xl ${getPlanColor(plan.id)} ${
                plan.id === 'plan-2' ? 'ring-2 ring-green-500 scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.id === 'plan-2' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    plan.id === 'plan-1' ? 'bg-blue-100 text-blue-600' :
                    plan.id === 'plan-2' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {getPlanIcon(plan.id)}
                  </div>
                </div>
                <h3 className="text-2xl text-gray-900 mb-2">{plan.name}</h3>
                {getPlanBadge(plan.id)}
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-gray-600 ml-2">/{plan.duration}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Job Posts Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Job Posts Included</p>
                  <p className="text-2xl font-bold text-gray-900">{plan.jobPostsAllowed}</p>
                  <p className="text-xs text-gray-500">
                    {plan.jobPostsAllowed === 1 ? 'Single post' : 
                     plan.jobPostsAllowed === 10 ? 'Per month' : 'Per year'}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                className={`w-full ${
                  plan.id === 'plan-1' ? 'bg-blue-600 hover:bg-blue-700' :
                  plan.id === 'plan-2' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-purple-600 hover:bg-purple-700'
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                Choose {plan.name}
              </Button>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">What's Included in All Plans</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Access to verified medical professionals</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Basic application management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Email notifications for new applications</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">24/7 customer support</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">Payment & Billing</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Secure payment via Razorpay</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Instant activation after payment</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Auto-renewal available</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Cancel anytime</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-2">What happens if I exceed my job posting limit?</h3>
              <p className="text-gray-600">You can purchase additional job posts at ₹999 each, or upgrade to a higher plan for better value.</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-2">Is there a free trial available?</h3>
              <p className="text-gray-600">Yes, new employers get a 7-day free trial with the Monthly Plan to test our platform.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


