package com.smartdien.inventory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
public class InventoryApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
    }
}

// ============================================================================
// ENTITIES
// ============================================================================

@Entity
@Table(name = "Employee")
class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EmployeeID")
    private Integer employeeId;

    @Column(name = "Name", nullable = false, length = 100)
    private String name;

    @Column(name = "Phone", nullable = false, length = 15)
    private String phone;

    @Column(name = "Role", nullable = false, length = 30)
    private String role;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "HireDate")
    private LocalDate hireDate;

    public Employee() {}

    public Integer getEmployeeId() { return employeeId; }
    public void setEmployeeId(Integer employeeId) { this.employeeId = employeeId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
}

@Entity
@Table(name = "Supplier")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SupplierID")
    private Integer supplierId;

    @Column(name = "Name", nullable = false, length = 120)
    private String name;

    @Column(name = "Phone", nullable = false, length = 15)
    private String phone;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "Address", nullable = false, length = 255)
    private String address;

    public Supplier() {}

    public Integer getSupplierId() { return supplierId; }
    public void setSupplierId(Integer supplierId) { this.supplierId = supplierId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}

@Entity
@Table(name = "Inventory")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "InventoryID")
    private Integer inventoryId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "SupplierID", referencedColumnName = "SupplierID")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Supplier supplier;

    @Column(name = "ItemName", nullable = false, length = 100)
    private String itemName;

    @Column(name = "Quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "Unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "ReorderLevel", nullable = false, precision = 10, scale = 2)
    private BigDecimal reorderLevel;

    public Inventory() {}

    public Integer getInventoryId() { return inventoryId; }
    public void setInventoryId(Integer inventoryId) { this.inventoryId = inventoryId; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(BigDecimal reorderLevel) { this.reorderLevel = reorderLevel; }
}
// ============================================================================
// REPOSITORIES
// ============================================================================

@Repository
interface EmployeeRepository extends JpaRepository<Employee, Integer> {}

@Repository
interface SupplierRepository extends JpaRepository<Supplier, Integer> {}

@Repository
interface InventoryRepository extends JpaRepository<Inventory, Integer> {}

// ============================================================================
// CONTROLLER (Full CRUD with Add & Delete)
// ============================================================================

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
class SmartDineController {
    private final InventoryRepository inventoryRepo;
    private final SupplierRepository supplierRepo;
    private final EmployeeRepository employeeRepo;

    public SmartDineController(InventoryRepository inventoryRepo,
                               SupplierRepository supplierRepo,
                               EmployeeRepository employeeRepo) {
        this.inventoryRepo = inventoryRepo;
        this.supplierRepo = supplierRepo;
        this.employeeRepo = employeeRepo;
    }

    // --- Inventory ---
    @GetMapping("/inventory")
    public List<Inventory> getInventory() { return inventoryRepo.findAll(); }

    public record InventoryDTO(String itemName, BigDecimal quantity, String unit, BigDecimal reorderLevel, Integer supplierId) {}

    @PostMapping("/inventory")
    public ResponseEntity<?> addInventory(@RequestBody InventoryDTO dto) {
        try {
            Inventory item = new Inventory();
            item.setItemName(dto.itemName());
            item.setQuantity(dto.quantity());
            item.setUnit(dto.unit());
            item.setReorderLevel(dto.reorderLevel());

            // 1. If the user selected a supplier from the dropdown, find and set it
            if (dto.supplierId() != null) {
                supplierRepo.findById(dto.supplierId()).ifPresent(item::setSupplier);
            }

            // 2. If no supplier was provided or found, default to the first supplier in the database
            if (item.getSupplier() == null) {
                List<Supplier> allSuppliers = supplierRepo.findAll();
                if (!allSuppliers.isEmpty()) {
                    item.setSupplier(allSuppliers.get(0));
                }
            }

            Inventory saved = inventoryRepo.save(item);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + ex.getMessage());
        }
    }
    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Integer id) {
        inventoryRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- Suppliers ---
    @GetMapping("/suppliers")
    public List<Supplier> getSuppliers() { return supplierRepo.findAll(); }

    @PostMapping("/suppliers")
    public Supplier addSupplier(@RequestBody Supplier s) { return supplierRepo.save(s); }

    @DeleteMapping("/suppliers/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Integer id) {
        supplierRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- Employees ---
    @GetMapping("/employees")
    public List<Employee> getEmployees() { return employeeRepo.findAll(); }

    @PostMapping("/employees")
    public Employee addEmployee(@RequestBody Employee e) {
        if (e.getHireDate() == null) {
            e.setHireDate(LocalDate.now());
        }
        return employeeRepo.save(e);
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Integer id) {
        employeeRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}