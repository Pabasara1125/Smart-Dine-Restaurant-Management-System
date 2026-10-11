
package com.smartdine.service;

import com.smartdine.member4billing.Payment;
import com.smartdine.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment updatePayment(Integer id, Payment updatedPayment) {
        Payment existingPayment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found with ID: " + id));

        existingPayment.setBillID(updatedPayment.getBillID());
        existingPayment.setPaymentDate(updatedPayment.getPaymentDate());
        existingPayment.setAmount(updatedPayment.getAmount());
        existingPayment.setPaymentMethod(updatedPayment.getPaymentMethod());
        existingPayment.setPaymentStatus(updatedPayment.getPaymentStatus());
        existingPayment.setTransactionRef(updatedPayment.getTransactionRef());

        return paymentRepository.save(existingPayment);
    }

    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }
}

