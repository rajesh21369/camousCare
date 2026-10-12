package com.campuscare.model;

import java.util.EnumSet;
import java.util.Set;

public enum ComplaintStatus {
    SUBMITTED,
    UNDER_REVIEW,
    ASSIGNED,
    IN_PROGRESS,
    MORE_INFO_REQUIRED,
    RESOLVED,
    CLOSED,
    REOPENED,
    ESCALATED,
    REJECTED;

    /**
     * Determines whether transitioning from this status to targetStatus is valid.
     */
    public boolean canTransitionTo(ComplaintStatus targetStatus) {
        if (this == targetStatus) {
            return true; // No status change is allowed when adding a comment
        }
        return switch (this) {
            case SUBMITTED -> EnumSet.of(UNDER_REVIEW, ASSIGNED, REJECTED).contains(targetStatus);
            case UNDER_REVIEW -> EnumSet.of(ASSIGNED, MORE_INFO_REQUIRED, REJECTED, IN_PROGRESS).contains(targetStatus);
            case ASSIGNED -> EnumSet.of(IN_PROGRESS, MORE_INFO_REQUIRED, ESCALATED, REJECTED).contains(targetStatus);
            case IN_PROGRESS -> EnumSet.of(MORE_INFO_REQUIRED, RESOLVED, ESCALATED, REJECTED).contains(targetStatus);
            case MORE_INFO_REQUIRED -> EnumSet.of(IN_PROGRESS, UNDER_REVIEW, REJECTED).contains(targetStatus);
            case RESOLVED -> EnumSet.of(CLOSED, REOPENED).contains(targetStatus);
            case REOPENED -> EnumSet.of(UNDER_REVIEW, ASSIGNED, IN_PROGRESS, ESCALATED).contains(targetStatus);
            case ESCALATED -> EnumSet.of(IN_PROGRESS, RESOLVED, REJECTED).contains(targetStatus);
            case REJECTED, CLOSED -> EnumSet.of(REOPENED).contains(targetStatus); // Reopen can be permitted by admin or special request
        };
    }
}
