package com.smartdine.backend.repository;

import com.smartdine.backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

    Optional<Inventory> findFirstByItemNameIgnoreCaseAndUnitIgnoreCase(
            String itemName,
            String unit
    );
}