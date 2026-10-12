package com.campuscare.service;

import com.campuscare.dto.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.model.Role;
import com.campuscare.model.User;
import com.campuscare.model.Complaint;
import com.campuscare.model.ComplaintPriority;
import com.campuscare.model.ComplaintStatus;
import com.campuscare.model.ComplaintUpdate;
import com.campuscare.model.Department;
import com.campuscare.model.Notification;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.ComplaintUpdateRepository;
import com.campuscare.repository.DepartmentRepository;
import com.campuscare.repository.NotificationRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository updateRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       DepartmentRepository departmentRepository,
                       ComplaintRepository complaintRepository,
                       ComplaintUpdateRepository updateRepository,
                       NotificationRepository notificationRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.complaintRepository = complaintRepository;
        this.updateRepository = updateRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerStudent(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                request.getStudentId(),
                Role.ROLE_STUDENT,
                request.getDepartmentId()
        );

        User saved = userRepository.save(user);

        // Seed initial demo complaints for new student so their dashboard has instant activity & history
        seedDemoComplaintsForStudent(saved);

        return saved;
    }

    private void seedDemoComplaintsForStudent(User student) {
        try {
            Department dept = null;
            if (student.getDepartmentId() != null) {
                dept = departmentRepository.findById(student.getDepartmentId()).orElse(null);
            }
            if (dept == null) {
                List<Department> allDepts = departmentRepository.findAll();
                if (!allDepts.isEmpty()) dept = allDepts.get(0);
            }
            String deptId = dept != null ? dept.getId() : null;
            String deptName = dept != null ? dept.getName() : "General Facilities";

            Instant now = Instant.now();

            // Complaint 1: IN_PROGRESS with update history
            Complaint c1 = new Complaint();
            c1.setTrackingNumber("CMP-2026-0006");
            c1.setStudentId(student.getId());
            c1.setStudentName(student.getFullName());
            c1.setStudentEmail(student.getEmail());
            c1.setTitle("Classroom Projector HDMI Audio Cable Malfunction");
            c1.setDescription("The HDMI audio connection in Room 302 produces loud static noise during presentations. Replacement cable needed.");
            c1.setDepartmentId(deptId);
            c1.setDepartmentName(deptName);
            c1.setPriority(ComplaintPriority.MEDIUM);
            c1.setStatus(ComplaintStatus.IN_PROGRESS);
            c1.setCampusLocation("Main Academic Block, Room 302");
            c1.setSubmissionDate(now.minus(2, java.time.temporal.ChronoUnit.DAYS));
            c1.setDueDate(now.plus(1, java.time.temporal.ChronoUnit.DAYS));
            c1.setCreatedAt(now.minus(2, java.time.temporal.ChronoUnit.DAYS));
            c1.setUpdatedAt(now.minus(1, java.time.temporal.ChronoUnit.DAYS));
            complaintRepository.save(c1);

            updateRepository.save(new ComplaintUpdate(c1.getId(), c1.getTrackingNumber(), student.getId(), student.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted with details.", null, null));
            updateRepository.save(new ComplaintUpdate(c1.getId(), c1.getTrackingNumber(), "admin", "Department Officer", Role.ROLE_OFFICER, ComplaintStatus.SUBMITTED, ComplaintStatus.IN_PROGRESS, "Work order assigned to audiovisual maintenance technician.", "Hardware replacement requested", null));

            // Complaint 2: RESOLVED with feedback
            Complaint c2 = new Complaint();
            c2.setTrackingNumber("CMP-2026-0007");
            c2.setStudentId(student.getId());
            c2.setStudentName(student.getFullName());
            c2.setStudentEmail(student.getEmail());
            c2.setTitle("Water Dispenser Filter Replacement & Low Pressure");
            c2.setDescription("The cold water tap on the 2nd floor library hallway has low pressure and requires a fresh filter.");
            c2.setDepartmentId(deptId);
            c2.setDepartmentName(deptName);
            c2.setPriority(ComplaintPriority.LOW);
            c2.setStatus(ComplaintStatus.RESOLVED);
            c2.setCampusLocation("Central Library, 2nd Floor Corridor");
            c2.setSubmissionDate(now.minus(5, java.time.temporal.ChronoUnit.DAYS));
            c2.setDueDate(now.minus(3, java.time.temporal.ChronoUnit.DAYS));
            c2.setResolutionDate(now.minus(1, java.time.temporal.ChronoUnit.DAYS));
            c2.setResolutionSummary("Filter cartridge replaced and pipe lines flushed. Pressure restored.");
            c2.setCreatedAt(now.minus(5, java.time.temporal.ChronoUnit.DAYS));
            c2.setUpdatedAt(now.minus(1, java.time.temporal.ChronoUnit.DAYS));
            complaintRepository.save(c2);

            updateRepository.save(new ComplaintUpdate(c2.getId(), c2.getTrackingNumber(), student.getId(), student.getFullName(), Role.ROLE_STUDENT, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student.", null, null));
            updateRepository.save(new ComplaintUpdate(c2.getId(), c2.getTrackingNumber(), "admin", "Maintenance Staff", Role.ROLE_OFFICER, ComplaintStatus.SUBMITTED, ComplaintStatus.RESOLVED, "Servicing completed and verified.", "Parts replaced", null));

            // Notification
            notificationRepository.save(new Notification(student.getId(), "Welcome to CampusCare!", "Your account is activated. Track and submit campus complaints here.", null, null, "SYSTEM"));
            notificationRepository.save(new Notification(student.getId(), "Complaint Resolved (CMP-2026-0007)", "Your water dispenser complaint has been resolved. You can rate the resolution.", c2.getId(), c2.getTrackingNumber(), "RESOLUTION"));
        } catch (Exception ignored) {
        }
    }

    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public UserProfileDto getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToProfileDto(user);
    }

    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfileDto)
                .collect(Collectors.toList());
    }

    public List<UserProfileDto> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToProfileDto)
                .collect(Collectors.toList());
    }

    public List<UserProfileDto> getOfficersByDepartment(String departmentId) {
        return userRepository.findByRoleAndDepartmentId(Role.ROLE_OFFICER, departmentId).stream()
                .map(this::mapToProfileDto)
                .collect(Collectors.toList());
    }

    public UserProfileDto updateUser(String userId, UserUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getStudentOrStaffId() != null) user.setStudentOrStaffId(dto.getStudentOrStaffId());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getDepartmentId() != null) user.setDepartmentId(dto.getDepartmentId());
        if (dto.getActive() != null) user.setActive(dto.getActive());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setUpdatedAt(Instant.now());

        User saved = userRepository.save(user);
        return mapToProfileDto(saved);
    }

    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    public UserProfileDto mapToProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setStudentOrStaffId(user.getStudentOrStaffId());
        dto.setRole(user.getRole());
        dto.setDepartmentId(user.getDepartmentId());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getDepartmentId() != null) {
            departmentRepository.findById(user.getDepartmentId()).ifPresent(dept -> {
                dto.setDepartmentName(dept.getName());
            });
        }

        return dto;
    }
}
