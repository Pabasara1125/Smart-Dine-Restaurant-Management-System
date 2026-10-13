package com.smartdine.backend.repository;

import com.smartdine.backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository
        extends JpaRepository<Supplier, Integer> {
}