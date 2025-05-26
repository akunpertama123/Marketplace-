// Database management using backend API
class Database {
    constructor() {
        this.API_URL = '/api';
    }

    async initializeDatabase() {
        // Initial setup is now handled by backend
        console.log('Database initialized with backend API');
    }

    async getTemplates() {
        try {
            const response = await fetch(`${this.API_URL}/templates`);
            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }
            const templates = await response.json();
            return templates;
        } catch (error) {
            console.error('Error fetching templates:', error);
            return [];
        }
    }

    async saveTemplate(template) {
        try {
            const formData = new FormData();
            formData.append('title', template.title);
            formData.append('description', template.description);
            formData.append('price', template.price);
            formData.append('type', template.type);
            formData.append('file', template.file);
            
            if (template.samplePreviews) {
                template.samplePreviews.forEach((preview, index) => {
                    formData.append(`preview${index + 1}`, preview);
                });
            }

            const response = await fetch(`${this.API_URL}/templates`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to save template');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving template:', error);
            throw error;
        }
    }

    async createPurchase(templateId) {
        try {
            const response = await fetch(`${this.API_URL}/payments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId: templateId,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create purchase');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating purchase:', error);
            throw error;
        }
    }

    async getPendingPayments() {
        try {
            const response = await fetch(`${this.API_URL}/payments/pending`);
            if (!response.ok) {
                throw new Error('Failed to fetch pending payments');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching pending payments:', error);
            return [];
        }
    }

    async confirmPayment(paymentId) {
        try {
            const response = await fetch(`${this.API_URL}/payments/${paymentId}/confirm`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Failed to confirm payment');
            }

            return await response.json();
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    }

    async validateUser(username, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            return await response.json();
        } catch (error) {
            console.error('Error validating user:', error);
            return null;
        }
    }
}

// Initialize database
const db = new Database();
