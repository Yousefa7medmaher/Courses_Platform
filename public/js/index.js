// Minimal Landing Page JavaScript - Safe Version
console.log('Landing page JavaScript loading...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing page features...');

    // Ensure all content is visible
    document.body.style.visibility = 'visible';

    // Basic form handling only
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }

    // Simple button click effects
    document.querySelectorAll('.cta-btn, .path-btn, .submit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Add a simple click effect
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });

    console.log('Page features initialized successfully');
});
