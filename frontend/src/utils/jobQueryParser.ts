// AI assisted development

export interface ParsedJobQuery {
  title: string[];
  qualification: string[];
  department: string[];
  location: string | null;
  experience: string | null;
  salary: string | null;
  job_type: string | null;
  company: string | null;
  synonyms: string[];
}

// Medical role synonyms mapping
const ROLE_SYNONYMS: Record<string, string[]> = {
  'jr': ['Junior Resident', 'JR', 'Junior Resident Doctor'],
  'mo': ['Medical Officer', 'MO', 'Medical Officer Doctor'],
  'sr': ['Senior Resident', 'SR', 'Senior Resident Doctor'],
  'consultant': ['Consultant', 'Senior Consultant', 'Consultant Doctor'],
  'nurse': ['Nurse', 'Nursing', 'Staff Nurse', 'Nursing Staff'],
  'doctor': ['Doctor', 'Physician', 'Medical Doctor', 'MD'],
  'surgeon': ['Surgeon', 'Surgical', 'Surgery'],
  'anesthetist': ['Anesthetist', 'Anaesthetist', 'Anesthesiologist'],
  'radiologist': ['Radiologist', 'Radiology'],
  'pathologist': ['Pathologist', 'Pathology'],
  'gynecologist': ['Gynecologist', 'Gynaecologist', 'OBGYN'],
  'pediatrician': ['Pediatrician', 'Paediatrician', 'Pediatrics'],
  'cardiologist': ['Cardiologist', 'Cardiology'],
  'orthopedic': ['Orthopedic', 'Orthopaedics', 'Orthopedic Surgeon'],
  'dermatologist': ['Dermatologist', 'Dermatology'],
  'psychiatrist': ['Psychiatrist', 'Psychiatry'],
  'neurologist': ['Neurologist', 'Neurology'],
  'ophthalmologist': ['Ophthalmologist', 'Ophthalmology'],
  'ent': ['ENT', 'Ear Nose Throat', 'Otolaryngologist'],
  'physiotherapist': ['Physiotherapist', 'Physical Therapist', 'Physiotherapy'],
  'pharmacist': ['Pharmacist', 'Pharmacy'],
  'lab technician': ['Lab Technician', 'Laboratory Technician', 'Lab Tech'],
  'x-ray technician': ['X-Ray Technician', 'Radiology Technician'],
  'operation theatre': ['OT Technician', 'Operation Theatre Technician', 'OT Tech'],
};

// Qualification tokens
const QUALIFICATIONS = [
  'MBBS', 'BDS', 'BAMS', 'BHMS', 'BUMS', 'BVSc',
  'MD', 'MS', 'DM', 'MCh', 'DNB', 'MDS',
  'BSc Nursing', 'GNM', 'ANM', 'BPT', 'BPharm', 'DPharm',
  'MSc Nursing', 'MPT', 'MPharm', 'PhD',
  'Diploma', 'PG Diploma', 'Certificate'
];

// Department names
const DEPARTMENTS = [
  'Cardiology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Obstetrics',
  'Neurology', 'Neurosurgery', 'Psychiatry', 'Dermatology', 'Ophthalmology',
  'ENT', 'Anesthesiology', 'Radiology', 'Pathology', 'Microbiology',
  'General Medicine', 'General Surgery', 'Emergency', 'ICU', 'CCU',
  'Oncology', 'Urology', 'Nephrology', 'Gastroenterology', 'Pulmonology',
  'Endocrinology', 'Rheumatology', 'Hematology', 'Immunology'
];

// Indian cities and states
const LOCATIONS = [
  // Major cities
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
  'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Amritsar', 'Chandigarh',
  'Kochi', 'Coimbatore', 'Madurai', 'Mysore', 'Mangalore', 'Hubli',
  'Vijayawada', 'Guntur', 'Warangal', 'Raipur', 'Bhilai', 'Bhubaneswar',
  'Cuttack', 'Rourkela', 'Jamshedpur', 'Ranchi', 'Dhanbad', 'Bokaro',
  'Guwahati', 'Silchar', 'Dibrugarh', 'Imphal', 'Aizawl', 'Shillong',
  'Agartala', 'Kohima', 'Itanagar', 'Gangtok', 'Dehradun', 'Haridwar',
  'Nainital', 'Shimla', 'Dharamshala', 'Jammu', 'Leh', 'Udaipur',
  'Jodhpur', 'Bikaner', 'Ajmer', 'Kota', 'Bhilwara', 'Alwar',
  'Gurgaon', 'Noida', 'Greater Noida', 'Faridabad', 'Panipat', 'Karnal',
  'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Sonipat', 'Rewari',
  // States
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh',
  'Telangana', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh',
  'West Bengal', 'Bihar', 'Odisha', 'Punjab', 'Haryana', 'Himachal Pradesh',
  'Uttarakhand', 'Jammu and Kashmir', 'Assam', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Sikkim', 'Goa'
];

// Job type keywords
const JOB_TYPES = [
  'full time', 'full-time', 'part time', 'part-time', 'contract',
  'permanent', 'temporary', 'internship', 'residency', 'fellowship',
  'government', 'private', 'public', 'contractual'
];

// Company/Organization keywords
const COMPANY_KEYWORDS = [
  'hospital', 'clinic', 'medical college', 'university', 'institute',
  'healthcare', 'pharma', 'pharmaceutical', 'diagnostic', 'laboratory',
  'government', 'private', 'public sector', 'corporate'
];

/**
 * Parse a user query into structured job search filters
 */
export function parseJobQuery(query: string): ParsedJobQuery {
  const lowerQuery = query.toLowerCase().trim();
  const words = query.split(/\s+/);
  
  const result: ParsedJobQuery = {
    title: [],
    qualification: [],
    department: [],
    location: null,
    experience: null,
    salary: null,
    job_type: null,
    company: null,
    synonyms: []
  };

  // Extract qualifications
  for (const qual of QUALIFICATIONS) {
    const qualLower = qual.toLowerCase();
    if (lowerQuery.includes(qualLower)) {
      result.qualification.push(qual);
      // Add synonyms
      if (qual === 'MBBS') result.synonyms.push('Bachelor of Medicine', 'Bachelor of Surgery');
      if (qual === 'MD') result.synonyms.push('Doctor of Medicine', 'Post Graduate');
      if (qual === 'MS') result.synonyms.push('Master of Surgery', 'Post Graduate');
    }
  }

  // Extract departments
  for (const dept of DEPARTMENTS) {
    const deptLower = dept.toLowerCase();
    if (lowerQuery.includes(deptLower)) {
      result.department.push(dept);
    }
  }

  // Extract locations
  for (const loc of LOCATIONS) {
    const locLower = loc.toLowerCase();
    if (lowerQuery.includes(locLower)) {
      result.location = loc;
      break; // Take first match
    }
  }

  // Extract job titles and map synonyms
  for (const [key, synonyms] of Object.entries(ROLE_SYNONYMS)) {
    if (lowerQuery.includes(key)) {
      result.title.push(...synonyms);
      result.synonyms.push(key, ...synonyms);
    }
  }

  // If no title found, try to extract common patterns
  if (result.title.length === 0) {
    // Check for "junior", "senior", "assistant", "associate" patterns
    const titlePatterns = [
      /(junior|jr)\s+(\w+)/i,
      /(senior|sr)\s+(\w+)/i,
      /(assistant)\s+(\w+)/i,
      /(associate)\s+(\w+)/i,
      /(chief)\s+(\w+)/i,
      /(head)\s+of\s+(\w+)/i,
    ];
    
    for (const pattern of titlePatterns) {
      const match = query.match(pattern);
      if (match) {
        const prefix = match[1].toLowerCase();
        const role = match[2];
        result.title.push(`${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${role}`);
        result.synonyms.push(prefix, role);
      }
    }
  }

  // Extract experience (patterns like "2 years", "3-5 years", "fresher")
  const experiencePatterns = [
    /(\d+)\s*-\s*(\d+)\s*years?/i,
    /(\d+)\s*\+\s*years?/i,
    /(\d+)\s*years?/i,
    /fresher/i,
    /entry\s*level/i,
    /experienced/i,
  ];
  
  for (const pattern of experiencePatterns) {
    const match = query.match(pattern);
    if (match) {
      if (match[0].toLowerCase().includes('fresher')) {
        result.experience = '0 years';
      } else if (match[0].toLowerCase().includes('entry')) {
        result.experience = '0-1 years';
      } else if (match[1] && match[2]) {
        result.experience = `${match[1]}-${match[2]} years`;
      } else if (match[1]) {
        result.experience = `${match[1]}+ years`;
      }
      break;
    }
  }

  // Extract salary (patterns like "50000", "50k", "5 lakhs", "₹50000")
  const salaryPatterns = [
    /₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|L|Lakh)/i,
    /₹?\s*(\d+(?:\.\d+)?)\s*k/i,
    /₹?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/,
    /salary\s*:?\s*₹?\s*(\d+(?:\.\d+)?)/i,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = query.match(pattern);
    if (match) {
      let amount = match[1].replace(/,/g, '');
      if (match[0].toLowerCase().includes('lakh')) {
        amount = (parseFloat(amount) * 100000).toString();
      } else if (match[0].toLowerCase().includes('k')) {
        amount = (parseFloat(amount) * 1000).toString();
      }
      result.salary = `₹${amount}`;
      break;
    }
  }

  // Extract job type
  for (const type of JOB_TYPES) {
    if (lowerQuery.includes(type)) {
      result.job_type = type.replace('-', ' ');
      break;
    }
  }

  // Extract company/organization
  for (const keyword of COMPANY_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      result.company = keyword;
      break;
    }
  }

  // Fix typos and common misspellings
  const typoMap: Record<string, string> = {
    'docter': 'doctor',
    'nurce': 'nurse',
    'nursing': 'nurse',
    'cardialogist': 'cardiologist',
    'orthopedic': 'orthopedics',
    'pediatrician': 'pediatrics',
  };

  for (const [typo, correct] of Object.entries(typoMap)) {
    if (lowerQuery.includes(typo) && !result.title.some(t => t.toLowerCase().includes(correct))) {
      result.synonyms.push(typo, correct);
    }
  }

  // Remove duplicates
  result.title = [...new Set(result.title)];
  result.qualification = [...new Set(result.qualification)];
  result.department = [...new Set(result.department)];
  result.synonyms = [...new Set(result.synonyms)];

  return result;
}

/**
 * Format parsed query as JSON string
 */
export function formatParsedQuery(parsed: ParsedJobQuery): string {
  return JSON.stringify(parsed, null, 2);
}

/**
 * Main parser function - takes query string and returns JSON
 * This is the primary entry point for the parser
 */
export function parseQueryToJSON(query: string): string {
  const parsed = parseJobQuery(query);
  return JSON.stringify(parsed, null, 2);
}

