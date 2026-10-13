package com.smartdine.backend.service;

import com.smartdine.backend.entity.Bill;
import com.smartdine.backend.entity.Payment;
import com.smartdine.backend.repository.BillRepository;
import com.smartdine.backend.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            BillRepository billRepository) {

        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    @Transactional
    public Payment createPayment(Payment payment) {

        if (payment.getBillID() == null) {
            throw new IllegalArgumentException("Bill ID is required.");
        }

        if (payment.getAmount() == null || payment.getAmount() <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero.");
        }

        if (payment.getPaymentMethod() == null
                || payment.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException(
                    "Payment method is required.");
        }

        Bill bill = billRepository.findById(payment.getBillID())
                .orElseThrow(() ->
                        new IllegalArgumentException("Bill not found."));

        double billTotal = bill.getTotalAmount() == null
                ? 0.0 : bill.getTotalAmount();

        // Only successful payments count towards the bill.
        double alreadyPaid = paymentRepository
                .findByBillID(payment.getBillID())
                .stream()
                .filter(p -> "COMPLETED".equalsIgnoreCase(
                        p.getPaymentStatus()))
                .mapToDouble(p -> p.getAmount() == null
                        ? 0.0 : p.getAmount())
                .sum();

        double outstanding = Math.max(0.0, billTotal - alreadyPaid);

        if (outstanding <= 0.009) {
            throw new IllegalArgumentException(
                    "This bill has already been fully paid.");
        }

        if (payment.getAmount() > outstanding + 0.009) {
            throw new IllegalArgumentException(
                    "The amount applied to the bill cannot exceed the outstanding balance.");
        }

        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDateTime.now());
        }

        if (payment.getPaymentStatus() == null
                || payment.getPaymentStatus().isBlank()) {
            payment.setPaymentStatus("COMPLETED");
        }

        // This implementation supports completed payments only.
        if (!"COMPLETED".equalsIgnoreCase(
                payment.getPaymentStatus())) {
            throw new IllegalArgumentException(
                    "Only completed payments can be recorded.");
        }

        if ("CASH".equalsIgnoreCase(payment.getPaymentMethod())) {

            double cashReceived = payment.getCashReceived() == null
                    ? payment.getAmount()
                    : payment.getCashReceived();

            if (cashReceived < payment.getAmount()) {
                throw new IllegalArgumentException(
                        "Cash received cannot be less than the amount applied.");
            }

            payment.setCashReceived(cashReceived);
            payment.setChangeReturned(
                    Math.round((cashReceived - payment.getAmount()) * 100.0)
                            / 100.0);

        } else {

            // Non-cash payments do not produce cash change.
            payment.setCashReceived(0.0);
            payment.setChangeReturned(0.0);
        }

        Payment savedPayment = paymentRepository.save(payment);

        double totalPaid = alreadyPaid + savedPayment.getAmount();

        if (totalPaid >= billTotal - 0.009) {
            bill.setBillStatus("PAID");
        } else {
            bill.setBillStatus("PARTIALLY_PAID");
        }

        billRepository.save(bill);

        return savedPayment;
    }

    public Payment updatePayment(Integer id, Payment updatedPayment) {

        Payment existingPayment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with ID: " + id));

        existingPayment.setBillID(updatedPayment.getBillID());
        existingPayment.setPaymentDate(updatedPayment.getPaymentDate());
        existingPayment.setAmount(updatedPayment.getAmount());
        existingPayment.setPaymentMethod(updatedPayment.getPaymentMethod());
        existingPayment.setPaymentStatus(updatedPayment.getPaymentStatus());
        existingPayment.setTransactionRef(updatedPayment.getTransactionRef());
        existingPayment.setCashReceived(updatedPayment.getCashReceived());
        existingPayment.setChangeReturned(updatedPayment.getChangeReturned());

        return paymentRepository.save(existingPayment);
    }

    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }
}