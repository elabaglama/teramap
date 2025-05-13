// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Mobile menu toggle
    const createMobileMenu = () => {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        
        const menuButton = document.createElement('div');
        menuButton.classList.add('menu-toggle');
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
        
        nav.appendChild(menuButton);
        
        menuButton.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('show');
            
            if (navLinks.classList.contains('show')) {
                menuButton.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                menuButton.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    };
    
    // Check if mobile view
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }
    
    // Adjust on window resize
    window.addEventListener('resize', () => {
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (window.innerWidth <= 768 && !menuToggle) {
            createMobileMenu();
        } else if (window.innerWidth > 768 && menuToggle) {
            menuToggle.remove();
            document.querySelector('.nav-links').classList.remove('show');
        }
    });
    
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
    });

    // No additional JavaScript needed for the new orbital network visualization
}); 