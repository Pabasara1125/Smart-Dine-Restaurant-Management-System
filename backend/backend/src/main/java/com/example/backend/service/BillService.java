package com.example.backend.service;

import com.example.backend.model.Bill;
import com.example.backend.repository.BillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BillService {

    private final BillRepository billRepository;

    public BillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public Bill createBill(Bill bill) {
        return billRepository.save(bill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Optional<Bill> getBillById(Integer id) {
        return billRepository.findById(id);
    }

    public Bill updateBill(Integer id, Bill bill) {
        Optional<Bill> existingBill = billRepository.findById(id);

        if (existingBill.isPresent()) {
            Bill updatedBill = existingBill.get();

            updatedBill.setOrderID(bill.getOrderID());
            updatedBill.setBillDate(bill.getBillDate());
            updatedBill.setSubtotal(bill.getSubtotal());
            updatedBill.setTax(bill.getTax());
            updatedBill.setDiscount(bill.getDiscount());
            updatedBill.setTotalAmount(bill.getTotalAmount());
            updatedBill.setBillStatus(bill.getBillStatus());

            return billRepository.save(updatedBill);
        }

        return null;
    }

    public void deleteBill(Integer id) {
        billRepository.deleteById(id);
    }
}