// --- Core Application State and Logic ---

const VAT_RATE = 0.18; // 18% VAT, common in Sri Lanka
let products = [
    { id: Date.now() + 1, name: "ERP System License (1 Year)", price: 85000.00, qty: 1 },
    { id: Date.now() + 2, name: "On-site Implementation Service", price: 50000.00, qty: 1 },
    { id: Date.now() + 3, name: "Custom Reporting Module Development", price: 120000.00, qty: 1 },
];
let isSummaryMode = false;

const el = (id) => document.getElementById(id);
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
});

document.addEventListener('DOMContentLoaded', () => {
    // Initial data render on load
    renderProducts();
    saveClientInfo(); // Load default client info
});

/**
 * Saves client info from input fields to the display area.
 */
function saveClientInfo() {
    const name = el('clientName').value.trim() || 'Client Name Here';
    const address = el('clientAddress').value.trim() || 'Client Address Here';
    const contact = el('clientContact').value.trim() || 'Client Contact Info Here';

    el('displayClientName').textContent = name;
    el('displayClientAddress').textContent = address;
    el('displayClientContact').textContent = 'Attn: ' + contact;
}

/**
 * Adds a new product/service item to the list.
 */
function addProduct() {
    const name = el('productName').value.trim();
    const price = parseFloat(el('unitPrice').value);
    const qty = parseInt(el('quantity').value, 10);

    if (!name || isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) {
        console.error("Validation Error: Please enter a valid name, price (>0), and quantity (>0).");
        return;
    }

    products.push({
        id: Date.now(),
        name: name,
        price: price,
        qty: qty
    });

    // Clear inputs
    el('productName').value = '';
    el('unitPrice').value = '';
    el('quantity').value = '1';

    renderProducts();
}

/**
 * Deletes a product item by ID.
 * @param {number} id - The unique ID of the product to delete.
 */
function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    renderProducts();
}

/**
 * Calculates and updates all totals (Subtotal, VAT, Grand Total).
 */
function calculateTotals() {
    let subtotal = products.reduce((acc, p) => acc + (p.price * p.qty), 0);
    let vatAmount = subtotal * VAT_RATE;
    let grandTotal = subtotal + vatAmount;

    el('subTotal').textContent = formatter.format(subtotal);
    el('vatAmount').textContent = formatter.format(vatAmount);
    el('grandTotal').textContent = formatter.format(grandTotal);
}

/**
 * Renders the product list in the table body and applies pagination class.
 */
function renderProducts() {
    const tbody = el('quotationTableBody');
    tbody.innerHTML = '';
    
    // Always iterate through all products now, regardless of summary mode.
    // We control column visibility via CSS class within the loop.

    products.forEach((p, index) => {
        const rowTotal = p.price * p.qty;
        const row = tbody.insertRow();
        row.className = 'hover:bg-gray-50 transition duration-150';

        // Add page break class to the 10th item for printing (0-indexed 9)
        if (index === 9) {
            row.classList.add('page-break-after-ten');
        }

        // Qty should always use its default responsive class: hidden on small screens, visible on large screens
        const qtyClass = 'hidden lg:table-cell'; 

        // Unit Price is hidden if in summary mode, otherwise uses default responsive class
        const priceClass = isSummaryMode ? 'hidden' : 'hidden lg:table-cell';

        row.innerHTML = `
            <td class="px-6 py-3">${index + 1}</td>
            <td class="px-6 py-3 text-gray-900 font-medium">${p.name}</td>
            <td class="px-6 py-3 text-right ${qtyClass}">${p.qty}</td>
            <td class="px-6 py-3 text-right ${priceClass}">${formatter.format(p.price).replace('LKR', '')}</td>
            <td class="px-6 py-3 text-right font-semibold">${formatter.format(rowTotal)}</td>
            <td class="px-6 py-3 text-right no-print">
                <button onclick="deleteProduct(${p.id})" class="text-red-600 hover:text-red-800 text-sm font-semibold p-1 rounded-md transition duration-150">Remove</button>
            </td>
        `;
    });

    calculateTotals();
}

/**
 * Toggles the view between detailed product list and a summary view (showing items and Qty, but hiding unit price).
 */
function toggleSummaryView() {
    isSummaryMode = !isSummaryMode;
    el('summaryButton').textContent = isSummaryMode 
        ? 'Exit Summary View (Show Details)' 
        : 'Toggle Summary View (Show Totals Only)';
    
    // Get table elements we need to modify
    const headerQty = el('headerQty');
    const headerPrice = el('headerPrice');
    const tableFooterCells = document.querySelectorAll('#app table tfoot td:first-child');
    
    // The number of columns spanned by Subtotal/VAT/Grand Total (index/description/qty/unit price)
    const totalFooterColumns = 4; // # + Description + Qty + Unit Price

    if (isSummaryMode) {
        // SUMMARY MODE: Hide Unit Price column (Header and Cells)
        headerPrice.classList.add('hidden'); 
        
        // Qty header remains visible (default class handles this).

        // Adjust the colspan for the footer cells (Subtotal, VAT, Grand Total labels)
        // Colspan needs to cover 3 columns now: #, Description, and Qty (Unit Price is hidden)
        tableFooterCells.forEach(cell => {
             // 4 columns spanned when Unit Price is visible, 3 when hidden.
             // We adjust the first TD in TFOOT to span the empty columns
             cell.setAttribute('colspan', totalFooterColumns - 1); 
        });

    } else {
        // DETAILED MODE: Show Unit Price column (Header and Cells)
        headerPrice.classList.remove('hidden');
        
        // Restore colspan for the footer cells to cover 4 columns
        tableFooterCells.forEach(cell => {
            cell.setAttribute('colspan', totalFooterColumns); 
        });
    }
    
    // Rerender products to apply the new column visibility logic to all cells
    renderProducts(); 
}

/**
 * Triggers the browser print dialog.
 */
function printQuotation() {
    // Ensure we are not in summary mode before printing
    if (isSummaryMode) {
        toggleSummaryView(); // Switch back to detailed view
    }
    window.print();
}

// Add some initial data to demonstrate pagination
for(let i = 4; i <= 12; i++) {
    products.push({
        id: Date.now() + i,
        name: `Software License Maintenance Package ${i}`,
        price: 15000.00,
        qty: i % 3 + 1
    });
}
renderProducts(); // Initial render with demo products
