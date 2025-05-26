document.addEventListener('DOMContentLoaded', () => {
    loadTemplates();
    setupUploadForm();
    loadPayments();

    // Ensure adminActions container exists, create if missing
    let adminActions = document.getElementById('adminActions');
    if (!adminActions) {
        const container = document.querySelector('.container.mt-4');
        if (container) {
            adminActions = document.createElement('div');
            adminActions.id = 'adminActions';
            adminActions.className = 'mb-3';
            container.insertBefore(adminActions, container.firstChild);
        }
    }

    // Add clear payments button
    if (adminActions) {
        const btn = document.createElement('button');
        btn.textContent = 'Hapus Semua Data Pembayaran';
        btn.className = 'btn btn-danger mb-3';
        btn.addEventListener('click', clearAllPayments);
        adminActions.appendChild(btn);
    }
});

// Function to clear all payments
async function clearAllPayments() {
    if (!confirm('Apakah Anda yakin ingin menghapus semua data pembayaran? Tindakan ini tidak dapat dibatalkan.')) {
        return;
    }
    try {
        const response = await fetch('/api/admin/payments/clear', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            alert('Semua data pembayaran berhasil dihapus.');
            loadPayments();
        } else {
            const errorData = await response.json();
            alert('Gagal menghapus data pembayaran: ' + errorData.error);
        }
    } catch (error) {
        alert('Terjadi kesalahan saat menghapus data pembayaran: ' + error.message);
    }
}

async function loadPayments() {
    try {
        const response = await fetch('/api/payments');
        const payments = await response.json();
        const container = document.getElementById('pendingPaymentsList');
        container.innerHTML = '';

        if (payments.length === 0) {
            container.innerHTML = '<p>No pending payments.</p>';
            return;
        }

        payments.forEach(payment => {
            const div = document.createElement('div');
            div.classList.add('card', 'mb-3');
            div.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${payment.productTitle}</h5>
                    <p class="card-text">Buyer: ${payment.buyerName} (${payment.buyerEmail})</p>
                    <p class="card-text">Price: Rp ${payment.price ? payment.price.toLocaleString() : '0'}</p>
                    <p class="card-text">Purchase Date: ${payment.date ? new Date(payment.date).toLocaleString() : 'Unknown'}</p>
                    <p class="card-text">Status: <strong>${payment.status}</strong></p>
                    <div>
                        ${payment.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="confirmPayment('${payment.id}')">Confirm Payment</button>` : ''}
                        ${payment.status === 'confirmed' ? `<button class="btn btn-danger btn-sm" onclick="deletePayment('${payment.id}')">Delete</button>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

async function confirmPayment(paymentId) {
    if (!confirm('Are you sure you want to confirm this payment?')) return;
    try {
        const response = await fetch(`/api/payments/${paymentId}/confirm`, {
            method: 'PUT'
        });
        if (!response.ok) {
            const errorData = await response.json();
            alert('Error confirming payment: ' + (errorData.error || response.statusText));
            return;
        }
        alert('Payment confirmed successfully!');
        loadPayments();
    } catch (error) {
        alert('Error confirming payment: ' + error.message);
    }
}

function downloadProduct(productId) {
    if (!productId) {
        alert('Product ID not available.');
        return;
    }
    // Redirect to download endpoint
    window.location.href = `/api/templates/${productId}/download`;
}

async function loadTemplates() {
    try {
        const response = await fetch('/api/templates');
        const templates = await response.json();
        const tbody = document.getElementById('templatesList');
        tbody.innerHTML = '';

        templates.forEach(template => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${template.title}</td>
                <td>${template.type}</td>
                <td>Rp ${template.price.toLocaleString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="handleDeleteTemplate('${template.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

async function handleDeleteTemplate(id) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
        const response = await fetch('/api/templates/' + id, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            alert('Error deleting template: ' + (errorData.error || response.statusText));
            return;
        }
        alert('Template deleted successfully!');
        loadTemplates();
    } catch (error) {
        alert('Error deleting template: ' + error.message);
    }
}

function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    const samplePreviewInput = document.getElementById('templateSamplePreview');
    const samplePreviewGallery = document.getElementById('samplePreviewGallery');

    samplePreviewInput.addEventListener('change', () => {
        samplePreviewGallery.innerHTML = '';
        Array.from(samplePreviewInput.files).forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '100px';
            img.style.marginRight = '10px';
            samplePreviewGallery.appendChild(img);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('templateTitle').value;
        const price = document.getElementById('templatePrice').value;
        const description = document.getElementById('templateDescription').value;
        const type = document.getElementById('templateType').value;
        const fileInput = document.getElementById('templateFile');
        const samplePreviews = samplePreviewInput.files;

        if (samplePreviews.length !== 3) {
            alert('Please select exactly 3 sample preview images.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('price', price);
        formData.append('description', description);
        formData.append('type', type);
        formData.append('file', fileInput.files[0]);
        for (let i = 0; i < samplePreviews.length; i++) {
            formData.append('samplePreviews', samplePreviews[i]);
        }

        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert('Error uploading template: ' + (errorData.error || response.statusText));
                return;
            }

            alert('Template uploaded successfully!');
            form.reset();
            samplePreviewGallery.innerHTML = '';
            loadTemplates();
        } catch (error) {
            alert('Error uploading template: ' + error.message);
        }
    });
}
