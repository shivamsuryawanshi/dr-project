// AI assisted development
import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Shield, CreditCard, Users, AlertCircle, CheckCircle, Info, ChevronRight, Mail, Phone, MapPin, Scale } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface TermsConditionsPageProps {
  onNavigate: (page: string) => void;
}

export function TermsConditionsPage({ onNavigate }: TermsConditionsPageProps) {
  const [activeSection, setActiveSection] = useState<string>('acceptance');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: CheckCircle },
    { id: 'use-license', title: 'Use License', icon: FileText },
    { id: 'user-accounts', title: 'User Accounts', icon: Users },
    { id: 'payment-terms', title: 'Payment Terms', icon: CreditCard },
    { id: 'content-guidelines', title: 'Content Guidelines', icon: FileText },
    { id: 'privacy', title: 'Privacy & Data', icon: Shield },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: FileText },
    { id: 'termination', title: 'Termination', icon: AlertCircle },
    { id: 'liability', title: 'Limitation of Liability', icon: Shield },
    { id: 'governing-law', title: 'Governing Law', icon: Scale },
    { id: 'changes', title: 'Changes to Terms', icon: Info },
    { id: 'contact', title: 'Contact Us', icon: Mail },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Terms & Conditions</h1>
            </div>
            <div className="w-20 sm:w-24" />
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <span>Last updated: January 15, 2025</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Legally Binding
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="p-6 bg-white shadow-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Table of Contents
                </h2>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                          activeSection === section.id
                            ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>
          </aside>

          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-6">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Table of Contents
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
            </Button>
            {isMobileMenuOpen && (
              <Card className="mt-2 p-4 bg-white shadow-lg border border-gray-200">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                          activeSection === section.id
                            ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            {/* Introduction Summary */}
            <Card className="p-8 mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Terms of Service</h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    These Terms & Conditions govern your use of MedExJob.com, a medical job portal connecting healthcare 
                    professionals with employers. By accessing or using our platform, you agree to be bound by these terms.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className="bg-green-600 text-white">Legally Binding</Badge>
                    <Badge className="bg-blue-600 text-white">Indian Jurisdiction</Badge>
                    <Badge className="bg-purple-600 text-white">Razorpay Compliant</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 1: Acceptance */}
            <section id="acceptance" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">1. Acceptance of Terms</h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>
                    By accessing and using MedExJob.com ("the Platform," "we," "our," or "us"), you accept and agree to be 
                    bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, 
                    please do not use this service.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900 mb-1">Important Notice</p>
                        <p className="text-yellow-800 text-sm">
                          These terms constitute a legally binding agreement between you and MedExJob.com. 
                          Continued use of the platform after changes to these terms constitutes acceptance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 2: Use License */}
            <section id="use-license" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">2. Use License</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Permission is granted to temporarily access the materials (information or software) on MedExJob.com 
                    for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2.1 Restrictions</h3>
                    <p className="text-gray-700 mb-4">Under this license you may not:</p>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Modify or copy the materials without written permission</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Use the materials for any commercial purpose or for any public display</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Attempt to decompile or reverse engineer any software contained on the platform</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Remove any copyright or other proprietary notations from the materials</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Transfer the materials to another person or "mirror" the materials on any other server</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 3: User Accounts */}
            <section id="user-accounts" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">3. User Accounts</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">3.1 Registration Requirements</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      To access certain features of our platform, you must register for an account. You agree to:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Accurate Information</h4>
                        <p className="text-sm text-gray-700">Provide accurate, current, and complete information during registration</p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Account Security</h4>
                        <p className="text-sm text-gray-700">Maintain the security of your password and account credentials</p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Account Responsibility</h4>
                        <p className="text-sm text-gray-700">Accept responsibility for all activities under your account</p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Unauthorized Access</h4>
                        <p className="text-sm text-gray-700">Notify us immediately of any unauthorized use or security breach</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">3.2 Account Types</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Account Type</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Verification</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Candidates</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Medical professionals seeking employment</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Email verification required</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Employers</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Healthcare organizations posting jobs</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Business verification required</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Administrators</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Platform management and oversight</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Internal assignment only</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 4: Payment Terms */}
            <section id="payment-terms" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">4. Payment Terms and Service Fees</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 Payment Processing</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg mb-4">
                      <p className="text-gray-700 mb-2">
                        <strong>Payment Gateway:</strong> All payments are processed securely through Razorpay, our authorized 
                        PCI-DSS compliant payment gateway partner.
                      </p>
                      <p className="text-gray-700">
                        <strong>Currency:</strong> Payments are accepted in Indian Rupees (INR) only. All service fees are 
                        non-refundable as per our Refund & Cancellation Policy.
                      </p>
                    </div>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Employers are required to pay fees for job postings; candidates use the platform free of charge</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">By making a payment, you agree to Razorpay's terms and conditions</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Payment confirmation will be sent to your registered email address</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 Employer Responsibilities</h3>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Job postings must be accurate, lawful, and not discriminatory</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">You are responsible for verifying candidate qualifications and conducting background checks</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>No Guarantee:</strong> We do not guarantee placement or number of applications for your job postings</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Violation of posting guidelines may result in account suspension without refund</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4.3 Candidate Responsibilities</h3>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Applications must contain truthful and accurate information</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">You are responsible for the accuracy of your resume and qualifications</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Professional conduct is expected in all communications with employers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 5: Content Guidelines */}
            <section id="content-guidelines" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">5. Content Guidelines</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    All content posted on MedExJob.com must comply with our community standards and applicable laws:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Prohibited Content</h4>
                      <ul className="space-y-2 text-sm text-red-800">
                        <li>• Discriminatory language or practices</li>
                        <li>• False or misleading information</li>
                        <li>• Spam or unsolicited communications</li>
                        <li>• Copyrighted material without permission</li>
                        <li>• Offensive or inappropriate content</li>
                      </ul>
                    </div>
                    <div className="p-5 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Required Standards</h4>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li>• Accurate job descriptions</li>
                        <li>• Professional communication</li>
                        <li>• Respectful interactions</li>
                        <li>• Compliance with medical ethics</li>
                        <li>• Truthful qualifications</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-lg">
                    <p className="text-sm text-yellow-900">
                      <strong>Consequences:</strong> Violation of content guidelines may result in content removal, 
                      account suspension, or termination without refund, at our sole discretion.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 6: Privacy */}
            <section id="privacy" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">6. Privacy and Data Protection</h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p>
                    Your privacy is important to us. Please review our <strong>Privacy Policy</strong>, which also governs 
                    your use of MedExJob.com, to understand our practices regarding the collection, use, and protection of 
                    your personal information in compliance with India's Digital Personal Data Protection Act (DPDPA).
                  </p>
                </div>
              </Card>
            </section>

            {/* Section 7: Intellectual Property */}
            <section id="intellectual-property" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">7. Intellectual Property</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    The service and its original content, features, and functionality are and will remain the exclusive property 
                    of MedExJob.com and its licensors. The service is protected by copyright, trademark, and other laws of India.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                    <p className="text-gray-700">
                      <strong>User Content:</strong> By posting content on our platform, you grant us a non-exclusive, 
                      worldwide, royalty-free license to use, display, and distribute your content for platform operations. 
                      You retain ownership of your content.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 8: Termination */}
            <section id="termination" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">8. Termination</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We may terminate or suspend your account and bar access to the service immediately, without prior notice 
                    or liability, under our sole discretion, for any reason whatsoever, including but not limited to:
                  </p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Breach of these Terms & Conditions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Violation of content guidelines or community standards</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Fraudulent activity or misrepresentation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Extended period of account inactivity</span>
                    </li>
                  </ul>
                  <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
                    <p className="text-sm text-red-900">
                      <strong>No Refund:</strong> Upon termination, you will not be entitled to any refund for services 
                      already rendered or payments made, except as required by law.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 9: Limitation of Liability */}
            <section id="liability" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">9. Limitation of Liability</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    In no event shall MedExJob.com, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                    be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Excluded Damages</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Loss of profits or revenue</li>
                        <li>• Loss of data or use</li>
                        <li>• Loss of goodwill</li>
                        <li>• Business interruption</li>
                      </ul>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">No Guarantees</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Job placement or hiring</li>
                        <li>• Number of applications</li>
                        <li>• Candidate quality</li>
                        <li>• Platform availability</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-lg">
                    <p className="text-sm text-yellow-900">
                      <strong>Maximum Liability:</strong> Our total liability for any claims arising from these Terms 
                      shall not exceed the amount you paid to us in the 12 months preceding the claim.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 10: Governing Law */}
            <section id="governing-law" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Scale className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">10. Governing Law and Jurisdiction</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions. 
                    Any disputes arising from these Terms or your use of MedExJob.com shall be subject to the exclusive jurisdiction 
                    of the courts in New Delhi, India.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                    <p className="text-gray-700 mb-2">
                      <strong>Dispute Resolution:</strong> In the event of any dispute, parties agree to first attempt to resolve 
                      the matter through good faith negotiations. If unresolved, disputes shall be resolved through arbitration 
                      in accordance with the Arbitration and Conciliation Act, 2015.
                    </p>
                    <p className="text-gray-700">
                      <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining 
                      provisions will remain in full effect. Our failure to enforce any right or provision will not be considered 
                      a waiver of those rights.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 11: Changes to Terms */}
            <section id="changes" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Info className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">11. Changes to Terms</h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                    If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                  <p>
                    Material changes will be communicated via email to your registered address and/or through prominent 
                    notices on our platform. Continued use of the service after changes constitutes acceptance of the updated terms.
                  </p>
                </div>
              </Card>
            </section>

            {/* Section 12: Contact */}
            <section id="contact" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">12. Contact Information</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    If you have any questions about these Terms & Conditions, please contact us:
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Email</h3>
                      </div>
                      <p className="text-gray-700">legal@medexjob.com</p>
                      <p className="text-sm text-gray-600 mt-1">Response within 24-48 hours</p>
                    </div>
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Phone</h3>
                      </div>
                      <p className="text-gray-700">+91 98765 43210</p>
                      <p className="text-sm text-gray-600 mt-1">Mon-Sat, 9 AM - 6 PM IST</p>
                    </div>
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm md:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Mailing Address</h3>
                      </div>
                      <p className="text-gray-700">
                        MedExJob.com<br />
                        Legal Department<br />
                        123, Medical Plaza, New Delhi - 110001, India
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Update History */}
            <Card className="p-6 bg-gray-50 border border-gray-200 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Update History</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>January 15, 2025:</strong> Comprehensive Terms & Conditions published, Razorpay payment terms and Indian jurisdiction clarified</p>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
