package com.campuscare.repository;

import com.campuscare.model.ComplaintUpdate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintUpdateRepository extends MongoRepository<ComplaintUpdate, String> {

    List<ComplaintUpdate> findByComplaintIdOrderByTimestampAsc(String complaintId);

    List<ComplaintUpdate> findByTrackingNumberOrderByTimestampAsc(String trackingNumber);
}
