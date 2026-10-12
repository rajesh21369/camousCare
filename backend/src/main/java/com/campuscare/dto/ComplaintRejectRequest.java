package com.campuscare.dto;

import jakarta.validation.constraints.NotBlank;

public class ComplaintRejectRequest {

    @NotBlank(message = "Rejection reason is mandatory")
    private String reason;

    private String internalNote;

    public ComplaintRejectRequest() {
    }

    public ComplaintRejectRequest(String reason, String internalNote) {
        this.reason = reason;
        this.internalNote = internalNote;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getInternalNote() {
        return internalNote;
    }

    public void setInternalNote(String internalNote) {
        this.internalNote = internalNote;
    }
}
