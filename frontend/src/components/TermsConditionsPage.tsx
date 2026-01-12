import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface TermsConditionsPageProps {
  onNavigate: (page: string) => void;
}

export function TermsConditionsPage({ onNavigate }: TermsConditionsPageProps) {
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
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600">Last updated: January 2025</p>
          <div className="w-24 h-1 bg-green-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-12 border border-gray-100">
          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">1</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Acceptance of Terms</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                By accessing and using MedExJob.com, you accept and agree to be bound by the terms and provision
                of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Use License</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                Permission is granted to temporarily access the materials (information or software) on MedExJob.com
                for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Modify or copy the materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Use the materials for any commercial purpose or for any public display</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Attempt to decompile or reverse engineer any software contained on MedExJob.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Remove any copyright or other proprietary notations from the materials</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">3</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">User Accounts</h2>
            </div>
            <div className="pl-11 space-y-6">
              <div>
                <h3 className="text-xl text-green-700 mb-4 font-medium">Registration</h3>
                <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                  To access certain features of our platform, you must register for an account. You agree to:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Provide accurate and complete information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Maintain the security of your password</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Accept responsibility for all activities under your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Notify us immediately of any unauthorized use</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl text-green-700 mb-4 font-medium">Account Types</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed"><strong>Candidates:</strong> Medical professionals seeking employment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed"><strong>Employers:</strong> Healthcare organizations posting job opportunities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed"><strong>Administrators:</strong> Platform management and oversight</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">4</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Job Posting and Applications</h2>
            </div>
            <div className="pl-11 space-y-6">
              <div>
                <h3 className="text-xl text-green-700 mb-4 font-medium">For Employers</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Job postings must be accurate and not discriminatory</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">You are responsible for verifying candidate qualifications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Subscription fees are non-refundable</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Violation of posting guidelines may result in account suspension</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl text-green-700 mb-4 font-medium">For Candidates</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Applications must contain truthful information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">You are responsible for the accuracy of your resume and qualifications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Multiple applications to the same position may be restricted</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Professional conduct is expected in all communications</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">5</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Content Guidelines</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                All content posted on MedExJob.com must comply with our community standards:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">No discriminatory language or practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">No false or misleading information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">No spam or unsolicited communications</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">No copyrighted material without permission</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">No offensive or inappropriate content</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">6</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Privacy and Data Protection</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of MedExJob.com,
                to understand our practices regarding the collection and use of your personal information.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">7</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Intellectual Property</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                The service and its original content, features, and functionality are and will remain the exclusive property
                of MedExJob.com and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">8</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Termination</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability,
                under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">9</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Limitation of Liability</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                In no event shall MedExJob.com, nor its directors, employees, partners, agents, suppliers, or affiliates,
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation,
                loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">10</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Governing Law</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions.
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">11</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Changes to Terms</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">12</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Contact Information</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Email: legal@medexjob.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Phone: +91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
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
