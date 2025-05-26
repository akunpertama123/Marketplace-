const API_BASE_URL = 'http://localhost:8002';

export async function deleteTemplate(id) {
    const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, { method: 'DELETE' });
    return response;
}

export async function getPayments() {
    const response = await fetch(`${API_BASE_URL}/api/payments`);
    return response.json();
}

export async function createPayment(paymentData) {
    const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
    });
    return response.json();
}

export async function approvePayment(paymentId) {
    const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/confirm`, {
        method: 'PUT'
    });
    return response.json();
}

// Add other API calls as needed
