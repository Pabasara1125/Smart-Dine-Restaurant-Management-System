CREATE TABLE PAYMENT (
                         PaymentID INT PRIMARY KEY AUTO_INCREMENT,
                         BillID INT NOT NULL,
                         PaymentDate DATETIME NOT NULL,
                         Amount DECIMAL(10,2) NOT NULL,
                         PaymentMethod VARCHAR(20) NOT NULL,
                         PaymentStatus VARCHAR(20) NOT NULL,
                         TransactionRef VARCHAR(100),

                         CONSTRAINT fk_payment_bill
                             FOREIGN KEY (BillID)
                                 REFERENCES BILL(BillID)
);