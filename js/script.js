// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Immediately set up the mobile menu toggle
    setupMobileMenu();
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Only process links that point to the current page with a hash
            if (href.includes('#') && (href.startsWith('#') || 
                href.startsWith('index.html#') && window.location.pathname.endsWith('index.html') || 
                href.startsWith(window.location.pathname + '#'))) {
                
                e.preventDefault();
                
                // Extract just the hash part
                const hashParts = href.split('#');
                const targetId = hashParts[hashParts.length - 1];
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
            
            // Close mobile menu when a link is clicked
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            if (navLinks && navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
                if (menuToggle) {
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    // Make external links open in a new window
    const setupExternalLinks = () => {
        const allLinks = document.querySelectorAll('a');
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('http') || href.startsWith('https'))) {
                // This is an external link
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    };
    
    // Initialize external links
    setupExternalLinks();
    
    // Animate elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.card, .about-feature, .testimonial');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('fade-in');
            }
        });
    };
    
    // Initial check for elements in view
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Mobile menu toggle function
    function setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle && navLinks) {
            // Remove any existing event listeners before adding new ones
            const newMenuToggle = menuToggle.cloneNode(true);
            menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
            
            // Add event listener to the new toggle button
            newMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the document click handler from firing
                navLinks.classList.toggle('show');
                
                if (navLinks.classList.contains('show')) {
                    newMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    newMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (navLinks && !navLinks.contains(e.target) && 
                    !newMenuToggle.contains(e.target) && 
                    navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                    newMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
            
            // Prevent clicks inside the menu from closing it
            navLinks.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
    
    // CTA Buttons animation
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-5px)';
            button.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
        
        // Add touch support for mobile devices
        button.addEventListener('touchstart', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
        });
        
        button.addEventListener('touchend', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });

    // Ensure menu toggle is initialized on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            // Check if the menu toggle exists
            const menuToggle = document.querySelector('.menu-toggle');
            if (!menuToggle) {
                // Recreate it if it doesn't exist
                const nav = document.querySelector('nav');
                const menuToggleEl = document.createElement('div');
                menuToggleEl.className = 'menu-toggle';
                menuToggleEl.innerHTML = '<i class="fas fa-bars"></i>';
                nav.appendChild(menuToggleEl);
                setupMobileMenu();
            }
        }
    });

    // No additional JavaScript needed for the new orbital network visualization
}); 