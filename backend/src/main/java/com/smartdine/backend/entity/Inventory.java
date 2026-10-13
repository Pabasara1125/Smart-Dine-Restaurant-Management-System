package com.smartdine.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Inventory")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "InventoryID")
    private Integer inventoryId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "SupplierID",
        referencedColumnName = "SupplierID"
    )
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Supplier supplier;

    @Column(name = "ItemName", nullable = false, length = 100)
    private String itemName;

    @Column(
        name = "Quantity",
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal quantity;

    @Column(name = "Unit", nullable = false, length = 20)
    private String unit;

    @Column(
        name = "ReorderLevel",
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal reorderLevel;

    public Inventory() {
    }

    public Integer getInventoryId() {
        return inventoryId;
    }

    public void setInventoryId(Integer inventoryId) {
        this.inventoryId = inventoryId;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(BigDecimal reorderLevel) {
        this.reorderLevel = reorderLevel;
    }
}
