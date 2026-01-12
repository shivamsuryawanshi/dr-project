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
                    <span className="text-gray-700 leading-relaxed">Name, email address, phone number</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Professional qualifications and experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Resume and work history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Account credentials</span>
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
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To provide and maintain our job portal services</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To match candidates with suitable job opportunities</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To communicate with you about your applications and account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To improve our platform and develop new features</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To ensure platform security and prevent fraud</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">To comply with legal obligations</span>
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
              <h2 className="text-2xl text-gray-900 font-semibold">Data Security</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                We implement appropriate technical and organizational measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers,
                and regular security assessments.
              </p>
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
              <h2 className="text-2xl text-gray-900 font-semibold">Cookies and Tracking</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns,
                and provide personalized content. You can control cookie preferences through your browser settings.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">8</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Data Retention</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                We retain your personal information for as long as necessary to provide our services and fulfill
                the purposes outlined in this policy, unless a longer retention period is required by law.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">9</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">International Data Transfers</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                Your information may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place to protect your data during such transfers.
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
