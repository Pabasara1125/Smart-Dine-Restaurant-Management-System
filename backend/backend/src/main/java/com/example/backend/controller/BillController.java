package com.example.backend.controller;

import com.example.backend.model.Bill;
import com.example.backend.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    // Create a new bill
    @PostMapping
    public Bill createBill(@RequestBody Bill bill) {
        return billService.createBill(bill);
    }

    // Get all bills
    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    // Get bill by ID
    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Integer id) {

        return billService.getBillById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update bill
    @PutMapping("/{id}")
    public ResponseEntity<Bill> updateBill(
            @PathVariable Integer id,
            @RequestBody Bill bill) {

        Bill updatedBill = billService.updateBill(id, bill);

        if (updatedBill != null) {
            return ResponseEntity.ok(updatedBill);
        }

        return ResponseEntity.notFound().build();
    }

    // Delete bill
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Integer id) {

        billService.deleteBill(id);

        return ResponseEntity.noContent().build();
    }
}
