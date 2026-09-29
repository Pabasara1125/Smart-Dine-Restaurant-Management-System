const API_BASE = "http://localhost:8081/api";

let customers = [];
let reservations = [];
let tables = [];


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadCustomers();
    loadReservations();
    loadTables();

});


// ==========================================
// NAVIGATION
// ==========================================

function showSection(sectionName) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active-section");
    });

    document.getElementById(sectionName).classList.add("active-section");


    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });


    const buttons = document.querySelectorAll(".nav-btn");

    buttons.forEach(button => {

        if (button.innerText.toLowerCase().includes(sectionName.replace("customers", "customer").replace("reservations", "reservation"))) {
            button.classList.add("active");
        }

    });


    const titles = {
        dashboard: "Dashboard",
        customers: "Customer Management",
        reservations: "Reservation Management",
        tables: "Restaurant Tables"
    };

    document.getElementById("pageTitle").innerText =
        titles[sectionName] || "Smart Dine";

}


// ==========================================
// NOTIFICATION
// ==========================================

function showNotification(message) {

    const notification =
        document.getElementById("notification");

    notification.innerText = message;

    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);

}


// ==========================================
// CUSTOMERS
// ==========================================

async function loadCustomers() {

    try {

        const response =
            await fetch(`${API_BASE}/customers`);

        if (!response.ok) {
            throw new Error("Unable to load customers");
        }

        customers = await response.json();

        renderCustomers();

        updateDashboard();

        populateCustomerDropdown();

    } catch (error) {

        console.error(error);

        showNotification("Could not load customers.");

    }

}


function renderCustomers() {

    const tbody =
        document.getElementById("customerTableBody");

    tbody.innerHTML = "";


    if (customers.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }


    customers.forEach(customer => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${customer.customerId}</td>

            <td>
                <strong>${escapeHtml(customer.name || "")}</strong>
            </td>

            <td>${escapeHtml(customer.phone || "")}</td>

            <td>${escapeHtml(customer.email || "")}</td>

            <td>${escapeHtml(customer.address || "")}</td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editCustomer(${customer.customerId})">
                    ✏️
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteCustomer(${customer.customerId})">
                    🗑️
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

    document.getElementById("customerModal")
        .classList.add("show");


    if (customer) {

        document.getElementById("customerModalTitle")
            .innerText = "Edit Customer";

        document.getElementById("customerId")
            .value = customer.customerId;

        document.getElementById("customerName")
            .value = customer.name || "";

        document.getElementById("customerPhone")
            .value = customer.phone || "";

        document.getElementById("customerEmail")
            .value = customer.email || "";

        document.getElementById("customerAddress")
            .value = customer.address || "";

    } else {

        document.getElementById("customerModalTitle")
            .innerText = "Add Customer";

        document.getElementById("customerForm").reset();

        document.getElementById("customerId").value = "";

    }

}


function closeCustomerModal() {

    document.getElementById("customerModal")
        .classList.remove("show");

}


document.getElementById("customerForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const id =
            document.getElementById("customerId").value;


        const customer = {

            name:
                document.getElementById("customerName").value,

            phone:
                document.getElementById("customerPhone").value,

            email:
                document.getElementById("customerEmail").value,

            address:
                document.getElementById("customerAddress").value

        };


        try {

            let response;


            if (id) {

                response = await fetch(
                    `${API_BASE}/customers/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(customer)
                    }
                );

            } else {

                response = await fetch(
                    `${API_BASE}/customers`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(customer)
                    }
                );

            }


            if (!response.ok) {

                throw new Error("Customer save failed");

            }


            closeCustomerModal();

            await loadCustomers();

            showNotification(
                id
                    ? "Customer updated successfully."
                    : "Customer added successfully."
            );


        } catch (error) {

            console.error(error);

            showNotification("Could not save customer.");

        }

    });


function editCustomer(id) {

    const customer =
        customers.find(c => c.customerId == id);

    if (customer) {

        openCustomerModal(customer);

    }

}


async function deleteCustomer(id) {

    if (!confirm("Are you sure you want to delete this customer?")) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/customers/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error("Delete failed");

        }


        await loadCustomers();

        showNotification("Customer deleted successfully.");


    } catch (error) {

        console.error(error);

        showNotification("Could not delete customer.");

    }

}


// ==========================================
// RESERVATIONS
// ==========================================

async function loadReservations() {

    try {

        const response =
            await fetch(`${API_BASE}/reservations`);


        if (!response.ok) {
            throw new Error("Unable to load reservations");
        }


        reservations =
            await response.json();


        renderReservations();

        renderRecentReservations();

        updateDashboard();


    } catch (error) {

        console.error(error);

        showNotification("Could not load reservations.");

    }

}


function renderReservations() {

    const tbody =
        document.getElementById("reservationTableBody");

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

        const customerName =
            reservation.customer?.name || "N/A";


        const tableNumber =
            reservation.restaurantTable?.tableNumber || "N/A";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${reservation.reservationId}</td>

            <td>${escapeHtml(customerName)}</td>

            <td>${reservation.date || ""}</td>

            <td>${reservation.time || ""}</td>

            <td>${reservation.noOfGuests || ""}</td>

            <td>Table ${tableNumber}</td>

            <td>
                ${getStatusBadge(reservation.status)}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editReservation(${reservation.reservationId})">
                    ✏️
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteReservation(${reservation.reservationId})">
                    🗑️
                </button>

            </td>

        `;


        tbody.appendChild(row);

    });

}


function renderRecentReservations() {

    const container =
        document.getElementById("recentReservations");


    if (reservations.length === 0) {

        container.innerHTML =
            "<p>No reservations available.</p>";

        return;

    }


    const recent =
        [...reservations]
            .slice(-5)
            .reverse();


    container.innerHTML = recent.map(reservation => {

        const customer =
            reservation.customer?.name || "N/A";


        return `

            <div style="
                padding:12px 0;
                border-bottom:1px solid #edf0f3;
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <div>

                    <strong>
                        ${escapeHtml(customer)}
                    </strong>

                    <div style="
                        color:#7b8493;
                        font-size:12px;
                        margin-top:4px;
                    ">

                        ${reservation.date || ""}
                        ·
                        ${reservation.time || ""}

                    </div>

                </div>

                ${getStatusBadge(reservation.status)}

            </div>

        `;

    }).join("");

}


function getStatusBadge(status) {

    if (!status) {
        status = "Pending";
    }


    const normalized =
        status.toLowerCase();


    let className = "status-pending";


    if (normalized === "confirmed") {
        className = "status-confirmed";
    }

    if (normalized === "completed") {
        className = "status-completed";
    }

    if (normalized === "cancelled") {
        className = "status-cancelled";
    }


    return `
        <span class="status ${className}">
            ${escapeHtml(status)}
        </span>
    `;

}


// ==========================================
// RESERVATION MODAL
// ==========================================

async function openReservationModal(reservation = null) {

    await loadCustomers();

    await loadTables();


    document.getElementById("reservationModal")
        .classList.add("show");


    if (reservation) {

        document.getElementById("reservationModalTitle")
            .innerText = "Edit Reservation";


        document.getElementById("reservationId")
            .value = reservation.reservationId;


        document.getElementById("reservationCustomer")
            .value =
            reservation.customer?.customerId || "";


        document.getElementById("reservationTable")
            .value =
            reservation.restaurantTable?.tableId || "";


        document.getElementById("reservationDate")
            .value = reservation.date || "";


        document.getElementById("reservationTime")
            .value = reservation.time || "";


        document.getElementById("reservationGuests")
            .value = reservation.noOfGuests || "";


        document.getElementById("reservationStatus")
            .value = reservation.status || "Pending";


    } else {

        document.getElementById("reservationModalTitle")
            .innerText = "New Reservation";


        document.getElementById("reservationForm")
            .reset();


        document.getElementById("reservationId")
            .value = "";

    }

}


function closeReservationModal() {

    document.getElementById("reservationModal")
        .classList.remove("show");

}


function populateCustomerDropdown() {

    const select =
        document.getElementById("reservationCustomer");


    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">Select customer</option>`;


    customers.forEach(customer => {

        const option =
            document.createElement("option");


        option.value =
            customer.customerId;


        option.textContent =
            `${customer.name} - ${customer.phone}`;


        select.appendChild(option);

    });

}


function populateTableDropdown() {

    const select =
        document.getElementById("reservationTable");


    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">Select table</option>`;


    tables.forEach(table => {

        const option =
            document.createElement("option");


        option.value =
            table.tableId;


        option.textContent =
            `Table ${table.tableNumber} - Capacity ${table.capacity}`;


        select.appendChild(option);

    });

}


document.getElementById("reservationForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const id =
            document.getElementById("reservationId").value;


        const customerId =
            Number(
                document.getElementById("reservationCustomer").value
            );


        const tableId =
            Number(
                document.getElementById("reservationTable").value
            );


        const reservation = {

            date:
                document.getElementById("reservationDate").value,

            time:
                document.getElementById("reservationTime").value,

            noOfGuests:
                Number(
                    document.getElementById("reservationGuests").value
                ),

            status:
                document.getElementById("reservationStatus").value,

            customer: {
                customerId: customerId
            },

            restaurantTable: {
                tableId: tableId
            }

        };


        try {

            let response;


            if (id) {

                response =
                    await fetch(
                        `${API_BASE}/reservations/${id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body:
                                JSON.stringify(reservation)
                        }
                    );

            } else {

                response =
                    await fetch(
                        `${API_BASE}/reservations`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body:
                                JSON.stringify(reservation)
                        }
                    );

            }


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(errorText);

                throw new Error("Reservation save failed");

            }


            closeReservationModal();

            await loadReservations();

            showNotification(
                id
                    ? "Reservation updated successfully."
                    : "Reservation created successfully."
            );


        } catch (error) {

            console.error(error);

            showNotification(
                "Could not save reservation."
            );

        }

    });


function editReservation(id) {

    const reservation =
        reservations.find(
            r => r.reservationId == id
        );


    if (reservation) {

        openReservationModal(reservation);

    }

}


async function deleteReservation(id) {

    if (!confirm(
        "Are you sure you want to delete this reservation?"
    )) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/reservations/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error("Delete failed");

        }


        await loadReservations();

        showNotification(
            "Reservation deleted successfully."
        );


    } catch (error) {

        console.error(error);

        showNotification(
            "Could not delete reservation."
        );

    }

}


// ==========================================
// RESTAURANT TABLES
// ==========================================

async function loadTables() {

    try {

        const response =
            await fetch(`${API_BASE}/tables`);


        if (!response.ok) {

            throw new Error("Unable to load tables");

        }


        tables =
            await response.json();


        renderTables();

        populateTableDropdown();

        updateDashboard();


    } catch (error) {

        console.error(error);

        showNotification(
            "Could not load restaurant tables."
        );

    }

}


function renderTables() {

    const container =
        document.getElementById("tableCards");


    container.innerHTML = "";


    if (tables.length === 0) {

        container.innerHTML =
            "<p>No restaurant tables found.</p>";

        return;

    }


    tables.forEach(table => {

        const card =
            document.createElement("div");


        card.className =
            "restaurant-table-card";


        card.innerHTML = `

            <div style="font-size:32px;">
                🪑
            </div>

            <h3>
                Table ${table.tableNumber}
            </h3>

            <p>
                Capacity: ${table.capacity} guests
            </p>

            <p>
                Location: ${escapeHtml(table.location || "N/A")}
            </p>

            <p>
                Status:
                <strong>
                    ${escapeHtml(table.status || "N/A")}
                </strong>
            </p>

        `;


        container.appendChild(card);

    });

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    document.getElementById("customerCount")
        .innerText = customers.length;


    document.getElementById("reservationCount")
        .innerText = reservations.length;


    document.getElementById("tableCount")
        .innerText = tables.length;

}


// ==========================================
// HTML SAFETY
// ==========================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}