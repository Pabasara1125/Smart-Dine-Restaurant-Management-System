package com.smartdine.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "Supplier")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Supplier {

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

    public Supplier() {
    }

    public Integer getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Integer supplierId) {
        this.supplierId = supplierId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
