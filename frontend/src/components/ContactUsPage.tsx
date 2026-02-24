// AI assisted development
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ContactUsPageProps {
  onNavigate: (page: string) => void;
}

export function ContactUsPage({ onNavigate }: ContactUsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            Contact Us
          </h1>
          <p className="text-lg text-gray-600">We're here to help you. Get in touch with our team.</p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Support</h3>
                  <p className="text-gray-600 mb-2">For general inquiries and support</p>
                  <a href="mailto:medexjob1997@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">
                    medexjob1997@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone Support</h3>
                  <p className="text-gray-600 mb-2">Call us during business hours</p>
                  <a href="tel:+917727930382" className="text-green-600 hover:text-green-700 font-medium">
                    +91 77279 30382
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Address</h3>
                  <p className="text-gray-600 leading-relaxed">
                    MedExJob<br />
                    Tribhuwam Vihar, Bagli Village<br />
                    Bhopal, Madhya Pradesh – 462043<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Monday to Saturday: 9:00 AM - 6:00 PM IST<br />
                    Sunday: Closed<br />
                    <span className="text-sm text-gray-500">(Response time: 24-48 hours)</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 77279 30382"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="payment">Payment/Billing</option>
                  <option value="refund">Refund Request</option>
                  <option value="partnership">Partnership/Business</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe your inquiry in detail..."
                ></textarea>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card>
        </div>

        {/* Business Details Section */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Business Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Entity Details</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Business Name:</strong> MedExJob</p>
                <p><strong>Legal Structure:</strong> Individual / Sole Proprietor</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Channels</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> medexjob1997@gmail.com</p>
                <p><strong>Phone:</strong> +91 77279 30382</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Grievance Redressal */}
        <Card className="p-8 bg-blue-50 border-blue-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Grievance Redressal</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any complaints or grievances regarding our services, please contact our Grievance Officer:
          </p>
          <div className="space-y-2 text-gray-700">
            <p><strong>Grievance Officer:</strong> Shivam Suryawanshi</p>
            <p><strong>Email:</strong> medexjob1997@gmail.com</p>
            <p><strong>Phone:</strong> +91 77279 30382</p>
            <p><strong>Response Time:</strong> Within 7 working days</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            As per Indian consumer protection laws, we are committed to resolving all grievances in a timely and fair manner.
          </p>
        </Card>
      </div>
    </div>
  );
}

