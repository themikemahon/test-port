// Mobile navigation toggle
function setupMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('nav');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !navToggle.contains(e.target) && nav.classList.contains('active')) {
                nav.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Animation for elements when they enter viewport
function setupAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    
    // Only setup the observer if there are elements to animate
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Special handling for brief statement and project cards on homepage
    const briefStatement = document.querySelector('.brief-statement p');
    if (briefStatement) {
        setTimeout(() => {
            briefStatement.style.opacity = '1';
            briefStatement.style.transform = 'translateY(0)';
        }, 300);
    }
    
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 500 + (index * 100));
    });
}

// Function to load social links for the footer
async function loadSocialLinks() {
    try {
        // Initialize Contentful client
        const client = contentful.createClient({
            space: '2ic80tk26lba',
            accessToken: '0fj8ZC49Pk_cMvoLHkdsxX0Zg1kZY8eStn9AWCaUk_c'
        });
        
        // Fetch social links
        const response = await client.getEntries({
            content_type: 'socialLinks'
        });
        
        if (response.items.length === 0) {
            console.warn('No social links found in Contentful.');
            return;
        }
        
        // Update footer social links
        const socialLinksContainer = document.querySelector('.footer-column:nth-of-type(2) ul');
        if (socialLinksContainer) {
            socialLinksContainer.innerHTML = '';
            
            // Add each social link
            response.items.forEach(item => {
                const platform = item.fields.platform;
                const url = item.fields.url;
                
                if (platform && url) {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = url;
                    a.target = "_blank";
                    a.textContent = platform;
                    li.appendChild(a);
                    socialLinksContainer.appendChild(li);
                }
            });
        }
    } catch (error) {
        console.error('Error loading social links:', error);
    }
}

// Initialize all shared functionality
document.addEventListener('DOMContentLoaded', function() {
    setupMobileNav();
    setupAnimations();
    
    // Add touch-friendly behavior for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // Load social links for footer
    loadSocialLinks();
});
