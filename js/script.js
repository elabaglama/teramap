// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality - Improved version
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (!menuToggle || !navLinks) return;
        
        // First remove any existing click handlers by cloning
        const newMenuToggle = menuToggle.cloneNode(true);
        if (menuToggle.parentNode) {
            menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        }
        
        // Add click event to toggle menu
        newMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            navLinks.classList.toggle('show');
            
            // Update icon
            if (navLinks.classList.contains('show')) {
                newMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            } else {
                newMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = ''; // Enable scrolling
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('show') && 
                !navLinks.contains(e.target) && 
                !newMenuToggle.contains(e.target)) {
                navLinks.classList.remove('show');
                newMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = ''; // Enable scrolling
            }
        });
        
        // Close menu when link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('show');
                newMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = ''; // Enable scrolling
            });
        });
        
        // Prevent clicks inside the menu from closing it
        navLinks.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Re-initialize on window resize
    window.addEventListener('resize', function() {
        initMobileMenu();
    });
    
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
}); 