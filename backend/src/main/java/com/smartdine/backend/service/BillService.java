package com.smartdine.backend.service;

import com.smartdine.backend.entity.Bill;
import com.smartdine.backend.repository.BillRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BillService {

    private final BillRepository billRepository;

    public BillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Optional<Bill> getBillById(Integer id) {
        return billRepository.findById(id);
    }

    // Create a bill with a server-calculated total.
    @Transactional
    public Bill createBill(Bill bill) {

        validateAmounts(bill);

        bill.setBillID(null);
        bill.setTotalAmount(
                calculateTotal(
                        bill.getSubtotal(),
                        bill.getTax(),
                        bill.getDiscount()
                )
        );

        if (bill.getBillStatus() == null
                || bill.getBillStatus().isBlank()) {
            bill.setBillStatus("UNPAID");
        }

        return billRepository.save(bill);
    }

    // Update tax and discount on an existing unpaid bill.
    @Transactional
    public Bill updateBill(Integer id, Bill updatedBill) {

        Bill existingBill = billRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Bill not found with ID: " + id));

        if ("PAID".equalsIgnoreCase(existingBill.getBillStatus())) {
            throw new IllegalArgumentException(
                    "A paid bill cannot be edited."
            );
        }

        validateAmounts(updatedBill);

        // Keep the original order and bill date.
        // Update the financial amounts only.
        existingBill.setSubtotal(updatedBill.getSubtotal());
        existingBill.setTax(
                updatedBill.getTax() == null
                        ? 0.0
                        : updatedBill.getTax()
        );
        existingBill.setDiscount(
                updatedBill.getDiscount() == null
                        ? 0.0
                        : updatedBill.getDiscount()
        );

        existingBill.setTotalAmount(
                calculateTotal(
                        existingBill.getSubtotal(),
                        existingBill.getTax(),
                        existingBill.getDiscount()
                )
        );

        return billRepository.save(existingBill);
    }

    public void deleteBill(Integer id) {
        billRepository.deleteById(id);
    }

    private void validateAmounts(Bill bill) {

        if (bill == null) {
            throw new IllegalArgumentException(
                    "Bill details are required."
            );
        }

        if (bill.getOrderID() == null) {
            throw new IllegalArgumentException(
                    "Please select an order."
            );
        }

        if (bill.getSubtotal() == null
                || bill.getSubtotal() < 0) {
            throw new IllegalArgumentException(
                    "Subtotal cannot be negative."
            );
        }

        if (bill.getTax() != null
                && bill.getTax() < 0) {
            throw new IllegalArgumentException(
                    "Tax cannot be negative."
            );
        }

        if (bill.getDiscount() != null
                && bill.getDiscount() < 0) {
            throw new IllegalArgumentException(
                    "Discount cannot be negative."
            );
        }

        double subtotal = bill.getSubtotal();
        double tax = bill.getTax() == null
                ? 0.0
                : bill.getTax();
        double discount = bill.getDiscount() == null
                ? 0.0
                : bill.getDiscount();

        if (discount > subtotal + tax) {
            throw new IllegalArgumentException(
                    "Discount cannot exceed subtotal plus tax."
            );
        }
    }

    private double calculateTotal(
            Double subtotal,
            Double tax,
            Double discount) {

        BigDecimal subtotalValue =
                BigDecimal.valueOf(subtotal);

        BigDecimal taxValue =
                BigDecimal.valueOf(tax == null ? 0.0 : tax);

        BigDecimal discountValue =
                BigDecimal.valueOf(
                        discount == null ? 0.0 : discount
                );

        return subtotalValue
                .add(taxValue)
                .subtract(discountValue)
                .doubleValue();
    }
}