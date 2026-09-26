CREATE TABLE BILL (
                      BillID INT PRIMARY KEY AUTO_INCREMENT,
                      OrderID INT NOT NULL,
                      BillDate DATETIME NOT NULL,
                      Subtotal DECIMAL(10,2) NOT NULL,
                      Tax DECIMAL(10,2) DEFAULT 0.00,
                      Discount DECIMAL(10,2) DEFAULT 0.00,
                      TotalAmount DECIMAL(10,2) NOT NULL,
                      BillStatus VARCHAR(20) NOT NULL,

                      CONSTRAINT fk_bill_order
                          FOREIGN KEY (OrderID)
                              REFERENCES CUSTOMER_ORDER(OrderID)
);