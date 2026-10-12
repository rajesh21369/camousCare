package com.campuscare.service;

import com.campuscare.model.DatabaseSequence;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.Objects;

@Service
public class SequenceGeneratorService {

    private final MongoOperations mongoOperations;

    public SequenceGeneratorService(MongoOperations mongoOperations) {
        this.mongoOperations = mongoOperations;
    }

    public long generateSequence(String seqName) {
        Query query = new Query(Criteria.where("_id").is(seqName));
        Update update = new Update().inc("seq", 1);
        DatabaseSequence counter = mongoOperations.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                DatabaseSequence.class);

        return !Objects.isNull(counter) ? counter.getSeq() : 1;
    }

    /**
     * Generates a thread-safe, unique tracking number formatted as CMP-{YEAR}-{4-digit counter}
     * e.g., CMP-2026-0001
     */
    public String generateComplaintTrackingNumber() {
        int currentYear = Year.now().getValue();
        String seqKey = "complaint_seq_" + currentYear;
        long seq = generateSequence(seqKey);
        return String.format("CMP-%d-%04d", currentYear, seq);
    }
}
