// AI assisted development
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface RefundCancellationPageProps {
  onNavigate: (page: string) => void;
}

export function RefundCancellationPage({ onNavigate }: RefundCancellationPageProps) {
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
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-lg text-gray-600">Last updated: January 2025</p>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-12 border border-gray-100">
          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">1</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">General Policy</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                MedExJob.com operates as a service-based platform connecting medical professionals with healthcare employers. 
                All payments made for job posting services are final and non-refundable, except as explicitly stated in this policy.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                By making a payment on our platform, you acknowledge and agree to this refund and cancellation policy. 
                This policy is in compliance with Indian consumer protection laws and payment gateway regulations.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">2</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Payment Terms</h2>
            </div>
            <div className="pl-11 space-y-6">
              <div>
                <h3 className="text-xl text-red-700 mb-4 font-medium">Payment Processing</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">All payments are processed securely through Razorpay, our authorized payment gateway partner</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Payments are accepted in Indian Rupees (INR) only</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">All payment transactions are subject to Razorpay's terms and conditions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Payment confirmation will be sent to your registered email address</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl text-red-700 mb-4 font-medium">Service Charges</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Job posting fees are charged per job listing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Featured job postings may incur additional charges</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">All prices are displayed in INR and are inclusive of applicable taxes (if any)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">We reserve the right to modify pricing with prior notice</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">3</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Non-Refundable Services</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                The following services are non-refundable once payment is processed:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Job Posting Fees:</strong> Once a job is posted and published on our platform, the payment is non-refundable</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Featured Job Listings:</strong> Premium placement fees are non-refundable</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Subscription Plans:</strong> Monthly or annual subscription fees are non-refundable</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Service Activation:</strong> Once services are activated, no refunds will be processed</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">4</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Cancellation Policy</h2>
            </div>
            <div className="pl-11 space-y-6">
              <div>
                <h3 className="text-xl text-red-700 mb-4 font-medium">Job Posting Cancellation</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Employers may cancel a job posting at any time through their dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Cancellation of a job posting does not entitle you to a refund</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Once cancelled, the job posting will be removed from public view</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Cancelled jobs cannot be reactivated without a new payment</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl text-red-700 mb-4 font-medium">Account Cancellation</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">You may cancel your account at any time by contacting our support team</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Account cancellation does not entitle you to a refund for any active subscriptions or posted jobs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Upon cancellation, your account will be deactivated and data will be retained as per our Privacy Policy</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">5</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Refund Exceptions</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Refunds may be considered only in the following exceptional circumstances:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Technical Failure:</strong> If a payment is processed but the service fails to activate due to a technical error on our part, a full refund will be processed within 7-14 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Duplicate Payment:</strong> If you are charged multiple times for the same service due to a system error, duplicate charges will be refunded</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Unauthorized Transaction:</strong> If you report an unauthorized transaction within 48 hours, we will investigate and process a refund if verified</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed"><strong>Service Not Delivered:</strong> If a paid service is not delivered within the promised timeframe due to our error, a refund may be processed</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-gray-700 leading-relaxed text-sm">
                  <strong>Note:</strong> All refund requests must be submitted within 7 days of the transaction date. 
                  Refund processing may take 7-14 business days depending on your bank or payment method. 
                  Refunds will be credited to the original payment method used for the transaction.
                </p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">6</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Refund Process</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                To request a refund, please follow these steps:
              </p>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-gray-700 leading-relaxed">Contact our customer support team at support@medexjob.com or call +91-XXXXXXXXXX</li>
                <li className="text-gray-700 leading-relaxed">Provide your transaction ID, payment receipt, and reason for refund request</li>
                <li className="text-gray-700 leading-relaxed">Our team will review your request within 3-5 business days</li>
                <li className="text-gray-700 leading-relaxed">If approved, refund will be processed to your original payment method within 7-14 business days</li>
                <li className="text-gray-700 leading-relaxed">You will receive email confirmation once the refund is processed</li>
              </ol>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">7</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">No Placement Guarantee</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                <strong>Important Disclaimer:</strong> MedExJob.com is a job listing platform that facilitates connections between employers and candidates. 
                We do not guarantee:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Job placement or employment opportunities for candidates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Number of applications or candidate responses for job postings</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Quality or suitability of candidates or job opportunities</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Successful hiring outcomes</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed text-lg mt-4">
                Payment for job posting services is for platform access and listing visibility only. 
                No refunds will be provided based on hiring outcomes, application numbers, or candidate quality.
              </p>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">8</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Razorpay Payment Gateway</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                All payments on MedExJob.com are processed through Razorpay, a PCI-DSS compliant payment gateway. 
                By using our platform, you agree to Razorpay's terms and conditions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Razorpay handles all payment processing and security</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Refund processing times are subject to Razorpay's policies and your bank's processing time</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">For payment-related disputes, Razorpay's dispute resolution process will apply</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">We are not responsible for payment gateway downtime or technical issues beyond our control</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">9</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Dispute Resolution</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                In case of any disputes regarding payments or refunds:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Contact our customer support team first for resolution</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">Provide all relevant transaction details and documentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">We will investigate and respond within 5-7 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">If unresolved, disputes will be subject to Indian jurisdiction and consumer protection laws</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">10</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Contact for Refund Requests</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                For refund requests or payment-related queries, please contact us at:
              </p>
              <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Email: support@medexjob.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Phone: +91-XXXXXXXXXX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Response Time: Within 24-48 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">11</span>
              </div>
              <h2 className="text-2xl text-gray-900 font-semibold">Policy Updates</h2>
            </div>
            <div className="pl-11">
              <p className="text-gray-700 leading-relaxed text-lg">
                We reserve the right to modify this Refund & Cancellation Policy at any time. 
                Changes will be effective immediately upon posting on this page. 
                Continued use of our services after policy changes constitutes acceptance of the updated policy. 
                We recommend reviewing this policy periodically.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

