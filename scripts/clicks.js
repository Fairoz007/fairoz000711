document.addEventListener('DOMContentLoaded', () => {
    const imageContainer = document.querySelector('.cards');
    const backButton = document.getElementById('backButton');

    // Array of image file names
    const images = [
        "image0001.jpeg", "image0002.jpeg", "image0003.jpeg", "image0004.jpeg", 
        "image0005.jpeg", "image0006.jpeg", "image0007.jpeg", "image0008.jpeg", 
        "image0009.jpeg", "image00010.jpeg", "image00011.jpeg", "image00012.jpeg", 
        "image00013.jpeg", "image00014.jpeg", "image00015.jpeg", "image00016.jpeg", 
        "image00017.jpeg", "image00018.jpeg", "image00019.jpeg", "image00020.jpeg", 
        "image00021.jpeg", "image00022.jpeg", "image00023.jpeg", "image00024.jpeg", 
        "image00025.jpeg", "image00026.jpeg", "image00027.jpeg", "image00028.jpeg", 
        "image00029.png"
    ];

    // Dynamically create image cards
    images.forEach((image, index) => {
        const card = document.createElement('figure');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = `images/${image}`;
        img.alt = `Image ${index + 1}`;

        card.appendChild(img);
        imageContainer.appendChild(card);
    });

    // Back button functionality
    backButton.addEventListener('click', () => {
        window.location.href = '/'; // Change this to your preferred home page URL
    });
});
