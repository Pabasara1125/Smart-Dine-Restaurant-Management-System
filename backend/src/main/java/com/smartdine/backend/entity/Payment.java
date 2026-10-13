package com.smartdine.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENT")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private Integer paymentID;

    @Column(name = "BillID", nullable = false)
    private Integer billID;

    @Column(name = "PaymentDate", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "Amount", nullable = false)
    private Double amount;

    @Column(name = "PaymentMethod", nullable = false)
    private String paymentMethod;

    @Column(name = "PaymentStatus", nullable = false)
    private String paymentStatus;

    @Column(name = "CashReceived", nullable = false)
    private Double cashReceived = 0.0;

    @Column(name = "ChangeReturned", nullable = false)
    private Double changeReturned = 0.0;

    @Column(name = "TransactionRef")
    private String transactionRef;

    // Default constructor
    public Payment() {
    }

    // Payment ID
    public Integer getPaymentID() {
        return paymentID;
    }

    public void setPaymentID(Integer paymentID) {
        this.paymentID = paymentID;
    }

    // Bill ID
    public Integer getBillID() {
        return billID;
    }

    public void setBillID(Integer billID) {
        this.billID = billID;
    }

    // Payment date
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    // Payment amount
    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    // Payment method
    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    // Payment status
    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    // Cash received from customer
    public Double getCashReceived() {
        return cashReceived;
    }

    public void setCashReceived(Double cashReceived) {
        this.cashReceived = cashReceived;
    }

    // Change returned to customer
    public Double getChangeReturned() {
        return changeReturned;
    }

    public void setChangeReturned(Double changeReturned) {
        this.changeReturned = changeReturned;
    }

    // Transaction reference
    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }
}