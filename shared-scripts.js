// Loading state management
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

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
            
            // Fetch social links with ordering
            const response = await client.getEntries({
                content_type: 'socialLinks',
                order: 'fields.order'  // ← Order by the order field
            });
            
            if (response.items.length === 0) {
                console.warn('No social links found in Contentful.');
                return;
            }
            
            // Sort by order field (backup sorting)
            const sortedItems = response.items.sort((a, b) => {
                const orderA = a.fields.order || 999;
                const orderB = b.fields.order || 999;
                return orderA - orderB;
            });
            
            // Update footer social links
            const socialLinksContainer = document.querySelector('.footer-column:nth-of-type(2) ul');
            if (socialLinksContainer) {
                socialLinksContainer.innerHTML = '';
                
                // Add each social link in the correct order
                sortedItems.forEach(item => {
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
// Simplified site settings loader with better error handling
function loadSiteSettings() {
    // Check if Contentful client is available
    if (typeof contentful === 'undefined') {
        console.warn('Contentful SDK not loaded, using static metadata');
        return Promise.resolve();
    }
    
    const client = contentful.createClient({
        space: '2ic80tk26lba',
        accessToken: '0fj8ZC49Pk_cMvoLHkdsxX0Zg1kZY8eStn9AWCaUk_c'
    });
    
    return client.getEntries({
        content_type: 'siteSettings',
        limit: 1
    }).then(response => {
        console.log('Site settings response:', response);
        
        if (response.items.length > 0) {
            const settings = response.items[0].fields;
            console.log('Found site settings:', settings);
            
            // Update metadata and favicons
            updateMetaAndFavicons(settings);
            
            // Update accent color if provided (FIXED - now works correctly)
            if (settings.accentColor) {
                let accentColor = settings.accentColor;
                
                // Add # prefix if not present
                if (!accentColor.startsWith('#')) {
                    accentColor = '#' + accentColor;
                }
                
                // Set the CSS custom property
                document.documentElement.style.setProperty('--accent-color', accentColor);
                console.log('✅ Updated accent color to:', accentColor);
            }
            
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
            
            // Update footer tagline - handle line breaks
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
            
            console.log('✅ Site settings loaded successfully');
        } else {
            console.warn('No site settings found in Contentful - using static content');
        }
    }).catch(error => {
        console.error('❌ Error loading site settings:', error);
        console.log('Falling back to static metadata...');
        
        // Set a default accent color if nothing is loaded
        document.documentElement.style.setProperty('--accent-color', '#FF6B35');
    });
}

function updateMetaAndFavicons(settings) {
    if (!settings) {
        console.log('No settings provided, using defaults');
        return;
    }
    
    console.log('Updating metadata and favicons with settings:', settings);
    
    // Update title if available
    if (settings.siteTitle) {
        // Get current page title (e.g., "About | Mike Mahon")
        const currentTitle = document.title;
        // If the title contains " | ", preserve the first part (page name)
        if (currentTitle.includes(" | ")) {
            const pageName = currentTitle.split(" | ")[0];
            document.title = `${pageName} | ${settings.siteTitle}`;
        } else {
            document.title = settings.siteTitle;
        }
        console.log('✅ Updated title to:', document.title);
    }
    
    // Get the current page URL
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    // Update meta description
    if (settings.siteDescription) {
        updateOrCreateMetaTag('name', 'description', settings.siteDescription);
        updateOrCreateMetaTag('property', 'og:description', settings.siteDescription);
        updateOrCreateMetaTag('name', 'twitter:description', settings.siteDescription);
        console.log('✅ Updated meta descriptions');
    }
    
    // Add meta keywords if available
    if (settings.siteKeywords) {
        updateOrCreateMetaTag('name', 'keywords', settings.siteKeywords);
        console.log('✅ Updated meta keywords');
    }
    
    // Update Open Graph and Twitter meta tags with current page info
    updateOrCreateMetaTag('property', 'og:title', document.title);
    updateOrCreateMetaTag('property', 'og:type', 'website');
    updateOrCreateMetaTag('property', 'og:url', currentUrl);
    updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMetaTag('name', 'twitter:title', document.title);
    
    console.log('✅ Updated basic Open Graph and Twitter tags');
    
    // Add favicons with better error handling
    addFavicon(16, settings.favicon16);
    addFavicon(32, settings.favicon32);
    addFavicon(96, settings.favicon96);
    
    // Add Apple Touch Icon
    if (settings.appleTouchIcon && settings.appleTouchIcon.fields && settings.appleTouchIcon.fields.file) {
        const existing = document.querySelector('link[rel="apple-touch-icon"]');
        if (existing) existing.remove();
        
        let iconUrl = settings.appleTouchIcon.fields.file.url;
        if (iconUrl.startsWith('//')) {
            iconUrl = 'https:' + iconUrl;
        }
        
        const link = document.createElement('link');
        link.rel = 'apple-touch-icon';
        link.href = iconUrl;
        document.head.appendChild(link);
        console.log('✅ Added Apple Touch Icon:', iconUrl);
    }
    
    // Log final meta tag values for debugging
    setTimeout(() => {
        console.log('=== FINAL META TAG VALUES ===');
        console.log('og:url:', document.querySelector('meta[property="og:url"]')?.getAttribute('content'));
        console.log('og:title:', document.querySelector('meta[property="og:title"]')?.getAttribute('content'));
        console.log('og:description:', document.querySelector('meta[property="og:description"]')?.getAttribute('content'));
    }, 100);
}

// Helper function to update or create meta tags (same as before)
function updateOrCreateMetaTag(attribute, property, content) {
    if (!content) {
        console.warn(`Empty content for ${property}, skipping`);
        return;
    }
    
    let meta = document.querySelector(`meta[${attribute}="${property}"]`);
    
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
        console.log(`Created new meta tag: ${property}`);
    }
    
    meta.setAttribute('content', content);
    console.log(`Updated ${property}: ${content}`);
}

// Helper function to add favicon (improved)
function addFavicon(size, field) {
    if (field && field.fields && field.fields.file) {
        const existing = document.querySelector(`link[rel="icon"][sizes="${size}x${size}"]`);
        if (existing) existing.remove();
        
        let iconUrl = field.fields.file.url;
        if (iconUrl.startsWith('//')) {
            iconUrl = 'https:' + iconUrl;
        }
        
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.sizes = `${size}x${size}`;
        link.href = iconUrl;
        document.head.appendChild(link);
        console.log(`✅ Added ${size}x${size} favicon:`, iconUrl);
    } else {
        console.log(`No ${size}x${size} favicon provided`);
    }
}

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
                this.classList.add('touch-active');
            });
            
            newLink.addEventListener('touchend', function(e) {
                this.classList.remove('touch-active');
            });
            
            newLink.addEventListener('touchcancel', function(e) {
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

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing shared scripts...');
    
    setupMobileNav();
    setupAnimations();
    enhancedTouchDetection();
    fixBriefStatement();
    
    // Load all shared content
    const promises = [];
    
    // Add loading promises
    promises.push(loadSocialLinks());
    promises.push(loadSiteSettings());
    
    // Wait for all shared content to load, then hide overlay
    Promise.all(promises).finally(() => {
        console.log('✅ All shared content loaded');
        // Give a small delay to ensure page-specific content has also loaded
        setTimeout(() => {
            hideLoadingOverlay();
        }, 500);
    });
});
