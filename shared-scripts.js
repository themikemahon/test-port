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
                    // observer.unobserve(entry.target); - REMOVE THIS LINE
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
                
                // Update metadata and favicons
                updateMetaAndFavicons(settings);
                
                // Update accent color if provided
                if (settings.accentColor) {
                    // Add the # prefix to the hex code
                    const accentColor = '#' + settings.accentColor;
                    
                    // Set the CSS custom property
                    document.documentElement.style.setProperty('--accent-color', accentColor);
                    console.log('Updated accent color to:', accentColor);
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
    
    // Function to update metadata and favicons
    function updateMetaAndFavicons(settings) {
        if (!settings) return;
        
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
        }
        
        // Update meta description
        if (settings.siteDescription) {
            // Look for existing description meta tag
            let metaDesc = document.querySelector('meta[name="description"]');
            
            // If it doesn't exist, create it
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            
            // Set the content
            metaDesc.setAttribute('content', settings.siteDescription);
        }
        
        // Add meta keywords if available
        if (settings.siteKeywords) {
            // Look for existing keywords meta tag
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            
            // If it doesn't exist, create it
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywords);
            }
            
            // Set the content
            metaKeywords.setAttribute('content', settings.siteKeywords);
        }
        
        // Add favicon links
        const head = document.head;
        
        // Helper function to add favicon link
        function addFavicon(size, field) {
            if (settings[field] && settings[field].fields && settings[field].fields.file) {
                // Remove existing favicon of this size if it exists
                const existing = document.querySelector(`link[rel="icon"][sizes="${size}x${size}"]`);
                if (existing) {
                    existing.remove();
                }
                
                // Create new favicon link
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = 'https:' + settings[field].fields.file.url;
                head.appendChild(link);
            }
        }
        
        // Add different favicon sizes
        addFavicon(16, 'favicon16');
        addFavicon(32, 'favicon32');
        addFavicon(96, 'favicon96');
        
        // Add Apple Touch Icon
        if (settings.appleTouchIcon && settings.appleTouchIcon.fields && settings.appleTouchIcon.fields.file) {
            // Remove existing apple touch icon if it exists
            const existing = document.querySelector('link[rel="apple-touch-icon"]');
            if (existing) {
                existing.remove();
            }
            
            const link = document.createElement('link');
            link.rel = 'apple-touch-icon';
            link.href = 'https:' + settings.appleTouchIcon.fields.file.url;
            head.appendChild(link);
        }
        
        // Add Open Graph meta tags
        if (settings.ogImage && settings.ogImage.fields && settings.ogImage.fields.file) {
            // OG Image
            let ogImage = document.querySelector('meta[property="og:image"]');
            if (!ogImage) {
                ogImage = document.createElement('meta');
                ogImage.setAttribute('property', 'og:image');
                head.appendChild(ogImage);
            }
            ogImage.setAttribute('content', 'https:' + settings.ogImage.fields.file.url);
            
            // OG Image dimensions if available
            if (settings.ogImage.fields.file.details && settings.ogImage.fields.file.details.image) {
                const width = settings.ogImage.fields.file.details.image.width;
                const height = settings.ogImage.fields.file.details.image.height;
                
                let ogWidth = document.querySelector('meta[property="og:image:width"]');
                if (!ogWidth) {
                    ogWidth = document.createElement('meta');
                    ogWidth.setAttribute('property', 'og:image:width');
                    head.appendChild(ogWidth);
                }
                ogWidth.setAttribute('content', width.toString());
                
                let ogHeight = document.querySelector('meta[property="og:image:height"]');
                if (!ogHeight) {
                    ogHeight = document.createElement('meta');
                    ogHeight.setAttribute('property', 'og:image:height');
                    head.appendChild(ogHeight);
                }
                ogHeight.setAttribute('content', height.toString());
            }
        }
        
        // OG Title
        if (settings.siteTitle) {
            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (!ogTitle) {
                ogTitle = document.createElement('meta');
                ogTitle.setAttribute('property', 'og:title');
                head.appendChild(ogTitle);
            }
            ogTitle.setAttribute('content', document.title); // Use the page-specific title
        }
        
        // OG Description
        if (settings.siteDescription) {
            let ogDesc = document.querySelector('meta[property="og:description"]');
            if (!ogDesc) {
                ogDesc = document.createElement('meta');
                ogDesc.setAttribute('property', 'og:description');
                head.appendChild(ogDesc);
            }
            ogDesc.setAttribute('content', settings.siteDescription);
        }
        
        // OG URL (current page)
        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (!ogUrl) {
            ogUrl = document.createElement('meta');
            ogUrl.setAttribute('property', 'og:url');
            head.appendChild(ogUrl);
        }
        ogUrl.setAttribute('content', window.location.href);
        
        // OG Type (default to website)
        let ogType = document.querySelector('meta[property="og:type"]');
        if (!ogType) {
            ogType = document.createElement('meta');
            ogType.setAttribute('property', 'og:type');
            head.appendChild(ogType);
        }
        ogType.setAttribute('content', 'website');
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

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    setupMobileNav();
    setupAnimations();
    enhancedTouchDetection(); // Use the enhanced version instead of the simple check
    fixBriefStatement();
    
    // Load social links for footer
    loadSocialLinks();
    
    // Load site settings
    loadSiteSettings();
    
    // Ensure they run again if the window is resized
    window.addEventListener('resize', function() {
        fixBriefStatement();
    });
});

// Function to update metadata and favicons
    function updateMetaAndFavicons(settings) {
        if (!settings) return;
        
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
        }
        
        // Update meta description
        if (settings.siteDescription) {
            // Look for existing description meta tag
            let metaDesc = document.querySelector('meta[name="description"]');
            
            // If it doesn't exist, create it
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            
            // Set the content
            metaDesc.setAttribute('content', settings.siteDescription);
        }
        
        // Add meta keywords if available
        if (settings.siteKeywords) {
            // Look for existing keywords meta tag
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            
            // If it doesn't exist, create it
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywords);
            }
            
            // Set the content
            metaKeywords.setAttribute('content', settings.siteKeywords);
        }
        
        // Add favicon links
        const head = document.head;
        
        // Helper function to add favicon link
        function addFavicon(size, field) {
            if (settings[field] && settings[field].fields && settings[field].fields.file) {
                // Remove existing favicon of this size if it exists
                const existing = document.querySelector(`link[rel="icon"][sizes="${size}x${size}"]`);
                if (existing) {
                    existing.remove();
                }
                
                // Create new favicon link
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                link.href = 'https:' + settings[field].fields.file.url;
                head.appendChild(link);
            }
        }
        
        // Add different favicon sizes
        addFavicon(16, 'favicon16');
        addFavicon(32, 'favicon32');
        addFavicon(96, 'favicon96');
        
        // Add Apple Touch Icon
        if (settings.appleTouchIcon && settings.appleTouchIcon.fields && settings.appleTouchIcon.fields.file) {
            // Remove existing apple touch icon if it exists
            const existing = document.querySelector('link[rel="apple-touch-icon"]');
            if (existing) {
                existing.remove();
            }
            
            const link = document.createElement('link');
            link.rel = 'apple-touch-icon';
            link.href = 'https:' + settings.appleTouchIcon.fields.file.url;
            head.appendChild(link);
        }
        
        // Add Open Graph meta tags
        if (settings.ogImage && settings.ogImage.fields && settings.ogImage.fields.file) {
            // OG Image
            let ogImage = document.querySelector('meta[property="og:image"]');
            if (!ogImage) {
                ogImage = document.createElement('meta');
                ogImage.setAttribute('property', 'og:image');
                head.appendChild(ogImage);
            }
            ogImage.setAttribute('content', 'https:' + settings.ogImage.fields.file.url);
            
            // OG Image dimensions if available
            if (settings.ogImage.fields.file.details && settings.ogImage.fields.file.details.image) {
                const width = settings.ogImage.fields.file.details.image.width;
                const height = settings.ogImage.fields.file.details.image.height;
                
                let ogWidth = document.querySelector('meta[property="og:image:width"]');
                if (!ogWidth) {
                    ogWidth = document.createElement('meta');
                    ogWidth.setAttribute('property', 'og:image:width');
                    head.appendChild(ogWidth);
                }
                ogWidth.setAttribute('content', width.toString());
                
                let ogHeight = document.querySelector('meta[property="og:image:height"]');
                if (!ogHeight) {
                    ogHeight = document.createElement('meta');
                    ogHeight.setAttribute('property', 'og:image:height');
                    head.appendChild(ogHeight);
                }
                ogHeight.setAttribute('content', height.toString());
            }
        }
        
        // OG Title
        if (settings.siteTitle) {
            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (!ogTitle) {
                ogTitle = document.createElement('meta');
                ogTitle.setAttribute('property', 'og:title');
                head.appendChild(ogTitle);
            }
            ogTitle.setAttribute('content', document.title); // Use the page-specific title
        }
        
        // OG Description
        if (settings.siteDescription) {
            let ogDesc = document.querySelector('meta[property="og:description"]');
            if (!ogDesc) {
                ogDesc = document.createElement('meta');
                ogDesc.setAttribute('property', 'og:description');
                head.appendChild(ogDesc);
            }
            ogDesc.setAttribute('content', settings.siteDescription);
        }
        
        // OG URL (current page)
        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (!ogUrl) {
            ogUrl = document.createElement('meta');
            ogUrl.setAttribute('property', 'og:url');
            head.appendChild(ogUrl);
        }
        ogUrl.setAttribute('content', window.location.href);
        
        // OG Type (default to website)
        let ogType = document.querySelector('meta[property="og:type"]');
        if (!ogType) {
            ogType = document.createElement('meta');
            ogType.setAttribute('property', 'og:type');
            head.appendChild(ogType);
        }
        ogType.setAttribute('content', 'website');
    }
