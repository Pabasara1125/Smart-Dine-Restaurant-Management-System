const API_BASE_URL = "http://localhost:8081/api";

/* =========================
   SECTION NAVIGATION
========================= */

function showSection(sectionId) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        section.style.display = "none";
    });

    document.getElementById(sectionId).style.display = "block";
}


/* =========================
   CREATE BILL
========================= */

document.getElementById("billForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const bill = {
        orderID: parseInt(document.getElementById("orderID").value),

        billDate: document.getElementById("billDate").value,

        subtotal: parseFloat(document.getElementById("subtotal").value),

        tax: parseFloat(document.getElementById("tax").value),

        discount: parseFloat(document.getElementById("discount").value),

        totalAmount: parseFloat(document.getElementById("totalAmount").value),

        billStatus: document.getElementById("billStatus").value
    };

    try {

        const response = await fetch(`${API_BASE_URL}/bills`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(bill)
        });

        if (!response.ok) {
            throw new Error("Failed to create bill");
        }

        const createdBill = await response.json();

        document.getElementById("billMessage").textContent =
            `Bill created successfully! Bill ID: ${createdBill.billID}`;

        document.getElementById("billForm").reset();

    } catch (error) {

        console.error(error);

        document.getElementById("billMessage").textContent =
            "Error creating bill. Please check the backend.";
    }
});


/* =========================
   CREATE PAYMENT
========================= */

document.getElementById("paymentForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const payment = {

        billID: parseInt(document.getElementById("paymentBillID").value),

        paymentDate: document.getElementById("paymentDate").value,

        amount: parseFloat(document.getElementById("paymentAmount").value),

        paymentMethod: document.getElementById("paymentMethod").value,

        paymentStatus: document.getElementById("paymentStatus").value,

        transactionRef: document.getElementById("transactionRef").value
    };

    try {

        const response = await fetch(`${API_BASE_URL}/payments`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payment)
        });

        if (!response.ok) {
            throw new Error("Failed to create payment");
        }

        const createdPayment = await response.json();

        document.getElementById("paymentMessage").textContent =
            `Payment created successfully! Payment ID: ${createdPayment.paymentID}`;

        document.getElementById("paymentForm").reset();

    } catch (error) {

        console.error(error);

        document.getElementById("paymentMessage").textContent =
            "Error creating payment. Please check the backend.";
    }
});


/* =========================
   LOAD ALL BILLS
========================= */

async function loadBills() {

    try {

        const response = await fetch(`${API_BASE_URL}/bills`);

        if (!response.ok) {
            throw new Error("Failed to load bills");
        }

        const bills = await response.json();

        const billList = document.getElementById("billList");

        if (bills.length === 0) {

            billList.innerHTML = "<p>No bills found.</p>";

            return;
        }

        let table = `
            <table>

                <tr>
                    <th>Bill ID</th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Subtotal</th>
                    <th>Tax</th>
                    <th>Discount</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
        `;

        bills.forEach(bill => {

            table += `
                <tr>
                    <td>${bill.billID}</td>
                    <td>${bill.orderID}</td>
                    <td>${bill.billDate}</td>
                    <td>${bill.subtotal}</td>
                    <td>${bill.tax}</td>
                    <td>${bill.discount}</td>
                    <td>${bill.totalAmount}</td>
                    <td>${bill.billStatus}</td>
                </tr>
            `;
        });

        table += "</table>";

        billList.innerHTML = table;

    } catch (error) {

        console.error(error);

        document.getElementById("billList").innerHTML =
            "<p>Unable to load bills. Please check the backend.</p>";
    }
}


/* =========================
   LOAD ALL PAYMENTS
========================= */

async function loadPayments() {

    try {

        const response = await fetch(`${API_BASE_URL}/payments`);

        if (!response.ok) {
            throw new Error("Failed to load payments");
        }

        const payments = await response.json();

        const paymentList = document.getElementById("paymentList");

        if (payments.length === 0) {

            paymentList.innerHTML = "<p>No payments found.</p>";

            return;
        }

        let table = `
            <table>

                <tr>
                    <th>Payment ID</th>
                    <th>Bill ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Transaction Ref</th>
                </tr>
        `;

        payments.forEach(payment => {

            table += `
                <tr>
                    <td>${payment.paymentID}</td>
                    <td>${payment.billID}</td>
                    <td>${payment.paymentDate}</td>
                    <td>${payment.amount}</td>
                    <td>${payment.paymentMethod}</td>
                    <td>${payment.paymentStatus}</td>
                    <td>${payment.transactionRef || "-"}</td>
                </tr>
            `;
        });

        table += "</table>";

        paymentList.innerHTML = table;

    } catch (error) {

        console.error(error);

        document.getElementById("paymentList").innerHTML =
            "<p>Unable to load payments. Please check the backend.</p>";
    }
}