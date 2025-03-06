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
    const briefStatement = document.querySelector('.brief-statement p, .statement-text');
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
        // Check if Contentful is available
        if (typeof contentful === 'undefined') {
            console.warn('Contentful SDK not loaded');
            return;
        }

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

// Load site settings from Contentful
function loadSiteSettings() {
    // Check if Contentful client is available
    if (typeof contentful === 'undefined') {
        console.warn('Contentful SDK not loaded, skipping site settings');
        return;
    }
    
    const client = contentful.createClient({
        space: '2ic80tk26lba',
        accessToken: '0fj8ZC49Pk_cMvoLHkdsxX0Zg1kZY8eStn9AWCaUk_c'
    });
    
    client.getEntries({
        content_type: 'siteSettings',
        limit: 1
    }).then(response => {
        if (response.items.length > 0) {
            const settings = response.items[0].fields;
            
            // Update homepage brief statement if we're on the homepage
            if (settings.briefStatement) {
                const briefStatement = document.querySelector('.brief-statement p');
                if (briefStatement) {
                    // Replace [word] with <span class="highlight">word</span>
                    const formattedText = settings.briefStatement.replace(
                        /\[([^\]]+)\]/g, 
                        '<span class="highlight">$1</span>'
                    );
                    briefStatement.innerHTML = formattedText;
                }
                
                // For new design with statement-text class
                const statementText = document.querySelector('.statement-text');
                if (statementText) {
                    // Replace [word] with <span class="highlight">word</span>
                    const formattedText = settings.briefStatement.replace(
                        /\[([^\]]+)\]/g, 
                        '<span class="highlight">$1</span>'
                    );
                    statementText.innerHTML = formattedText;
                }
            }
            
            // Update footer text
            if (settings.footerText) {
                const footerInfo = document.querySelector('.footer-info p:last-child');
                if (footerInfo) {
                    footerInfo.textContent = settings.footerText;
                }
            }
            
            // Update footer tagline - MODIFIED TO HANDLE LINE BREAKS
            if (settings.footerTagline) {
                const footerTagline = document.querySelector('.footer-tagline');
                if (footerTagline) {
                    footerTagline.innerHTML = settings.footerTagline.replace(/\n/g, '<br>');
                }
            }

            // Update footer copyright (Inter font text)
            if (settings.footerCopyright) {
                const footerCopyright = document.querySelector('.footer-copyright');
                if (footerCopyright) {
                    footerCopyright.textContent = settings.footerCopyright;
                }
            }
        }
    }).catch(error => {
        console.error('Error loading site settings:', error);
    });
}

// Add this to the existing shared-scripts.js file

// Enhance touch device detection
function enhancedTouchDetection() {
  // Check if device supports touch
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
    document.body.classList.add('touch-device');
    
    // Add specific handling for next project links on touch devices
    const projectNextLinks = document.querySelectorAll('.project-next-link');
    projectNextLinks.forEach(link => {
      // Remove any existing event listeners
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      // Add touch-specific event handling
      newLink.addEventListener('touchstart', function(e) {
        // Only change appearance on touch, don't navigate yet
        this.classList.add('touch-active');
      });
      
      newLink.addEventListener('touchend', function(e) {
        // Remove the active state
        this.classList.remove('touch-active');
      });
      
      newLink.addEventListener('touchcancel', function(e) {
        // Remove the active state
        this.classList.remove('touch-active');
      });
    });
  }
}

// Ensure brief statement text fits within viewport on mobile
function fixBriefStatement() {
  const briefStatement = document.querySelector('.brief-statement p, .statement-text');
  if (briefStatement && window.innerWidth <= 768) {
    // Ensure text wraps properly
    briefStatement.style.width = '100%';
    briefStatement.style.maxWidth = '100%';
    
    // If using the highlight class, ensure it works with wrapped text
    const highlightSpans = briefStatement.querySelectorAll('.highlight');
    highlightSpans.forEach(span => {
      span.style.display = 'inline';
    });
  }
}

// Add these functions to the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  // Call our new functions
  enhancedTouchDetection();
  fixBriefStatement();
  
  // Ensure they run again if the window is resized
  window.addEventListener('resize', function() {
    fixBriefStatement();
  });
});

// Combine DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    setupMobileNav();
    setupAnimations();
    
    // Add touch-friendly behavior for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // Load social links for footer
    loadSocialLinks();
    
    // Load site settings
    loadSiteSettings();
});
