import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface FAQPageProps {
  onNavigate: (page: string) => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I create an account on MedExJob.com?",
    answer: "To create an account, click on the 'Register' button in the top navigation. Choose your role (Candidate, Employer, or Admin) and fill in the required information including your email, password, and basic profile details. You'll receive a confirmation email to verify your account."
  },
  {
    question: "Is registration free for job seekers?",
    answer: "Yes, creating an account and searching for jobs is completely free for candidates. You can apply to unlimited jobs, save job searches, and set up job alerts at no cost."
  },
  {
    question: "How do employers post jobs on the platform?",
    answer: "Employers need to register and verify their account. Once verified, they can access the employer dashboard and post jobs. Different subscription plans offer varying numbers of job postings and additional features."
  },
  {
    question: "What types of jobs are available on MedExJob.com?",
    answer: "We specialize in healthcare and medical jobs including doctors, nurses, pharmacists, medical technicians, administrative staff, and other healthcare professionals. We have both government and private sector opportunities."
  },
  {
    question: "How do I apply for a job?",
    answer: "Once you find a job you're interested in, click on 'Apply Now' or 'View Details' to see the full job description. Upload your resume and fill in any additional information requested. Your application will be sent directly to the employer."
  },
  {
    question: "Can I save jobs for later?",
    answer: "Yes, you can save jobs by clicking the heart icon or 'Save for Later' button. All saved jobs can be accessed from your dashboard under the 'Saved Jobs' section."
  },
  {
    question: "How do I track my job applications?",
    answer: "Log in to your account and go to your dashboard. You'll find an 'Applied Jobs' section where you can see the status of all your applications, including pending, shortlisted, interviewed, and rejected applications."
  },
  {
    question: "What should I include in my resume?",
    answer: "Your resume should include your contact information, professional summary, work experience, education, certifications, skills, and any relevant licenses. Make sure all information is accurate and up-to-date."
  },
  {
    question: "How do employers find candidates?",
    answer: "Employers can search through candidate profiles, review applications received for their job postings, and use filters to find candidates with specific qualifications, experience levels, and locations."
  },
  {
    question: "What are the subscription plans for employers?",
    answer: "We offer various subscription plans including Basic (limited job postings), Professional (more postings and features), and Enterprise (unlimited postings with advanced analytics). Contact us for detailed pricing."
  },
  {
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we take data security seriously. We use encryption, secure servers, and follow industry best practices to protect your personal information. Please review our Privacy Policy for more details."
  },
  {
    question: "Can I update my profile information?",
    answer: "Yes, you can update your profile information anytime from your dashboard. Go to 'Profile' section to edit your personal details, resume, preferences, and account settings."
  },
  {
    question: "How do I contact customer support?",
    answer: "You can contact us through the 'Contact Us' section on our website, or email us at support@medexjob.com. We also have a comprehensive help center with guides and tutorials."
  },
  {
    question: "What if I have issues with my account?",
    answer: "If you experience any issues with your account, please contact our support team immediately. We'll help resolve login issues, account verification problems, or any other technical difficulties."
  }
];

export function FAQPage({ onNavigate }: FAQPageProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

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
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">Find answers to common questions about MedExJob.com</p>
          <div className="w-24 h-1 bg-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* FAQ Content */}
        <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200 overflow-hidden border border-gray-100">
          {faqData.map((faq, index) => (
            <div key={index} className="p-8 hover:bg-gray-50 transition-all duration-200">
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-start gap-4 text-left group"
              >
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold text-xs">Q</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 group-hover:text-purple-700 transition-colors duration-200 leading-relaxed">{faq.question}</h3>
                </div>
                {openItems.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0 transition-transform duration-200 mt-1" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-purple-600 transition-colors duration-200 mt-1" />
                )}
              </button>
              {openItems.has(index) && (
                <div className="mt-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold text-xs">A</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg flex-1">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8 text-center border border-gray-100">
          <h2 className="text-2xl text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate('contact')}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('mailto:support@medexjob.com')}
              className="border-purple-200 hover:bg-purple-50 transition-all duration-200"
            >
              Email Us
            </Button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>Support Hours: Monday - Friday, 9:00 AM - 6:00 PM IST</p>
            <p>Response Time: Within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
