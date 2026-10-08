import { isGenericNotice, isRegulatoryDump } from './extractedFieldDisplay';

const SEARCH_STOPWORDS = new Set([
  'a', 'an', 'and', 'at', 'for', 'in', 'of', 'on', 'the', 'to', 'with',
  'job', 'jobs', 'vacancy', 'vacancies', 'post', 'posts', 'recruitment',
]);

function clean(value: unknown) {
  return String(value ?? '').trim();
}

function unique(values: unknown[]) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function basePostName(job: any) {
  let title = clean(job?.displayTitle || job?.title);
  const suffixes = unique([
    job?.speciality,
    job?.department,
    ...(job?.departments || []),
    ...(job?.specialities || []),
  ]);
  for (const suffix of suffixes) {
    const cleanSuffix = String(suffix).replace(/^\s*(?:\d+[\.\)\-:]|\([0-9a-zA-Z]+\))\s*/, '').trim();
    const markers = [` - ${suffix}`, ` - ${cleanSuffix}`];
    for (const marker of markers) {
      if (title.toLowerCase().endsWith(marker.toLowerCase())) {
        title = title.slice(0, title.length - marker.length).trim();
      }
    }
  }
  return title;
}

function organisation(job: any) {
  return clean(
    job?.organization ||
    job?.organisationName ||
    job?.organisation ||
    job?.companyName ||
    job?.employer?.companyName ||
    job?.employerName ||
    job?.hospitalName,
  );
}

function searchTokens(query?: string) {
  if (!query?.trim()) return [];
  const raw = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).map((token) => token.trim()).filter(Boolean);
  if (raw.length <= 1) return [...new Set(raw)];
  const meaningful = raw.filter((token) => !SEARCH_STOPWORDS.has(token));
  return [...new Set(meaningful.length ? meaningful : raw)].slice(0, 12);
}

function queryGroups(query?: string) {
  if (!query?.trim()) return [];
  return query.split(',').map((part) => searchTokens(part)).filter((tokens) => tokens.length > 0);
}

function searchTextFor(job: any) {
  return unique([
    job?.displayTitle, job?.title, organisation(job), job?.location, job?.state,
    job?.qualification, job?.experience, job?.salary, job?.salaryRange,
    job?.department, job?.speciality, job?.description,
    ...(job?.departments || []), ...(job?.specialities || []),
  ]).join(' ');
}

function matchesQuery(job: any, query?: string) {
  if (!query?.trim()) return true;
  const q = query.trim().toLowerCase();

  // Strict cadre checking: prevents unrelated roles from matching
  const queryHasSR = /\b(senior[\s_]*resident|sr\b|sr[\s_]*resident|senior[\s_]*residency)\b/i.test(q);
  const queryHasJR = /\b(junior[\s_]*resident|jr\b|jr[\s_]*resident|junior[\s_]*residency)\b/i.test(q);
  const queryHasFaculty = /\b(faculty|professor|associate[\s_]*prof|assistant[\s_]*prof|lecturer)\b/i.test(q);
  const queryHasMO = /\b(medical[\s_]*officer|gdmo)\b/i.test(q);

  const roleText = clean([
    job?.displayTitle,
    job?.title,
    ...(job?.postNames || []),
    ...(Array.isArray(job?.jobRoles) ? job.jobRoles : [job?.jobRoles]),
    job?.category,
  ].filter(Boolean).join(' ')).toLowerCase().replace(/_/g, ' ');

  const isJobSR = /\b(senior[\s_]*resident|sr\b|sr[\s_]*resident|senior[\s_]*residency)\b/i.test(roleText);
  const isJobJR = /\b(junior[\s_]*resident|jr\b|jr[\s_]*resident|junior[\s_]*residency)\b/i.test(roleText);
  const isJobFaculty = /\b(faculty|professor|associate[\s_]*prof|assistant[\s_]*prof|lecturer|tutor|dean|principal)\b/i.test(roleText);
  const isJobMO = /\b(medical[\s_]*officer|gdmo|general[\s_]*duty)\b/i.test(roleText);

  if (queryHasSR && !queryHasJR && !isJobSR) return false;
  if (queryHasJR && !queryHasSR && !isJobJR) return false;
  if (queryHasFaculty && !isJobFaculty) return false;
  if (queryHasMO && !isJobMO) return false;

  // Pure cadre queries match immediately once cadre is verified
  if (queryHasSR && isJobSR && !q.replace(/\b(senior[\s_]*resident|sr\b|sr[\s_]*resident|senior[\s_]*residency)\b/gi, '').trim()) {
    return true;
  }
  if (queryHasJR && isJobJR && !q.replace(/\b(junior[\s_]*resident|jr\b|jr[\s_]*resident|junior[\s_]*residency)\b/gi, '').trim()) {
    return true;
  }
  if (queryHasFaculty && isJobFaculty && !q.replace(/\b(faculty|professor|associate[\s_]*prof|assistant[\s_]*prof|lecturer)\b/gi, '').trim()) {
    return true;
  }
  if (queryHasMO && isJobMO && !q.replace(/\b(medical[\s_]*officer|gdmo)\b/gi, '').trim()) {
    return true;
  }

  const groups = queryGroups(query);
  if (!groups.length) return true;
  const haystack = clean([
    job?.displayTitle,
    job?.title,
    ...(job?.postNames || []),
    ...(job?.departments || []),
    ...(job?.specialities || []),
    job?.department,
    job?.speciality,
    job?.category,
    ...(Array.isArray(job?.jobRoles) ? job.jobRoles : [job?.jobRoles]),
    job?.description,
    job?.requirements,
    job?._groupSearchText,
    organisation(job),
    job?.location,
  ].filter(Boolean).join(' ')).toLowerCase().replace(/_/g, ' ');
  // Comma-separated role groups are OR; words within each role are AND.
  return groups.some((tokens) => tokens.every((token) => haystack.includes(token)));
}

/**
 * Resolves standard card title according to user specifications:
 * - Reflects core role post (e.g., "Senior Resident (Multiple Specialties)")
 * - Preserves custom/user-edited titles without forcing "Various Departments"
 * - Accurately represents single or multiple specialties
 */
export function resolveStandardCardTitle(input: any): string {
  if (!input) return 'Medical Vacancy';
  const items = Array.isArray(input) ? input : [input];
  const first = items[0] || {};

  const departments = unique(items.flatMap((item) => [item.department, item.speciality, ...(item.departments || []), ...(item.specialities || [])])).filter(Boolean);
  const postNames = unique(items.map((item) => item._basePostName || basePostName(item))).filter(Boolean);
  const hasMultipleSpecialties = departments.length > 1 || items.length > 1 || Boolean(first?.recruitmentGrouped);

  let rawUserTitle = clean(first?.title || first?.displayTitle || '');
  rawUserTitle = rawUserTitle.replace(/\s*-\s*Multiple\s*Departments/gi, '').trim();
  const isLegacyConcat = /\+\s*\d+\s*more\s*posts/i.test(rawUserTitle);

  // If this is a multi-specialty circular, check if rawUserTitle is just one child department's title:
  // e.g. "Senior Resident - 5. Pathology" or "Senior Resident - Pathology"
  if (hasMultipleSpecialties && rawUserTitle) {
    const isChildDeptTitle = departments.some((d) => {
      const cleanD = d.replace(/^\s*(?:\d+[\.\)\-:]|\([0-9a-zA-Z]+\))\s*/, '').trim().toLowerCase();
      const lowerTitle = rawUserTitle.toLowerCase();
      return (
        lowerTitle.endsWith(` - ${d.toLowerCase()}`) ||
        lowerTitle.endsWith(` - ${cleanD}`) ||
        new RegExp(`\\s*-\\s*(?:\\d+[\\.\\)]\\s*)?${cleanD.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i').test(rawUserTitle)
      );
    });
    if (isChildDeptTitle) {
      rawUserTitle = '';
    }
  }

  // If user provided a specific non-generic title, always preserve it!
  const isGeneric =
    !rawUserTitle ||
    /^(various\s*departments(\s*\(multiple\s*department\))?|medical\s*vacancy|vacancy|recruitment\s*notification|medical\s*staff\s*recruitment)$/i.test(
      rawUserTitle
    ) ||
    isLegacyConcat;

  if (!isGeneric) {
    return rawUserTitle;
  }

  // Extract ONLY cadre / designation fields from vacancy titles and categories
  const cadreText = items
    .map((item) => `${item._basePostName || ''} ${item.postName || ''} ${item.category || ''}`)
    .join(' ')
    .toLowerCase();

  const hasJR = /\b(junior\s*resident|jr\b|jr\s*resident|junior\s*residency|house\s*job|house\s*physician|house\s*surgeon)\b/i.test(cadreText);
  const hasSR = /\b(senior\s*resident|sr\b|sr\s*resident|senior\s*residency)\b/i.test(cadreText);
  const hasFaculty = /\b(faculty|professor|associate\s*prof|assistant\s*prof|lecturer|tutor|dean|principal|demonstrator)\b/i.test(cadreText);
  const hasMO = /\b(medical\s*officer|gdmo|general\s*duty\s*medical\s*officer|duty\s*medical\s*officer)\b/i.test(cadreText);
  const hasConsultant = /\b(consultant|specialist|super\s*specialist|attending\s*consultant)\b/i.test(cadreText);
  const hasParamedical = /\b(paramedical|nurse|nursing|technician|radiographer|optometrist|dietician|ecg)\b/i.test(cadreText) || (/\b(pharmacist|dispenser)\b/i.test(cadreText) && !/\bpharmacolog/i.test(cadreText));
  const hasResearch = /\b(research\s*scientist|research\s*fellow|project\s*fellow|research\s*associate|survey\s*officer)\b/i.test(cadreText);

  const detectedCadres: string[] = [];
  if (hasSR) detectedCadres.push('Senior Resident');
  if (hasJR) detectedCadres.push('Junior Resident');
  if (hasFaculty) detectedCadres.push('Faculty');
  if (hasMO) detectedCadres.push('Medical Officer');
  if (hasConsultant) detectedCadres.push('Specialist / Consultant');
  if (hasParamedical) detectedCadres.push('Paramedical Staff');
  if (hasResearch) detectedCadres.push('Research / Survey');

  // 1. Single core cadre detected across the circular:
  if (detectedCadres.length === 1) {
    const cadre = detectedCadres[0];
    return hasMultipleSpecialties ? `${cadre} (Multiple Specialties)` : cadre;
  }

  // 2. Multiple distinct cadres detected:
  if (detectedCadres.length === 2) {
    return `${detectedCadres[0]} & ${detectedCadres[1]} (Multiple Specialties)`;
  }
  if (detectedCadres.length > 2) {
    return 'Medical Staff (Multiple Specialties)';
  }

  // 3. Cadre not in standard list, but distinct postNames exist:
  if (postNames.length === 1 && postNames[0]) {
    return hasMultipleSpecialties ? `${postNames[0]} (Multiple Specialties)` : postNames[0];
  }
  if (postNames.length === 2) {
    return `${postNames[0]} & ${postNames[1]} (Multiple Specialties)`;
  }
  if (postNames.length > 2) {
    return `${postNames[0]} & More (Multiple Specialties)`;
  }

  // 4. Fallback for multi-specialty:
  return hasMultipleSpecialties ? 'Medical Staff (Multiple Specialties)' : 'Medical Vacancy';
}

export function groupRecruitmentJobs(jobs: any[], query?: string) {
  const groups = new Map<string, any[]>();
  const standalone: any[] = [];

  for (const job of Array.isArray(jobs) ? jobs : []) {
    if (!job?.sourceRecruitmentId) {
      const displayTitle = resolveStandardCardTitle(job);
      const enriched = { ...job, displayTitle, title: displayTitle };
      const searchText = searchTextFor(enriched);
      standalone.push({ ...enriched, _groupSearchText: searchText, title: displayTitle });
      continue;
    }

    const postName = basePostName(job) || clean(job?.title) || 'Vacancy';
    const key = String(job.sourceRecruitmentId);
    const bucket = groups.get(key) || [];
    bucket.push({ ...job, _basePostName: postName });
    groups.set(key, bucket);
  }

  const grouped = [...groups.values()].map((items) => {
    const first = items[0];
    const departments = unique(items.map((item) => item.department || item.speciality)).filter(Boolean);
    const postNames = unique(items.map((item) => item._basePostName || basePostName(item))).filter(Boolean);
    const displayTitle = resolveStandardCardTitle(items);
    const specialities = unique(items.map((item) => item.speciality));
    const locations = unique(items.map((item) => item.location));
    const states = unique(items.map((item) => item.state));
    const qualifications = unique(items.map((item) => item.qualification)).filter((value) => !isRegulatoryDump(value) && !isGenericNotice(value));
    const salaries = unique(items.map((item) => item.salary || item.salaryRange)).filter((value) => !isRegulatoryDump(value));
    const experiences = unique(items.map((item) => item.experience)).filter((value) => !isRegulatoryDump(value) && !isGenericNotice(value));
    const totalPosts = items.reduce((sum, item) => sum + Math.max(0, Number(item.numberOfPosts || 0)), 0);
    const org = organisation(first);
    const searchText = unique([
      displayTitle, org, ...postNames, ...departments, ...specialities, ...locations, ...states,
      ...qualifications, ...salaries, ...experiences, ...items.map((item) => item.description),
    ]).join(' ');

    const allRoles = unique(
      items.flatMap((item) => {
        const rList: string[] = [];
        if (Array.isArray(item.jobRoles)) {
          item.jobRoles.forEach((r: any) => {
            if (typeof r === 'string') {
              r.split(/[/,]| and /i).forEach((p) => {
                if (p.trim()) rList.push(p.trim());
              });
            }
          });
        } else if (typeof item.jobRoles === 'string') {
          item.jobRoles.split(/[/,]| and /i).forEach((p: string) => {
            if (p.trim()) rList.push(p.trim());
          });
        }
        if (item.category && item.category !== 'Multiple Roles') {
          item.category.split(/[/,]| and /i).forEach((p: string) => {
            if (p.trim()) rList.push(p.trim());
          });
        }
        return rList;
      })
    );

    const groupContextText = items
      .map((item) => `${item.title || ''} ${item.department || ''} ${item.speciality || ''} ${item.description || ''}`)
      .join(' ')
      .toLowerCase();

    const isFacultyGroup = items.some((item) =>
      /\b(faculty|professor|assoc\w*\s+prof|asst\w*\s+prof|assistant\s+professor|tutor|lecturer)\b/i.test(
        `${item.title || ''} ${item.category || ''} ${item.jobRoles || ''}`
      )
    );
    const hasPharmacology = /\bpharmacolog\w*\b/i.test(groupContextText);
    const hasRealPharmacy = /\b(pharmacist|b\.?\s*pharm|d\.?\s*pharm|m\.?\s*pharm|pharm\.?\s*d|dispenser)\b/i.test(groupContextText);
    const hasPsychiatry = /\bpsychiatr\w*\b/i.test(groupContextText);
    const hasRealPsychology = /\b(psycholog\w*|mental\s*health|counselor|counsellor)\b/i.test(groupContextText);

    const hasAnyRealMO = items.some((item) =>
      /\b(medical\s*officer|gdmo|general\s*duty\s*medical\s*officer)\b/i.test(
        `${item._basePostName || ''} ${item.postName || ''} ${item.title || ''}`
      )
    );

    const isSeniorOrJuniorResidentGroup = items.some((item) =>
      /\b(senior\s*resident|junior\s*resident|sr\b|jr\b)\b/i.test(
        `${item._basePostName || ''} ${item.postName || ''} ${item.title || ''}`
      )
    );

    const filteredRoles = allRoles.filter((r) => {
      const lower = r.toLowerCase().trim();
      if (!hasAnyRealMO && (lower === 'medical officer' || lower === 'mo' || lower === 'gdmo')) {
        return false;
      }
      if ((isFacultyGroup || isSeniorOrJuniorResidentGroup) && !hasAnyRealMO && lower.includes('medical officer')) {
        return false;
      }
      if (isFacultyGroup) {
        if ((lower === 'pharmacy' || lower === 'pharmacist') && !hasRealPharmacy) return false;
        if ((lower.includes('psychology') || lower === 'psychology & mental health') && !hasRealPsychology) return false;
      }
      if ((lower === 'pharmacy' || lower === 'pharmacist') && (hasPharmacology && !hasRealPharmacy)) {
        return false;
      }
      if ((lower.includes('psychology') || lower === 'psychology & mental health') && (hasPsychiatry && !hasRealPsychology)) {
        return false;
      }
      return true;
    });

    const itemCategories = unique(items.map((item) => item.category)).filter((c) => c && c !== 'Multiple Roles');
    let resolvedCategory = itemCategories.length === 1 ? itemCategories[0] : first.category;
    if (resolvedCategory === 'Medical Officer' && !hasAnyRealMO && (isFacultyGroup || isSeniorOrJuniorResidentGroup)) {
      resolvedCategory = isSeniorOrJuniorResidentGroup ? 'Senior Resident' : 'Faculty';
    }

    return {
      ...first,
      displayTitle,
      title: displayTitle,
      organization: org || first.organization,
      recruitmentGrouped: true,
      groupedVacancyRows: items.length,
      postNames,
      jobRoles: filteredRoles.length > 0 ? filteredRoles : (first.jobRoles || (first.category ? [first.category] : undefined)),
      departments,
      specialities,
      departmentCount: departments.length,
      childJobIds: items.map((item) => item.id).filter(Boolean),
      numberOfPosts: totalPosts || first.numberOfPosts,
      location: locations.length > 1 ? 'Multiple Locations' : (locations[0] || first.location),
      state: states.length === 1 ? states[0] : first.state,
      qualification: qualifications.length > 1 ? 'Varies by post' : (qualifications[0] || first.qualification),
      salary: salaries.length > 1 ? 'Varies by post' : (salaries[0] || first.salary),
      experience: experiences.length > 1 ? 'Varies by post' : (experiences[0] || first.experience),
      category: resolvedCategory || (itemCategories.length === 1 ? itemCategories[0] : 'Multiple Roles'),
      _groupSearchText: searchText,
    };
  });

  return [...grouped, ...standalone]
    .filter((job) => matchesQuery(job, query))
    .sort((a, b) => new Date(b.createdAt || b.postedDate || 0).getTime() - new Date(a.createdAt || a.postedDate || 0).getTime());
}
