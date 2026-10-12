package com.campuscare.dto;

import com.campuscare.model.ComplaintPriority;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class ComplaintAssignRequest {

    private String departmentId;

    @NotBlank(message = "Assigned officer ID is required")
    private String assignedOfficerId;

    private ComplaintPriority priority;

    private Instant dueDate;

    private String comment;

    public ComplaintAssignRequest() {
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(String assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
    }

    public ComplaintPriority getPriority() {
        return priority;
    }

    public void setPriority(ComplaintPriority priority) {
        this.priority = priority;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
