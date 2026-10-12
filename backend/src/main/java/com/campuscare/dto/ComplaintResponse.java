package com.campuscare.dto;

import com.campuscare.model.Attachment;
import com.campuscare.model.ComplaintPriority;
import com.campuscare.model.ComplaintStatus;
import com.campuscare.model.Role;

import java.time.Instant;
import java.util.List;

public class ComplaintResponse {

    private String id;
    private String trackingNumber;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String title;
    private String description;
    private String categoryId;
    private String categoryName;
    private String departmentId;
    private String departmentName;
    private String assignedOfficerId;
    private String assignedOfficerName;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private String campusLocation;
    private List<Attachment> attachments;
    private Instant submissionDate;
    private Instant dueDate;
    private Instant resolutionDate;
    private boolean feedbackSubmitted;
    private String rejectionReason;
    private boolean isOverdue;
    private List<UpdateDto> updates;
    private FeedbackDto feedback;
    private Instant createdAt;
    private Instant updatedAt;

    public static class UpdateDto {
        private String id;
        private String actorId;
        private String actorName;
        private Role actorRole;
        private ComplaintStatus oldStatus;
        private ComplaintStatus newStatus;
        private String publicComment;
        private String internalNote; // Will be null for students
        private String attachmentUri;
        private Instant timestamp;

        public UpdateDto() {
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getActorId() {
            return actorId;
        }

        public void setActorId(String actorId) {
            this.actorId = actorId;
        }

        public String getActorName() {
            return actorName;
        }

        public void setActorName(String actorName) {
            this.actorName = actorName;
        }

        public Role getActorRole() {
            return actorRole;
        }

        public void setActorRole(Role actorRole) {
            this.actorRole = actorRole;
        }

        public ComplaintStatus getOldStatus() {
            return oldStatus;
        }

        public void setOldStatus(ComplaintStatus oldStatus) {
            this.oldStatus = oldStatus;
        }

        public ComplaintStatus getNewStatus() {
            return newStatus;
        }

        public void setNewStatus(ComplaintStatus newStatus) {
            this.newStatus = newStatus;
        }

        public String getPublicComment() {
            return publicComment;
        }

        public void setPublicComment(String publicComment) {
            this.publicComment = publicComment;
        }

        public String getInternalNote() {
            return internalNote;
        }

        public void setInternalNote(String internalNote) {
            this.internalNote = internalNote;
        }

        public String getAttachmentUri() {
            return attachmentUri;
        }

        public void setAttachmentUri(String attachmentUri) {
            this.attachmentUri = attachmentUri;
        }

        public Instant getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(Instant timestamp) {
            this.timestamp = timestamp;
        }
    }

    public static class FeedbackDto {
        private String id;
        private int rating;
        private String comment;
        private String satisfactionCategory;
        private Instant createdAt;

        public FeedbackDto() {
        }

        public FeedbackDto(String id, int rating, String comment, String satisfactionCategory, Instant createdAt) {
            this.id = id;
            this.rating = rating;
            this.comment = comment;
            this.satisfactionCategory = satisfactionCategory;
            this.createdAt = createdAt;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }

        public String getSatisfactionCategory() {
            return satisfactionCategory;
        }

        public void setSatisfactionCategory(String satisfactionCategory) {
            this.satisfactionCategory = satisfactionCategory;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }

    public ComplaintResponse() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(String assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
    }

    public String getAssignedOfficerName() {
        return assignedOfficerName;
    }

    public void setAssignedOfficerName(String assignedOfficerName) {
        this.assignedOfficerName = assignedOfficerName;
    }

    public ComplaintPriority getPriority() {
        return priority;
    }

    public void setPriority(ComplaintPriority priority) {
        this.priority = priority;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getCampusLocation() {
        return campusLocation;
    }

    public void setCampusLocation(String campusLocation) {
        this.campusLocation = campusLocation;
    }

    public List<Attachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<Attachment> attachments) {
        this.attachments = attachments;
    }

    public Instant getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public Instant getResolutionDate() {
        return resolutionDate;
    }

    public void setResolutionDate(Instant resolutionDate) {
        this.resolutionDate = resolutionDate;
    }

    public boolean isFeedbackSubmitted() {
        return feedbackSubmitted;
    }

    public void setFeedbackSubmitted(boolean feedbackSubmitted) {
        this.feedbackSubmitted = feedbackSubmitted;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }

    public List<UpdateDto> getUpdates() {
        return updates;
    }

    public void setUpdates(List<UpdateDto> updates) {
        this.updates = updates;
    }

    public FeedbackDto getFeedback() {
        return feedback;
    }

    public void setFeedback(FeedbackDto feedback) {
        this.feedback = feedback;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
