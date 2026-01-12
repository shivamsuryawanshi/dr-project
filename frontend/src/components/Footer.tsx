import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl text-white">MedExJob.com</h3>
            </div>
            <p className="text-sm mb-4">
              India's premier job portal dedicated to medical professionals. Find your dream career in healthcare.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-blue-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-blue-400 transition-colors">
                  All Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('govt-jobs')} className="hover:text-blue-400 transition-colors">
                  Government Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('private-jobs')} className="hover:text-blue-400 transition-colors">
                  Private Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-blue-400 transition-colors">
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-white mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-blue-400 transition-colors">
                  Register as Employer
                </button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">
                  Post a Job
                </button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">
                  Browse Candidates
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>contact@medexjob.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>123, Medical Plaza, New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; 2025 MedExJob.com. All rights reserved.</p>
            <div className="flex gap-6">
              <button onClick={() => onNavigate('privacy-policy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button>
              <button onClick={() => onNavigate('terms-conditions')} className="hover:text-blue-400 transition-colors">Terms & Conditions</button>
              <button onClick={() => onNavigate('faq')} className="hover:text-blue-400 transition-colors">FAQ</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
