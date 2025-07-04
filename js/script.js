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
    const navLinksAnchors = document.querySelectorAll('.nav-links a');
    
    navLinksAnchors.forEach(link => {
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
    
    // Console log for debugging
    console.log('✨ Simplified animations loaded!');

    // Toast notification system
    (function() {
        // Create toast functions immediately
        function showToast(message, type = 'success') {
            // Create toast container if it doesn't exist
            let toastContainer = document.getElementById('toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                document.body.appendChild(toastContainer);
            }

            // Create toast element
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;

            // Add toast to container
            toastContainer.appendChild(toast);

            // Remove toast after animation
            setTimeout(() => {
                toast.classList.add('toast-fade-out');
                setTimeout(() => {
                    toast.remove();
                    if (toastContainer.children.length === 0) {
                        toastContainer.remove();
                    }
                }, 300);
            }, 3000);
        }

        // Make toast functions globally available immediately
        window.showToast = showToast;
    })();

    // Update the showSuccess function to use toast
    function showSuccess(message) {
        showToast(message, 'success');
    }

    // Update the showError function to use toast (if needed)
    function showError(message) {
        showToast(message, 'error');
    }
}); 