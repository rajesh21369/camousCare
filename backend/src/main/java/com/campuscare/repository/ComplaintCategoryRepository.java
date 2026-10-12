package com.campuscare.repository;

import com.campuscare.model.ComplaintCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintCategoryRepository extends MongoRepository<ComplaintCategory, String> {

    Optional<ComplaintCategory> findByName(String name);

    boolean existsByName(String name);

    List<ComplaintCategory> findByActiveTrue();

    List<ComplaintCategory> findByDefaultDepartmentId(String departmentId);
}
