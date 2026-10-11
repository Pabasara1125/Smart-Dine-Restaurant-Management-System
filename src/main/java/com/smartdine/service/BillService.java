
package com.smartdine.service;

import com.smartdine.member4billing.Bill;
import com.smartdine.repository.BillRepository;
import org.springframework.stereotype.Service;

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

    public Bill createBill(Bill bill) {
        return billRepository.save(bill);
    }

    public Bill updateBill(Integer id, Bill updatedBill) {
        Bill existingBill = billRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Bill not found with ID: " + id));

        existingBill.setOrderID(updatedBill.getOrderID());
        existingBill.setBillDate(updatedBill.getBillDate());
        existingBill.setSubtotal(updatedBill.getSubtotal());
        existingBill.setTax(updatedBill.getTax());
        existingBill.setDiscount(updatedBill.getDiscount());
        existingBill.setTotalAmount(updatedBill.getTotalAmount());
        existingBill.setBillStatus(updatedBill.getBillStatus());

        return billRepository.save(existingBill);
    }

    public void deleteBill(Integer id) {
        billRepository.deleteById(id);
    }
}

