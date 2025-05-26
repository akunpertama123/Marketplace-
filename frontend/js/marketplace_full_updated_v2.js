 // Check authentication on page load
 const currentUser = checkAuth();
 if (currentUser?.role !== 'user') {
     window.location.href = '../index.html';
 }
 
 // Initialize Bootstrap modal
 let templateModal;
 let selectedTemplate;
 document.addEventListener('DOMContentLoaded', async function() {
     templateModal = new bootstrap.Modal(document.getElementById('templateModal'));
     await loadTemplates();
     
     // Set username in navbar
     document.getElementById('username').textContent = currentUser.username;
 });
 
 async function loadTemplates(filter = 'all') {
     const templates = await db.getTemplates();
     const grid = document.getElementById('templatesGrid');
     grid.innerHTML = '';
 
     if (!templates || templates.length === 0) {
         grid.innerHTML = '<div class="col-12 text-center"><p>No templates available</p></div>';
         return;
     }

    const filteredTemplates = templates.filter(template => filter === 'all' || template.type === filter);
    
    if (filteredTemplates.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center"><p>No templates found for selected filter</p></div>';
        return;
    }

    filteredTemplates.forEach(template => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        // Get first preview image or use placeholder
        let previewImage;
        if (template.samplePreviewPaths && template.samplePreviewPaths.length > 0) {
            previewImage = '/uploads/' + template.samplePreviewPaths[0].split(/[\\/]/).pop();
        } else {
            previewImage = '/marketplace/assets/samples/slide1.jpg';
        }
             
        col.innerHTML = `
            <div class="card template-card">
                <img src="${previewImage}" 
                     class="card-img-top" 
                     alt="Sample Preview" 
                     style="height: 200px; object-fit: cover; cursor: pointer;" 
                     onclick="showTemplateDetailsAsync('${template.id}')">
                <div class="card-body">
                    <span class="template-type type-${template.type}">
                        ${template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </span>
                    <h5 class="card-title">${template.title}</h5>
                    <p class="card-text description">${template.description}</p>
                    <div class="price">Rp ${template.price.toLocaleString()}</div>
                    <button class="btn btn-view-details-custom w-100 mt-3" onclick="handleViewDetailsClick(this, '${template.id}')">View Details</button>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

// Filter templates
function filterTemplates(type) {
    // Update active button
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load filtered templates
    loadTemplates(type);
}

function handleViewDetailsClick(button, id) {
    button.classList.toggle('clicked');
    showTemplateDetailsAsync(id);
}

// Search templates
function searchTemplates() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const templates = db.getTemplates();
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = '';

    templates
        .filter(template => 
            template.title.toLowerCase().includes(searchTerm) ||
            template.description.toLowerCase().includes(searchTerm)
        )
        .forEach(template => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.innerHTML = `
                <div class="card template-card" onclick="showTemplateDetails('${template.id}')">
                    <div class="card-body">
                        <span class="template-type type-${template.type}">
                            ${template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                        </span>
                        <h5 class="card-title">${template.title}</h5>
                        <p class="card-text description">${template.description}</p>
                        <div class="price">Rp ${template.price.toLocaleString()}</div>
                    </div>
                </div>
            `;
            grid.appendChild(col);
        });
}

function showTemplateDetails(id) {
    // This function is now async to await templates
    showTemplateDetailsAsync(id);
}

async function showTemplateDetailsAsync(id) {
    const templates = await db.getTemplates();
    const template = templates.find(t => t.id === id);

    if (template) {
        selectedTemplate = template;

        // Hide templates grid and show detailed product card
        document.getElementById('templatesGrid').style.display = 'none';
        const detailCard = document.getElementById('detailedProductCard');
        detailCard.style.display = 'block';

        // Populate detailed product card
        document.getElementById('detailTitle').textContent = template.title;
        document.getElementById('detailDescription').textContent = template.description;

        // Calculate file size approx
        const base64Data = template.fileUrl;
        let fileSize = 'N/A';
        if (base64Data) {
            fileSize = Math.round((base64Data.length * 3) / 4 / 1024);
            fileSize = `${fileSize} KB`;
        }
        document.getElementById('detailFileSize').textContent = fileSize;

        // Initialize image preview modal
        const imagePreviewModal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
        let currentImageIndex = 0;
        let previewImages = [];

        // Populate sample previews
        const previewsContainer = document.getElementById('detailSamplePreviews');
        previewsContainer.innerHTML = '';

        // Function to show image in modal
        const showImageInModal = (index) => {
            const previewImage = document.getElementById('previewImage');
            previewImage.src = previewImages[index];
            document.getElementById('imageCounter').textContent = `${index + 1} / ${previewImages.length}`;
            
            // Update navigation button visibility
            document.getElementById('prevImage').style.display = index === 0 ? 'none' : 'block';
            document.getElementById('nextImage').style.display = index === previewImages.length - 1 ? 'none' : 'block';
        };

        // Get preview images
        if (template.samplePreviewPaths && Array.isArray(template.samplePreviewPaths) && template.samplePreviewPaths.length > 0) {
            previewImages = template.samplePreviewPaths.map(p => '/uploads/' + p.split(/[\\/]/).pop());
            template.samplePreviewPaths.forEach((url, index) => {
                const img = document.createElement('img');
                img.src = '/uploads/' + url.split(/[\\/]/).pop();
                img.style.maxWidth = '150px';
                img.style.maxHeight = '150px';
                img.style.objectFit = 'cover';
                img.classList.add('border', 'rounded', 'me-2', 'mb-2');
                img.alt = `Sample Preview ${index + 1}`;
                img.onclick = () => {
                    currentImageIndex = index;
                    showImageInModal(currentImageIndex);
                    imagePreviewModal.show();
                };
                previewsContainer.appendChild(img);
            });
        } else {
            previewImages = [];
        }

        // Setup buttons
        const btnAddToCart = document.getElementById('btnAddToCart');
        const btnPayNow = document.getElementById('btnPayNow');

if (btnAddToCart) {
    btnAddToCart.onclick = function() {
        // Check if already in cart
        let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        if (cart.find(item => item.id === template.id)) {
            alert('Item sudah ada di keranjang');
            return;
        }
        // Add samplePreviewUrls to template before adding to cart
        const templateWithUrls = {
            ...template,
            samplePreviewUrls: (template.samplePreviewPaths || []).map(p => '/uploads/' + p.split(/[\\/]/).pop())
        };
        cart.push(templateWithUrls);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        alert('Item berhasil ditambahkan ke keranjang');
    };
}

if (btnPayNow) {
    btnPayNow.onclick = function() {
        // Add to cart if not already
        let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        if (!cart.find(item => item.id === template.id)) {
            // Add samplePreviewUrls to template before adding to cart
            const templateWithUrls = {
                ...template,
                samplePreviewUrls: (template.samplePreviewPaths || []).map(p => '/uploads/' + p.split(/[\\/]/).pop())
            };
            cart.push(templateWithUrls);
            sessionStorage.setItem('cart', JSON.stringify(cart));
        }
        // Redirect to payment page
        window.location.href = 'payment.html';
    };
}

        if (btnPayNow) {
            btnPayNow.onclick = function() {
                // Add to cart if not already
                let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
                if (!cart.find(item => item.id === template.id)) {
                    cart.push(template);
                    sessionStorage.setItem('cart', JSON.stringify(cart));
                }
                // Redirect to payment page
                window.location.href = 'payment.html';
            };
        }

        // Set up navigation buttons
        document.getElementById('prevImage').onclick = () => {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                showImageInModal(currentImageIndex);
            }
        };

        document.getElementById('nextImage').onclick = () => {
            if (currentImageIndex < previewImages.length - 1) {
                currentImageIndex++;
                showImageInModal(currentImageIndex);
            }
        };
    }
}

// Cart management
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

// Add to cart
function addToCart() {
    if (!selectedTemplate) return;

    // Check if already in cart
    if (cart.find(item => item.id === selectedTemplate.id)) {
        alert('Item already in cart');
        return;
    }

    cart.push(selectedTemplate);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart');
}

// Add to cart by template id
function addToCartById(id) {
    const templates = db.getTemplates();
    const template = templates.find(t => t.id === id);
    if (!template) {
        alert('Template not found');
        return;
    }
    if (cart.find(item => item.id === id)) {
        alert('Item already in cart');
        return;
    }
    // Add samplePreviewUrls to template before adding to cart
    const templateWithUrls = {
        ...template,
        samplePreviewUrls: (template.samplePreviewPaths || []).map(p => '/uploads/' + p.split(/[\\/]/).pop())
    };
    cart.push(templateWithUrls);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart');
}

// Buy now by template id (add to cart and redirect to payment)
function buyNow(id) {
    addToCartById(id);
    window.location.href = 'payment.html';
}

// Remove from cart (used in cart.html)
function removeFromCart(index) {
    cart.splice(index, 1);
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

/* Removed import statement for createPayment */

// Purchase templates (called from payment page)
async function purchaseTemplates() {
    if (!Array.isArray(cart) || cart.length === 0) return;

    const currentUserId = currentUser?.email || null;
    if (!currentUserId) {
        alert('User not logged in properly.');
        return;
    }

    try {
        for (const template of cart) {
            const paymentData = {
                templateId: template.id,
                buyerId: currentUserId,
                price: template.price
            };
            // Use global createPayment function
            await window.createPayment(paymentData);
        }

        // Clear cart and purchases in local storage
        db.savePurchases([]);
        cart = [];
        sessionStorage.removeItem('cart');

        alert('Purchase successful! You can now download your templates.');
        window.location.href = '/marketplace/browse.html';
    } catch (error) {
        alert('Error processing payment: ' + error.message);
    }
}

// Update cart count badge
function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const badge = document.getElementById('cartCountBadge');
    if (badge) {
        badge.textContent = cart.length;
        badge.style.display = cart.length > 0 ? 'inline' : 'none';
    }
}

// Navigate to cart page
function goToCart() {
    window.location.href = 'cart.html';
}

// Call updateCartCount on page load and after cart changes
updateCartCount();

// Override addToCartById and addToCart to update cart count
const originalAddToCartById = addToCartById;
addToCartById = function(id) {
    originalAddToCartById(id);
    updateCartCount();
};

const originalAddToCart = addToCart;
addToCart = function() {
    originalAddToCart();
    updateCartCount();
};

function showCartItemPreview(index) {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (index < 0 || index >= cart.length) return;

    const item = cart[index];
    const modalTitle = document.getElementById('cartItemPreviewTitle');
    const modalImages = document.getElementById('cartItemPreviewImages');

    modalTitle.textContent = item.title;
    modalImages.innerHTML = '';

    if (item.samplePreviewUrls && item.samplePreviewUrls.length > 0) {
        item.samplePreviewUrls.forEach((url, i) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Sample Preview ${i + 1}`;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            img.style.objectFit = 'cover';
            img.classList.add('border', 'rounded');
            modalImages.appendChild(img);
        });
    }

    const modal = new bootstrap.Modal(document.getElementById('cartItemPreviewModal'));
    modal.show();
}

// Handle search on enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchTemplates();
    }
});
