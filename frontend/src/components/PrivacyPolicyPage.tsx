// AI assisted development
import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail, Phone, MapPin, CheckCircle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface PrivacyPolicyPageProps {
  onNavigate: (page: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: Info },
    { id: 'data-collection', title: 'Data Collection', icon: FileText },
    { id: 'data-usage', title: 'How We Use Data', icon: Eye },
    { id: 'data-sharing', title: 'Data Sharing', icon: Shield },
    { id: 'data-security', title: 'Security & Storage', icon: Lock },
    { id: 'your-rights', title: 'Your Rights', icon: CheckCircle },
    { id: 'cookies', title: 'Cookies & Tracking', icon: FileText },
    { id: 'retention', title: 'Data Retention', icon: FileText },
    { id: 'third-party', title: 'Third-Party Services', icon: Shield },
    { id: 'compliance', title: 'Legal Compliance', icon: Shield },
    { id: 'faq', title: 'Frequently Asked Questions', icon: Info },
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
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
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <div className="w-20 sm:w-24" />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Last updated: January 15, 2025</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              DPDPA & GDPR Compliant
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
                  <FileText className="w-5 h-5 text-blue-600" />
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
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
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
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
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
            <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Privacy at MedExJob.com</h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    At MedExJob.com, we are committed to protecting your privacy and ensuring the security of your personal information. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical job portal platform.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className="bg-blue-600 text-white">DPDPA Compliant</Badge>
                    <Badge className="bg-indigo-600 text-white">GDPR Compatible</Badge>
                    <Badge className="bg-green-600 text-white">ISO 27001 Standards</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 1: Introduction */}
            <section id="introduction" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">1. Introduction</h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>
                    MedExJob.com ("we," "our," or "us") operates a medical job portal that connects healthcare professionals 
                    with employers. This Privacy Policy describes how we collect, use, process, and protect your personal 
                    information in compliance with India's Digital Personal Data Protection Act, 2023 (DPDPA) and aligned with 
                    international standards including GDPR.
                  </p>
                  <p>
                    By using our platform, you agree to the collection and use of information in accordance with this policy. 
                    If you do not agree with our policies and practices, please do not use our services.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900 mb-1">Important Notice</p>
                        <p className="text-yellow-800 text-sm">
                          This policy applies to all users of MedExJob.com, including candidates, employers, and administrators. 
                          We regularly update this policy to reflect changes in our practices and legal requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 2: Data Collection */}
            <section id="data-collection" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">2. Information We Collect</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2.1 Personal Information</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      We collect personal information that you provide directly when you register, create a profile, or use our services:
                    </p>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Identity Information:</strong> Name, email address, phone number, date of birth, government identification documents (for employer verification)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Professional Information:</strong> Qualifications, certifications, work experience, educational background, resume/CV, professional licenses</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Account Information:</strong> Username, password (encrypted), authentication tokens, account preferences</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Payment Information:</strong> Billing address, payment method details (processed securely through Razorpay, PCI-DSS compliant)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Communication Data:</strong> Messages sent through our platform, application correspondence, support tickets</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2.2 Usage and Technical Information</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      We automatically collect certain information when you use our platform:
                    </p>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Device Information:</strong> IP address, browser type and version, device type, operating system, unique device identifiers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Usage Data:</strong> Pages visited, time spent, click patterns, search queries, job applications submitted, saved jobs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Location Data:</strong> General location based on IP address (city/state level, not precise coordinates)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>Log Data:</strong> Server logs, error reports, performance metrics, security events</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                    <p className="text-sm text-blue-900 font-medium">
                      <strong>Lawful Basis (GDPR/DPDPA):</strong> We collect this information based on your consent, 
                      contract performance (service delivery), legitimate interests (platform security, fraud prevention), 
                      and legal obligations (tax compliance, verification requirements).
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 3: How We Use Data */}
            <section id="data-usage" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">3. How We Use Your Information</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We use your personal information for the following purposes, in compliance with Indian data protection laws:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Service Delivery</h4>
                      <p className="text-sm text-gray-700">Provide job portal services, match candidates with employers, facilitate applications</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                      <p className="text-sm text-gray-700">Send job alerts, application updates, account notifications (with consent)</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Processing</h4>
                      <p className="text-sm text-gray-700">Process payments for job postings through Razorpay gateway</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Security & Verification</h4>
                      <p className="text-sm text-gray-700">Verify employer credentials, prevent fraud, ensure platform security</p>
                    </div>
                  </div>

                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">To improve our platform, develop new features, and conduct analytics (anonymized where possible)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">To comply with legal obligations, court orders, and regulatory requirements in India</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">To personalize your experience and provide relevant job recommendations</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </section>

            {/* Section 4: Data Sharing */}
            <section id="data-sharing" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">4. Information Sharing and Disclosure</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                    except in the following circumstances:
                  </p>

                  <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
                    <p className="font-semibold text-red-900 mb-2">We Never Sell Your Data</p>
                    <p className="text-sm text-red-800">
                      MedExJob.com does not sell personal information to third parties for marketing or advertising purposes.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 With Employers</h3>
                    <p className="text-gray-700 mb-3">
                      When you apply for a job, we share relevant information with the employer:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Resume/CV and professional qualifications</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Contact information (email, phone) for application purposes</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Application status and correspondence</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 With Service Providers</h3>
                    <p className="text-gray-700 mb-3">
                      We share information with trusted third-party service providers who assist our operations:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Service Provider</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Purpose</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Compliance</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Razorpay</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Payment processing</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">PCI-DSS compliant</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Cloud Hosting</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Secure data storage (India)</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">ISO 27001 certified</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Email/SMS Services</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Communication delivery</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">GDPR compliant</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Analytics</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Platform usage analysis</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Anonymized data only</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4.3 Legal Requirements</h3>
                    <p className="text-gray-700">
                      We may disclose information when required by law, court orders, or to protect our rights, 
                      property, or safety, or that of our users or others.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 5: Data Security */}
            <section id="data-security" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">5. Data Security and Storage</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We implement appropriate technical and organizational measures to protect your personal information against 
                    unauthorized access, alteration, disclosure, or destruction, in compliance with Indian data protection standards.
                  </p>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">5.1 Security Measures</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Lock className="w-5 h-5 text-green-600" />
                          Encryption
                        </h4>
                        <p className="text-sm text-gray-700">SSL/TLS encryption for data transmission, AES-256 encryption for data at rest</p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          Access Controls
                        </h4>
                        <p className="text-sm text-gray-700">Multi-factor authentication, role-based access, regular security audits</p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-purple-600" />
                          Monitoring
                        </h4>
                        <p className="text-sm text-gray-700">24/7 security monitoring, intrusion detection, vulnerability assessments</p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                          Compliance
                        </h4>
                        <p className="text-sm text-gray-700">PCI-DSS compliant payment processing, ISO 27001 standards</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">5.2 Data Storage Location</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                      <p className="text-gray-700 mb-2">
                        <strong>Primary Storage:</strong> Your personal data is stored on secure servers located in India, 
                        in compliance with data localization requirements under DPDPA.
                      </p>
                      <p className="text-gray-700">
                        <strong>Backup Storage:</strong> Encrypted backups are maintained in geographically distributed data centers 
                        within India for disaster recovery purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 6: Your Rights */}
            <section id="your-rights" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">6. Your Rights and Choices</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Under India's Digital Personal Data Protection Act (DPDPA) and aligned with GDPR principles, you have the following rights:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Right to Access</h4>
                      <p className="text-sm text-gray-700">Request a copy of your personal information we hold</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Right to Correction</h4>
                      <p className="text-sm text-gray-700">Update or correct inaccurate or incomplete information</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Right to Deletion</h4>
                      <p className="text-sm text-gray-700">Request deletion of your personal information (subject to legal obligations)</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Right to Object</h4>
                      <p className="text-sm text-gray-700">Object to or restrict certain processing activities</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Data Portability</h4>
                      <p className="text-sm text-gray-700">Receive your data in a structured, machine-readable format</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Withdraw Consent</h4>
                      <p className="text-sm text-gray-700">Withdraw consent for processing where applicable</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-lg">
                    <p className="font-semibold text-green-900 mb-2">How to Exercise Your Rights</p>
                    <p className="text-sm text-green-800 mb-3">
                      To exercise any of these rights, please contact us at <strong>privacy@medexjob.com</strong> or use the 
                      privacy controls in your account settings. We will respond to your request within 30 days.
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Verification:</strong> For security purposes, we may require identity verification before processing your request.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 7: Cookies */}
            <section id="cookies" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">7. Cookies and Tracking Technologies</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
                    and provide personalized content.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cookie Type</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Purpose</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Essential</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Authentication, security, session management</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Session / 1 year</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Functional</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Preferences, language settings</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">1 year</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Analytics</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Usage statistics, platform improvement</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">2 years</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Marketing</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Personalized ads (opt-out available)</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">1 year</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                    <p className="font-semibold text-blue-900 mb-2">Cookie Controls</p>
                    <p className="text-sm text-blue-800">
                      You can control cookie preferences through your browser settings. However, disabling essential cookies 
                      may affect platform functionality. By continuing to use our platform, you consent to our use of cookies 
                      as described in our Cookie Policy.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 8: Data Retention */}
            <section id="retention" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">8. Data Retention and Deletion</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We retain your personal information for as long as necessary to provide our services and fulfill 
                    the purposes outlined in this policy, unless a longer retention period is required by Indian law.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Data Type</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Retention Period</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Active Account Data</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">While account is active</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Service delivery</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Deactivated Account</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Up to 3 years</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Legal compliance, dispute resolution</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Payment Records</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">7 years</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Indian tax laws</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Application Data</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">2 years after job closure</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Employer reference, records</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Log Data</strong></td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">1 year</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">Security, troubleshooting</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-lg">
                    <p className="text-sm text-yellow-900">
                      <strong>Early Deletion:</strong> You may request data deletion at any time, subject to legal obligations 
                      (tax records, dispute resolution, etc.). We will delete your data within 30 days of your verified request, 
                      except where retention is required by law.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 9: Third-Party Services */}
            <section id="third-party" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">9. Third-Party Services and Links</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Our platform may contain links to third-party websites or integrate with third-party services. 
                    We are not responsible for the privacy practices of these external sites.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    All third-party service providers are contractually bound to protect your data and use it only 
                    for specified purposes. We conduct regular audits to ensure compliance.
                  </p>
                </div>
              </Card>
            </section>

            {/* Section 10: Legal Compliance */}
            <section id="compliance" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">10. Legal Compliance and Jurisdiction</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">10.1 Indian Compliance (DPDPA)</h3>
                    <p className="text-gray-700 mb-3">
                      This Privacy Policy is designed to comply with India's Digital Personal Data Protection Act, 2023 (DPDPA), including:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Data localization requirements (storage in India)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Consent-based processing and notice requirements</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Individual rights (access, correction, deletion, grievance redressal)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Data breach notification obligations</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">10.2 GDPR Compatibility</h3>
                    <p className="text-gray-700 mb-3">
                      While primarily designed for Indian users, our practices are aligned with GDPR principles for international users:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Lawful basis for processing (consent, contract, legitimate interests)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Data minimization and purpose limitation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Transparency and accountability</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                    <p className="font-semibold text-blue-900 mb-2">Governing Law</p>
                    <p className="text-sm text-blue-800">
                      This Privacy Policy is governed by the laws of India. Any disputes shall be subject to the exclusive 
                      jurisdiction of courts in New Delhi, India.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 11: FAQ */}
            <section id="faq" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">11. Frequently Asked Questions</h2>
                </div>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-5">
                    <h3 className="font-semibold text-gray-900 mb-2">How do I access my personal data?</h3>
                    <p className="text-gray-700 text-sm">
                      You can access your data through your account settings or by emailing privacy@medexjob.com. 
                      We will provide your data in a structured format within 30 days.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Can I delete my account and all my data?</h3>
                    <p className="text-gray-700 text-sm">
                      Yes, you can request account deletion through your account settings or by contacting us. 
                      We will delete your data within 30 days, except where retention is required by law (e.g., payment records for 7 years).
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Do you share my data with employers?</h3>
                    <p className="text-gray-700 text-sm">
                      We only share relevant information (resume, qualifications, contact details) with employers when you apply 
                      for their job postings. We never share your data for marketing purposes without your consent.
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-5">
                    <h3 className="font-semibold text-gray-900 mb-2">How is my payment information protected?</h3>
                    <p className="text-gray-700 text-sm">
                      Payment processing is handled by Razorpay, a PCI-DSS compliant payment gateway. We do not store 
                      full credit card details on our servers. All payment data is encrypted during transmission.
                    </p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-5">
                    <h3 className="font-semibold text-gray-900 mb-2">What happens if there's a data breach?</h3>
                    <p className="text-gray-700 text-sm">
                      In the event of a data breach that may affect your personal information, we will notify you and 
                      relevant authorities within 72 hours as required by DPDPA. We have incident response procedures 
                      and security measures to prevent and mitigate breaches.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 12: Contact */}
            <section id="contact" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">12. Contact Us</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                    please contact our Data Protection Officer:
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Email</h3>
                      </div>
                      <p className="text-gray-700">privacy@medexjob.com</p>
                      <p className="text-sm text-gray-600 mt-1">Response within 24-48 hours</p>
                    </div>
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Phone</h3>
                      </div>
                      <p className="text-gray-700">+91 98765 43210</p>
                      <p className="text-sm text-gray-600 mt-1">Mon-Sat, 9 AM - 6 PM IST</p>
                    </div>
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm md:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Mailing Address</h3>
                      </div>
                      <p className="text-gray-700">
                        MedExJob.com<br />
                        Data Protection Officer<br />
                        123, Medical Plaza, New Delhi - 110001, India
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-5 rounded-r-lg">
                    <p className="font-semibold text-blue-900 mb-2">Grievance Redressal</p>
                    <p className="text-sm text-blue-800">
                      For complaints or grievances regarding data privacy, please contact us at the above address. 
                      We will acknowledge your complaint within 7 days and resolve it within 30 days as per DPDPA requirements.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Update History */}
            <Card className="p-6 bg-gray-50 border border-gray-200 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Update History</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>January 15, 2025:</strong> Initial comprehensive Privacy Policy published, DPDPA and GDPR compliant</p>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
