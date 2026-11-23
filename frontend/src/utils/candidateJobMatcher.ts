import { CandidateProfileData } from '../api/candidateProfiles';

export interface MatchResult {
  isMatch: boolean;
  score: number; // 0 to 100
  matchReasons: string[];
  qualifies: boolean;
}

/**
 * Intelligent Healthcare Job Matching Engine
 * Matches candidate's structured qualifications, medical category, speciality,
 * target roles, and practice locations with active job vacancies.
 * Handles wildcard rules ("Anywhere in India", "All Relevant") and medical role
 * cross-qualification mappings (e.g., MBBS for Junior Resident & Medical Officer).
 */
export function matchCandidateToJob(candidate: CandidateProfileData, job: any): MatchResult {
  if (!candidate || !job) {
    return { isMatch: false, score: 0, matchReasons: [], qualifies: false };
  }

  const reasons: string[] = [];
  let score = 0;

  const jobTitle = String(job.title || '').toLowerCase();
  const jobDesc = String(job.description || '').toLowerCase();
  const jobRoles = Array.isArray(job.jobRoles)
    ? job.jobRoles.map((r: string) => String(r).toLowerCase())
    : [String(job.jobRole || '').toLowerCase()];
  const jobQualification = String(job.qualification || '').toLowerCase();
  const jobSector = String(job.sector || '').toLowerCase();
  const jobLocation = String(job.location || job.state || job.city || '').toLowerCase();
  const jobCategory = String(job.category || '').toLowerCase();
  const jobSpeciality = String(job.speciality || '').toLowerCase();
  const jobDepartment = String(job.department || '').toLowerCase();

  const candidateBasic = String(candidate.basicQualification || '').toLowerCase();
  const candidateHighest = String(candidate.highestQualification || candidate.qualification || '').toLowerCase();
  const candidateSpeciality = String(candidate.speciality || '').toLowerCase().trim();
  const qualificationsToCheck = [candidateHighest, candidateBasic].filter(Boolean);
  const isMbbs = qualificationsToCheck.some((q) => q.includes('mbbs'));

  // 1. PRACTICE LOCATION MATCH (20 points)
  const candidateLocation = String(
    candidate.preferredLocation ||
    candidate.locationPreferenceType ||
    candidate.currentCity ||
    candidate.state ||
    ''
  ).toLowerCase().trim();

  const candidateStates = Array.isArray(candidate.preferredStates)
    ? candidate.preferredStates.map((s) => String(s).toLowerCase().trim())
    : [];

  const isLocationWildcard =
    !candidateLocation ||
    candidateLocation.includes('anywhere') ||
    candidateLocation.includes('india') ||
    candidateLocation.includes('pan india') ||
    candidateLocation.includes('all india') ||
    candidateLocation.includes('flexible') ||
    candidateLocation.includes('any');

  if (isLocationWildcard) {
    score += 20;
    reasons.push('Location matched: Anywhere in India');
  } else if (
    (jobLocation && candidateLocation && (jobLocation.includes(candidateLocation) || candidateLocation.includes(jobLocation))) ||
    candidateStates.some((st) => st && jobLocation.includes(st))
  ) {
    score += 20;
    reasons.push(`Location matched: ${job.location || candidate.preferredLocation}`);
  }

  // 2. SPECIALITY & CLINICAL DISCIPLINE MATCH (35 points)
  const isAllSpecialities =
    !candidateSpeciality ||
    candidateSpeciality === 'all' ||
    candidateSpeciality === 'any' ||
    candidateSpeciality === 'all relevant';

  if (isAllSpecialities) {
    score += 35;
    reasons.push('Speciality matched: All clinical specialities');
  } else if (candidateSpeciality && candidateSpeciality !== 'other' && candidateSpeciality !== 'none') {
    // Medical discipline synonyms expansion
    const medicineSynonyms = candidateSpeciality.includes('medicine')
      ? ['medicine', 'internal medicine', 'general medicine', 'physician', 'general physician', 'gdmo', 'medical officer', 'resident']
      : [];
    const surgerySynonyms = candidateSpeciality.includes('surgery')
      ? ['surgery', 'general surgery', 'surgical']
      : [];
    const pediaSynonyms = candidateSpeciality.includes('pediatric') || candidateSpeciality.includes('paediatric')
      ? ['pediatric', 'paediatric', 'pediatrics', 'paediatrics', 'child health']
      : [];
    const obgynSynonyms = candidateSpeciality.includes('gynaec') || candidateSpeciality.includes('gynec') || candidateSpeciality.includes('obstetric')
      ? ['obstetrics', 'gynaecology', 'gynecology', 'obg', 'obs & gynae']
      : [];
    const synonyms = [
      candidateSpeciality,
      ...medicineSynonyms,
      ...surgerySynonyms,
      ...pediaSynonyms,
      ...obgynSynonyms,
    ];

    const jobFullText = `${jobTitle} ${jobDesc} ${jobSpeciality} ${jobDepartment} ${jobCategory}`;
    const hasSpecMatch = synonyms.some((syn) => syn && jobFullText.includes(syn));

    if (hasSpecMatch) {
      score += 35;
      reasons.push(`Speciality matched: ${candidate.speciality}`);
    }
  }

  // 3. QUALIFICATION MATCH (30 points)
  const jobFullQualText = `${jobQualification} ${jobTitle} ${jobDesc} ${jobCategory}`;
  let qualMatched = false;

  if (isMbbs) {
    if (
      jobFullQualText.includes('mbbs') ||
      jobFullQualText.includes('medical graduate') ||
      jobFullQualText.includes('junior resident') ||
      jobFullQualText.includes('medical officer') ||
      jobFullQualText.includes('gdmo') ||
      jobFullQualText.includes('resident doctor') ||
      jobFullQualText.includes('duty doctor') ||
      jobFullQualText.includes('rmo') ||
      jobFullQualText.includes('tutor') ||
      jobFullQualText.includes('demonstrator')
    ) {
      qualMatched = true;
      reasons.push('Basic qualification matched: MBBS (eligible for JR / MO / GDMO posts)');
    }
  }

  if (!qualMatched) {
    for (const qual of qualificationsToCheck) {
      if (qual) {
        const qClean = qual.toLowerCase().replace(' only', '');
        const regex = new RegExp(`\\b${qClean}\\b`, 'i');
        if (regex.test(jobFullQualText) || jobFullQualText.includes(qClean)) {
          qualMatched = true;
          reasons.push(`Qualification matched: ${qual.toUpperCase()}`);
          break;
        }
      }
    }
  }

  if (qualMatched) {
    score += 30;
  }

  // 4. TARGET JOB ROLE MATCH (15 points)
  const candidateRoles = (candidate.preferredJobRoles || [candidate.preferredJobRole]).filter(Boolean);
  let roleMatched = false;

  const isWildcardRole = candidateRoles.length === 0 || candidateRoles.some((r) => {
    const rLower = String(r).toLowerCase().trim();
    return rLower === 'all relevant' || rLower === 'all' || rLower === 'any' || rLower === 'any relevant';
  });

  if (isWildcardRole) {
    roleMatched = true;
    reasons.push('Role matched: All Relevant medical posts');
  } else {
    for (const role of candidateRoles) {
      const roleLower = String(role).toLowerCase().trim();
      if (
        jobRoles.some((jr: string) => jr.includes(roleLower) || roleLower.includes(jr)) ||
        jobTitle.includes(roleLower) ||
        (isMbbs && (roleLower.includes('junior') || roleLower.includes('medical officer')) &&
          (jobTitle.includes('junior resident') || jobTitle.includes('medical officer') || jobCategory.includes('resident')))
      ) {
        roleMatched = true;
        reasons.push(`Role matched: ${role}`);
        break;
      }
    }
  }

  if (roleMatched) {
    score += 15;
  }

  // 5. SECTOR MATCH BONUS (5 points)
  if (!candidate.preferredSectors || candidate.preferredSectors.length === 0) {
    score += 5;
  } else {
    const wantsGovt = candidate.preferredSectors.some((s) => s.toLowerCase().includes('gov') || s.toLowerCase() === 'both');
    const wantsPrivate = candidate.preferredSectors.some((s) => s.toLowerCase().includes('priv') || s.toLowerCase() === 'both');

    if ((jobSector.includes('gov') && wantsGovt) || (jobSector.includes('priv') && wantsPrivate)) {
      score += 5;
    }
  }

  const qualifies = score >= 35 || (qualMatched && reasons.length >= 2);
  const isMatch = score >= 25;

  return {
    isMatch,
    score: Math.min(100, score),
    matchReasons: reasons,
    qualifies,
  };
}
