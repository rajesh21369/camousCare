package com.campuscare.service;

import com.campuscare.model.*;
import com.campuscare.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataSeederService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeederService.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository updateRepository;
    private final FeedbackRepository feedbackRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-demo-data:true}")
    private boolean seedDemoData;

    public DataSeederService(UserRepository userRepository,
                             DepartmentRepository departmentRepository,
                             ComplaintCategoryRepository categoryRepository,
                             ComplaintRepository complaintRepository,
                             ComplaintUpdateRepository updateRepository,
                             FeedbackRepository feedbackRepository,
                             NotificationRepository notificationRepository,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.complaintRepository = complaintRepository;
        this.updateRepository = updateRepository;
        this.feedbackRepository = feedbackRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedDemoData) {
            logger.info("Demo data seeding is disabled.");
            return;
        }

        if (userRepository.count() > 0) {
            logger.info("Database already initialized with users.");
            seedComplaintsForUsersWithNone();
            return;
        }

        logger.info("Seeding initial CampusCare demo data...");
        seedData();
        logger.info("Demo data seeding completed successfully!");
    }

    private void seedComplaintsForUsersWithNone() {
        try {
            List<User> students = userRepository.findByRole(Role.ROLE_STUDENT);
            for (User student : students) {
                if (complaintRepository.countByStudentId(student.getId()) == 0) {
                    logger.info("Seeding sample complaints for student: " + student.getUsername());
                    Instant now = Instant.now();

                    Complaint c1 = new Complaint();
                    c1.setTrackingNumber("CMP-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000)));
                    c1.setStudentId(student.getId());
                    c1.setStudentName(student.getFullName());
                    c1.setStudentEmail(student.getEmail());
                    c1.setTitle("Classroom Projector HDMI Cable Malfunction in Room 302");
                    c1.setDescription("The HDMI audio connection in Room 302 produces loud static noise during presentations. A replacement cable is requested.");
                    c1.setPriority(ComplaintPriority.MEDIUM);
                    c1.setStatus(ComplaintStatus.IN_PROGRESS);
                    c1.setCampusLocation("Main Academic Block, Room 302");
                    c1.setSubmissionDate(now.minus(2, ChronoUnit.DAYS));
                    c1.setDueDate(now.plus(1, ChronoUnit.DAYS));
                    c1.setCreatedAt(now.minus(2, ChronoUnit.DAYS));
                    c1.setUpdatedAt(now.minus(1, ChronoUnit.DAYS));
                    Complaint savedC1 = complaintRepository.save(c1);

                    updateRepository.save(new ComplaintUpdate(savedC1.getId(), savedC1.getTrackingNumber(), student.getId(), student.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted with details.", null, null));
                    updateRepository.save(new ComplaintUpdate(savedC1.getId(), savedC1.getTrackingNumber(), "admin", "Audiovisual Staff", Role.ROLE_OFFICER, ComplaintStatus.SUBMITTED, ComplaintStatus.IN_PROGRESS, "Technician dispatched to replace the HDMI cable.", "Hardware scheduled", null));

                    Complaint c2 = new Complaint();
                    c2.setTrackingNumber("CMP-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000)));
                    c2.setStudentId(student.getId());
                    c2.setStudentName(student.getFullName());
                    c2.setStudentEmail(student.getEmail());
                    c2.setTitle("Water Cooler Filter Service & Low Pressure");
                    c2.setDescription("Cold water dispenser on 2nd floor library hallway has slow flow and requires filter servicing.");
                    c2.setPriority(ComplaintPriority.LOW);
                    c2.setStatus(ComplaintStatus.RESOLVED);
                    c2.setCampusLocation("Central Library, 2nd Floor Corridor");
                    c2.setSubmissionDate(now.minus(5, ChronoUnit.DAYS));
                    c2.setDueDate(now.minus(3, ChronoUnit.DAYS));
                    c2.setResolutionDate(now.minus(1, ChronoUnit.DAYS));
                    c2.setCreatedAt(now.minus(5, ChronoUnit.DAYS));
                    c2.setUpdatedAt(now.minus(1, ChronoUnit.DAYS));
                    Complaint savedC2 = complaintRepository.save(c2);

                    updateRepository.save(new ComplaintUpdate(savedC2.getId(), savedC2.getTrackingNumber(), student.getId(), student.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student.", null, null));
                    updateRepository.save(new ComplaintUpdate(savedC2.getId(), savedC2.getTrackingNumber(), "admin", "Maintenance Staff", Role.ROLE_OFFICER, ComplaintStatus.SUBMITTED, ComplaintStatus.RESOLVED, "Servicing completed and verified.", "Parts replaced", null));

                    notificationRepository.save(new Notification(student.getId(), "Welcome to CampusCare!", "Your account is activated. Track and submit campus complaints here.", null, null, "SYSTEM"));
                    notificationRepository.save(new Notification(student.getId(), "Complaint Resolved (" + savedC2.getTrackingNumber() + ")", "Your water dispenser complaint has been resolved. You can rate the resolution.", savedC2.getId(), savedC2.getTrackingNumber(), "RESOLUTION"));
                }
            }
        } catch (Exception e) {
            logger.warn("Could not seed individual student complaints: " + e.getMessage());
        }
    }

    public void seedData() {
        String commonPassword = passwordEncoder.encode("Password@123");

        // 1. Seed Departments
        Department deptIT = departmentRepository.save(new Department("IT & Networking", "IT-NET", "Campus internet, Wi-Fi, servers, and lab computers", "it-support@campuscare.edu", null));
        Department deptEstate = departmentRepository.save(new Department("Estate & Facilities", "ESTATE", "Classrooms, electricity, plumbing, and structural maintenance", "estate@campuscare.edu", null));
        Department deptHostel = departmentRepository.save(new Department("Hostel Administration", "HOSTEL", "Hostel rooms, mess hygiene, amenities, and residential life", "hostel@campuscare.edu", null));
        Department deptAcad = departmentRepository.save(new Department("Academic & Library Services", "ACAD-LIB", "Central library, learning spaces, and student academic queries", "library@campuscare.edu", null));
        Department deptTransport = departmentRepository.save(new Department("Transport Department", "TRANS", "College shuttle fleet, routes, and schedule coordination", "transport@campuscare.edu", null));
        Department deptSanitation = departmentRepository.save(new Department("Sanitation & Hygiene", "SANITATION", "Campus washrooms, waste management, and cleanliness", "cleanliness@campuscare.edu", null));

        // 2. Seed Users
        User adminUser = new User("admin", "admin@campuscare.edu", commonPassword, "Dr. Sarah Jenkins (Admin)", "9876543210", "ADM-001", Role.ROLE_ADMIN, null);
        adminUser = userRepository.save(adminUser);

        User officerIT = new User("officer_it", "officer.it@campuscare.edu", commonPassword, "Prof. Vikram Sharma (IT Officer)", "9876543211", "STF-101", Role.ROLE_OFFICER, deptIT.getId());
        officerIT = userRepository.save(officerIT);
        deptIT.setHeadOfficerId(officerIT.getId());
        departmentRepository.save(deptIT);

        User officerEstate = new User("officer_estate", "officer.estate@campuscare.edu", commonPassword, "Eng. Rajesh Patel (Estate Officer)", "9876543212", "STF-102", Role.ROLE_OFFICER, deptEstate.getId());
        officerEstate = userRepository.save(officerEstate);
        deptEstate.setHeadOfficerId(officerEstate.getId());
        departmentRepository.save(deptEstate);

        User officerHostel = new User("officer_hostel", "officer.hostel@campuscare.edu", commonPassword, "Warden Meena Kumari", "9876543213", "STF-103", Role.ROLE_OFFICER, deptHostel.getId());
        officerHostel = userRepository.save(officerHostel);
        deptHostel.setHeadOfficerId(officerHostel.getId());
        departmentRepository.save(deptHostel);

        User student1 = new User("student1", "rahul.sharma@campuscare.edu", commonPassword, "Rahul Sharma", "9876543214", "CS-2023-042", Role.ROLE_STUDENT, deptIT.getId());
        student1 = userRepository.save(student1);

        User student2 = new User("student2", "ananya.verma@campuscare.edu", commonPassword, "Ananya Verma", "9876543215", "EC-2024-019", Role.ROLE_STUDENT, deptIT.getId());
        student2 = userRepository.save(student2);

        User principal = new User("principal", "principal@campuscare.edu", commonPassword, "Dr. K. S. Raman (Principal & Director)", "9876543216", "MGT-001", Role.ROLE_MANAGEMENT, null);
        principal = userRepository.save(principal);

        // 3. Seed Complaint Categories
        ComplaintCategory catWifi = categoryRepository.save(new ComplaintCategory("Internet and Wi-Fi", "Wi-Fi connectivity, speed, hotspot, and authentication issues", deptIT.getId(), ComplaintPriority.HIGH, 2));
        ComplaintCategory catLab = categoryRepository.save(new ComplaintCategory("Laboratory Equipment", "Computer labs, physics/chemistry instruments, oscilloscopes", deptIT.getId(), ComplaintPriority.MEDIUM, 3));
        ComplaintCategory catClassroom = categoryRepository.save(new ComplaintCategory("Classroom Facilities", "Projectors, benches, smart boards, and whiteboards", deptEstate.getId(), ComplaintPriority.MEDIUM, 3));
        ComplaintCategory catElec = categoryRepository.save(new ComplaintCategory("Electrical and Plumbing", "Fans, lighting, water coolers, taps, and power sockets", deptEstate.getId(), ComplaintPriority.HIGH, 2));
        ComplaintCategory catHostel = categoryRepository.save(new ComplaintCategory("Hostel Facilities", "Room maintenance, hot water, furniture, and mess concerns", deptHostel.getId(), ComplaintPriority.MEDIUM, 3));
        ComplaintCategory catSanitation = categoryRepository.save(new ComplaintCategory("Sanitation and Cleanliness", "Washroom hygiene, corridors, dustbins, and campus cleanliness", deptSanitation.getId(), ComplaintPriority.MEDIUM, 1));
        ComplaintCategory catLibrary = categoryRepository.save(new ComplaintCategory("Library Services", "Book catalog, quiet zone noise, e-journal access", deptAcad.getId(), ComplaintPriority.LOW, 4));
        ComplaintCategory catTransport = categoryRepository.save(new ComplaintCategory("College Transport", "Bus delays, seat capacity, bus stop issues", deptTransport.getId(), ComplaintPriority.MEDIUM, 3));
        ComplaintCategory catAdmin = categoryRepository.save(new ComplaintCategory("Faculty or Administrative Services", "Fee office, certificates, admissions desk queries", deptAcad.getId(), ComplaintPriority.MEDIUM, 5));
        ComplaintCategory catOther = categoryRepository.save(new ComplaintCategory("Other", "General complaints not covered above", deptEstate.getId(), ComplaintPriority.LOW, 5));

        // 4. Seed Sample Complaints with full workflow history & notifications
        Instant now = Instant.now();

        // Complaint 1: IN_PROGRESS
        Complaint c1 = new Complaint();
        c1.setTrackingNumber("CMP-2026-0001");
        c1.setStudentId(student1.getId());
        c1.setStudentName(student1.getFullName());
        c1.setStudentEmail(student1.getEmail());
        c1.setTitle("High latency and frequent disconnection on Campus Wi-Fi in Lab 3");
        c1.setDescription("During practical sessions in Lab 3 (Turing Hall), the campus Wi-Fi network 'CampusCare-Secure' drops out every 10 minutes. This disrupts git pushes and cloud labs.");
        c1.setCategoryId(catWifi.getId());
        c1.setCategoryName(catWifi.getName());
        c1.setDepartmentId(deptIT.getId());
        c1.setDepartmentName(deptIT.getName());
        c1.setAssignedOfficerId(officerIT.getId());
        c1.setAssignedOfficerName(officerIT.getFullName());
        c1.setPriority(ComplaintPriority.HIGH);
        c1.setStatus(ComplaintStatus.IN_PROGRESS);
        c1.setCampusLocation("Turing Hall, Computer Lab 3, 2nd Floor");
        c1.setSubmissionDate(now.minus(2, ChronoUnit.DAYS));
        c1.setDueDate(now.plus(1, ChronoUnit.DAYS));
        c1.setCreatedAt(now.minus(2, ChronoUnit.DAYS));
        c1.setUpdatedAt(now.minus(6, ChronoUnit.HOURS));
        Complaint savedC1 = complaintRepository.save(c1);

        updateRepository.save(new ComplaintUpdate(savedC1.getId(), savedC1.getTrackingNumber(), student1.getId(), student1.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student.", null, null));
        updateRepository.save(new ComplaintUpdate(savedC1.getId(), savedC1.getTrackingNumber(), adminUser.getId(), adminUser.getFullName(), Role.ROLE_ADMIN, ComplaintStatus.SUBMITTED, ComplaintStatus.ASSIGNED, "Assigned to IT Network team for wireless AP signal analysis.", "Check switch port 24 and router beacon interval", null));
        updateRepository.save(new ComplaintUpdate(savedC1.getId(), savedC1.getTrackingNumber(), officerIT.getId(), officerIT.getFullName(), Role.ROLE_OFFICER, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, "Inspected AP in Lab 3. Firmware upgrade scheduled tonight.", "Replaced faulty patch cable; testing channel 6 overlap", null));

        // Complaint 2: RESOLVED with Student 5-star Feedback
        Complaint c2 = new Complaint();
        c2.setTrackingNumber("CMP-2026-0002");
        c2.setStudentId(student1.getId());
        c2.setStudentName(student1.getFullName());
        c2.setStudentEmail(student1.getEmail());
        c2.setTitle("Water cooler leaking water on 2nd Floor Central Library corridor");
        c2.setDescription("The commercial water cooler near the journal reading section is leaking water onto the marble floor, creating a severe slip hazard for students.");
        c2.setCategoryId(catElec.getId());
        c2.setCategoryName(catElec.getName());
        c2.setDepartmentId(deptEstate.getId());
        c2.setDepartmentName(deptEstate.getName());
        c2.setAssignedOfficerId(officerEstate.getId());
        c2.setAssignedOfficerName(officerEstate.getFullName());
        c2.setPriority(ComplaintPriority.HIGH);
        c2.setStatus(ComplaintStatus.RESOLVED);
        c2.setCampusLocation("Central Library, 2nd Floor North Corridor");
        c2.setSubmissionDate(now.minus(4, ChronoUnit.DAYS));
        c2.setDueDate(now.minus(2, ChronoUnit.DAYS));
        c2.setResolutionDate(now.minus(1, ChronoUnit.DAYS));
        c2.setFeedbackSubmitted(true);
        c2.setCreatedAt(now.minus(4, ChronoUnit.DAYS));
        c2.setUpdatedAt(now.minus(1, ChronoUnit.DAYS));
        Complaint savedC2 = complaintRepository.save(c2);

        updateRepository.save(new ComplaintUpdate(savedC2.getId(), savedC2.getTrackingNumber(), student1.getId(), student1.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student.", null, null));
        updateRepository.save(new ComplaintUpdate(savedC2.getId(), savedC2.getTrackingNumber(), adminUser.getId(), adminUser.getFullName(), Role.ROLE_ADMIN, ComplaintStatus.SUBMITTED, ComplaintStatus.ASSIGNED, "Assigned to Estate Facilities for urgent repair.", "Safety hazard flagged", null));
        updateRepository.save(new ComplaintUpdate(savedC2.getId(), savedC2.getTrackingNumber(), officerEstate.getId(), officerEstate.getFullName(), Role.ROLE_OFFICER, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, "Plumber dispatched with replacement drainage valve.", "Drain gasket was cracked", null));
        updateRepository.save(new ComplaintUpdate(savedC2.getId(), savedC2.getTrackingNumber(), officerEstate.getId(), officerEstate.getFullName(), Role.ROLE_OFFICER, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, "Drain pipe and gasket replaced. Area thoroughly cleaned and dried. Cooler functioning normally.", "Verified leak-free under 3 bar pressure", null));

        feedbackRepository.save(new Feedback(savedC2.getId(), savedC2.getTrackingNumber(), student1.getId(), student1.getFullName(), 5, "Fixed very quickly! The walkway is safe again. Thank you Estate team!", "Timeliness"));

        // Complaint 3: MORE_INFO_REQUIRED
        Complaint c3 = new Complaint();
        c3.setTrackingNumber("CMP-2026-0003");
        c3.setStudentId(student2.getId());
        c3.setStudentName(student2.getFullName());
        c3.setStudentEmail(student2.getEmail());
        c3.setTitle("Projector flickering in Seminar Hall 1");
        c3.setDescription("The HDMI connection drops color signal and turns magenta during presentations.");
        c3.setCategoryId(catClassroom.getId());
        c3.setCategoryName(catClassroom.getName());
        c3.setDepartmentId(deptEstate.getId());
        c3.setDepartmentName(deptEstate.getName());
        c3.setAssignedOfficerId(officerEstate.getId());
        c3.setAssignedOfficerName(officerEstate.getFullName());
        c3.setPriority(ComplaintPriority.MEDIUM);
        c3.setStatus(ComplaintStatus.MORE_INFO_REQUIRED);
        c3.setCampusLocation("Seminar Hall 1, Administrative Block");
        c3.setSubmissionDate(now.minus(1, ChronoUnit.DAYS));
        c3.setDueDate(now.plus(2, ChronoUnit.DAYS));
        c3.setCreatedAt(now.minus(1, ChronoUnit.DAYS));
        c3.setUpdatedAt(now.minus(3, ChronoUnit.HOURS));
        Complaint savedC3 = complaintRepository.save(c3);

        updateRepository.save(new ComplaintUpdate(savedC3.getId(), savedC3.getTrackingNumber(), student2.getId(), student2.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student.", null, null));
        updateRepository.save(new ComplaintUpdate(savedC3.getId(), savedC3.getTrackingNumber(), officerEstate.getId(), officerEstate.getFullName(), Role.ROLE_OFFICER, ComplaintStatus.SUBMITTED, ComplaintStatus.MORE_INFO_REQUIRED, "Does this flicker happen with all laptops or a specific HDMI dongle/adapter? Please provide details.", "Need to isolate podium HDMI cable from user adapter", null));

        // Complaint 4: SUBMITTED (Awaiting Admin review/assignment)
        Complaint c4 = new Complaint();
        c4.setTrackingNumber("CMP-2026-0004");
        c4.setStudentId(student2.getId());
        c4.setStudentName(student2.getFullName());
        c4.setStudentEmail(student2.getEmail());
        c4.setTitle("Hostel Block B room 214 ceiling fan making loud grinding noise");
        c4.setDescription("The fan motor bearing has seized and produces a loud screeching vibration that prevents studying and sleeping.");
        c4.setCategoryId(catHostel.getId());
        c4.setCategoryName(catHostel.getName());
        c4.setDepartmentId(deptHostel.getId());
        c4.setDepartmentName(deptHostel.getName());
        c4.setPriority(ComplaintPriority.MEDIUM);
        c4.setStatus(ComplaintStatus.SUBMITTED);
        c4.setCampusLocation("Girls Hostel Block B, Room 214");
        c4.setSubmissionDate(now.minus(5, ChronoUnit.HOURS));
        c4.setDueDate(now.plus(3, ChronoUnit.DAYS));
        c4.setCreatedAt(now.minus(5, ChronoUnit.HOURS));
        c4.setUpdatedAt(now.minus(5, ChronoUnit.HOURS));
        Complaint savedC4 = complaintRepository.save(c4);

        updateRepository.save(new ComplaintUpdate(savedC4.getId(), savedC4.getTrackingNumber(), student2.getId(), student2.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student.", null, null));

        // Complaint 5: ESCALATED / Overdue
        Complaint c5 = new Complaint();
        c5.setTrackingNumber("CMP-2026-0005");
        c5.setStudentId(student1.getId());
        c5.setStudentName(student1.getFullName());
        c5.setStudentEmail(student1.getEmail());
        c5.setTitle("Emergency exit door stuck in Science Block East Wing");
        c5.setDescription("The push bar on the double doors is jammed shut and will not open from the inside. Immediate safety hazard.");
        c5.setCategoryId(catClassroom.getId());
        c5.setCategoryName(catClassroom.getName());
        c5.setDepartmentId(deptEstate.getId());
        c5.setDepartmentName(deptEstate.getName());
        c5.setAssignedOfficerId(officerEstate.getId());
        c5.setAssignedOfficerName(officerEstate.getFullName());
        c5.setPriority(ComplaintPriority.CRITICAL);
        c5.setStatus(ComplaintStatus.ESCALATED);
        c5.setCampusLocation("Science Block, 1st Floor East Wing Emergency Exit");
        c5.setSubmissionDate(now.minus(5, ChronoUnit.DAYS));
        c5.setDueDate(now.minus(3, ChronoUnit.DAYS)); // Overdue!
        c5.setCreatedAt(now.minus(5, ChronoUnit.DAYS));
        c5.setUpdatedAt(now.minus(1, ChronoUnit.DAYS));
        Complaint savedC5 = complaintRepository.save(c5);

        updateRepository.save(new ComplaintUpdate(savedC5.getId(), savedC5.getTrackingNumber(), student1.getId(), student1.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student.", null, null));
        updateRepository.save(new ComplaintUpdate(savedC5.getId(), savedC5.getTrackingNumber(), adminUser.getId(), adminUser.getFullName(), Role.ROLE_ADMIN, ComplaintStatus.SUBMITTED, ComplaintStatus.ESCALATED, "Escalated due to overdue deadline and fire safety code concern.", "Priority elevated to Critical", null));

        // 5. Seed Initial Notifications
        notificationRepository.save(new Notification(student1.getId(), "Welcome to CampusCare", "You can register campus complaints and track their real-time resolution here.", null, null, "SYSTEM"));
        notificationRepository.save(new Notification(student1.getId(), "Complaint Resolved (CMP-2026-0002)", "Your complaint regarding library water cooler was resolved. Please rate our service!", savedC2.getId(), savedC2.getTrackingNumber(), "RESOLUTION"));
        notificationRepository.save(new Notification(student2.getId(), "More Information Requested (CMP-2026-0003)", "Estate Officer requested details on your projector complaint.", savedC3.getId(), savedC3.getTrackingNumber(), "INFO_REQUEST"));
        notificationRepository.save(new Notification(officerIT.getId(), "Assigned Complaint (CMP-2026-0001)", "You were assigned complaint 'High latency on Campus Wi-Fi in Lab 3'.", savedC1.getId(), savedC1.getTrackingNumber(), "ASSIGNMENT"));
        notificationRepository.save(new Notification(officerEstate.getId(), "Escalated Complaint (CMP-2026-0005)", "Emergency exit door stuck has been escalated due to SLA overdue.", savedC5.getId(), savedC5.getTrackingNumber(), "ESCALATION"));
    }
}
