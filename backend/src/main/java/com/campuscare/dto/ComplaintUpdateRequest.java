package com.campuscare.dto;

import com.campuscare.model.ComplaintStatus;

public class ComplaintUpdateRequest {

    private ComplaintStatus status;

    private String publicComment;

    private String internalNote;

    private String attachmentUri;

    public ComplaintUpdateRequest() {
    }

    public ComplaintUpdateRequest(ComplaintStatus status, String publicComment, String internalNote, String attachmentUri) {
        this.status = status;
        this.publicComment = publicComment;
        this.internalNote = internalNote;
        this.attachmentUri = attachmentUri;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
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
}
