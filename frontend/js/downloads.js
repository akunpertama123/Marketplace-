document.addEventListener('DOMContentLoaded', function() {
    const currentUser = checkAuth();
    if (!currentUser) {
        alert('Anda harus login terlebih dahulu.');
        window.location.href = '../login.html';
        return;
    }

    const downloadsList = document.getElementById('downloadsList');
    downloadsList.innerHTML = '';

    let purchasedProducts = JSON.parse(sessionStorage.getItem('selectedTemplatesForDownload')) || [];
    console.log('Loaded purchasedProducts from sessionStorage:', purchasedProducts);  // Added log

    if (!purchasedProducts || purchasedProducts.length === 0) {
        downloadsList.innerHTML = '<div class="col-12 text-center"><p>Tidak ada produk yang siap diunduh.</p></div>';
        return;
    }

    fetch('/api/payments')
        .then(response => response.json())
        .then(payments => {
            console.log('Fetched payments from API:', payments);  // Added log
            purchasedProducts.forEach(product => {
                const payment = payments.find(p => p.templateId === product.id && p.buyerEmail.toLowerCase() === currentUser.email.toLowerCase());
                const isApproved = payment && (payment.status === 'confirmed' || payment.status === 'approved');

                const col = document.createElement('div');
                col.className = 'col-md-4 mb-4';

                const card = document.createElement('div');
                card.className = 'card h-100 shadow-sm';

                const previewContainer = document.createElement('div');
                previewContainer.style.display = 'flex';
                previewContainer.style.gap = '10px';
                previewContainer.style.margin = '10px';
                previewContainer.style.justifyContent = 'center';
                previewContainer.style.overflow = 'hidden';

                if (product.samplePreviewUrls && product.samplePreviewUrls.length > 0) {
                    product.samplePreviewUrls.forEach(url => {
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = 'Sample Preview';
                        img.style.width = '100px';
                        img.style.height = '100px';
                        img.style.objectFit = 'cover';
                        img.style.border = '1px solid #ccc';
                        img.style.borderRadius = '4px';
                        previewContainer.appendChild(img);
                    });
                }

                const cardBody = document.createElement('div');
                cardBody.className = 'card-body d-flex flex-column';

                const title = document.createElement('h5');
                title.className = 'card-title';
                title.textContent = product.title;

                const btnDownload = document.createElement('button');
                btnDownload.className = isApproved ? 'btn btn-download-green mt-auto' : 'btn btn-download-red mt-auto';
                btnDownload.textContent = 'Download';
                if (isApproved) {
                    btnDownload.onclick = () => {
                        window.location.href = `/api/templates/${product.id}/download?email=${encodeURIComponent(currentUser.email)}`;
                    };
                } else {
                    btnDownload.onclick = () => {
                        alert('Pembayaran belum di-ACC oleh admin.');
                    };
                }

                cardBody.appendChild(title);
                cardBody.appendChild(previewContainer);
                cardBody.appendChild(btnDownload);

                card.appendChild(cardBody);
                col.appendChild(card);
                downloadsList.appendChild(col);
            });
        })
        .catch(error => {
            downloadsList.innerHTML = '<div class="col-12 text-center text-danger"><p>Gagal memuat data pembayaran.</p></div>';
            console.error('Error fetching payments:', error);
        });
});
