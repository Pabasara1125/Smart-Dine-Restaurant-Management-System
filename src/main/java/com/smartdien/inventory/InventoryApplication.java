package com.smartdien.inventory;

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

// ---------------------------------------------------------
// 1. DATABASE ENTITIES (EMPLOYEE, SUPPLIER, INVENTORY, PURCHASE)
// ---------------------------------------------------------

@Entity
@Table(name = "Employee")
class Employee {
   @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "EmployeeID")
private Integer employeeId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(unique = true, length = 100)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(nullable = false)
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
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
}

@Entity
@Table(name = "Supplier")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
class Supplier {
   @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "SupplierID")
private Integer supplierId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(nullable = false, length = 255)
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
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
class Inventory {

   @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "InventoryID")
private Integer inventoryId;

    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "SupplierID", referencedColumnName = "SupplierID")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
private Supplier supplier;

    @Column(nullable = false, length = 100)
    private String itemName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(nullable = false, precision = 10, scale = 2)
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

@Entity
@Table(name = "Purchase")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
class Purchase {

    @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "PurchaseID")
private Integer purchaseId;

   @ManyToOne(optional = false)
@JoinColumn(name = "SupplierID", referencedColumnName = "SupplierID", nullable = false)
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
private Supplier supplier;

@ManyToOne(optional = false)
@JoinColumn(name = "InventoryID", referencedColumnName = "InventoryID", nullable = false)
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
private Inventory inventory;

    // leave the rest of Purchase unchanged

    @Column(nullable = false)
    private LocalDateTime purchaseDate = LocalDateTime.now();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    public Purchase() {}

    public Integer getPurchaseId() { return purchaseId; }
    public void setPurchaseId(Integer purchaseId) { this.purchaseId = purchaseId; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public Inventory getInventory() { return inventory; }
    public void setInventory(Inventory inventory) { this.inventory = inventory; }
    public LocalDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDateTime purchaseDate) { this.purchaseDate = purchaseDate; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}

// ---------------------------------------------------------
// 2. REPOSITORIES (DATABASE TALKERS)
// ---------------------------------------------------------

@Repository
interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    List<Employee> findByRoleIgnoreCase(String role);
}

@Repository
interface SupplierRepository extends JpaRepository<Supplier, Integer> {}

@Repository
interface InventoryRepository extends JpaRepository<Inventory, Integer> {
    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.reorderLevel")
    List<Inventory> findItemsAtOrBelowReorderLevel();
}

@Repository
interface PurchaseRepository extends JpaRepository<Purchase, Integer> {
    @Query("SELECT p FROM Purchase p WHERE p.supplier.supplierId = :supplierId ORDER BY p.purchaseDate DESC")
    List<Purchase> findPurchasesBySupplierId(@Param("supplierId") Integer supplierId);
}

// ---------------------------------------------------------
// 3. SERVICE (BUSINESS LOGIC)
// ---------------------------------------------------------

@Service
class SmartDineService {
    private final EmployeeRepository employeeRepo;
    private final SupplierRepository supplierRepo;
    private final InventoryRepository inventoryRepo;
    private final PurchaseRepository purchaseRepo;

    public SmartDineService(EmployeeRepository employeeRepo, SupplierRepository supplierRepo,
                            InventoryRepository inventoryRepo, PurchaseRepository purchaseRepo) {
        this.employeeRepo = employeeRepo;
        this.supplierRepo = supplierRepo;
        this.inventoryRepo = inventoryRepo;
        this.purchaseRepo = purchaseRepo;
    }

    public List<Employee> getAllEmployees() { return employeeRepo.findAll(); }
    public Employee addEmployee(Employee emp) { return employeeRepo.save(emp); }

    public List<Supplier> getAllSuppliers() { return supplierRepo.findAll(); }
    public Supplier addSupplier(Supplier s) { return supplierRepo.save(s); }

    public List<Inventory> getAllInventory() { return inventoryRepo.findAll(); }
    public List<Inventory> getLowStockAlerts() { return inventoryRepo.findItemsAtOrBelowReorderLevel(); }
    public Inventory addInventoryItem(Inventory item) { return inventoryRepo.save(item); }

    @Transactional
    public Purchase recordPurchase(Integer supplierId, Integer inventoryId, BigDecimal qty, BigDecimal price) {
        Supplier supplier = supplierRepo.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        Inventory inventory = inventoryRepo.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found"));

        Purchase p = new Purchase();
        p.setSupplier(supplier);
        p.setInventory(inventory);
        p.setQuantity(qty);
        p.setUnitPrice(price);
        p.setTotalAmount(qty.multiply(price));
        p.setPurchaseDate(LocalDateTime.now());
        Purchase saved = purchaseRepo.save(p);

        // Auto-increment the stock quantity
        inventory.setQuantity(inventory.getQuantity().add(qty));
        inventoryRepo.save(inventory);

        return saved;
    }
}

// ---------------------------------------------------------
// 4. REST CONTROLLERS (THE WEB APIS)
// ---------------------------------------------------------

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
class SmartDineController {
    private final SmartDineService service;

    public SmartDineController(SmartDineService service) {
        this.service = service;
    }

    @GetMapping("/employees")
    public List<Employee> getEmployees() { return service.getAllEmployees(); }

    @PostMapping("/employees")
    public Employee addEmployee(@RequestBody Employee e) { return service.addEmployee(e); }

    @GetMapping("/suppliers")
    public List<Supplier> getSuppliers() { return service.getAllSuppliers(); }

    @PostMapping("/suppliers")
    public Supplier addSupplier(@RequestBody Supplier s) { return service.addSupplier(s); }

    @GetMapping("/inventory")
    public List<Inventory> getInventory() { return service.getAllInventory(); }

    @GetMapping("/inventory/low-stock")
    public List<Inventory> getLowStock() { return service.getLowStockAlerts(); }

    @PostMapping("/inventory")
    public Inventory addInventory(@RequestBody Inventory i) { return service.addInventoryItem(i); }

    public record PurchaseDTO(Integer supplierId, Integer inventoryId, BigDecimal quantity, BigDecimal unitPrice) {}

    @PostMapping("/purchases")
    public ResponseEntity<Purchase> recordPurchase(@RequestBody PurchaseDTO dto) {
        return ResponseEntity.ok(service.recordPurchase(dto.supplierId(), dto.inventoryId(), dto.quantity(), dto.unitPrice()));
    }
}