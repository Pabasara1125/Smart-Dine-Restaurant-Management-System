const API_BASE = "http://localhost:8081/api";

let customers = [];
let reservations = [];
let tables = [];
let menuItems = [];
let orders = [];

// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    setupBillingPreview();

    document.getElementById("paymentBillId")
        ?.addEventListener("change", updatePaymentPreview);

    document.getElementById("paymentAmount")
        ?.addEventListener("input", updatePaymentPreview);

    document.getElementById("paymentCashReceived")
        ?.addEventListener("input", updatePaymentPreview);

    document.getElementById("paymentMethod")
        ?.addEventListener("change", updatePaymentPreview);

    await Promise.allSettled([
        loadCustomers(),
        loadReservations(),
        loadTables(),
        loadMenuItems(),
        loadOrders(),
        loadBills(),
        loadPayments(),
        loadEmployees(),
        loadSuppliers(),
        loadInventory()
    ]);

    document.getElementById("customerSearch")
        ?.addEventListener("input", renderCustomers);
});

// ==========================================
// NAVIGATION
// ==========================================

function showSection(sectionName) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active-section");
    });

    const selectedSection = document.getElementById(sectionName);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    const navigationMap = {
        dashboard: "Dashboard",
        customers: "Customers",
        reservations: "Reservations",
        tables: "Restaurant Tables",
        menu: "Menu Management",
        orders: "Order Management",
        employees: "Employee Management",
        suppliers: "Supplier Management",
        inventory: "Inventory Management",
        billing: "Billing Management",
        payments: "Payment Management"
    };

    const expectedLabel = navigationMap[sectionName];

    document.querySelectorAll(".nav-btn").forEach(button => {
        if (button.textContent.trim().includes(expectedLabel || "")) {
            button.classList.add("active");
        }
    });

    const titles = {
        dashboard: "Dashboard",
        customers: "Customer Management",
        reservations: "Reservation Management",
        tables: "Restaurant Tables",
        menu: "Menu Management",
        orders: "Order Management",
        employees: "Employee Management",
        suppliers: "Supplier Management",
        inventory: "Inventory Management",
        billing: "Billing Management",
        payments: "Payment Management"
    };

    const pageTitle = document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent = titles[sectionName] || "Smart Dine";
    }
}

// ==========================================
// NOTIFICATION
// ==========================================

function showNotification(message) {
    const notification = document.getElementById("notification");

    if (!notification) {
        alert(message);
        return;
    }

    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}

// ==========================================
// HTML ESCAPING
// ==========================================

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// ==========================================
// CUSTOMERS
// ==========================================

async function loadCustomers() {
    try {
        const response = await fetch(`${API_BASE}/customers`);

        if (!response.ok) {
            throw new Error("Unable to load customers");
        }

        customers = await response.json();

        renderCustomers();
        updateDashboard();
        populateCustomerDropdown();
        populateOrderCustomerDropdown();

    } catch (error) {
        console.error("Error loading customers:", error);
        showNotification("Could not load customers.");
    }
}

function renderCustomers() {
    const tbody = document.getElementById("customerTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const searchInput = document.getElementById("customerSearch");

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const filteredCustomers = customers.filter(customer => {
        const name = String(customer.name || "").toLowerCase();
        const phone = String(customer.phone || "").toLowerCase();
        const email = String(customer.email || "").toLowerCase();

        return (
            name.includes(searchText) ||
            phone.includes(searchText) ||
            email.includes(searchText)
        );
    });

    if (filteredCustomers.length === 0) {
        const message = searchText
            ? "No matching customers found."
            : "No customers found.";

        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    ${message}
                </td>
            </tr>
        `;

        return;
    }

    filteredCustomers.forEach(customer => {
        const customerId = Number(
            customer.customerId ?? customer.id
        );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${customerId}</td>

            <td>
                <strong>${escapeHtml(customer.name || "")}</strong>
            </td>

            <td>${escapeHtml(customer.phone || "")}</td>

            <td>${escapeHtml(customer.email || "")}</td>

            <td>${escapeHtml(customer.address || "")}</td>

            <td>
                <button
                    type="button"
                    class="action-btn edit-btn"
                    onclick="editCustomer(${customerId})">
                    Edit
                </button>

                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteCustomer(${customerId})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// CUSTOMER MODAL
// ==========================================

function openCustomerModal(customer = null) {
    const modal = document.getElementById("customerModal");
    const form = document.getElementById("customerForm");

    if (!modal || !form) return;

    form.reset();

    modal.classList.add("show");

    if (customer) {
        document.getElementById("customerModalTitle").textContent =
            "Edit Customer";

        document.getElementById("customerId").value =
            customer.customerId ?? customer.id ?? "";

        document.getElementById("customerName").value =
            customer.name || "";

        document.getElementById("customerPhone").value =
            customer.phone || "";

        document.getElementById("customerEmail").value =
            customer.email || "";

        document.getElementById("customerAddress").value =
            customer.address || "";

    } else {
        document.getElementById("customerModalTitle").textContent =
            "Add Customer";

        document.getElementById("customerId").value = "";
    }
}

function closeCustomerModal() {
    document.getElementById("customerModal")
        ?.classList.remove("show");
}

function editCustomer(customerId) {
    const customer = customers.find(item =>
        Number(item.customerId ?? item.id) === Number(customerId)
    );

    if (!customer) {
        showNotification("Customer not found.");
        return;
    }

    openCustomerModal(customer);
}

// ==========================================
// SAVE CUSTOMER
// ==========================================

document.getElementById("customerForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const customerId =
            document.getElementById("customerId").value;

        const name =
            document.getElementById("customerName").value.trim();

        const phone =
            document.getElementById("customerPhone").value.trim();

        const email =
            document.getElementById("customerEmail").value.trim();

        const address =
            document.getElementById("customerAddress").value.trim();

        if (!name || !phone) {
            showNotification("Customer name and phone are required.");
            return;
        }

        const customer = {
            name,
            phone,
            email,
            address
        };

        const url = customerId
            ? `${API_BASE}/customers/${customerId}`
            : `${API_BASE}/customers`;

        const method = customerId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(customer)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to save customer"
                );
            }

            closeCustomerModal();

            await loadCustomers();

            showNotification(
                customerId
                    ? "Customer updated successfully."
                    : "Customer added successfully."
            );

        } catch (error) {
            console.error("Error saving customer:", error);

            showNotification(
                error.message || "Could not save customer."
            );
        }
    });

// ==========================================
// DELETE CUSTOMER
// ==========================================

async function deleteCustomer(customerId) {
    if (!confirm("Are you sure you want to delete this customer?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/customers/${customerId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete customer");
        }

        await loadCustomers();

        showNotification("Customer deleted successfully.");

    } catch (error) {
        console.error("Error deleting customer:", error);

        showNotification(
            "Could not delete customer. Check whether related records exist."
        );
    }
}

// ==========================================
// CUSTOMER DROPDOWNS
// ==========================================

function populateCustomerDropdown() {
    const select = document.getElementById("reservationCustomer");

    if (!select) return;

    const previousValue = select.value;

    select.innerHTML = `
        <option value="">Select customer</option>
    `;

    customers.forEach(customer => {
        const id = customer.customerId ?? customer.id;

        const option = document.createElement("option");

        option.value = id;
        option.textContent = customer.name || `Customer ${id}`;

        select.appendChild(option);
    });

    if (previousValue) {
        select.value = previousValue;
    }
}

function populateOrderCustomerDropdown() {
    const select = document.getElementById("orderCustomer");

    if (!select) return;

    const previousValue = select.value;

    select.innerHTML = `
        <option value="">Select Customer</option>
    `;

    customers.forEach(customer => {
        const id = customer.customerId ?? customer.id;

        const option = document.createElement("option");

        option.value = id;
        option.textContent = customer.name || `Customer ${id}`;

        select.appendChild(option);
    });

    if (previousValue) {
        select.value = previousValue;
    }
}
// ==========================================
// RESERVATIONS
// ==========================================

async function loadReservations() {
    try {
        const response = await fetch(`${API_BASE}/reservations`);

        if (!response.ok) {
            throw new Error("Unable to load reservations");
        }

        reservations = await response.json();

        renderReservations();
        renderRecentReservations();
        updateDashboard();

    } catch (error) {
        console.error("Error loading reservations:", error);
        showNotification("Could not load reservations.");
    }
}

function renderReservations() {
    const tbody = document.getElementById("reservationTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (reservations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No reservations found.
                </td>
            </tr>
        `;
        return;
    }

    reservations.forEach(reservation => {
        const id = reservation.reservationId ?? reservation.id;

        const customer = customers.find(item =>
            Number(item.customerId ?? item.id) ===
            Number(reservation.customerId ?? reservation.customer?.customerId)
        );

        const customerName =
            reservation.customerName ||
            reservation.customer?.name ||
            customer?.name ||
            "Customer";

        const dateValue =
            reservation.reservationDate ??
            reservation.date ??
            "";

        const timeValue =
            reservation.reservationTime ??
            reservation.time ??
            "";

        const guests =
            reservation.numberOfGuests ??
            reservation.guests ??
            reservation.guestCount ??
            "";

        const tableId =
            reservation.tableId ??
            reservation.restaurantTable?.tableId ??
            reservation.restaurantTable?.id ??
            "";

        const status = reservation.status || "Pending";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(id)}</td>
            <td>${escapeHtml(customerName)}</td>
            <td>${escapeHtml(formatDate(dateValue))}</td>
            <td>${escapeHtml(formatTime(timeValue))}</td>
            <td>${escapeHtml(guests)}</td>
            <td>${escapeHtml(tableId || "Not assigned")}</td>
            <td>
                <span class="status-badge">
                    ${escapeHtml(status)}
                </span>
            </td>
            <td>
                <button
                    type="button"
                    class="action-btn edit-btn"
                    onclick="editReservation(${Number(id)})">
                    Edit
                </button>

                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteReservation(${Number(id)})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// RECENT RESERVATIONS
// ==========================================

function renderRecentReservations() {
    const container = document.getElementById("recentReservations");

    if (!container) return;

    if (reservations.length === 0) {
        container.innerHTML = "<p>No recent reservations.</p>";
        return;
    }

    const recent = [...reservations]
        .sort((a, b) => {
            const dateA = new Date(
                a.reservationDate ?? a.date ?? 0
            ).getTime();

            const dateB = new Date(
                b.reservationDate ?? b.date ?? 0
            ).getTime();

            return dateB - dateA;
        })
        .slice(0, 5);

    container.innerHTML = recent.map(reservation => {
        const customer = customers.find(item =>
            Number(item.customerId ?? item.id) ===
            Number(reservation.customerId ?? reservation.customer?.customerId)
        );

        const customerName =
            reservation.customerName ||
            reservation.customer?.name ||
            customer?.name ||
            "Customer";

        return `
            <div class="recent-reservation-item">
                <strong>${escapeHtml(customerName)}</strong>
                <span>
                    ${escapeHtml(formatDate(
                        reservation.reservationDate ??
                        reservation.date ??
                        ""
                    ))}
                </span>
            </div>
        `;
    }).join("");
}

// ==========================================
// RESERVATION MODAL
// ==========================================

function openReservationModal(reservation = null) {
    const modal = document.getElementById("reservationModal");
    const form = document.getElementById("reservationForm");

    if (!modal || !form) return;

    form.reset();

    modal.classList.add("show");

    populateCustomerDropdown();
    populateReservationTableDropdown();

    const title = document.getElementById("reservationModalTitle");

    if (reservation) {
        if (title) title.textContent = "Edit Reservation";

        document.getElementById("reservationId").value =
            reservation.reservationId ?? reservation.id ?? "";

        document.getElementById("reservationCustomer").value =
            reservation.customerId ??
            reservation.customer?.customerId ??
            "";

        document.getElementById("reservationTable").value =
            reservation.tableId ??
            reservation.restaurantTable?.tableId ??
            reservation.restaurantTable?.id ??
            "";

        document.getElementById("reservationDate").value =
            getDateInputValue(
                reservation.reservationDate ?? reservation.date
            );

        document.getElementById("reservationTime").value =
            getTimeInputValue(
                reservation.reservationTime ?? reservation.time
            );

        document.getElementById("reservationGuests").value =
            reservation.numberOfGuests ??
            reservation.guests ??
            reservation.guestCount ??
            1;

        document.getElementById("reservationStatus").value =
            reservation.status || "Pending";

    } else {
        if (title) title.textContent = "New Reservation";

        document.getElementById("reservationId").value = "";

        document.getElementById("reservationGuests").value = 1;

        document.getElementById("reservationStatus").value = "Pending";
    }
}

function closeReservationModal() {
    document.getElementById("reservationModal")
        ?.classList.remove("show");
}

function editReservation(reservationId) {
    const reservation = reservations.find(item =>
        Number(item.reservationId ?? item.id) ===
        Number(reservationId)
    );

    if (!reservation) {
        showNotification("Reservation not found.");
        return;
    }

    openReservationModal(reservation);
}

// ==========================================
// SAVE RESERVATION
// ==========================================

document.getElementById("reservationForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const reservationId =
            document.getElementById("reservationId").value;

        const customerId =
            document.getElementById("reservationCustomer").value;

        const tableId =
            document.getElementById("reservationTable").value;

        const reservationDate =
            document.getElementById("reservationDate").value;

        const reservationTime =
            document.getElementById("reservationTime").value;

        const numberOfGuests =
            Number(document.getElementById("reservationGuests").value);

        const status =
            document.getElementById("reservationStatus").value;

        if (!customerId || !tableId || !reservationDate ||
            !reservationTime || numberOfGuests < 1) {
            showNotification("Please complete all required fields.");
            return;
        }

        const selectedDateTime = new Date(
            `${reservationDate}T${reservationTime}`
        );

       if (Number.isNaN(selectedDateTime.getTime())) {
    showNotification("Enter a valid reservation date and time.");
    return;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const selectedDate = new Date(`${reservationDate}T00:00:00`);

if (selectedDate < today) {
    showNotification("Cannot make a reservation for a past date.");
    return;
}

if (selectedDateTime < new Date()) {
    showNotification("Please select a future reservation time.");
    return;
}

       const reservation = {
    date: reservationDate,
    time: reservationTime,
    noOfGuests: numberOfGuests,
    status: status,
    customer: {
        customerId: Number(customerId)
    },
    restaurantTable: {
        tableId: Number(tableId)
    }
};

        const url = reservationId
            ? `${API_BASE}/reservations/${reservationId}`
            : `${API_BASE}/reservations`;

        const method = reservationId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reservation)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to save reservation"
                );
            }

            closeReservationModal();

            await loadReservations();

            showNotification(
                reservationId
                    ? "Reservation updated successfully."
                    : "Reservation created successfully."
            );

        } catch (error) {
            console.error("Error saving reservation:", error);

            showNotification(
                error.message || "Could not save reservation."
            );
        }
    });

// ==========================================
// DELETE RESERVATION
// ==========================================

async function deleteReservation(reservationId) {
    if (!confirm("Are you sure you want to delete this reservation?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/reservations/${reservationId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete reservation");
        }

        await loadReservations();

        showNotification("Reservation deleted successfully.");

    } catch (error) {
        console.error("Error deleting reservation:", error);

        showNotification(
            "Could not delete reservation. Check whether related records exist."
        );
    }
}

// ==========================================
// RESTAURANT TABLES
// ==========================================

async function loadTables() {
    try {
        const response = await fetch(`${API_BASE}/tables`);

        if (!response.ok) {
            throw new Error("Unable to load restaurant tables");
        }

        tables = await response.json();

        renderTables();
        populateReservationTableDropdown();
        updateDashboard();

    } catch (error) {
        console.error("Error loading tables:", error);
        showNotification("Could not load restaurant tables.");
    }
}

function renderTables() {
    const container = document.getElementById("tableCards");

    if (!container) return;

    container.innerHTML = "";

    if (tables.length === 0) {
        container.innerHTML = "<p>No restaurant tables found.</p>";
        return;
    }

    tables.forEach(table => {
        const id = table.tableId ?? table.id;

        const tableNumber =
            table.tableNumber ??
            table.number ??
            id;

        const capacity =
            table.capacity ??
            table.seatingCapacity ??
            table.numberOfSeats ??
            "N/A";

        const status =
            table.status ??
            table.tableStatus ??
            "Available";

        const card = document.createElement("div");

        card.className = "table-card";

        card.innerHTML = `
            <div class="table-card-icon">🪑</div>

            <h3>Table ${escapeHtml(tableNumber)}</h3>

            <p>
                Capacity:
                ${escapeHtml(capacity)}
            </p>

            <span class="status-badge">
                ${escapeHtml(status)}
            </span>
        `;

        container.appendChild(card);
    });
}

// ==========================================
// RESERVATION TABLE DROPDOWN
// ==========================================

function populateReservationTableDropdown() {
    const select = document.getElementById("reservationTable");

    if (!select) return;

    const previousValue = select.value;

    select.innerHTML = `
        <option value="">Select table</option>
    `;

    tables.forEach(table => {
        const id = table.tableId ?? table.id;

        const tableNumber =
            table.tableNumber ??
            table.number ??
            id;

        const capacity =
            table.capacity ??
            table.seatingCapacity ??
            table.numberOfSeats ??
            "";

        const option = document.createElement("option");

        option.value = id;

        option.textContent =
            `Table ${tableNumber}` +
            (capacity ? ` (Capacity: ${capacity})` : "");

        select.appendChild(option);
    });

    if (previousValue) {
        select.value = previousValue;
    }
}

// ==========================================
// DATE AND TIME FORMATTING
// ==========================================

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString();
}

function formatTime(value) {
    if (!value) return "";

    const text = String(value);

    if (/^\d{2}:\d{2}:\d{2}$/.test(text)) {
        return text.substring(0, 5);
    }

    if (/^\d{2}:\d{2}$/.test(text)) {
        return text;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return text;
    }

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getDateInputValue(value) {
    if (!value) return "";

    if (typeof value === "string") {
        const match = value.match(/^\d{4}-\d{2}-\d{2}/);

        if (match) return match[0];
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function getTimeInputValue(value) {
    if (!value) return "";

    const text = String(value);

    const match = text.match(/(\d{2}:\d{2})/);

    return match ? match[1] : "";
}
// ==========================================
// MENU MANAGEMENT
// ==========================================

async function loadMenuItems() {
    try {
        const response = await fetch(`${API_BASE}/menu`);

        if (!response.ok) {
            throw new Error("Unable to load menu items");
        }

        menuItems = await response.json();

        renderMenuItems();
        populateOrderMenuDropdown();

    } catch (error) {
        console.error("Error loading menu items:", error);
        showNotification("Could not load menu items.");
    }
}

// ==========================================
// RENDER MENU ITEMS
// ==========================================

function renderMenuItems() {
    const tbody = document.getElementById("menuTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (menuItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No menu items found.
                </td>
            </tr>
        `;
        return;
    }

    menuItems.forEach(item => {
        const id = item.menuItemId ?? item.id;

        const available =
            item.available === true ||
            String(item.available).toLowerCase() === "true";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(id)}</td>
            <td>${escapeHtml(item.name ?? item.itemName ?? "")}</td>
            <td>${escapeHtml(item.category ?? "")}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>
                <span class="status-badge">
                    ${available ? "Available" : "Unavailable"}
                </span>
            </td>
            <td>
                <button
                    type="button"
                    class="action-btn edit-btn"
                    onclick="editMenuItem(${Number(id)})">
                    Edit
                </button>

                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteMenuItem(${Number(id)})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// MENU ITEM FORM
// ==========================================

function openMenuForm(item = null) {
    const formCard = document.getElementById("menuFormCard");
    const form = document.getElementById("menuForm");

    if (!formCard || !form) return;

    form.reset();

    formCard.style.display = "block";

    if (item) {
        document.getElementById("menuFormTitle").textContent =
            "Edit Menu Item";

        document.getElementById("menuItemId").value =
            item.menuItemId ?? item.id ?? "";

        document.getElementById("menuName").value =
            item.name ?? item.itemName ?? "";

        document.getElementById("menuCategory").value =
            item.category ?? "";

        document.getElementById("menuPrice").value =
            item.price ?? "";

        document.getElementById("menuAvailable").value =
            String(item.available ?? true);

    } else {
        document.getElementById("menuFormTitle").textContent =
            "Add Menu Item";

        document.getElementById("menuItemId").value = "";
        document.getElementById("menuAvailable").value = "true";
    }

    formCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeMenuForm() {
    const formCard = document.getElementById("menuFormCard");

    if (formCard) {
        formCard.style.display = "none";
    }

    document.getElementById("menuForm")?.reset();
}

// ==========================================
// EDIT MENU ITEM
// ==========================================

function editMenuItem(itemId) {
    const item = menuItems.find(menuItem =>
        Number(menuItem.menuItemId ?? menuItem.id) ===
        Number(itemId)
    );

    if (!item) {
        showNotification("Menu item not found.");
        return;
    }

    openMenuForm(item);
}

// ==========================================
// SAVE MENU ITEM
// ==========================================

document.getElementById("menuForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const itemId =
            document.getElementById("menuItemId").value;

        const name =
            document.getElementById("menuName").value.trim();

        const category =
            document.getElementById("menuCategory").value;

        const price =
            Number(document.getElementById("menuPrice").value);

        const available =
            document.getElementById("menuAvailable").value === "true";

        if (!name || !category || !Number.isFinite(price) || price <= 0) {
            showNotification(
                "Enter a valid item name, category, and price."
            );
            return;
        }

        const menuItem = {
            name,
            category,
            price,
            available
        };

        const url = itemId
            ? `${API_BASE}/menu/${itemId}`
            : `${API_BASE}/menu`;

        const method = itemId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(menuItem)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to save menu item"
                );
            }

            closeMenuForm();

            await loadMenuItems();

            showNotification(
                itemId
                    ? "Menu item updated successfully."
                    : "Menu item added successfully."
            );

        } catch (error) {
            console.error("Error saving menu item:", error);

            showNotification(
                error.message || "Could not save menu item."
            );
        }
    });

// ==========================================
// DELETE MENU ITEM
// ==========================================

async function deleteMenuItem(itemId) {
    if (!confirm("Are you sure you want to delete this menu item?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/menu/${itemId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete menu item");
        }

        await loadMenuItems();

        showNotification("Menu item deleted successfully.");

    } catch (error) {
        console.error("Error deleting menu item:", error);

        showNotification(
            "Could not delete this menu item. It may be linked to an existing order."
        );
    }
}

// ==========================================
// ORDER MENU DROPDOWN
// ==========================================

function populateOrderMenuDropdown() {
    const select = document.getElementById("orderMenuItems");

    if (!select) return;

    const previousValues = Array.from(select.selectedOptions)
        .map(option => option.value);

    select.innerHTML = "";

    const availableItems = menuItems.filter(item =>
        item.available === true ||
        String(item.available).toLowerCase() === "true"
    );

    if (availableItems.length === 0) {
        const option = document.createElement("option");

        option.value = "";
        option.textContent = "No available menu items";
        option.disabled = true;

        select.appendChild(option);

        return;
    }

    availableItems.forEach(item => {
        const id = item.menuItemId ?? item.id;

        const name = item.name ?? item.itemName ?? "Menu Item";

        const option = document.createElement("option");

        option.value = id;

        option.textContent =
            `${name} — ${formatCurrency(item.price)}`;

        if (previousValues.includes(String(id))) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

// ==========================================
// SHARED CURRENCY FORMATTER
// ==========================================

function formatCurrency(value) {
    const amount = Number(value ?? 0);

    return "Rs. " + (
        Number.isFinite(amount) ? amount : 0
    ).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
// ==========================================
// ORDER MANAGEMENT
// ==========================================

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);

        if (!response.ok) {
            throw new Error("Unable to load orders");
        }

        orders = await response.json();

        renderOrders();

        // Refresh the billing dropdown using the latest orders.
        populateBillingOrderDropdown();

        updateDashboard();

    } catch (error) {
        console.error("Error loading orders:", error);
        showNotification("Could not load orders.");
    }
}

// ==========================================
// RENDER ORDERS
// ==========================================

function renderOrders() {
    const tbody = document.getElementById("orderTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No orders found.
                </td>
            </tr>
        `;
        return;
    }

    orders.forEach(order => {
        const orderId = order.orderId ?? order.id;

        const customerName =
            order.customerName ||
            order.customer?.name ||
            "Customer";

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        const itemNames = items.map(item =>
            item.name ?? item.itemName ?? "Menu Item"
        );

        const status = order.status || "PENDING";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(orderId)}</td>

            <td>${escapeHtml(customerName)}</td>

            <td>${escapeHtml(
                itemNames.length > 0
                    ? itemNames.join(", ")
                    : "No items"
            )}</td>

            <td>
                <select
                    id="orderStatus-${Number(orderId)}"
                    aria-label="Order status">
                    ${[
                        "PENDING",
                        "PREPARING",
                        "READY",
                        "COMPLETED",
                        "CANCELLED"
                    ].map(option => `
                        <option
                            value="${option}"
                            ${String(status).toUpperCase() === option
                                ? "selected"
                                : ""}>
                            ${option.replaceAll("_", " ")}
                        </option>
                    `).join("")}
                </select>
            </td>

            <td>
                <button
                    type="button"
                    class="action-btn edit-btn"
                    onclick="saveOrderStatus(${Number(orderId)})">
                    Update Status
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// CREATE ORDER
// ==========================================

document.getElementById("orderForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const customerId =
            document.getElementById("orderCustomer").value;

        const menuSelect =
            document.getElementById("orderMenuItems");

        const selectedMenuIds = Array.from(
            menuSelect.selectedOptions
        )
            .filter(option => option.value !== "")
            .map(option => Number(option.value));

        const status =
            document.getElementById("orderStatus").value;

        if (!customerId) {
            showNotification("Please select a customer.");
            return;
        }

        if (selectedMenuIds.length === 0) {
            showNotification("Please select at least one menu item.");
            return;
        }

        /*
         * IMPORTANT:
         * This request structure must match your OrderController.
         * It assumes the backend accepts customerId and itemIds.
         */

        const selectedCustomer = customers.find(customer =>
    Number(customer.customerId ?? customer.id) === Number(customerId)
);

if (!selectedCustomer) {
    showNotification("Please select a valid customer.");
    return;
}

const orderPayload = {
    customerName: selectedCustomer.name,
    menuItemIds: selectedMenuIds,
    status: status
};

        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to create order"
                );
            }

            const savedOrder = await response.json();

            document.getElementById("orderForm").reset();

            await loadOrders();

            showNotification("Order created successfully.");

            /*
             * If the backend returns the saved order as COMPLETED,
             * create a bill if one does not already exist.
             */
           

        } catch (error) {
            console.error("Error creating order:", error);

            showNotification(
                error.message || "Could not create order."
            );
        }
    });

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function saveOrderStatus(orderId) {
    const statusSelect = document.getElementById(
        `orderStatus-${orderId}`
    );

    if (!statusSelect) {
        showNotification("Order status field not found.");
        return;
    }

    const newStatus = statusSelect.value;

    const currentOrder = orders.find(order =>
        Number(order.orderId ?? order.id) === Number(orderId)
    );

    if (!currentOrder) {
        showNotification("Order not found.");
        return;
    }

    const previousStatus = String(
        currentOrder.status || ""
    ).toUpperCase();

    try {
        const response = await fetch(
            `${API_BASE}/orders/${orderId}/status?status=${encodeURIComponent(newStatus)}`,
            {
                method: "PUT"
            }
        );

               if (
            newStatus.toUpperCase() === "COMPLETED" &&
            previousStatus !== "COMPLETED"
        ) {
            const updatedOrder = orders.find(order =>
                Number(order.orderId ?? order.id) === Number(orderId)
            );

            if (updatedOrder) {
                await loadBills();
                populateBillingOrderDropdown();

                showNotification(
                    "Order status updated successfully. You can now create its bill in Billing Management."
                );
            } else {
                showNotification(
                    "Order updated, but its details could not be reloaded."
                );
            }
        } else {
            showNotification("Order status updated successfully.");
        }

    } catch (error) {
        console.error("Error updating order status:", error);

        showNotification(
            error.message || "Could not update order status."
        );

        await loadOrders();
    }
}
     
// ==========================================
// CREATE BILL FOR COMPLETED ORDER
// ==========================================

async function createBillForCompletedOrder(order) {
    const orderId = Number(order.orderId ?? order.id);

    if (!Number.isFinite(orderId)) {
        showNotification("Cannot create a bill: invalid Order ID.");
        return;
    }

    /*
     * Always refresh bills before checking for duplicates.
     */
    try {
        const response = await fetch(`${API_BASE}/bills`);

        if (!response.ok) {
            throw new Error("Unable to verify existing bills.");
        }

        bills = await response.json();

    } catch (error) {
        console.error("Error checking existing bills:", error);

        showNotification(
            "Order completed, but existing bills could not be checked."
        );

        return;
    }

    const existingBill = bills.find(bill =>
        Number(bill.orderID ?? bill.orderId) === orderId
    );

    if (existingBill) {
        showNotification(
            `Order ${orderId} is completed. Its bill already exists.`
        );

        return;
    }

    const subtotal = calculateOrderSubtotal(order);

    if (!Number.isFinite(subtotal) || subtotal < 0) {
        showNotification("Could not calculate the order subtotal.");
        return;
    }

    const billPayload = {
        orderID: orderId,
        billDate: new Date().toISOString().slice(0, 19),
        subtotal,
        tax: 0,
        discount: 0,
        totalAmount: subtotal,
        billStatus: "UNPAID"
    };

    try {
        const response = await fetch(`${API_BASE}/bills`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(billPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                errorText || "Unable to create bill"
            );
        }

        await loadBills();

        showNotification(
            `Bill created successfully for Order ${orderId}.`
        );

    } catch (error) {
        console.error("Error creating bill:", error);

        showNotification(
            error.message ||
            "Order completed, but its bill could not be created."
        );
    }
}

// ==========================================
// CALCULATE ORDER SUBTOTAL
// ==========================================

function calculateOrderSubtotal(order) {
    const items = Array.isArray(order.items)
        ? order.items
        : [];

    return items.reduce((total, orderItem) => {
        /*
         * The current project stores menu items in order.items.
         * Each item contributes its price once.
         */
        const itemId =
            orderItem.menuItemId ??
            orderItem.id;

        const menuItem = menuItems.find(item =>
            Number(item.menuItemId ?? item.id) === Number(itemId)
        );

        const price = Number(
            orderItem.price ??
            menuItem?.price ??
            0
        );

        return total + (
            Number.isFinite(price) && price > 0
                ? price
                : 0
        );
    }, 0);
}

// ==========================================
// BILLING ORDER DROPDOWN
// ==========================================

function populateBillingOrderDropdown() {
    const select = document.getElementById("billOrderId");

    if (!select) return;

    const previousValue = select.value;

    select.innerHTML = `
        <option value="">Select a completed order</option>
    `;

    const completedOrders = orders.filter(order =>
        String(order.status || "").toUpperCase() === "COMPLETED"
    );
    console.log("Orders loaded:", orders);
console.log("Completed orders:", completedOrders);
console.log("Bills loaded:", bills);

    completedOrders.forEach(order => {
        const orderId = order.orderId ?? order.id;

        /*
         * Orders that already have a bill must not be offered again.
         */
        const alreadyBilled = bills.some(bill =>
            Number(bill.orderID ?? bill.orderId) === Number(orderId)
        );

        if (alreadyBilled) return;

        const option = document.createElement("option");

        option.value = orderId;

        option.textContent =
            `Order ${orderId} — ${escapeHtml(
                order.customerName || order.customer?.name || "Customer"
            )}`;

        select.appendChild(option);
    });

    if (
        previousValue &&
        Array.from(select.options).some(
            option => option.value === previousValue
        )
    ) {
        select.value = previousValue;
    }
}
// ==========================================
// EMPLOYEE MANAGEMENT
// ==========================================

let employees = [];

// ==========================================
// LOAD EMPLOYEES
// ==========================================

async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE}/employees`);

        if (!response.ok) {
            throw new Error("Unable to load employees");
        }

        employees = await response.json();

        renderEmployees();

    } catch (error) {
        console.error("Error loading employees:", error);
        showNotification("Could not load employees.");
    }
}

// ==========================================
// DISPLAY EMPLOYEES
// ==========================================

function renderEmployees() {
    const tbody = document.getElementById("employeeTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (employees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No employees found.
                </td>
            </tr>
        `;
        return;
    }

    employees.forEach(employee => {
        const id =
            employee.employeeId ??
            employee.id;

        const name =
            employee.employeeName ??
            employee.name ??
            "";

        const phone =
            employee.phone ??
            employee.phoneNumber ??
            "";

        const role =
            employee.role ??
            employee.position ??
            "";

        const email =
            employee.email ??
            "";

        const hireDate =
            employee.hireDate ??
            employee.dateHired ??
            "";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(id)}</td>
            <td>${escapeHtml(name)}</td>
            <td>${escapeHtml(phone)}</td>
            <td>${escapeHtml(role)}</td>
            <td>${escapeHtml(email)}</td>
            <td>${escapeHtml(formatDate(hireDate))}</td>
            <td>
                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteEmployee(${Number(id)})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// ADD EMPLOYEE
// ==========================================

document.getElementById("employeeForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const employeeName =
            document.getElementById("employeeName").value.trim();

        const phone =
            document.getElementById("employeePhone").value.trim();

        const role =
            document.getElementById("employeeRole").value;

        const email =
            document.getElementById("employeeEmail").value.trim();

        if (!employeeName || !phone || !role) {
            showNotification(
                "Employee name, phone, and role are required."
            );
            return;
        }

       const employee = {
    name: employeeName,
    phone: phone,
    role: role,
    email: email
};

        try {
            const response = await fetch(`${API_BASE}/employees`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employee)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to add employee"
                );
            }

            document.getElementById("employeeForm").reset();

            await loadEmployees();

            showNotification("Employee added successfully.");

        } catch (error) {
            console.error("Error adding employee:", error);

            showNotification(
                error.message || "Could not add employee."
            );
        }
    });

// ==========================================
// DELETE EMPLOYEE
// ==========================================

async function deleteEmployee(employeeId) {
    if (!confirm("Are you sure you want to delete this employee?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/employees/${employeeId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete employee");
        }

        await loadEmployees();

        showNotification("Employee deleted successfully.");

    } catch (error) {
        console.error("Error deleting employee:", error);

        showNotification(
            "Could not delete employee. Check whether related records exist."
        );
    }
}
// ==========================================
// SUPPLIER MANAGEMENT
// ==========================================

let suppliers = [];

// ==========================================
// LOAD SUPPLIERS
// ==========================================

async function loadSuppliers() {
    try {
        const response = await fetch(`${API_BASE}/suppliers`);

        if (!response.ok) {
            throw new Error("Unable to load suppliers");
        }

        suppliers = await response.json();

        renderSuppliers();
        populateInventorySupplierDropdown();

    } catch (error) {
        console.error("Error loading suppliers:", error);
        showNotification("Could not load suppliers.");
    }
}

// ==========================================
// DISPLAY SUPPLIERS
// ==========================================

function renderSuppliers() {
    const tbody = document.getElementById("supplierTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (suppliers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No suppliers found.
                </td>
            </tr>
        `;
        return;
    }

    suppliers.forEach(supplier => {
        const id =
            supplier.supplierId ??
            supplier.id;

        const name =
            supplier.supplierName ??
            supplier.name ??
            "";

        const phone =
            supplier.phone ??
            supplier.phoneNumber ??
            "";

        const email =
            supplier.email ??
            "";

        const address =
            supplier.address ??
            "";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(id)}</td>
            <td>${escapeHtml(name)}</td>
            <td>${escapeHtml(phone)}</td>
            <td>${escapeHtml(email)}</td>
            <td>${escapeHtml(address)}</td>
            <td>
                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteSupplier(${Number(id)})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// ADD SUPPLIER
// ==========================================

document.getElementById("supplierForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const supplierName =
            document.getElementById("supplierName").value.trim();

        const phone =
            document.getElementById("supplierPhone").value.trim();

        const email =
            document.getElementById("supplierEmail").value.trim();

        const address =
            document.getElementById("supplierAddress").value.trim();

        if (!supplierName || !phone || !address) {
            showNotification(
                "Supplier name, phone, and address are required."
            );
            return;
        }

        const supplier = {
    name: supplierName,
    phone: phone,
    email: email,
    address: address
};

        try {
            const response = await fetch(`${API_BASE}/suppliers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(supplier)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to add supplier"
                );
            }

            document.getElementById("supplierForm").reset();

            await loadSuppliers();

            showNotification("Supplier added successfully.");

        } catch (error) {
            console.error("Error adding supplier:", error);

            showNotification(
                error.message || "Could not add supplier."
            );
        }
    });

// ==========================================
// DELETE SUPPLIER
// ==========================================

async function deleteSupplier(supplierId) {
    if (!confirm("Are you sure you want to delete this supplier?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/suppliers/${supplierId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete supplier");
        }

        await loadSuppliers();
        await loadInventory();

        showNotification("Supplier deleted successfully.");

    } catch (error) {
        console.error("Error deleting supplier:", error);

        showNotification(
            "Could not delete supplier. Check whether inventory records reference this supplier."
        );
    }
}

// ==========================================
// INVENTORY SUPPLIER DROPDOWN
// ==========================================

function populateInventorySupplierDropdown() {
    const select = document.getElementById("inventorySupplier");

    if (!select) return;

    const previousValue = select.value;

    select.innerHTML = `
        <option value="">Select Supplier</option>
    `;

    suppliers.forEach(supplier => {
        const id =
            supplier.supplierId ??
            supplier.id;

        const name =
            supplier.supplierName ??
            supplier.name ??
            `Supplier ${id}`;

        const option = document.createElement("option");

        option.value = id;
        option.textContent = name;

        select.appendChild(option);
    });

    if (
        previousValue &&
        Array.from(select.options).some(
            option => option.value === previousValue
        )
    ) {
        select.value = previousValue;
    }
}
// ==========================================
// INVENTORY MANAGEMENT
// ==========================================

let inventoryItems = [];

// ==========================================
// LOAD INVENTORY
// ==========================================

async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/inventory`);

        if (!response.ok) {
            throw new Error("Unable to load inventory");
        }

        inventoryItems = await response.json();

        renderInventory();

    } catch (error) {
        console.error("Error loading inventory:", error);
        showNotification("Could not load inventory.");
    }
}

// ==========================================
// DISPLAY INVENTORY
// ==========================================

function renderInventory() {
    const tbody = document.getElementById("inventoryTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (inventoryItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No inventory items found.
                </td>
            </tr>
        `;
        return;
    }

    inventoryItems.forEach(item => {
        const id =
            item.inventoryId ??
            item.id;

        const itemName =
            item.itemName ??
            item.name ??
            "";

        const quantity = Number(item.quantity ?? 0);

        const unit = item.unit ?? "";

        const reorderLevel = Number(item.reorderLevel ?? 0);

        const supplierId =
            item.supplierId ??
            item.supplier?.supplierId ??
            item.supplier?.id ??
            "";

        const supplierName =
            item.supplierName ??
            item.supplier?.supplierName ??
            item.supplier?.name ??
            getSupplierName(supplierId);

        const lowStock = quantity <= reorderLevel;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(id)}</td>

            <td>${escapeHtml(itemName)}</td>

            <td>${quantity.toLocaleString("en-LK", {
                maximumFractionDigits: 2
            })}</td>

            <td>${escapeHtml(unit)}</td>

            <td>${reorderLevel.toLocaleString("en-LK", {
                maximumFractionDigits: 2
            })}</td>

            <td>${escapeHtml(supplierName || "Not assigned")}</td>

            <td>
                <button
                    type="button"
                    class="action-btn edit-btn"
                    onclick="editInventoryItem(${Number(id)})">
                    Add Stock
                </button>

                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteInventoryItem(${Number(id)})">
                    Delete
                </button>

                ${
                    lowStock
                        ? `<span class="status-badge">Low Stock</span>`
                        : ""
                }
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// GET SUPPLIER NAME
// ==========================================

function getSupplierName(supplierId) {
    if (!supplierId) return "";

    const supplier = suppliers.find(item =>
        Number(item.supplierId ?? item.id) ===
        Number(supplierId)
    );

    return supplier
        ? supplier.supplierName ?? supplier.name ?? ""
        : "";
}

// ==========================================
// INVENTORY FORM
// ==========================================

function editInventoryItem(inventoryId) {
    const item = inventoryItems.find(inventoryItem =>
        Number(
            inventoryItem.inventoryId ??
            inventoryItem.id
        ) === Number(inventoryId)
    );

    if (!item) {
        showNotification("Inventory item not found.");
        return;
    }

    const nameField =
        document.getElementById("inventoryItemName");

    const quantityField =
        document.getElementById("inventoryQuantity");

    const unitField =
        document.getElementById("inventoryUnit");

    const reorderField =
        document.getElementById("inventoryReorderLevel");

    const supplierField =
        document.getElementById("inventorySupplier");

    if (!nameField || !quantityField || !unitField) {
        showNotification("Inventory form fields are missing.");
        return;
    }

    /*
     * Selecting an existing item prepares the form to add stock.
     * The backend should merge matching item names and units.
     */
    nameField.value = item.itemName ?? item.name ?? "";

    quantityField.value = "";

    quantityField.min = "0.01";

    unitField.value = item.unit ?? "";

    reorderField.value = item.reorderLevel ?? 0;

    supplierField.value =
        item.supplierId ??
        item.supplier?.supplierId ??
        item.supplier?.id ??
        "";

    quantityField.focus();

    document.getElementById("inventoryForm")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    showNotification(
        "Enter the additional quantity and submit to update stock."
    );
}

// ==========================================
// ADD INVENTORY OR ADD STOCK
// ==========================================

document.getElementById("inventoryForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const itemName =
            document.getElementById("inventoryItemName")
                .value.trim();

        const quantity =
            Number(document.getElementById("inventoryQuantity").value);

        const unit =
            document.getElementById("inventoryUnit")
                .value.trim();

        const reorderLevel =
            Number(
                document.getElementById("inventoryReorderLevel").value
            );

        const supplierValue =
            document.getElementById("inventorySupplier").value;

        if (!itemName || !unit) {
            showNotification("Item name and unit are required.");
            return;
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            showNotification("Quantity must be greater than zero.");
            return;
        }

        if (
            !Number.isFinite(reorderLevel) ||
            reorderLevel < 0
        ) {
            showNotification("Reorder level cannot be negative.");
            return;
        }

        const inventoryPayload = {
            itemName,
            quantity,
            unit,
            reorderLevel,
            supplierId: supplierValue
                ? Number(supplierValue)
                : null
        };

        try {
            const response = await fetch(`${API_BASE}/inventory`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(inventoryPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to save inventory item"
                );
            }

            document.getElementById("inventoryForm").reset();

            await loadInventory();

            showNotification(
                "Inventory saved successfully."
            );

        } catch (error) {
            console.error("Error saving inventory:", error);

            showNotification(
                error.message || "Could not save inventory."
            );
        }
    });

// ==========================================
// DELETE INVENTORY ITEM
// ==========================================

async function deleteInventoryItem(inventoryId) {
    if (!confirm("Are you sure you want to delete this inventory item?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/inventory/${inventoryId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete inventory item");
        }

        await loadInventory();

        showNotification("Inventory item deleted successfully.");

    } catch (error) {
        console.error("Error deleting inventory item:", error);

        showNotification(
            "Could not delete the inventory item."
        );
    }
}
// ==========================================
// BILLING MANAGEMENT
// ==========================================

let bills = [];

// ==========================================
// LOAD BILLS
// ==========================================

async function loadBills() {
    try {
        const response = await fetch(`${API_BASE}/bills`);

        if (!response.ok) {
            throw new Error("Unable to load bills");
        }

        bills = await response.json();

        renderBills();
        populateBillingOrderDropdown();
        populatePaymentBillDropdown();

    } catch (error) {
        console.error("Error loading bills:", error);
        showNotification("Could not load bills.");
    }
}

// ==========================================
// DISPLAY BILLS
// ==========================================

function renderBills() {
    const tbody = document.getElementById("billTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (bills.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;">
                    No bills found.
                </td>
            </tr>
        `;
        return;
    }

    bills.forEach(bill => {
        const billId =
            bill.billID ??
            bill.billId ??
            bill.id;

        const orderId =
            bill.orderID ??
            bill.orderId;

        const billDate =
            bill.billDate ??
            bill.date ??
            "";

        const subtotal = Number(bill.subtotal ?? 0);
        const tax = Number(bill.tax ?? 0);
        const discount = Number(bill.discount ?? 0);

        const total = Number(
            bill.totalAmount ??
            bill.total ??
            subtotal + tax - discount
        );

        const status = bill.billStatus || "UNPAID";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(billId)}</td>

            <td>${escapeHtml(orderId)}</td>

            <td>${escapeHtml(formatDate(billDate))}</td>

            <td>${formatCurrency(subtotal)}</td>

            <td>${formatCurrency(tax)}</td>

            <td>${formatCurrency(discount)}</td>

            <td>
                <strong>${formatCurrency(total)}</strong>
            </td>

            <td>
                <span class="status-badge">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteBill(${Number(billId)})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// BILLING FORM PREVIEW
// ==========================================

function setupBillingPreview() {
    const orderSelect = document.getElementById("billOrderId");
    const taxInput = document.getElementById("billTax");
    const discountInput = document.getElementById("billDiscount");

    orderSelect?.addEventListener("change", updateBillingSubtotal);
    taxInput?.addEventListener("input", updateBillPreview);
    discountInput?.addEventListener("input", updateBillPreview);

    updateBillPreview();
}

// ==========================================
// AUTO-POPULATE BILL SUBTOTAL
// ==========================================

function updateBillingSubtotal() {
    const orderSelect = document.getElementById("billOrderId");
    const subtotalInput = document.getElementById("billSubtotal");

    if (!orderSelect || !subtotalInput) return;

    const orderId = Number(orderSelect.value);

    const order = orders.find(item =>
        Number(item.orderId ?? item.id) === orderId
    );

    if (!order) {
        subtotalInput.value = "0";
        updateBillPreview();
        return;
    }

    const subtotal = calculateOrderSubtotal(order);

    subtotalInput.value = subtotal.toFixed(2);

    updateBillPreview();
}

// ==========================================
// CALCULATE BILL TOTAL
// ==========================================

function updateBillPreview() {
    const subtotal = Number(
        document.getElementById("billSubtotal")?.value || 0
    );

    const tax = Number(
        document.getElementById("billTax")?.value || 0
    );

    const discount = Number(
        document.getElementById("billDiscount")?.value || 0
    );

    const total = subtotal + tax - discount;

    const preview = document.getElementById("billTotalPreview");

    if (preview) {
        preview.textContent = formatCurrency(
            Math.max(0, total)
        );
    }
}

// ==========================================
// SAVE BILL
// ==========================================

document.getElementById("billForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const orderId = Number(
            document.getElementById("billOrderId").value
        );

        const subtotal = Number(
            document.getElementById("billSubtotal").value
        );

        const tax = Number(
            document.getElementById("billTax").value || 0
        );

        const discount = Number(
            document.getElementById("billDiscount").value || 0
        );

        if (!Number.isInteger(orderId) || orderId <= 0) {
            showNotification("Please select a completed order.");
            return;
        }

        const selectedOrder = orders.find(order =>
            Number(order.orderId ?? order.id) === orderId
        );

        if (
            !selectedOrder ||
            String(selectedOrder.status || "").toUpperCase() !== "COMPLETED"
        ) {
            showNotification(
                "Only completed orders can be billed."
            );
            return;
        }

        const duplicateBill = bills.find(bill =>
            Number(bill.orderID ?? bill.orderId) === orderId
        );

        if (duplicateBill) {
            showNotification(
                "This order already has a bill."
            );

            await loadBills();

            return;
        }

        if (
            !Number.isFinite(subtotal) ||
            !Number.isFinite(tax) ||
            !Number.isFinite(discount) ||
            subtotal < 0 ||
            tax < 0 ||
            discount < 0
        ) {
            showNotification(
                "Enter valid subtotal, tax, and discount values."
            );
            return;
        }

        const totalAmount = subtotal + tax - discount;

        if (totalAmount < 0) {
            showNotification(
                "Discount cannot exceed subtotal plus tax."
            );
            return;
        }

        /*
         * Bill status is set internally.
         * There is no billStatus input in the HTML form.
         */

        const billPayload = {
            orderID: orderId,
            billDate: new Date().toISOString().slice(0, 19),
            subtotal,
            tax,
            discount,
            totalAmount,
            billStatus: "UNPAID"
        };

        try {
            const response = await fetch(`${API_BASE}/bills`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(billPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to create bill"
                );
            }

            document.getElementById("billForm").reset();

            const subtotalField =
                document.getElementById("billSubtotal");

            if (subtotalField) {
                subtotalField.value = "0";
            }

            updateBillPreview();

            await loadBills();

            showNotification("Bill created successfully.");

        } catch (error) {
            console.error("Error creating bill:", error);

            showNotification(
                error.message || "Could not create bill."
            );
        }
    });

// ==========================================
// DELETE BILL
// ==========================================

async function deleteBill(billId) {
    const bill = bills.find(item =>
        Number(item.billID ?? item.billId ?? item.id) ===
        Number(billId)
    );

    if (!bill) {
        showNotification("Bill not found.");
        return;
    }

    /*
     * Do not delete bills with recorded payments.
     * Keeping the bill preserves payment history.
     */

    const billPayments = payments.filter(payment =>
        Number(payment.billID ?? payment.billId) ===
        Number(billId)
    );

    if (billPayments.length > 0) {
        showNotification(
            "This bill has payment records and cannot be deleted."
        );
        return;
    }

    if (!confirm("Are you sure you want to delete this bill?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/bills/${billId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete bill");
        }

        await loadBills();

        showNotification("Bill deleted successfully.");

    } catch (error) {
        console.error("Error deleting bill:", error);

        showNotification(
            "Could not delete bill. Check the backend and related records."
        );
    }
}
// ==========================================
// PAYMENT MANAGEMENT
// ==========================================

let payments = [];

// ==========================================
// LOAD PAYMENTS
// ==========================================

async function loadPayments() {
    try {
        const response = await fetch(`${API_BASE}/payments`);

        if (!response.ok) {
            throw new Error("Unable to load payments");
        }

        payments = await response.json();

        renderPayments();
        populatePaymentBillDropdown();

    } catch (error) {
        console.error("Error loading payments:", error);
        showNotification("Could not load payments.");
    }
}

// ==========================================
// PAYMENT STATUS HELPERS
// ==========================================

function isSuccessfulPayment(payment) {
    return String(payment.paymentStatus || "").toUpperCase()
        === "COMPLETED";
}

function getBillId(bill) {
    return Number(
        bill.billID ??
        bill.billId ??
        bill.id
    );
}

function getPaymentBillId(payment) {
    return Number(
        payment.billID ??
        payment.billId
    );
}

function getPaymentAmount(payment) {
    return Number(payment.amount ?? 0);
}

// ==========================================
// CALCULATE AMOUNT PAID
// ==========================================

function getAmountPaid(billId) {
    return payments
        .filter(payment =>
            getPaymentBillId(payment) === Number(billId) &&
            isSuccessfulPayment(payment)
        )
        .reduce((total, payment) => {
            return total + getPaymentAmount(payment);
        }, 0);
}

// ==========================================
// CALCULATE REMAINING BALANCE
// ==========================================

function getBillRemainingBalance(bill) {
    const billId = getBillId(bill);

    const total = Number(
        bill.totalAmount ??
        bill.total ??
        0
    );

    const amountPaid = getAmountPaid(billId);

    return Math.max(0, total - amountPaid);
}

// ==========================================
// POPULATE PAYMENT BILL DROPDOWN
// ==========================================

function populatePaymentBillDropdown() {
    const select = document.getElementById("paymentBillId");

    if (!select) return;

    const previousValue = select.value;

    select.innerHTML = `
        <option value="">Select an unpaid bill</option>
    `;

    bills.forEach(bill => {
        const billId = getBillId(bill);

        const balance = getBillRemainingBalance(bill);

        // Fully paid bills must not appear in the entry dropdown.
        if (balance <= 0.009) {
            return;
        }

        const orderId =
            bill.orderID ??
            bill.orderId ??
            "";

        const option = document.createElement("option");

        option.value = billId;

        option.textContent =
            `Bill ${billId} | Order ${orderId} | ` +
            `Balance: ${formatCurrency(balance)}`;

        select.appendChild(option);
    });

    if (
        previousValue &&
        Array.from(select.options).some(
            option => option.value === previousValue
        )
    ) {
        select.value = previousValue;
    }

    updatePaymentPreview();
}

// ==========================================
// PAYMENT FORM PREVIEW
// ==========================================

function updatePaymentPreview() {
    const billSelect = document.getElementById("paymentBillId");

    const amountInput = document.getElementById("paymentAmount");

    const cashInput = document.getElementById("paymentCashReceived");

    const methodInput = document.getElementById("paymentMethod");

    const changePreview = document.getElementById(
        "paymentChangePreview"
    );

    const balancePreview = document.getElementById(
        "paymentBalancePreview"
    );

    if (
        !billSelect ||
        !amountInput ||
        !cashInput
    ) {
        return;
    }

    const billId = Number(billSelect.value);

    const bill = bills.find(item =>
        getBillId(item) === billId
    );

    const method = String(methodInput?.value || "CASH")
        .toUpperCase();

    const isCash = method === "CASH";

    const cashGroup = document.getElementById("cashReceivedGroup");

    if (cashGroup) {
        cashGroup.style.display = isCash ? "block" : "none";
    }

    cashInput.required = isCash;

    if (!bill) {
        if (changePreview) {
            changePreview.textContent = formatCurrency(0);
        }

        if (balancePreview) {
            balancePreview.textContent = formatCurrency(0);
        }

        return;
    }

    const remainingBalance = getBillRemainingBalance(bill);

    let amount = Number(amountInput.value || 0);

    if (amount <= 0) {
        amount = 0;
    }

    const amountApplied = Math.min(
        amount,
        remainingBalance
    );

    let change = 0;

    if (isCash) {
        const cashReceived = Number(cashInput.value || 0);

        change = Math.max(
            0,
            cashReceived - amountApplied
        );
    }

    const newBalance = Math.max(
        0,
        remainingBalance - amountApplied
    );

    if (changePreview) {
        changePreview.textContent = formatCurrency(change);
    }

    if (balancePreview) {
        balancePreview.textContent = formatCurrency(newBalance);
    }

    // Prevent the user from entering more than the outstanding balance.
    amountInput.max = remainingBalance.toFixed(2);

    // For card/bank payments, the payment amount is the actual amount applied.
    if (!isCash) {
        cashInput.value = amountApplied.toFixed(2);
    }
}

// ==========================================
// RENDER PAYMENT HISTORY
// ==========================================

function renderPayments() {
    const tbody = document.getElementById("paymentTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (payments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;">
                    No payments found.
                </td>
            </tr>
        `;

        return;
    }

    payments.forEach(payment => {
        const paymentId =
            payment.paymentID ??
            payment.paymentId ??
            payment.id;

        const billId = getPaymentBillId(payment);

        const paymentDate =
            payment.paymentDate ??
            payment.date ??
            "";

        const amount = getPaymentAmount(payment);

        const cashReceived = Number(
            payment.cashReceived ?? amount
        );

        const changeReturned = Number(
            payment.changeReturned ?? 0
        );

        const paymentMethod =
            payment.paymentMethod ??
            payment.method ??
            "";

        const paymentStatus =
            payment.paymentStatus ??
            "COMPLETED";

        const transactionRef =
            payment.transactionRef ??
            "";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(paymentId)}</td>

            <td>${escapeHtml(billId)}</td>

            <td>${escapeHtml(formatDate(paymentDate))}</td>

            <td>${formatCurrency(amount)}</td>

            <td>${formatCurrency(cashReceived)}</td>

            <td>${formatCurrency(changeReturned)}</td>

            <td>${escapeHtml(paymentMethod)}</td>

            <td>${escapeHtml(paymentStatus)}</td>

            <td>${escapeHtml(transactionRef)}</td>

            <td>
                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deletePayment(${Number(paymentId)})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================================
// RECORD PAYMENT
// ==========================================

document.getElementById("paymentForm")
    ?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const billId = Number(
            document.getElementById("paymentBillId").value
        );

        const amount = Number(
            document.getElementById("paymentAmount").value
        );

        const cashReceivedInput = Number(
            document.getElementById("paymentCashReceived").value
        );

        const paymentMethod = document.getElementById(
            "paymentMethod"
        ).value;

        const transactionRef = document.getElementById(
            "paymentTransactionRef"
        ).value.trim();

        const paymentStatus = "COMPLETED";

        if (!Number.isInteger(billId) || billId <= 0) {
            showNotification("Please select an unpaid bill.");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            showNotification("Payment amount must be greater than zero.");
            return;
        }

        const bill = bills.find(item =>
            getBillId(item) === billId
        );

        if (!bill) {
            showNotification("Selected bill was not found.");
            return;
        }

        const remainingBalance = getBillRemainingBalance(bill);

        if (remainingBalance <= 0.009) {
            showNotification("This bill has already been paid.");

            await loadPayments();

            return;
        }

        if (amount > remainingBalance + 0.009) {
            showNotification(
                `Payment cannot exceed the outstanding balance of ${formatCurrency(remainingBalance)}.`
            );

            return;
        }

        const isCash = paymentMethod.toUpperCase() === "CASH";

        let cashReceived;
        let changeReturned;

        if (isCash) {
            cashReceived = cashReceivedInput;

            if (
                !Number.isFinite(cashReceived) ||
                cashReceived < amount
            ) {
                showNotification(
                    "Cash received must be equal to or greater than the payment amount."
                );

                return;
            }

            changeReturned = cashReceived - amount;

        } else {
            /*
             * For card or bank transfer, no cash change is returned.
             */
            cashReceived = amount;
            changeReturned = 0;
        }

        const paymentPayload = {
            billID: billId,
            paymentDate: new Date().toISOString().slice(0, 19),
            amount,
            paymentMethod,
            paymentStatus,
            cashReceived,
            changeReturned,
            transactionRef
        };

        try {
            const response = await fetch(`${API_BASE}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to record payment"
                );
            }

            document.getElementById("paymentForm").reset();

            await loadPayments();
            await loadBills();

            showNotification(
                `Payment of ${formatCurrency(amount)} recorded successfully.`
            );

        } catch (error) {
            console.error("Error recording payment:", error);

            showNotification(
                error.message || "Could not record payment."
            );
        }
    });

// ==========================================
// DELETE PAYMENT
// ==========================================

async function deletePayment(paymentId) {
    if (!confirm("Are you sure you want to delete this payment?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/payments/${paymentId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete payment");
        }

        await loadPayments();
        await loadBills();

        showNotification("Payment deleted successfully.");

    } catch (error) {
        console.error("Error deleting payment:", error);

        showNotification(
            "Could not delete payment. Check the backend and related records."
        );
    }
}
// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {
    const customerCount = document.getElementById("customerCount");
    const reservationCount = document.getElementById("reservationCount");
    const tableCount = document.getElementById("tableCount");

    if (customerCount) {
        customerCount.textContent = customers.length;
    }

    if (reservationCount) {
        reservationCount.textContent = reservations.length;
    }

    if (tableCount) {
        tableCount.textContent = tables.length;
    }

    renderRecentReservations();
}

// ==========================================
// REFRESH ALL DATA
// ==========================================

async function refreshAllData() {
    await Promise.allSettled([
        loadCustomers(),
        loadReservations(),
        loadTables(),
        loadMenuItems(),
        loadOrders(),
        loadBills(),
        loadPayments(),
        loadEmployees(),
        loadSuppliers(),
        loadInventory()
    ]);

    updateDashboard();

    showNotification("Smart Dine data refreshed.");
}

// ==========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener("click", function (event) {
    const customerModal = document.getElementById("customerModal");

    if (
        customerModal &&
        event.target === customerModal
    ) {
        closeCustomerModal();
    }

    const reservationModal =
        document.getElementById("reservationModal");

    if (
        reservationModal &&
        event.target === reservationModal
    ) {
        closeReservationModal();
    }
});

// ==========================================
// PREVENT NEGATIVE BILL VALUES
// ==========================================

["billTax", "billDiscount"].forEach(id => {
    const input = document.getElementById(id);

    input?.addEventListener("input", function () {
        if (Number(this.value) < 0) {
            this.value = "0";
        }

        updateBillPreview();
    });
});

// ==========================================
// PAYMENT PREVIEW LISTENERS
// ==========================================

document.getElementById("paymentBillId")
    ?.addEventListener("change", updatePaymentPreview);

document.getElementById("paymentAmount")
    ?.addEventListener("input", updatePaymentPreview);

document.getElementById("paymentCashReceived")
    ?.addEventListener("input", updatePaymentPreview);

document.getElementById("paymentMethod")
    ?.addEventListener("change", updatePaymentPreview);

// ==========================================
// BILLING PREVIEW LISTENERS
// ==========================================

document.getElementById("billOrderId")
    ?.addEventListener("change", updateBillingSubtotal);

document.getElementById("billTax")
    ?.addEventListener("input", updateBillPreview);

document.getElementById("billDiscount")
    ?.addEventListener("input", updateBillPreview);

// ==========================================
// INITIAL PREVIEW VALUES
// ==========================================

updateBillPreview();
updatePaymentPreview();