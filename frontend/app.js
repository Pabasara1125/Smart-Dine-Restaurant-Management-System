const API_BASE = "http://localhost:8082/api";

let bills = [];
let payments = [];

const $ = (id) => document.getElementById(id);

const money = (value) =>
    "Rs " + Number(value || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const showMessage = (id, message, error = false) => {
    const element = $(id);
    if (!element) return;

    element.textContent = message;
    element.classList.toggle("error", error);
};

const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

const dateText = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? escapeHTML(value)
        : date.toLocaleString();
};

const billId = (bill) => bill.billID ?? bill.billId;
const orderId = (bill) => bill.orderID ?? bill.orderId;
const paymentId = (payment) => payment.paymentID ?? payment.paymentId;
const relatedBillId = (payment) => payment.billID ?? payment.billId;
const billAmount = (bill) => Number(bill.totalAmount ?? 0);
const paymentAmount = (payment) => Number(payment.amount ?? 0);

const paymentStatus = (payment) =>
    String(payment.paymentStatus ?? "").trim().toLowerCase();

const isSuccessful = (payment) =>
    ["success", "successful", "completed", "paid"].includes(paymentStatus(payment));

const isPending = (payment) =>
    ["pending", "processing"].includes(paymentStatus(payment));

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(
            `Request failed (${response.status})${details ? ": " + details : ""}`
        );
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// Load records from the Spring Boot backend.
async function loadData() {
    showMessage("dashboard-message", "Loading dashboard data...");

    try {
        const [billData, paymentData] = await Promise.all([
            apiRequest("/bills"),
            apiRequest("/payments")
        ]);

        bills = Array.isArray(billData) ? billData : [];
        payments = Array.isArray(paymentData) ? paymentData : [];

        renderDashboard();
        renderBills();
        renderPayments();
        renderReports();

        showMessage("dashboard-message", "Dashboard data updated successfully.");
        showMessage("bills-message", "");
        showMessage("payments-message", "");
        showMessage("reports-message", "");
    } catch (error) {
        console.error("Could not load dashboard data:", error);

        showMessage(
            "dashboard-message",
            "Could not load data. Check that your Spring Boot application is running on port 8082. " +
            error.message,
            true
        );

        showMessage("bills-message", error.message, true);
        showMessage("payments-message", error.message, true);
        showMessage("reports-message", error.message, true);
    }
}

// Dashboard summary cards and recent bills.
function renderDashboard() {
    $("total-bills").textContent = bills.length;

    const revenue = payments
        .filter(isSuccessful)
        .reduce((total, payment) => total + paymentAmount(payment), 0);

    $("total-revenue").textContent = money(revenue);

    $("successful-payments").textContent =
        payments.filter(isSuccessful).length;

    $("pending-payments").textContent =
        payments.filter(isPending).length;

    const recent = [...bills]
        .sort((a, b) => String(b.billDate ?? "").localeCompare(String(a.billDate ?? "")))
        .slice(0, 5);

    $("recent-bills").innerHTML = recent.length
        ? recent.map((bill) => `
<tr>
<td>#${escapeHTML(billId(bill))}</td>
<td>#${escapeHTML(orderId(bill))}</td>
<td>${money(billAmount(bill))}</td>
<td>${dateText(bill.billDate)}</td>
</tr>
`).join("")
        : '<tr><td colspan="4" class="empty-state">No bills found.</td></tr>';
}

// Display and search bills.
function renderBills() {
    const search = ($("bill-search").value || "").trim().toLowerCase();

    const filtered = bills.filter((bill) =>
        [billId(bill), orderId(bill), bill.billStatus]
            .some((value) => String(value ?? "").toLowerCase().includes(search))
    );

    $("bills-table").innerHTML = filtered.length
        ? filtered.map((bill) => `
<tr>
<td>#${escapeHTML(billId(bill))}</td>
<td>#${escapeHTML(orderId(bill))}</td>
<td>${money(bill.subtotal)}</td>
<td>${money(bill.tax)}</td>
<td>${money(bill.discount)}</td>
<td><strong>${money(billAmount(bill))}</strong></td>
<td>${dateText(bill.billDate)}</td>
</tr>
`).join("")
        : '<tr><td colspan="7" class="empty-state">No matching bills found.</td></tr>';
}

// Display and search payments.
function renderPayments() {
    const search = ($("payment-search").value || "").trim().toLowerCase();

    const filtered = payments.filter((payment) =>
        [
            paymentId(payment),
            relatedBillId(payment),
            payment.paymentMethod,
            payment.paymentStatus,
            payment.transactionRef
        ].some((value) => String(value ?? "").toLowerCase().includes(search))
    );

    $("payments-table").innerHTML = filtered.length
        ? filtered.map((payment) => `
<tr>
<td>#${escapeHTML(paymentId(payment))}</td>
<td>#${escapeHTML(relatedBillId(payment))}</td>
<td>${money(paymentAmount(payment))}</td>
<td>${escapeHTML(payment.paymentMethod || "—")}</td>
<td>${escapeHTML(payment.paymentStatus || "Unknown")}</td>
<td>${dateText(payment.paymentDate)}</td>
</tr>
`).join("")
        : '<tr><td colspan="6" class="empty-state">No matching payments found.</td></tr>';
}

// Summary report.
function renderReports() {
    $("report-bills").textContent = bills.length;
    $("report-successful").textContent =
        payments.filter(isSuccessful).length;
    $("report-pending").textContent =
        payments.filter(isPending).length;

    const revenue = payments
        .filter(isSuccessful)
        .reduce((total, payment) => total + paymentAmount(payment), 0);

    $("report-revenue").textContent = money(revenue);
}

// Navigation between dashboard pages.
const pageDetails = {
    dashboard: {
        title: "Dashboard Overview",
        description: "Manage bills and payments in one place."
    },
    bills: {
        title: "Billing Records",
        description: "Create bills and review existing billing records."
    },
    payments: {
        title: "Payment Management",
        description: "Review and record customer payments."
    },
    reports: {
        title: "Payment Reports",
        description: "Review billing and payment summaries."
    }
};

function navigateTo(page) {
    if (!pageDetails[page]) return;

    document.querySelectorAll(".page").forEach((section) => {
        section.classList.add("hidden");
    });

    $(`${page}-page`).classList.remove("hidden");

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    $("page-title").textContent = pageDetails[page].title;
    $("page-description").textContent = pageDetails[page].description;
}

document.querySelectorAll("[data-page]").forEach((element) => {
    element.addEventListener("click", (event) => {
        event.preventDefault();
        navigateTo(element.dataset.page);
    });
});

// Bill form controls.
$("show-bill-form").addEventListener("click", () => {
    $("bill-form").classList.remove("hidden");
});

$("cancel-bill").addEventListener("click", () => {
    $("bill-form").reset();
    $("bill-form").classList.add("hidden");
});

$("bill-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const subtotal = Number($("bill-subtotal").value);
    const tax = Number($("bill-tax").value);
    const discount = Number($("bill-discount").value);

    if (subtotal < 0 || tax < 0 || discount < 0 || discount > subtotal + tax) {
        showMessage("bills-message", "Check the subtotal, tax, and discount amounts.", true);
        return;
    }

    const bill = {
        orderID: Number($("bill-order-id").value),
        subtotal,
        tax,
        discount,
        totalAmount: subtotal + tax - discount,
        billDate: new Date().toISOString().slice(0, 19),
        billStatus: "Pending"
    };

    try {
        await apiRequest("/bills", {
            method: "POST",
            body: JSON.stringify(bill)
        });

        $("bill-form").reset();
        $("bill-form").classList.add("hidden");
        await loadData();
        showMessage("bills-message", "Bill created successfully.");
    } catch (error) {
        showMessage("bills-message", "Could not create bill: " + error.message, true);
    }
});

// Payment form controls.
$("show-payment-form").addEventListener("click", () => {
    $("payment-form").classList.remove("hidden");
});

$("cancel-payment").addEventListener("click", () => {
    $("payment-form").reset();
    $("payment-form").classList.add("hidden");
});

$("payment-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const amount = Number($("payment-amount").value);

    if (amount <= 0) {
        showMessage("payments-message", "Payment amount must be greater than zero.", true);
        return;
    }

    const payment = {
        billID: Number($("payment-bill-id").value),
        amount,
        paymentMethod: $("payment-method").value,
        paymentStatus: "Pending",
        paymentDate: new Date().toISOString().slice(0, 19),
        transactionRef: null
    };

    try {
        await apiRequest("/payments", {
            method: "POST",
            body: JSON.stringify(payment)
        });

        $("payment-form").reset();
        $("payment-form").classList.add("hidden");
        await loadData();
        showMessage("payments-message", "Payment recorded successfully.");
    } catch (error) {
        showMessage("payments-message", "Could not record payment: " + error.message, true);
    }
});

// Search fields.
$("bill-search").addEventListener("input", renderBills);
$("payment-search").addEventListener("input", renderPayments);

// Refresh buttons.
$("refresh-btn").addEventListener("click", loadData);
$("report-refresh").addEventListener("click", loadData);

// Start on the dashboard and load the backend data.
navigateTo("dashboard");
loadData();