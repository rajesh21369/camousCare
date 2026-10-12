package com.campuscare.service;

import com.campuscare.dto.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.model.*;
import com.campuscare.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoOperations;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private ComplaintCategoryRepository categoryRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private ComplaintUpdateRepository updateRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SequenceGeneratorService sequenceGeneratorService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private MongoOperations mongoOperations;

    @InjectMocks
    private ComplaintService complaintService;

    private User student1;
    private User student2;
    private User officer;
    private User admin;
    private ComplaintCategory category;
    private Department department;

    @BeforeEach
    void setUp() {
        student1 = new User("student1", "s1@test.com", "pass", "Student One", "123", "STU1", Role.ROLE_STUDENT, null);
        student1.setId("student-id-1");

        student2 = new User("student2", "s2@test.com", "pass", "Student Two", "456", "STU2", Role.ROLE_STUDENT, null);
        student2.setId("student-id-2");

        department = new Department("IT Dept", "IT", "Info Tech", "it@test.com", null);
        department.setId("dept-id-1");

        officer = new User("officer1", "off1@test.com", "pass", "Officer One", "789", "OFF1", Role.ROLE_OFFICER, "dept-id-1");
        officer.setId("officer-id-1");

        admin = new User("admin", "admin@test.com", "pass", "Admin User", "000", "ADM1", Role.ROLE_ADMIN, null);
        admin.setId("admin-id-1");

        category = new ComplaintCategory("Network", "Internet issues", "dept-id-1", ComplaintPriority.HIGH, 2);
        category.setId("cat-id-1");
    }

    @Test
    @DisplayName("Create Complaint successfully generates tracking number and saves initial update")
    void testCreateComplaintSuccess() {
        ComplaintCreateRequest req = new ComplaintCreateRequest();
        req.setTitle("Campus Wi-Fi is down");
        req.setDescription("Wi-Fi is not connecting in Lab 3.");
        req.setCategoryId("cat-id-1");
        req.setCampusLocation("Lab 3, 2nd floor");

        when(categoryRepository.findById("cat-id-1")).thenReturn(Optional.of(category));
        when(departmentRepository.findById("dept-id-1")).thenReturn(Optional.of(department));
        when(sequenceGeneratorService.generateComplaintTrackingNumber()).thenReturn("CMP-2026-0001");
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> {
            Complaint c = invocation.getArgument(0);
            c.setId("comp-id-1");
            return c;
        });

        ComplaintResponse response = complaintService.createComplaint(req, student1, "127.0.0.1");

        assertNotNull(response);
        assertEquals("CMP-2026-0001", response.getTrackingNumber());
        assertEquals(ComplaintStatus.SUBMITTED, response.getStatus());
        assertEquals("Campus Wi-Fi is down", response.getTitle());
        verify(updateRepository, times(1)).save(any(ComplaintUpdate.class));
        verify(notificationService, times(1)).createNotification(eq(student1.getId()), anyString(), anyString(), eq("comp-id-1"), eq("CMP-2026-0001"), eq("SUBMISSION"));
    }

    @Test
    @DisplayName("Student cannot access another student's complaint")
    void testStudentAccessDenied() {
        Complaint c = new Complaint();
        c.setId("comp-id-1");
        c.setStudentId(student1.getId());

        when(complaintRepository.findById("comp-id-1")).thenReturn(Optional.of(c));

        assertThrows(UnauthorizedException.class, () -> {
            complaintService.getComplaintById("comp-id-1", student2);
        });
    }

    @Test
    @DisplayName("Officer can access complaint assigned to their department")
    void testOfficerDepartmentAccess() {
        Complaint c = new Complaint();
        c.setId("comp-id-1");
        c.setStudentId(student1.getId());
        c.setDepartmentId("dept-id-1");

        when(complaintRepository.findById("comp-id-1")).thenReturn(Optional.of(c));
        when(updateRepository.findByComplaintIdOrderByTimestampAsc("comp-id-1")).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> {
            complaintService.getComplaintById("comp-id-1", officer);
        });
    }

    @Test
    @DisplayName("Admin can assign complaint to officer")
    void testAdminAssignComplaint() {
        Complaint c = new Complaint();
        c.setId("comp-id-1");
        c.setTrackingNumber("CMP-2026-0001");
        c.setStudentId(student1.getId());
        c.setStatus(ComplaintStatus.SUBMITTED);

        ComplaintAssignRequest req = new ComplaintAssignRequest();
        req.setAssignedOfficerId(officer.getId());
        req.setPriority(ComplaintPriority.CRITICAL);

        when(complaintRepository.findById("comp-id-1")).thenReturn(Optional.of(c));
        when(userRepository.findById(officer.getId())).thenReturn(Optional.of(officer));
        when(departmentRepository.findById("dept-id-1")).thenReturn(Optional.of(department));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(i -> i.getArgument(0));

        ComplaintResponse response = complaintService.assignComplaint("comp-id-1", req, admin, "127.0.0.1");

        assertEquals(ComplaintStatus.ASSIGNED, response.getStatus());
        assertEquals(officer.getId(), response.getAssignedOfficerId());
        assertEquals(ComplaintPriority.CRITICAL, response.getPriority());
        verify(notificationService, times(1)).createNotification(eq(officer.getId()), anyString(), anyString(), eq("comp-id-1"), eq("CMP-2026-0001"), eq("ASSIGNMENT"));
    }

    @Test
    @DisplayName("Reject complaint requires valid reason and updates status")
    void testRejectComplaint() {
        Complaint c = new Complaint();
        c.setId("comp-id-1");
        c.setTrackingNumber("CMP-2026-0001");
        c.setStudentId(student1.getId());
        c.setStatus(ComplaintStatus.SUBMITTED);

        ComplaintRejectRequest req = new ComplaintRejectRequest("Duplicate submission", "Already registered under CMP-2026-0000");

        when(complaintRepository.findById("comp-id-1")).thenReturn(Optional.of(c));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(i -> i.getArgument(0));

        ComplaintResponse response = complaintService.rejectComplaint("comp-id-1", req, admin, "127.0.0.1");

        assertEquals(ComplaintStatus.REJECTED, response.getStatus());
        assertEquals("Duplicate submission", response.getRejectionReason());
    }

    @Test
    @DisplayName("Student can reopen a resolved complaint")
    void testStudentReopenComplaint() {
        Complaint c = new Complaint();
        c.setId("comp-id-1");
        c.setTrackingNumber("CMP-2026-0001");
        c.setStudentId(student1.getId());
        c.setStatus(ComplaintStatus.RESOLVED);
        c.setAssignedOfficerId(officer.getId());

        when(complaintRepository.findById("comp-id-1")).thenReturn(Optional.of(c));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(i -> i.getArgument(0));

        ComplaintResponse response = complaintService.reopenComplaint("comp-id-1", "Problem reoccurred this morning", student1, "127.0.0.1");

        assertEquals(ComplaintStatus.REOPENED, response.getStatus());
        assertNull(response.getResolutionDate());
    }
}
