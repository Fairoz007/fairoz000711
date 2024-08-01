document.addEventListener('DOMContentLoaded', (event) => {
    const imageContainer = document.getElementById('imageContainer');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    let currentImageIndex = 0;

    // Array of image file names
    const images = [];
    for (let i = 1; i <= 28; i++) {
        images.push({ src: `images/image000${i}.jpeg`, caption: `Image ${i}` });
    }

    // Dynamically create image cards
    images.forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.dataset.imgSrc = image.src;
        card.dataset.imgCaption = image.caption;

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.caption;

        card.appendChild(img);
        imageContainer.appendChild(card);

        card.addEventListener('click', () => {
            currentImageIndex = index;
            modalImage.src = image.src;
            modalCaption.textContent = image.caption;
            modal.style.display = 'flex';
        });
    });

    function closeModal() {
        modal.style.display = 'none';
    }

    function prevImage() {
        currentImageIndex--;
        if (currentImageIndex < 0) {
            currentImageIndex = images.length - 1;
        }
        modalImage.src = images[currentImageIndex].src;
        modalCaption.textContent = images[currentImageIndex].caption;
    }

    function nextImage() {
        currentImageIndex++;
        if (currentImageIndex >= images.length) {
            currentImageIndex = 0;
        }
        modalImage.src = images[currentImageIndex].src;
        modalCaption.textContent = images[currentImageIndex].caption;
    }

    function returnToCollection() {
        modal.style.display = 'none';
    }

    window.closeModal = closeModal;
    window.prevImage = prevImage;
    window.nextImage = nextImage;
    window.returnToCollection = returnToCollection;
});
