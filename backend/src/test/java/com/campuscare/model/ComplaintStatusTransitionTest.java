package com.campuscare.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ComplaintStatusTransitionTest {

    @Test
    @DisplayName("Submitted status can transition to Under Review, Assigned, or Rejected")
    void testSubmittedTransitions() {
        assertTrue(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.UNDER_REVIEW));
        assertTrue(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.ASSIGNED));
        assertTrue(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.REJECTED));
        assertFalse(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.RESOLVED));
        assertFalse(ComplaintStatus.SUBMITTED.canTransitionTo(ComplaintStatus.CLOSED));
    }

    @Test
    @DisplayName("Assigned status can transition to In Progress, More Info, Escalated, or Rejected")
    void testAssignedTransitions() {
        assertTrue(ComplaintStatus.ASSIGNED.canTransitionTo(ComplaintStatus.IN_PROGRESS));
        assertTrue(ComplaintStatus.ASSIGNED.canTransitionTo(ComplaintStatus.MORE_INFO_REQUIRED));
        assertTrue(ComplaintStatus.ASSIGNED.canTransitionTo(ComplaintStatus.ESCALATED));
        assertTrue(ComplaintStatus.ASSIGNED.canTransitionTo(ComplaintStatus.REJECTED));
        assertFalse(ComplaintStatus.ASSIGNED.canTransitionTo(ComplaintStatus.CLOSED));
    }

    @Test
    @DisplayName("In Progress can transition to Resolved, More Info, Escalated, or Rejected")
    void testInProgressTransitions() {
        assertTrue(ComplaintStatus.IN_PROGRESS.canTransitionTo(ComplaintStatus.RESOLVED));
        assertTrue(ComplaintStatus.IN_PROGRESS.canTransitionTo(ComplaintStatus.MORE_INFO_REQUIRED));
        assertTrue(ComplaintStatus.IN_PROGRESS.canTransitionTo(ComplaintStatus.ESCALATED));
        assertTrue(ComplaintStatus.IN_PROGRESS.canTransitionTo(ComplaintStatus.REJECTED));
        assertFalse(ComplaintStatus.IN_PROGRESS.canTransitionTo(ComplaintStatus.CLOSED));
    }

    @Test
    @DisplayName("Resolved status can transition to Closed or Reopened")
    void testResolvedTransitions() {
        assertTrue(ComplaintStatus.RESOLVED.canTransitionTo(ComplaintStatus.CLOSED));
        assertTrue(ComplaintStatus.RESOLVED.canTransitionTo(ComplaintStatus.REOPENED));
        assertFalse(ComplaintStatus.RESOLVED.canTransitionTo(ComplaintStatus.SUBMITTED));
    }

    @Test
    @DisplayName("Reopened status can transition back to Under Review, Assigned, In Progress, or Escalated")
    void testReopenedTransitions() {
        assertTrue(ComplaintStatus.REOPENED.canTransitionTo(ComplaintStatus.UNDER_REVIEW));
        assertTrue(ComplaintStatus.REOPENED.canTransitionTo(ComplaintStatus.ASSIGNED));
        assertTrue(ComplaintStatus.REOPENED.canTransitionTo(ComplaintStatus.IN_PROGRESS));
        assertTrue(ComplaintStatus.REOPENED.canTransitionTo(ComplaintStatus.ESCALATED));
    }
}
