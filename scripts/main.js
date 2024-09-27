document.addEventListener('DOMContentLoaded', (event) => {
    // EmailJS initialization
    (function() {
        emailjs.init("Z9mJIXGq7G-2EdgM1");
    })();

    // Contact form submission
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();

        // Capture form data
        var name = document.getElementById('name').value;
        var email = document.getElementById('email').value;
        var message = document.getElementById('message').value;

        // Log captured data (for debugging purposes)
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Message:', message);

        // Show loading spinner
        var submitButton = document.getElementById('contact-submit');
        submitButton.classList.add('loading');

        // Send email using EmailJS
        emailjs.send('service_jzmj0kp', 'template_fgnxqnh', {
            name: name,
            email: email,
            message: message
        }).then(function() {
            // Hide the contact form
            document.getElementById('contact-form').style.display = 'none';
            // Show the success message with a "Contact Again" button
            document.getElementById('status-message').innerHTML = `
                Thanks for contacting us. We will get back to you soon.
                <br><br>
                <button id="contact-again-btn" class="contact_btn" onclick="contactAgain()">Contact Again</button>
            `;
        }, function(error) {
            document.getElementById('status-message').innerHTML = "Failed to send message: " + JSON.stringify(error);
        }).finally(function() {
            // Hide loading spinner
            submitButton.classList.remove('loading');
        });
    });
});

// Contact Again functionality
function contactAgain() {
    // Reset the form fields
    document.getElementById('contact-form').reset();
    // Show the contact form
    document.getElementById('contact-form').style.display = 'block';
    // Clear the status message
    document.getElementById('status-message').innerHTML = '';
}

// Add the 'loading' class to the body initially
document.body.classList.add('loading');

// Ensure 'loading' class is added to body initially
document.body.classList.add('loading');

// Function to hide the loader after a delay once the page has fully loaded
window.onload = function() {
    const loader = document.querySelector('.loader');
    if (loader) {
        // Delay hiding the loader by 2 seconds (2000 ms) after page load
        setTimeout(() => {
            loader.style.display = 'none'; // Hide the loader
            document.body.classList.remove('loading'); // Re-enable scrolling
        }, 500); // Adjust this value to control the delay (2000 ms = 2 seconds)
    }
};
