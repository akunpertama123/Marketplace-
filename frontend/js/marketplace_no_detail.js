document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = checkAuth();
    if (!currentUser) {
        // Redirect handled in checkAuth, stop further execution
        return;
    }
    if (currentUser.role !== 'user') {
        window.location.href = '../index.html';
        return;
    }
    // Set username in navbar
    document.getElementById('username').textContent = currentUser.username;
    await loadTemplates();
});

async function loadTemplates(filter = 'all') {
    let templates = await db.getTemplates();
    if (!templates || templates.length === 0) {
        // Fallback to localStorage templates if API returns empty
        const localTemplates = localStorage.getItem('templates');
        if (localTemplates) {
            templates = JSON.parse(localTemplates);
        }
    }
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

        let previewImage;
        if (template.samplePreviewPaths && template.samplePreviewPaths.length > 0) {
            previewImage = '/uploads/' + template.samplePreviewPaths[0].split(/[\\/]/).pop();
        } else if (template.samplePreviewUrls && template.samplePreviewUrls.length > 0) {
            previewImage = template.samplePreviewUrls[0];
        } else {
            previewImage = '/marketplace/assets/samples/slide1.jpg';
        }

        col.innerHTML = `
            <div class="card template-card">
                <img src="${previewImage}"
                     class="card-img-top"
                     alt="Sample Preview"
                     style="height: 150px; object-fit: cover; cursor: default;">
                <div class="card-body">
                    <span class="template-type type-${template.type}">
                        ${template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </span>
                    <h5 class="card-title text-truncate" title="${template.title}">${template.title}</h5>
                    <p class="card-text description text-truncate">${template.description}</p>
                    <div class="price-container" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="price">Rp ${template.price.toLocaleString()}</div>
                        <button class="btn-buy">Beli Sekarang</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });

    // Add click event listeners to "Beli Sekarang" buttons
    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            // Redirect to login page on button click
            window.location.href = 'login.html';
        });
    });
}

function filterTemplates(type) {
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    loadTemplates(type);
}

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
                <div class="card template-card">
                    <div class="card-body">
                        <span class="template-type type-${template.type}">
                            ${template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                        </span>
                        <h5 class="card-title text-truncate" title="${template.title}">${template.title}</h5>
                        <p class="card-text description text-truncate">${template.description}</p>
                        <div class="price">Rp ${template.price.toLocaleString()}</div>
                    </div>
                </div>
            `;
            grid.appendChild(col);
        });
}
