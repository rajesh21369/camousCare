package com.campuscare.service;

import com.campuscare.dto.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.model.*;
import com.campuscare.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintUpdateRepository updateRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final MongoOperations mongoOperations;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintCategoryRepository categoryRepository,
                            DepartmentRepository departmentRepository,
                            ComplaintUpdateRepository updateRepository,
                            FeedbackRepository feedbackRepository,
                            UserRepository userRepository,
                            SequenceGeneratorService sequenceGeneratorService,
                            NotificationService notificationService,
                            AuditLogService auditLogService,
                            MongoOperations mongoOperations) {
        this.complaintRepository = complaintRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.updateRepository = updateRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.sequenceGeneratorService = sequenceGeneratorService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.mongoOperations = mongoOperations;
    }

    public ComplaintResponse createComplaint(ComplaintCreateRequest req, User student, String ipAddress) {
        ComplaintCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint category not found with id: " + req.getCategoryId()));

        String departmentId = req.getDepartmentId();
        if (departmentId == null || departmentId.isBlank()) {
            departmentId = category.getDefaultDepartmentId();
        }

        String departmentName = "General / Unassigned";
        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId).orElse(null);
            if (dept != null) {
                departmentName = dept.getName();
            }
        }

        ComplaintPriority priority = req.getPriority() != null ? req.getPriority() : category.getDefaultPriority();
        int slaDays = category.getSlaDays() > 0 ? category.getSlaDays() : 3;
        Instant dueDate = Instant.now().plus(slaDays, ChronoUnit.DAYS);

        String trackingNumber = sequenceGeneratorService.generateComplaintTrackingNumber();

        Complaint complaint = new Complaint();
        complaint.setTrackingNumber(trackingNumber);
        complaint.setStudentId(student.getId());
        complaint.setStudentName(student.getFullName());
        complaint.setStudentEmail(student.getEmail());
        complaint.setTitle(req.getTitle());
        complaint.setDescription(req.getDescription());
        complaint.setCategoryId(category.getId());
        complaint.setCategoryName(category.getName());
        complaint.setDepartmentId(departmentId);
        complaint.setDepartmentName(departmentName);
        complaint.setPriority(priority);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setCampusLocation(req.getCampusLocation());
        complaint.setAttachments(req.getAttachments() != null ? req.getAttachments() : new ArrayList<>());
        complaint.setSubmissionDate(Instant.now());
        complaint.setDueDate(dueDate);
        complaint.setCreatedAt(Instant.now());
        complaint.setUpdatedAt(Instant.now());

        Complaint saved = complaintRepository.save(complaint);

        // Record initial status update
        ComplaintUpdate initialUpdate = new ComplaintUpdate(
                saved.getId(),
                saved.getTrackingNumber(),
                student.getId(),
                student.getFullName(),
                student.getRole(),
                null,
                ComplaintStatus.SUBMITTED,
                "Complaint lodged successfully by student.",
                null,
                null
        );
        updateRepository.save(initialUpdate);

        // Create in-app notification for the student
        notificationService.createNotification(
                student.getId(),
                "Complaint Registered (" + trackingNumber + ")",
                "Your complaint '" + saved.getTitle() + "' was lodged successfully with tracking ID " + trackingNumber,
                saved.getId(),
                trackingNumber,
                "SUBMISSION"
        );

        auditLogService.logAction(
                student.getId(),
                student.getUsername(),
                student.getRole().name(),
                "COMPLAINT_CREATED",
                "Created complaint " + trackingNumber + " with title: " + saved.getTitle(),
                ipAddress
        );

        return mapToResponse(saved, student.getRole() != Role.ROLE_STUDENT);
    }

    public ComplaintResponse getComplaintById(String id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        validateAccess(complaint, currentUser);
        boolean showInternal = currentUser.getRole() != Role.ROLE_STUDENT;
        return mapToResponse(complaint, showInternal);
    }

    public ComplaintResponse getComplaintByTrackingNumber(String trackingNumber, User currentUser) {
        Complaint complaint = complaintRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with tracking number: " + trackingNumber));

        if (currentUser != null) {
            validateAccess(complaint, currentUser);
            boolean showInternal = currentUser.getRole() != Role.ROLE_STUDENT;
            return mapToResponse(complaint, showInternal);
        }

        // Public tracking: internal notes hidden
        return mapToResponse(complaint, false);
    }

    public List<ComplaintResponse> getComplaintsForUser(User currentUser,
                                                        ComplaintStatus status,
                                                        String departmentId,
                                                        String categoryId,
                                                        ComplaintPriority priority,
                                                        Boolean overdueOnly,
                                                        String search) {
        Query query = new Query();

        // Role-based scope
        if (currentUser.getRole() == Role.ROLE_STUDENT) {
            query.addCriteria(Criteria.where("studentId").is(currentUser.getId()));
        } else if (currentUser.getRole() == Role.ROLE_OFFICER) {
            // Officer can view complaints assigned directly to them OR assigned to their department
            if (currentUser.getDepartmentId() != null && !currentUser.getDepartmentId().isBlank()) {
                query.addCriteria(new Criteria().orOperator(
                        Criteria.where("assignedOfficerId").is(currentUser.getId()),
                        Criteria.where("departmentId").is(currentUser.getDepartmentId())
                ));
            } else {
                query.addCriteria(Criteria.where("assignedOfficerId").is(currentUser.getId()));
            }
        }
        // ADMIN and MANAGEMENT have college-wide access

        // Filters
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (departmentId != null && !departmentId.isBlank()) {
            query.addCriteria(Criteria.where("departmentId").is(departmentId));
        }
        if (categoryId != null && !categoryId.isBlank()) {
            query.addCriteria(Criteria.where("categoryId").is(categoryId));
        }
        if (priority != null) {
            query.addCriteria(Criteria.where("priority").is(priority));
        }
        if (Boolean.TRUE.equals(overdueOnly)) {
            query.addCriteria(Criteria.where("dueDate").lt(Instant.now())
                    .and("status").nin(ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED, ComplaintStatus.REJECTED));
        }
        if (search != null && !search.isBlank()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("trackingNumber").regex(search, "i"),
                    Criteria.where("title").regex(search, "i"),
                    Criteria.where("studentName").regex(search, "i"),
                    Criteria.where("campusLocation").regex(search, "i")
            ));
        }

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        List<Complaint> complaints = mongoOperations.find(query, Complaint.class);
        boolean showInternal = currentUser.getRole() != Role.ROLE_STUDENT;

        return complaints.stream()
                .map(c -> mapToResponse(c, showInternal))
                .collect(Collectors.toList());
    }

    public ComplaintResponse assignComplaint(String id, ComplaintAssignRequest req, User admin, String ipAddress) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User officer = userRepository.findById(req.getAssignedOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + req.getAssignedOfficerId()));

        if (officer.getRole() != Role.ROLE_OFFICER && officer.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Assigned user must be an officer or admin");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setAssignedOfficerId(officer.getId());
        complaint.setAssignedOfficerName(officer.getFullName());

        if (req.getDepartmentId() != null && !req.getDepartmentId().isBlank()) {
            Department dept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
            if (dept != null) {
                complaint.setDepartmentId(dept.getId());
                complaint.setDepartmentName(dept.getName());
            }
        } else if (officer.getDepartmentId() != null) {
            departmentRepository.findById(officer.getDepartmentId()).ifPresent(dept -> {
                complaint.setDepartmentId(dept.getId());
                complaint.setDepartmentName(dept.getName());
            });
        }

        if (req.getPriority() != null) {
            complaint.setPriority(req.getPriority());
        }
        if (req.getDueDate() != null) {
            complaint.setDueDate(req.getDueDate());
        }

        ComplaintStatus newStatus = ComplaintStatus.ASSIGNED;
        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(Instant.now());

        Complaint saved = complaintRepository.save(complaint);

        String comment = req.getComment() != null && !req.getComment().isBlank()
                ? req.getComment()
                : "Complaint assigned to Officer " + officer.getFullName();

        ComplaintUpdate update = new ComplaintUpdate(
                saved.getId(),
                saved.getTrackingNumber(),
                admin.getId(),
                admin.getFullName(),
                admin.getRole(),
                oldStatus,
                newStatus,
                comment,
                "Assigned by " + admin.getUsername(),
                null
        );
        updateRepository.save(update);

        // Notify Officer
        notificationService.createNotification(
                officer.getId(),
                "New Complaint Assigned (" + saved.getTrackingNumber() + ")",
                "You have been assigned complaint '" + saved.getTitle() + "' with priority " + saved.getPriority(),
                saved.getId(),
                saved.getTrackingNumber(),
                "ASSIGNMENT"
        );

        // Notify Student
        notificationService.createNotification(
                saved.getStudentId(),
                "Complaint Assigned (" + saved.getTrackingNumber() + ")",
                "Your complaint has been assigned to officer " + officer.getFullName() + " for investigation.",
                saved.getId(),
                saved.getTrackingNumber(),
                "STATUS_UPDATE"
        );

        auditLogService.logAction(
                admin.getId(),
                admin.getUsername(),
                admin.getRole().name(),
                "COMPLAINT_ASSIGNED",
                "Assigned " + saved.getTrackingNumber() + " to " + officer.getFullName(),
                ipAddress
        );

        return mapToResponse(saved, true);
    }

    public ComplaintResponse updateStatus(String id, ComplaintUpdateRequest req, User actor, String ipAddress) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        validateAccess(complaint, actor);

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = req.getStatus() != null ? req.getStatus() : oldStatus;

        // Check workflow permissions
        if (newStatus != oldStatus && !oldStatus.canTransitionTo(newStatus)) {
            throw new BadRequestException("Invalid status transition from " + oldStatus + " to " + newStatus);
        }

        // Students can only add comments or respond to MORE_INFO_REQUIRED
        if (actor.getRole() == Role.ROLE_STUDENT) {
            if (oldStatus == ComplaintStatus.MORE_INFO_REQUIRED && newStatus != ComplaintStatus.IN_PROGRESS && newStatus != ComplaintStatus.UNDER_REVIEW) {
                // Auto switch to IN_PROGRESS or UNDER_REVIEW when student responds
                newStatus = ComplaintStatus.IN_PROGRESS;
            } else if (oldStatus != ComplaintStatus.MORE_INFO_REQUIRED && newStatus != oldStatus) {
                throw new BadRequestException("Students cannot directly change complaint status. You can post a public comment or submit feedback once resolved.");
            }
        }

        complaint.setStatus(newStatus);
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolutionDate(Instant.now());
        } else if (newStatus == ComplaintStatus.REOPENED) {
            complaint.setResolutionDate(null);
            complaint.setFeedbackSubmitted(false);
        }
        complaint.setUpdatedAt(Instant.now());

        Complaint saved = complaintRepository.save(complaint);

        ComplaintUpdate update = new ComplaintUpdate(
                saved.getId(),
                saved.getTrackingNumber(),
                actor.getId(),
                actor.getFullName(),
                actor.getRole(),
                oldStatus,
                newStatus,
                req.getPublicComment(),
                req.getInternalNote(),
                req.getAttachmentUri()
        );
        updateRepository.save(update);

        // Notify student if update was by staff/admin
        if (actor.getRole() != Role.ROLE_STUDENT) {
            String title = newStatus == ComplaintStatus.RESOLVED ? "Complaint Resolved (" + saved.getTrackingNumber() + ")"
                    : newStatus == ComplaintStatus.MORE_INFO_REQUIRED ? "More Information Requested (" + saved.getTrackingNumber() + ")"
                    : "Status Update (" + saved.getTrackingNumber() + ")";
            String msg = (req.getPublicComment() != null && !req.getPublicComment().isBlank())
                    ? req.getPublicComment()
                    : "Complaint status updated to " + newStatus;

            notificationService.createNotification(
                    saved.getStudentId(),
                    title,
                    msg,
                    saved.getId(),
                    saved.getTrackingNumber(),
                    "STATUS_UPDATE"
            );
        } else {
            // Student added information -> notify assigned officer
            if (saved.getAssignedOfficerId() != null) {
                notificationService.createNotification(
                    saved.getAssignedOfficerId(),
                    "Student Responded (" + saved.getTrackingNumber() + ")",
                    "Student " + actor.getFullName() + " provided additional info: " + req.getPublicComment(),
                    saved.getId(),
                    saved.getTrackingNumber(),
                    "INFO_UPDATE"
                );
            }
        }

        auditLogService.logAction(
                actor.getId(),
                actor.getUsername(),
                actor.getRole().name(),
                "COMPLAINT_STATUS_UPDATE",
                "Updated " + saved.getTrackingNumber() + " from " + oldStatus + " to " + newStatus,
                ipAddress
        );

        boolean showInternal = actor.getRole() != Role.ROLE_STUDENT;
        return mapToResponse(saved, showInternal);
    }

    public ComplaintResponse rejectComplaint(String id, ComplaintRejectRequest req, User actor, String ipAddress) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        if (actor.getRole() != Role.ROLE_ADMIN && actor.getRole() != Role.ROLE_OFFICER) {
            throw new UnauthorizedException("Only department officers and administrators can reject complaints");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.REJECTED);
        complaint.setRejectionReason(req.getReason());
        complaint.setUpdatedAt(Instant.now());

        Complaint saved = complaintRepository.save(complaint);

        ComplaintUpdate update = new ComplaintUpdate(
                saved.getId(),
                saved.getTrackingNumber(),
                actor.getId(),
                actor.getFullName(),
                actor.getRole(),
                oldStatus,
                ComplaintStatus.REJECTED,
                "Complaint Rejected. Reason: " + req.getReason(),
                req.getInternalNote(),
                null
        );
        updateRepository.save(update);

        notificationService.createNotification(
                saved.getStudentId(),
                "Complaint Rejected (" + saved.getTrackingNumber() + ")",
                "Your complaint was rejected. Reason: " + req.getReason(),
                saved.getId(),
                saved.getTrackingNumber(),
                "STATUS_UPDATE"
        );

        auditLogService.logAction(
                actor.getId(),
                actor.getUsername(),
                actor.getRole().name(),
                "COMPLAINT_REJECTED",
                "Rejected " + saved.getTrackingNumber() + ". Reason: " + req.getReason(),
                ipAddress
        );

        return mapToResponse(saved, true);
    }

    public ComplaintResponse reopenComplaint(String id, String reason, User actor, String ipAddress) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        validateAccess(complaint, actor);

        if (complaint.getStatus() != ComplaintStatus.RESOLVED &&
            complaint.getStatus() != ComplaintStatus.CLOSED &&
            complaint.getStatus() != ComplaintStatus.REJECTED) {
            throw new BadRequestException("Only Resolved, Closed, or Rejected complaints can be reopened");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.REOPENED);
        complaint.setResolutionDate(null);
        complaint.setFeedbackSubmitted(false);
        complaint.setUpdatedAt(Instant.now());

        Complaint saved = complaintRepository.save(complaint);

        ComplaintUpdate update = new ComplaintUpdate(
                saved.getId(),
                saved.getTrackingNumber(),
                actor.getId(),
                actor.getFullName(),
                actor.getRole(),
                oldStatus,
                ComplaintStatus.REOPENED,
                "Complaint Reopened by " + actor.getFullName() + ". Reason: " + reason,
                "Reopened request",
                null
        );
        updateRepository.save(update);

        if (saved.getAssignedOfficerId() != null) {
            notificationService.createNotification(
                    saved.getAssignedOfficerId(),
                    "Complaint Reopened (" + saved.getTrackingNumber() + ")",
                    "Student reopened complaint '" + saved.getTitle() + "'. Reason: " + reason,
                    saved.getId(),
                    saved.getTrackingNumber(),
                    "ESCALATION"
            );
        }

        auditLogService.logAction(
                actor.getId(),
                actor.getUsername(),
                actor.getRole().name(),
                "COMPLAINT_REOPENED",
                "Reopened " + saved.getTrackingNumber() + ". Reason: " + reason,
                ipAddress
        );

        boolean showInternal = actor.getRole() != Role.ROLE_STUDENT;
        return mapToResponse(saved, showInternal);
    }

    public void validateAccess(Complaint complaint, User user) {
        if (user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_MANAGEMENT) {
            return;
        }

        if (user.getRole() == Role.ROLE_STUDENT) {
            if (!complaint.getStudentId().equals(user.getId())) {
                throw new UnauthorizedException("Access Denied: You can only access your own complaints.");
            }
            return;
        }

        if (user.getRole() == Role.ROLE_OFFICER) {
            boolean isAssigned = user.getId().equals(complaint.getAssignedOfficerId());
            boolean isSameDept = user.getDepartmentId() != null && user.getDepartmentId().equals(complaint.getDepartmentId());
            if (!isAssigned && !isSameDept) {
                throw new UnauthorizedException("Access Denied: You can only access complaints within your department or assigned to you.");
            }
        }
    }

    public ComplaintResponse mapToResponse(Complaint complaint, boolean showInternalNotes) {
        ComplaintResponse res = new ComplaintResponse();
        res.setId(complaint.getId());
        res.setTrackingNumber(complaint.getTrackingNumber());
        res.setStudentId(complaint.getStudentId());
        res.setStudentName(complaint.getStudentName());
        res.setStudentEmail(complaint.getStudentEmail());
        res.setTitle(complaint.getTitle());
        res.setDescription(complaint.getDescription());
        res.setCategoryId(complaint.getCategoryId());
        res.setCategoryName(complaint.getCategoryName());
        res.setDepartmentId(complaint.getDepartmentId());
        res.setDepartmentName(complaint.getDepartmentName());
        res.setAssignedOfficerId(complaint.getAssignedOfficerId());
        res.setAssignedOfficerName(complaint.getAssignedOfficerName());
        res.setPriority(complaint.getPriority());
        res.setStatus(complaint.getStatus());
        res.setCampusLocation(complaint.getCampusLocation());
        res.setAttachments(complaint.getAttachments());
        res.setSubmissionDate(complaint.getSubmissionDate());
        res.setDueDate(complaint.getDueDate());
        res.setResolutionDate(complaint.getResolutionDate());
        res.setFeedbackSubmitted(complaint.isFeedbackSubmitted());
        res.setRejectionReason(complaint.getRejectionReason());
        res.setCreatedAt(complaint.getCreatedAt());
        res.setUpdatedAt(complaint.getUpdatedAt());

        boolean isOverdue = complaint.getDueDate() != null
                && complaint.getDueDate().isBefore(Instant.now())
                && complaint.getStatus() != ComplaintStatus.RESOLVED
                && complaint.getStatus() != ComplaintStatus.CLOSED
                && complaint.getStatus() != ComplaintStatus.REJECTED;
        res.setOverdue(isOverdue);

        // Load updates
        List<ComplaintUpdate> updates = updateRepository.findByComplaintIdOrderByTimestampAsc(complaint.getId());
        List<ComplaintResponse.UpdateDto> updateDtos = updates.stream().map(u -> {
            ComplaintResponse.UpdateDto udto = new ComplaintResponse.UpdateDto();
            udto.setId(u.getId());
            udto.setActorId(u.getActorId());
            udto.setActorName(u.getActorName());
            udto.setActorRole(u.getActorRole());
            udto.setOldStatus(u.getOldStatus());
            udto.setNewStatus(u.getNewStatus());
            udto.setPublicComment(u.getPublicComment());
            udto.setAttachmentUri(u.getAttachmentUri());
            udto.setTimestamp(u.getTimestamp());
            if (showInternalNotes) {
                udto.setInternalNote(u.getInternalNote());
            } else {
                udto.setInternalNote(null);
            }
            return udto;
        }).collect(Collectors.toList());
        res.setUpdates(updateDtos);

        // Load feedback if exists
        feedbackRepository.findByComplaintId(complaint.getId()).ifPresent(fb -> {
            res.setFeedback(new ComplaintResponse.FeedbackDto(
                    fb.getId(),
                    fb.getRating(),
                    fb.getComment(),
                    fb.getSatisfactionCategory(),
                    fb.getCreatedAt()
            ));
        });

        return res;
    }
}
