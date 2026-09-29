package com.example.backend.service;

import com.example.backend.model.Payment;
import com.example.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    public Payment updatePayment(Integer id, Payment payment) {
        Optional<Payment> existingPayment = paymentRepository.findById(id);

        if (existingPayment.isPresent()) {
            Payment updatedPayment = existingPayment.get();

            updatedPayment.setBillID(payment.getBillID());
            updatedPayment.setPaymentDate(payment.getPaymentDate());
            updatedPayment.setAmount(payment.getAmount());
            updatedPayment.setPaymentMethod(payment.getPaymentMethod());
            updatedPayment.setPaymentStatus(payment.getPaymentStatus());
            updatedPayment.setTransactionRef(payment.getTransactionRef());

            return paymentRepository.save(updatedPayment);
        }

        return null;
    }

    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }
}