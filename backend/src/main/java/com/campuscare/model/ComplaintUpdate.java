package com.campuscare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "complaintUpdates")
public class ComplaintUpdate {

    @Id
    private String id;

    @Indexed
    private String complaintId;

    @Indexed
    private String trackingNumber;

    private String actorId;

    private String actorName;

    private Role actorRole;

    private ComplaintStatus oldStatus;

    private ComplaintStatus newStatus;

    private String publicComment;

    private String internalNote;

    private String attachmentUri;

    @Indexed
    private Instant timestamp = Instant.now();

    public ComplaintUpdate() {
    }

    public ComplaintUpdate(String complaintId, String trackingNumber, String actorId, String actorName,
                           Role actorRole, ComplaintStatus oldStatus, ComplaintStatus newStatus,
                           String publicComment, String internalNote, String attachmentUri) {
        this.complaintId = complaintId;
        this.trackingNumber = trackingNumber;
        this.actorId = actorId;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.publicComment = publicComment;
        this.internalNote = internalNote;
        this.attachmentUri = attachmentUri;
        this.timestamp = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(String complaintId) {
        this.complaintId = complaintId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
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
