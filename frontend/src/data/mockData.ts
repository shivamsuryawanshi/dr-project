import { Job, Application, Candidate, Employer, Notification, SubscriptionPlan } from '../types';

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Resident - General Medicine',
    organization: 'AIIMS New Delhi',
    sector: 'government',
    category: 'Senior Resident',
    location: 'New Delhi',
    qualification: 'MD/DNB Medicine',
    experience: '0-3 years',
    numberOfPosts: 5,
    salary: '₹67,700 - ₹2,08,700',
    description: 'AIIMS New Delhi invites applications for Senior Resident positions in General Medicine Department. Candidates must have completed MD/DNB in Medicine from a recognized institution.',
    lastDate: '2025-11-15',
    postedDate: '2025-10-10',
    pdfUrl: '#',
    applyLink: 'https://aiims.edu/apply',
    status: 'active',
    featured: true,
    views: 1245,
    applications: 87
  },
  {
    id: 'job-2',
    title: 'Medical Officer - Primary Health Centre',
    organization: 'Rajasthan Health Services',
    sector: 'government',
    category: 'Medical Officer',
    location: 'Jaipur, Rajasthan',
    qualification: 'MBBS',
    experience: '0-2 years',
    numberOfPosts: 15,
    salary: '₹45,000 - ₹1,20,000',
    description: 'Rajasthan Health Services Department is recruiting Medical Officers for various Primary Health Centres across Jaipur district.',
    lastDate: '2025-11-20',
    postedDate: '2025-10-12',
    pdfUrl: '#',
    applyLink: 'https://rajhealth.gov.in/apply',
    status: 'active',
    featured: true,
    views: 2341,
    applications: 156
  },
  {
    id: 'job-3',
    title: 'Consultant Cardiologist',
    organization: 'Apollo Hospitals',
    sector: 'private',
    category: 'Specialist',
    location: 'Mumbai, Maharashtra',
    qualification: 'DM/DNB Cardiology',
    experience: '3-5 years',
    numberOfPosts: 2,
    salary: '₹15-25 LPA',
    description: 'Apollo Hospitals Mumbai is seeking experienced Consultant Cardiologists for our Cardiac Care Centre. Excellent infrastructure and growth opportunities.',
    lastDate: '2025-11-25',
    postedDate: '2025-10-13',
    employerId: 'emp-1',
    status: 'active',
    featured: true,
    views: 876,
    applications: 34
  },
  {
    id: 'job-4',
    title: 'Junior Resident - Pediatrics',
    organization: 'PGI Chandigarh',
    sector: 'government',
    category: 'Junior Resident',
    location: 'Chandigarh',
    qualification: 'MBBS',
    experience: 'Fresher',
    numberOfPosts: 8,
    salary: '₹56,100',
    description: 'Post Graduate Institute of Medical Education & Research invites applications for Junior Resident positions in Pediatrics Department.',
    lastDate: '2025-11-10',
    postedDate: '2025-10-08',
    pdfUrl: '#',
    applyLink: 'https://pgi.ac.in/apply',
    status: 'active',
    featured: false,
    views: 1567,
    applications: 203
  },
  {
    id: 'job-5',
    title: 'Staff Nurse - ICU',
    organization: 'Fortis Healthcare',
    sector: 'private',
    category: 'Paramedical / Nursing',
    location: 'Bangalore, Karnataka',
    qualification: 'B.Sc Nursing / GNM',
    experience: '1-3 years',
    numberOfPosts: 10,
    salary: '₹3-5 LPA',
    description: 'Fortis Hospitals Bangalore requires experienced ICU nurses. Night shift allowance and medical insurance provided.',
    lastDate: '2025-11-30',
    postedDate: '2025-10-14',
    employerId: 'emp-2',
    status: 'active',
    featured: false,
    views: 654,
    applications: 78
  },
  {
    id: 'job-6',
    title: 'AYUSH Medical Officer',
    organization: 'Ministry of AYUSH',
    sector: 'government',
    category: 'AYUSH',
    location: 'Multiple Locations',
    qualification: 'BAMS/BHMS/BUMS',
    experience: '0-5 years',
    numberOfPosts: 50,
    salary: '₹40,000 - ₹1,00,000',
    description: 'Ministry of AYUSH invites applications for AYUSH Medical Officers across various wellness centres nationwide.',
    lastDate: '2025-12-05',
    postedDate: '2025-10-11',
    pdfUrl: '#',
    applyLink: 'https://ayush.gov.in/apply',
    status: 'active',
    featured: true,
    views: 987,
    applications: 125
  },
  {
    id: 'job-7',
    title: 'Associate Professor - Surgery',
    organization: 'Maulana Azad Medical College',
    sector: 'government',
    category: 'Faculty',
    location: 'New Delhi',
    qualification: 'MS/MCh with MD',
    experience: '5+ years',
    numberOfPosts: 3,
    salary: '₹1,31,100 - ₹2,16,600',
    description: 'MAMC Delhi invites applications for Associate Professor positions in Department of Surgery. Teaching and research experience required.',
    lastDate: '2025-11-18',
    postedDate: '2025-10-09',
    pdfUrl: '#',
    applyLink: 'https://mamc.edu/apply',
    status: 'active',
    featured: false,
    views: 543,
    applications: 23
  },
  {
    id: 'job-8',
    title: 'Radiologist',
    organization: 'Max Healthcare',
    sector: 'private',
    category: 'Specialist',
    location: 'Gurgaon, Haryana',
    qualification: 'MD Radio-Diagnosis',
    experience: '2-4 years',
    numberOfPosts: 1,
    salary: '₹12-18 LPA',
    description: 'Max Healthcare Gurgaon seeks skilled Radiologist for our diagnostic centre. State-of-the-art equipment and competitive compensation.',
    lastDate: '2025-11-22',
    postedDate: '2025-10-13',
    employerId: 'emp-3',
    status: 'active',
    featured: false,
    views: 432,
    applications: 19
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-3',
    candidateId: 'cand-1',
    candidateName: 'Dr. Priya Sharma',
    candidateEmail: 'priya.sharma@email.com',
    candidatePhone: '+91 98765 43210',
    resumeUrl: '#',
    status: 'shortlisted',
    appliedDate: '2025-10-14',
    notes: 'Strong credentials, 4 years experience'
  },
  {
    id: 'app-2',
    jobId: 'job-3',
    candidateId: 'cand-2',
    candidateName: 'Dr. Rahul Verma',
    candidateEmail: 'rahul.verma@email.com',
    candidatePhone: '+91 98765 43211',
    resumeUrl: '#',
    status: 'interview',
    appliedDate: '2025-10-13',
    interviewDate: '2025-10-20',
    notes: 'Interview scheduled for October 20'
  },
  {
    id: 'app-3',
    jobId: 'job-5',
    candidateId: 'cand-3',
    candidateName: 'Sneha Patel',
    candidateEmail: 'sneha.patel@email.com',
    candidatePhone: '+91 98765 43212',
    resumeUrl: '#',
    status: 'applied',
    appliedDate: '2025-10-15'
  }
];

export const mockCandidate: Candidate = {
  id: 'cand-1',
  name: 'Dr. Amit Kumar',
  email: 'amit.kumar@email.com',
  phone: '+91 98765 43200',
  role: 'candidate',
  qualifications: 'MBBS, MD (Medicine)',
  experience: '3 years',
  resumeUrl: '#',
  savedJobs: ['job-1', 'job-3', 'job-6']
};

export const mockEmployer: Employer = {
  id: 'emp-1',
  name: 'Rajesh Gupta',
  email: 'rajesh@apollohospitals.com',
  phone: '+91 98765 43201',
  role: 'employer',
  companyName: 'Apollo Hospitals',
  companyType: 'hospital',
  verified: true,
  subscriptionActive: true,
  subscriptionEndDate: '2026-01-15'
};

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'cand-1',
    type: 'job_alert',
    message: 'New job matching your profile: Senior Resident - General Medicine at AIIMS Delhi',
    read: false,
    createdAt: '2025-10-14T10:30:00',
    relatedJobId: 'job-1'
  },
  {
    id: 'notif-2',
    userId: 'cand-1',
    type: 'application_update',
    message: 'Your application for Consultant Cardiologist has been shortlisted',
    read: false,
    createdAt: '2025-10-14T09:15:00',
    relatedJobId: 'job-3'
  },
  {
    id: 'notif-3',
    userId: 'emp-1',
    type: 'application_update',
    message: 'New application received for Consultant Cardiologist position',
    read: true,
    createdAt: '2025-10-13T14:20:00',
    relatedJobId: 'job-3'
  }
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-1',
    name: 'Pay Per Post',
    price: 999,
    duration: 'per post',
    jobPostsAllowed: 1,
    features: [
      'Single job posting',
      '30 days validity',
      'Basic analytics',
      'Unlimited applications'
    ]
  },
  {
    id: 'plan-2',
    name: 'Monthly Plan',
    price: 4999,
    duration: 'monthly',
    jobPostsAllowed: 10,
    features: [
      '10 job postings per month',
      'Priority approval',
      'Advanced analytics',
      'Unlimited applications',
      'Email notifications'
    ]
  },
  {
    id: 'plan-3',
    name: 'Annual Plan',
    price: 49999,
    duration: 'yearly',
    jobPostsAllowed: 150,
    features: [
      '150 job postings per year',
      'Instant approval (verified employers)',
      'Advanced analytics & reports',
      'Unlimited applications',
      'Priority support',
      'Featured job options',
      'Dedicated account manager'
    ]
  }
];
