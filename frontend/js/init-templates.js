const sampleTemplates = [
    {
        id: '1',
        title: 'Business Presentation',
        price: 150000,
        description: 'Professional business presentation template with modern design',
        type: 'powerpoint',
        fileUrl: 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
        samplePreviewUrls: [
            'https://picsum.photos/400/300?random=1',
            'https://picsum.photos/400/300?random=2',
            'https://picsum.photos/400/300?random=3'
        ],
        uploadDate: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Financial Report',
        price: 100000,
        description: 'Comprehensive financial report template with automated calculations',
        type: 'excel',
        fileUrl: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
        samplePreviewUrls: [
            'https://picsum.photos/400/300?random=4',
            'https://picsum.photos/400/300?random=5',
            'https://picsum.photos/400/300?random=6'
        ],
        uploadDate: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Marketing Pitch Deck',
        price: 200000,
        description: 'Eye-catching marketing presentation template with infographics',
        type: 'powerpoint',
        fileUrl: 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAA==',
        samplePreviewUrls: [
            'https://picsum.photos/400/300?random=7',
            'https://picsum.photos/400/300?random=8',
            'https://picsum.photos/400/300?random=9'
        ],
        uploadDate: new Date().toISOString()
    }
];

// Initialize templates in localStorage
localStorage.setItem('templates', JSON.stringify(sampleTemplates));
console.log('Sample templates initialized successfully!');

function loadTemplates(filter = 'all') {
    console.log('loadTemplates function called with filter:', filter);
    const templates = JSON.parse(localStorage.getItem('templates')) || [];
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = '';

    if (templates.length === 0) {
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
        col.className = 'col-md-4 mb-4 d-flex align-items-stretch';

        let previewImage = '/marketplace/assets/samples/slide1.jpg';
        if (template.samplePreviewUrls && template.samplePreviewUrls.length > 0) {
            previewImage = template.samplePreviewUrls[0];
        }

        col.innerHTML = `
            <div class="card template-card">
                <img src="${previewImage}" class="card-img-top" alt="Sample Preview" style="height: 150px; object-fit: cover; cursor: default;">
                <div class="card-body">
                    <span class="template-type type-${template.type}">
                        ${template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </span>
                    <h5 class="card-title text-truncate" title="${template.title}">${template.title}</h5>
                    <p class="card-text description">${template.description}</p>
                    <div class="price">Rp ${template.price.toLocaleString()} <button class="btn-buy">Beli Sekarang</button></div>
                    <button class="btn-view-details mt-2">View Details</button>
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
            const template = filteredTemplates[index];
            alert(`Beli Sekarang clicked for: ${template.title}`);
        });
    });
}
