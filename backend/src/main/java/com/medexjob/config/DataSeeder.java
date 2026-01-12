package com.medexjob.config;

import com.medexjob.entity.Employer;
import com.medexjob.entity.Job;
import com.medexjob.entity.User;
import com.medexjob.repository.EmployerRepository;
import com.medexjob.repository.JobRepository;
import com.medexjob.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Locale;

@Component
@Profile({"default","dev"})
public class DataSeeder implements CommandLineRunner {

    @Value("${SEED_JOBS:false}")
    private boolean seedJobs;

    @Value("${SEED_EMPLOYER_NAME:Seeder Organization}")
    private String employerName;

    @Value("${SEED_EMPLOYER_TYPE:HOSPITAL}")
    private String employerType;

    @Value("${SEED_USER_NAME:Seeder Employer}")
    private String userName;

    @Value("${SEED_USER_EMAIL:employer.seeder@example.com}")
    private String userEmail;

    @Value("${SEED_USER_PHONE:9999999999}")
    private String userPhone;

    @Value("${SEED_USER_PASSWORD:ChangeMe@123}")
    private String userPassword;

    // Job 1
    @Value("${SEED_JOB1_TITLE:Andhra Pradesh Medical Officer}")
    private String job1Title;
    @Value("${SEED_JOB1_SECTOR:government}")
    private String job1Sector;
    @Value("${SEED_JOB1_CATEGORY:Medical Officer}")
    private String job1Category;
    @Value("${SEED_JOB1_LOCATION:Andhra Pradesh}")
    private String job1Location;
    @Value("${SEED_JOB1_QUALIFICATION:MBBS}")
    private String job1Qualification;
    @Value("${SEED_JOB1_EXPERIENCE:0-2 years}")
    private String job1Experience;
    @Value("${SEED_JOB1_POSTS:10}")
    private Integer job1Posts;
    @Value("${SEED_JOB1_SALARY:As per norms}")
    private String job1Salary;
    @Value("${SEED_JOB1_LAST_DATE:2025-12-31}")
    private String job1LastDate;
    @Value("${SEED_JOB1_DESCRIPTION:Official notification as per PDF}")
    private String job1Description;
    @Value("${SEED_JOB1_APPLY_LINK:}")
    private String job1ApplyLink;
    @Value("${SEED_JOB1_PDF_URL:}")
    private String job1PdfUrl;
    @Value("${SEED_JOB1_FEATURED:false}")
    private boolean job1Featured;

    // Job 2
    @Value("${SEED_JOB2_TITLE:Second Job}")
    private String job2Title;
    @Value("${SEED_JOB2_SECTOR:private}")
    private String job2Sector;
    @Value("${SEED_JOB2_CATEGORY:Specialist}")
    private String job2Category;
    @Value("${SEED_JOB2_LOCATION:Hyderabad}")
    private String job2Location;
    @Value("${SEED_JOB2_QUALIFICATION:Relevant Degree}")
    private String job2Qualification;
    @Value("${SEED_JOB2_EXPERIENCE:2-5 years}")
    private String job2Experience;
    @Value("${SEED_JOB2_POSTS:2}")
    private Integer job2Posts;
    @Value("${SEED_JOB2_SALARY:Negotiable}")
    private String job2Salary;
    @Value("${SEED_JOB2_LAST_DATE:2025-12-31}")
    private String job2LastDate;
    @Value("${SEED_JOB2_DESCRIPTION:As per PDF}")
    private String job2Description;
    @Value("${SEED_JOB2_APPLY_LINK:}")
    private String job2ApplyLink;
    @Value("${SEED_JOB2_PDF_URL:}")
    private String job2PdfUrl;
    @Value("${SEED_JOB2_FEATURED:false}")
    private boolean job2Featured;

    @Autowired private UserRepository userRepository;
    @Autowired private EmployerRepository employerRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!seedJobs) return; // only run when explicitly enabled

        // Create Employer User if not exists
        User user = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(userEmail))
                .findFirst()
                .orElseGet(() -> {
                    User nu = new User();
                    nu.setName(userName);
                    nu.setEmail(userEmail);
                    nu.setPhone(userPhone);
                    nu.setRole(User.UserRole.EMPLOYER);
                    nu.setPasswordHash(passwordEncoder.encode(userPassword));
                    return userRepository.save(nu);
                });

        // Create Employer if not exists for this user
        Employer employer = employerRepository.findAll().stream()
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseGet(() -> {
                    Employer e = new Employer();
                    e.setUser(user);
                    e.setCompanyName(employerName);
                    e.setCompanyType(parseCompanyType(employerType));
                    e.setIsVerified(true);
                    e.setVerificationStatus(Employer.VerificationStatus.APPROVED);
                    return employerRepository.save(e);
                });

        // Seed Job 1
        Job j1 = new Job();
        j1.setEmployer(employer);
        j1.setTitle(job1Title);
        j1.setDescription(job1Description);
        j1.setSector(parseSector(job1Sector));
        j1.setCategory(parseCategory(job1Category));
        j1.setLocation(job1Location);
        j1.setQualification(job1Qualification);
        j1.setExperience(job1Experience);
        j1.setNumberOfPosts(job1Posts);
        j1.setSalaryRange(blankToNull(job1Salary));
        j1.setLastDate(parseDate(job1LastDate));
        j1.setContactEmail(user.getEmail());
        j1.setContactPhone(user.getPhone());
        j1.setPdfUrl(blankToNull(job1PdfUrl));
        j1.setApplyLink(blankToNull(job1ApplyLink));
        j1.setStatus(Job.JobStatus.ACTIVE);
        j1.setIsFeatured(job1Featured);
        jobRepository.save(j1);

        // Seed Job 2
        Job j2 = new Job();
        j2.setEmployer(employer);
        j2.setTitle(job2Title);
        j2.setDescription(job2Description);
        j2.setSector(parseSector(job2Sector));
        j2.setCategory(parseCategory(job2Category));
        j2.setLocation(job2Location);
        j2.setQualification(job2Qualification);
        j2.setExperience(job2Experience);
        j2.setNumberOfPosts(job2Posts);
        j2.setSalaryRange(blankToNull(job2Salary));
        j2.setLastDate(parseDate(job2LastDate));
        j2.setContactEmail(user.getEmail());
        j2.setContactPhone(user.getPhone());
        j2.setPdfUrl(blankToNull(job2PdfUrl));
        j2.setApplyLink(blankToNull(job2ApplyLink));
        j2.setStatus(Job.JobStatus.ACTIVE);
        j2.setIsFeatured(job2Featured);
        jobRepository.save(j2);
    }

    private Employer.CompanyType parseCompanyType(String s) {
        String v = (s == null ? "" : s).trim().toUpperCase(Locale.ROOT);
        try {
            return Employer.CompanyType.valueOf(v);
        } catch (Exception e) {
            return Employer.CompanyType.HOSPITAL;
        }
    }

    private Job.JobSector parseSector(String s) {
        String v = (s == null ? "" : s).trim().toLowerCase(Locale.ROOT);
        if (v.equals("government")) return Job.JobSector.GOVERNMENT;
        return Job.JobSector.PRIVATE;
    }

    private Job.JobCategory parseCategory(String s) {
        if (s == null) return Job.JobCategory.SPECIALIST;
        String v = s.trim().toLowerCase(Locale.ROOT);
        return switch (v) {
            case "junior resident" -> Job.JobCategory.JUNIOR_RESIDENT;
            case "senior resident" -> Job.JobCategory.SENIOR_RESIDENT;
            case "medical officer" -> Job.JobCategory.MEDICAL_OFFICER;
            case "faculty" -> Job.JobCategory.FACULTY;
            case "specialist" -> Job.JobCategory.SPECIALIST;
            case "ayush" -> Job.JobCategory.AYUSH;
            case "paramedical / nursing", "paramedical", "nursing" -> Job.JobCategory.PARAMEDICAL_NURSING;
            default -> Job.JobCategory.SPECIALIST;
        };
    }

    private LocalDate parseDate(String s) {
        try {
            return LocalDate.parse(s);
        } catch (Exception e) {
            return LocalDate.now().plusDays(30);
        }
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
