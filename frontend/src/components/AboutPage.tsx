  import { Shield, TrendingUp, Users, CheckCircle, Award, Target, Heart, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const features = [
    {
      icon: Shield,
      title: 'Verified Employers',
      description: 'All employers undergo strict verification to ensure authenticity',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Latest Opportunities',
      description: 'Get instant alerts for new jobs matching your profile',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Direct Applications',
      description: 'Apply directly and track your application status in real-time',
      color: 'purple'
    },
    {
      icon: Award,
      title: 'Quality Jobs',
      description: 'Handpicked opportunities from top healthcare institutions',
      color: 'orange'
    },
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'AI-powered job recommendations based on your skills',
      color: 'red'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Quick application process with instant employer notifications',
      color: 'yellow'
    }
  ];

  const stats = [
    { label: 'Active Jobs', value: '5000+' },
    { label: 'Registered Hospitals', value: '2000+' },
    { label: 'Medical Professionals', value: '50K+' },
    { label: 'Successful Placements', value: '10K+' }
  ];

  const categories = [
    { name: 'Junior Resident', count: 450 },
    { name: 'Senior Resident', count: 380 },
    { name: 'Medical Officer', count: 520 },
    { name: 'Faculty', count: 150 },
    { name: 'Specialist', count: 290 },
    { name: 'AYUSH', count: 180 },
    { name: 'Paramedical', count: 620 },
    { name: 'Nursing', count: 850 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl mb-4 animate-fade-in-up">About MedExJob.com</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Empowering medical professionals to find their perfect career match
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white relative -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={index}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                MedExJob.com is India's premier online job portal dedicated exclusively to medical professionals. 
                We bridge the gap between healthcare institutions and qualified medical personnel, making job 
                search and recruitment efficient and transparent.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Our platform caters to doctors, nurses, and paramedical staff across both government and private 
                sectors, offering a comprehensive solution for medical career advancement.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-gray-900 mb-3">Why Choose Us?</h2>
            <p className="text-gray-600">Comprehensive features designed for medical professionals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600',
                green: 'bg-green-100 text-green-600 group-hover:bg-green-600',
                purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600',
                orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600',
                red: 'bg-red-100 text-red-600 group-hover:bg-red-600',
                yellow: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600'
              };

              return (
                <Card 
                  key={index}
                  className="p-8 text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-8 h-8 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-3xl text-gray-900 mb-8 text-center">Job Categories We Cover</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {categories.map((category, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-300 cursor-pointer group animate-fade-in-right"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {category.count}+ jobs
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Two Column Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* For Candidates */}
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-t-blue-600">
              <h3 className="text-2xl text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                For Candidates
              </h3>
              <ul className="space-y-3">
                {[
                  'Government and Private job listings',
                  'Real-time job alerts',
                  'Easy application tracking',
                  'Profile management',
                  'Direct employer connections',
                  'Interview scheduling',
                  'Resume builder',
                  'Career guidance'
                ].map((item, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* For Employers */}
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-t-green-600">
              <h3 className="text-2xl text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-green-600" />
                For Employers
              </h3>
              <ul className="space-y-3">
                {[
                  'Verified candidate database',
                  'Easy job posting',
                  'Application management',
                  'Interview scheduling',
                  'Flexible subscription plans',
                  'Advanced analytics',
                  'Priority support',
                  'Featured job options'
                ].map((item, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 text-gray-700 hover:text-green-600 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl mb-4">Join MedExJob.com Today</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your journey towards a successful medical career with India's most trusted platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
              onClick={() => onNavigate('register')}
            >
              Get Started Now
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
              onClick={() => onNavigate('jobs')}
            >
              Browse Jobs
            </Button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
