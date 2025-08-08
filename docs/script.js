// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Install button functionality
const installBtn = document.getElementById('install-btn');
const installButtons = document.querySelectorAll('a[href="#install"]');

// Function to handle Chrome Web Store installation
function handleInstallClick(e) {
    e.preventDefault();
    
    // Check if running in Chrome
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    if (isChrome) {
        // Try to open Chrome Web Store (will be updated with actual URL)
        const webStoreUrl = 'https://chrome.google.com/webstore/search/replygenius';
        window.open(webStoreUrl, '_blank');
    } else {
        // Show message for non-Chrome browsers
        showBrowserMessage();
    }
}

function showBrowserMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 1001;
        max-width: 300px;
        font-size: 0.875rem;
        line-height: 1.5;
    `;
    message.innerHTML = `
        <strong>Chrome Required</strong><br>
        ReplyGenius is a Chrome extension. Please install it from the Chrome Web Store using Google Chrome.
    `;
    
    document.body.appendChild(message);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Attach click handlers to install buttons
installButtons.forEach(button => {
    button.addEventListener('click', handleInstallClick);
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .step');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Demo animation for AI reply
function startDemoAnimation() {
    const typingIndicator = document.querySelector('.typing-indicator');
    const generatedReply = document.querySelector('.generated-reply');
    
    // Show typing indicator
    typingIndicator.style.display = 'flex';
    generatedReply.style.display = 'none';
    
    // After 2 seconds, show the reply
    setTimeout(() => {
        typingIndicator.style.display = 'none';
        generatedReply.style.display = 'block';
        generatedReply.style.opacity = '0';
        generatedReply.style.transform = 'translateY(10px)';
        
        // Animate in the reply
        setTimeout(() => {
            generatedReply.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            generatedReply.style.opacity = '1';
            generatedReply.style.transform = 'translateY(0)';
        }, 100);
    }, 2000);
}

// Start demo animation on page load and repeat every 6 seconds
document.addEventListener('DOMContentLoaded', () => {
    startDemoAnimation();
    setInterval(startDemoAnimation, 6000);
});

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    // Implementation for mobile menu toggle
    // Can be added if navigation becomes more complex
}

// Performance optimization: Lazy load images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Analytics tracking (placeholder for future implementation)
function trackEvent(eventName, properties = {}) {
    // Placeholder for analytics tracking
    console.log(`Event: ${eventName}`, properties);
}

// Track important user interactions
document.addEventListener('DOMContentLoaded', () => {
    // Track install button clicks
    installButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('install_button_clicked', {
                location: button.closest('section')?.id || 'unknown'
            });
        });
    });
    
    // Track section views
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackEvent('section_viewed', {
                    section: entry.target.id
                });
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => sectionObserver.observe(section));
});