package com.smartdine.backend.controller;

import com.smartdine.backend.entity.Employee;
import com.smartdine.backend.entity.Inventory;
import com.smartdine.backend.entity.Supplier;

import com.smartdine.backend.repository.EmployeeRepository;
import com.smartdine.backend.repository.InventoryRepository;
import com.smartdine.backend.repository.SupplierRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EmployeeInventoryController {

    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeInventoryController(
            InventoryRepository inventoryRepository,
            SupplierRepository supplierRepository,
            EmployeeRepository employeeRepository) {

        this.inventoryRepository = inventoryRepository;
        this.supplierRepository = supplierRepository;
        this.employeeRepository = employeeRepository;
    }

    // ================= INVENTORY =================

    @GetMapping("/inventory")
    public List<Inventory> getInventory() {
        return inventoryRepository.findAll();
    }

    public record InventoryDTO(
            String itemName,
            BigDecimal quantity,
            String unit,
            BigDecimal reorderLevel,
            Integer supplierId) {
    }
@PostMapping("/inventory")
public ResponseEntity<?> addInventory(
        @RequestBody InventoryDTO dto) {

    // Validate required fields
    if (dto.itemName() == null || dto.itemName().isBlank()
            || dto.quantity() == null
            || dto.unit() == null || dto.unit().isBlank()
            || dto.reorderLevel() == null) {

        return ResponseEntity.badRequest()
                .body("Item name, quantity, unit and reorder level are required.");
    }

    // Quantity purchased must be greater than zero
    if (dto.quantity().compareTo(BigDecimal.ZERO) <= 0) {
        return ResponseEntity.badRequest()
                .body("Purchased quantity must be greater than zero.");
    }

    // Reorder level cannot be negative
    if (dto.reorderLevel().compareTo(BigDecimal.ZERO) < 0) {
        return ResponseEntity.badRequest()
                .body("Reorder level cannot be negative.");
    }

    String itemName = dto.itemName().trim();
    String unit = dto.unit().trim();

    // Find existing stock using item name and unit
    Inventory item = inventoryRepository
            .findFirstByItemNameIgnoreCaseAndUnitIgnoreCase(
                    itemName,
                    unit
            )
            .orElse(null);

    // Find and validate supplier, if selected
    Supplier supplier = null;

    if (dto.supplierId() != null) {

        supplier = supplierRepository
                .findById(dto.supplierId())
                .orElse(null);

        if (supplier == null) {
            return ResponseEntity.badRequest()
                    .body("Supplier not found: " + dto.supplierId());
        }
    }

    if (item != null) {

        // Existing item: increase its stock
        BigDecimal updatedQuantity =
                item.getQuantity().add(dto.quantity());

        item.setQuantity(updatedQuantity);

        // Update the reorder level with the submitted value
        item.setReorderLevel(dto.reorderLevel());

        // Update supplier only if a supplier was selected
        if (supplier != null) {
            item.setSupplier(supplier);
        }

    } else {

        // New item: create a new inventory record
        item = new Inventory();

        item.setItemName(itemName);
        item.setQuantity(dto.quantity());
        item.setUnit(unit);
        item.setReorderLevel(dto.reorderLevel());

        if (supplier != null) {
            item.setSupplier(supplier);
        }
    }

    return ResponseEntity.ok(
            inventoryRepository.save(item)
    );
}


    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<Void> deleteInventory(
            @PathVariable Integer id) {

        if (!inventoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        inventoryRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // ================= SUPPLIERS =================

    @GetMapping("/suppliers")
    public List<Supplier> getSuppliers() {
        return supplierRepository.findAll();
    }

    @PostMapping("/suppliers")
    public ResponseEntity<?> addSupplier(
            @RequestBody Supplier supplier) {

        if (supplier.getName() == null
                || supplier.getName().isBlank()
                || supplier.getPhone() == null
                || supplier.getPhone().isBlank()
                || supplier.getAddress() == null
                || supplier.getAddress().isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Supplier name, phone and address are required.");
        }

        supplier.setSupplierId(null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierRepository.save(supplier));
    }

    @DeleteMapping("/suppliers/{id}")
    public ResponseEntity<Void> deleteSupplier(
            @PathVariable Integer id) {

        if (!supplierRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        supplierRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // ================= EMPLOYEES =================

    @GetMapping("/employees")
    public List<Employee> getEmployees() {
        return employeeRepository.findAll();
    }

    @PostMapping("/employees")
    public ResponseEntity<?> addEmployee(
            @RequestBody Employee employee) {

        if (employee.getName() == null
                || employee.getName().isBlank()
                || employee.getPhone() == null
                || employee.getPhone().isBlank()
                || employee.getRole() == null
                || employee.getRole().isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Employee name, phone and role are required.");
        }

        employee.setEmployeeId(null);

        if (employee.getHireDate() == null) {
            employee.setHireDate(LocalDate.now());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employeeRepository.save(employee));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable Integer id) {

        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        employeeRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
