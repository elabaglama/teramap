// Navigation fix script
document.addEventListener('DOMContentLoaded', () => {
    // Get header element
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    // Handle scroll events for header appearance
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow and background opacity based on scroll position
        if (scrollTop > 20) {
            header.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = '0 1px 5px rgba(0, 0, 0, 0.05)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Fix for navbar links with hash navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Handle internal links on current page
            if (href.includes('#')) {
                // If we're on index.html and link points to index.html#something
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const isCurrentPageLink = href.startsWith(currentPage + '#');
                const isHashOnly = href.startsWith('#');
                
                if (isHashOnly || isCurrentPageLink) {
                    e.preventDefault();
                    
                    // Extract just the hash part
                    const hashPart = href.split('#')[1];
                    const targetSection = document.getElementById(hashPart);
                    
                    if (targetSection) {
                        // Adjust for header height
                        const headerHeight = document.querySelector('header').offsetHeight;
                        window.scrollTo({
                            top: targetSection.offsetTop - headerHeight - 20,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });
}); 