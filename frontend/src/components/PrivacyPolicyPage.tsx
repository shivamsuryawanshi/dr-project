import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyPolicyPageProps {
  onNavigate: (page: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 mb-6 mx-auto hover:bg-white/50 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">Last updated: January 2025</p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-12 border border-gray-100">
          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Introduction</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                At MedExJob.com, we are committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Information We Collect</h2>
            </div>
            <div className="pl-11 space-y-6">
              <div>
                <h3 className="text-xl text-blue-700 mb-4 font-medium">Personal Information</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Name, email address, phone number, date of birth</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Professional qualifications, certifications, and experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Resume, work history, and educational background</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Account credentials and authentication information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Payment information (for employers) processed securely through Razorpay</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Government identification documents (for employer verification)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl text-blue-700 mb-4 font-medium">Usage Information</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">IP address and location data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Browser type and version</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Pages visited and time spent</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Job search preferences</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">How We Use Your Information</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We use your personal information for the following purposes, in compliance with Indian data protection laws:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To provide and maintain our job portal services and facilitate employer-candidate connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To match candidates with suitable job opportunities based on qualifications and preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To send you job alerts, application updates, and account notifications via email and SMS (with your consent)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To process payments for job postings through Razorpay payment gateway</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To verify employer credentials and prevent fraudulent activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To improve our platform, develop new features, and conduct analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To ensure platform security, prevent fraud, and protect user data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To comply with legal obligations, court orders, and regulatory requirements in India</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">4</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Information Sharing</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                except in the following circumstances:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">With employers when you apply for jobs (only relevant information)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">With service providers who assist our operations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">When required by law or to protect our rights</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">In connection with a business transfer or acquisition</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">5</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Data Security and Storage</h2>
            </div>
            <div className="pl-11 space-y-4">
              <p className="text-gray-700 leading-relaxed text-lg">
                We implement appropriate technical and organizational measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction, in compliance with Indian data protection standards.
              </p>
              <div>
                <h3 className="text-xl text-blue-700 mb-3 font-medium">Security Measures</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">SSL/TLS encryption for data transmission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Secure servers hosted in India with regular security audits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Access controls and authentication mechanisms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Regular security assessments and vulnerability testing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Payment data is processed through PCI-DSS compliant Razorpay gateway</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl text-blue-700 mb-3 font-medium">Data Storage</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Your personal data is stored on secure servers located in India. We retain your data for as long as 
                  necessary to provide our services and comply with legal obligations. Data may be stored for up to 
                  3 years after account deactivation, unless you request earlier deletion.
                </p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">6</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Your Rights</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">You have the right to:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Access and review your personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Correct inaccurate or incomplete information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Request deletion of your personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Object to or restrict certain processing activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Data portability</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Withdraw consent where applicable</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">7</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Consent and Communication</h2>
            </div>
            <div className="pl-11 space-y-4">
              <div>
                <h3 className="text-xl text-blue-700 mb-3 font-medium">Email and SMS Communication</h3>
                <p className="text-gray-700 leading-relaxed text-lg mb-3">
                  By using MedExJob.com, you consent to receive:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Job alerts and application updates via email and SMS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Account notifications and security alerts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Marketing communications (you can opt-out anytime)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Payment confirmations and transaction receipts</span>
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed text-lg mt-4">
                  You can withdraw your consent for marketing communications at any time by updating your preferences 
                  in your account settings or by contacting us. However, transactional and service-related communications 
                  will continue to be sent as they are essential for platform functionality.
                </p>
              </div>
              <div>
                <h3 className="text-xl text-blue-700 mb-3 font-medium">Cookies and Tracking</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns,
                  and provide personalized content. You can control cookie preferences through your browser settings.
                  By continuing to use our platform, you consent to our use of cookies as described.
                </p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">8</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Data Retention and Deletion</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We retain your personal information for as long as necessary to provide our services and fulfill
                the purposes outlined in this policy, unless a longer retention period is required by Indian law.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Active accounts: Data retained while your account is active</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Deactivated accounts: Data retained for up to 3 years for legal compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Payment records: Retained for 7 years as per Indian tax laws</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">You may request data deletion at any time, subject to legal obligations</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">9</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Third-Party Services and Data Sharing</h2>
            </div>
            <div className="pl-11 space-y-4">
              <p className="text-gray-700 leading-relaxed text-lg">
                We may share your information with trusted third-party service providers who assist us in operating our platform:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Razorpay:</strong> Payment processing (PCI-DSS compliant)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Cloud Hosting:</strong> Secure data storage on servers in India</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Email/SMS Services:</strong> Communication delivery (with your consent)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Analytics:</strong> Platform usage analysis (anonymized data)</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed text-lg mt-4">
                All third-party service providers are contractually bound to protect your data and use it only 
                for specified purposes. We do not sell your personal information to third parties.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">10</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Changes to This Policy</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                We may update this Privacy Policy from time to time. We will notify you of any material changes
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">11</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Contact Us</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Email: privacy@medexjob.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Phone: +91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Address: 123, Medical Plaza, New Delhi, India</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
