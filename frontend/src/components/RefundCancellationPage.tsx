// AI assisted development
import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Info, ChevronRight, Mail, Phone, MapPin, CreditCard, XCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface RefundCancellationPageProps {
  onNavigate: (page: string) => void;
}

export function RefundCancellationPage({ onNavigate }: RefundCancellationPageProps) {
  const [activeSection, setActiveSection] = useState<string>('general-policy');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'general-policy', title: 'General Policy', icon: Info },
    { id: 'payment-terms', title: 'Payment Terms', icon: CreditCard },
    { id: 'non-refundable', title: 'Non-Refundable Services', icon: XCircle },
    { id: 'cancellation', title: 'Cancellation Policy', icon: Clock },
    { id: 'refund-exceptions', title: 'Refund Exceptions', icon: CheckCircle },
    { id: 'refund-process', title: 'Refund Process', icon: FileText },
    { id: 'no-guarantee', title: 'No Placement Guarantee', icon: AlertCircle },
    { id: 'razorpay', title: 'Razorpay Payment Gateway', icon: CreditCard },
    { id: 'dispute-resolution', title: 'Dispute Resolution', icon: FileText },
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
              <FileText className="w-6 h-6 text-red-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Refund & Cancellation Policy</h1>
            </div>
            <div className="w-20 sm:w-24" />
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <span>Last updated: January 15, 2025</span>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Non-Refundable Services
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
                  <FileText className="w-5 h-5 text-red-600" />
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
                            ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
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
                            ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
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
            <Card className="p-8 mb-8 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-600 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Refund & Cancellation Policy</h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    MedExJob.com operates as a service-based platform connecting medical professionals with healthcare employers. 
                    All payments made for job posting services are <strong>final and non-refundable</strong>, except as explicitly 
                    stated in this policy.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className="bg-red-600 text-white">Non-Refundable</Badge>
                    <Badge className="bg-blue-600 text-white">Razorpay Compliant</Badge>
                    <Badge className="bg-green-600 text-white">Indian Consumer Laws</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 1: General Policy */}
            <section id="general-policy" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Info className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">1. General Policy</h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>
                    By making a payment on our platform, you acknowledge and agree to this refund and cancellation policy. 
                    This policy is in compliance with Indian consumer protection laws and payment gateway regulations.
                  </p>
                  <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
                    <p className="font-semibold text-red-900 mb-2">Key Principle</p>
                    <p className="text-red-800 text-sm">
                      All service fees are non-refundable once payment is processed and services are activated, 
                      except in the exceptional circumstances outlined in Section 5 (Refund Exceptions).
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 2: Payment Terms */}
            <section id="payment-terms" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">2. Payment Terms</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2.1 Payment Processing</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg mb-4">
                      <p className="text-gray-700 mb-2">
                        <strong>Payment Gateway:</strong> All payments are processed securely through Razorpay, our authorized 
                        PCI-DSS compliant payment gateway partner.
                      </p>
                      <p className="text-gray-700">
                        <strong>Currency:</strong> Payments are accepted in Indian Rupees (INR) only. All payment transactions 
                        are subject to Razorpay's terms and conditions.
                      </p>
                    </div>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Payment confirmation will be sent to your registered email address</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">All prices are displayed in INR and are inclusive of applicable taxes (if any)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2.2 Service Charges</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Service Type</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Charging Model</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Refundable</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Job Posting</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Per job listing</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><Badge className="bg-red-600 text-white">No</Badge></td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Featured Listing</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Additional premium fee</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><Badge className="bg-red-600 text-white">No</Badge></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><strong>Subscription Plans</strong></td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Monthly/Annual</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700"><Badge className="bg-red-600 text-white">No</Badge></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 3: Non-Refundable Services */}
            <section id="non-refundable" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">3. Non-Refundable Services</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    The following services are non-refundable once payment is processed:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Job Posting Fees</h4>
                      <p className="text-sm text-red-800">
                        Once a job is posted and published on our platform, the payment is non-refundable, 
                        regardless of application numbers or hiring outcomes.
                      </p>
                    </div>
                    <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Featured Job Listings</h4>
                      <p className="text-sm text-red-800">
                        Premium placement fees are non-refundable once the featured status is activated.
                      </p>
                    </div>
                    <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Subscription Plans</h4>
                      <p className="text-sm text-red-800">
                        Monthly or annual subscription fees are non-refundable, even if you cancel mid-term.
                      </p>
                    </div>
                    <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Service Activation</h4>
                      <p className="text-sm text-red-800">
                        Once services are activated, no refunds will be processed, except as stated in Section 5.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 4: Cancellation Policy */}
            <section id="cancellation" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">4. Cancellation Policy</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 Job Posting Cancellation</h3>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Employers may cancel a job posting at any time through their dashboard</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"><strong>No Refund:</strong> Cancellation of a job posting does not entitle you to a refund</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Once cancelled, the job posting will be removed from public view</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Cancelled jobs cannot be reactivated without a new payment</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 Account Cancellation</h3>
                    <ul className="space-y-3 ml-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">You may cancel your account at any time by contacting our support team</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Account cancellation does not entitle you to a refund for any active subscriptions or posted jobs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Upon cancellation, your account will be deactivated and data will be retained as per our Privacy Policy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 5: Refund Exceptions */}
            <section id="refund-exceptions" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">5. Refund Exceptions</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Refunds may be considered only in the following exceptional circumstances:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Technical Failure</h4>
                      <p className="text-sm text-green-800 mb-2">
                        If a payment is processed but the service fails to activate due to a technical error on our part, 
                        a full refund will be processed within 7-14 business days.
                      </p>
                    </div>
                    <div className="p-5 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Duplicate Payment</h4>
                      <p className="text-sm text-green-800 mb-2">
                        If you are charged multiple times for the same service due to a system error, 
                        duplicate charges will be refunded.
                      </p>
                    </div>
                    <div className="p-5 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Unauthorized Transaction</h4>
                      <p className="text-sm text-green-800 mb-2">
                        If you report an unauthorized transaction within 48 hours, we will investigate and 
                        process a refund if verified.
                      </p>
                    </div>
                    <div className="p-5 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Service Not Delivered</h4>
                      <p className="text-sm text-green-800 mb-2">
                        If a paid service is not delivered within the promised timeframe due to our error, 
                        a refund may be processed.
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-lg">
                    <p className="text-sm text-yellow-900">
                      <strong>Important:</strong> All refund requests must be submitted within 7 days of the transaction date. 
                      Refund processing may take 7-14 business days depending on your bank or payment method. 
                      Refunds will be credited to the original payment method used for the transaction.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 6: Refund Process */}
            <section id="refund-process" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">6. Refund Process</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    To request a refund, please follow these steps:
                  </p>
                  <ol className="space-y-4 ml-6">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</div>
                      <span className="text-gray-700 pt-1">Contact our customer support team at <strong>support@medexjob.com</strong> or call <strong>+91 98765 43210</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
                      <span className="text-gray-700 pt-1">Provide your transaction ID, payment receipt, and reason for refund request</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">3</div>
                      <span className="text-gray-700 pt-1">Our team will review your request within 3-5 business days</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">4</div>
                      <span className="text-gray-700 pt-1">If approved, refund will be processed to your original payment method within 7-14 business days</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">5</div>
                      <span className="text-gray-700 pt-1">You will receive email confirmation once the refund is processed</span>
                    </li>
                  </ol>
                </div>
              </Card>
            </section>

            {/* Section 7: No Placement Guarantee */}
            <section id="no-guarantee" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">7. No Placement Guarantee</h2>
                </div>
                <div className="space-y-6">
                  <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
                    <p className="font-semibold text-red-900 mb-2">Important Disclaimer</p>
                    <p className="text-red-800 text-sm">
                      MedExJob.com is a job listing platform that facilitates connections between employers and candidates. 
                      We do not guarantee job placement, employment opportunities, or hiring outcomes.
                    </p>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    We do not guarantee:
                  </p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Job placement or employment opportunities for candidates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Number of applications or candidate responses for job postings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Quality or suitability of candidates or job opportunities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Successful hiring outcomes</span>
                    </li>
                  </ul>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-lg">
                    <p className="text-sm text-yellow-900">
                      <strong>Payment Purpose:</strong> Payment for job posting services is for platform access and listing 
                      visibility only. No refunds will be provided based on hiring outcomes, application numbers, or candidate quality.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Section 8: Razorpay */}
            <section id="razorpay" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">8. Razorpay Payment Gateway</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    All payments on MedExJob.com are processed through Razorpay, a PCI-DSS compliant payment gateway. 
                    By using our platform, you agree to Razorpay's terms and conditions.
                  </p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Razorpay handles all payment processing and security</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Refund processing times are subject to Razorpay's policies and your bank's processing time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">For payment-related disputes, Razorpay's dispute resolution process will apply</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">We are not responsible for payment gateway downtime or technical issues beyond our control</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </section>

            {/* Section 9: Dispute Resolution */}
            <section id="dispute-resolution" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-white shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">9. Dispute Resolution</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    In case of any disputes regarding payments or refunds:
                  </p>
                  <ol className="space-y-3 ml-6">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</div>
                      <span className="text-gray-700 pt-1">Contact our customer support team first for resolution</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
                      <span className="text-gray-700 pt-1">Provide all relevant transaction details and documentation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">3</div>
                      <span className="text-gray-700 pt-1">We will investigate and respond within 5-7 business days</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">4</div>
                      <span className="text-gray-700 pt-1">If unresolved, disputes will be subject to Indian jurisdiction and consumer protection laws</span>
                    </li>
                  </ol>
                </div>
              </Card>
            </section>

            {/* Section 10: Contact */}
            <section id="contact" className="mb-12 scroll-mt-24">
              <Card className="p-8 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">10. Contact for Refund Requests</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    For refund requests or payment-related queries, please contact us:
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-gray-900">Email</h3>
                      </div>
                      <p className="text-gray-700">support@medexjob.com</p>
                      <p className="text-sm text-gray-600 mt-1">Response within 24-48 hours</p>
                    </div>
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-gray-900">Phone</h3>
                      </div>
                      <p className="text-gray-700">+91 98765 43210</p>
                      <p className="text-sm text-gray-600 mt-1">Mon-Sat, 9 AM - 6 PM IST</p>
                    </div>
                    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm md:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      </div>
                      <p className="text-gray-700">Monday to Saturday, 9:00 AM - 6:00 PM IST</p>
                      <p className="text-sm text-gray-600 mt-1">Response Time: Within 24-48 hours</p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Update History */}
            <Card className="p-6 bg-gray-50 border border-gray-200 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Update History</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>January 15, 2025:</strong> Comprehensive Refund & Cancellation Policy published, Razorpay compliance and Indian consumer laws clarified</p>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
