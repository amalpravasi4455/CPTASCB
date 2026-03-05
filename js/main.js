document.addEventListener('DOMContentLoaded', () => {
    // Load Header
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('#header-placeholder').innerHTML = data;
            highlightActiveLink();
            setupMobileMenu();
        });

    // Load Footer
    fetch('components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('#footer-placeholder').innerHTML = data;
        });

    // Shared IntersectionObserver for any reveal elements
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0, // Trigger immediately when even 1px is visible
        rootMargin: "0px 0px 50px 0px" // Trigger slightly before entering view
    });

    const initReveal = (element) => {
        if (!element.classList.contains('reveal')) {
            element.classList.add('reveal');
        }
        revealObserver.observe(element);
    };

    const setupReveal = () => {
        // Broad sections are now excluded from automatic reveal to prevent blank pages on mobile
        const selector = '.service-card, .about-grid, .vision-mission-grid, .contact-grid, .gallery-item, .leader-card, .reveal';
        const targets = document.querySelectorAll(selector);
        targets.forEach(initReveal);

        // Watch for dynamically added elements (like gallery items)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches(selector)) {
                            initReveal(node);
                        }
                        node.querySelectorAll(selector).forEach(initReveal);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    // Execute scroll reveal setup
    setupReveal();

    // Subtle Parallax for Hero
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        if (hero) {
            const scrollValue = window.scrollY;
            hero.style.backgroundPositionY = `${scrollValue * 0.5}px`;
        }
    });

    function highlightActiveLink() {
        const path = window.location.pathname;
        const page = path.split("/").pop() || 'index.html';
        const pageName = page.replace('.html', '');
        const navId = (pageName === 'index' || pageName === '') ? 'nav-home' : `nav-${pageName}`;
        const activeLink = document.getElementById(navId);
        if (activeLink) activeLink.classList.add('active');
    }

    function setupMobileMenu() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        const contactInfo = document.querySelector('.contact-info-header');
        
        if (mobileBtn && navLinks) {
            // Include contact details in nav items on mobile
            if (contactInfo && window.innerWidth <= 992) {
                navLinks.appendChild(contactInfo);
            }

            mobileBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileBtn.classList.toggle('open');
            });
            
            // Close menu when clicking a link
            document.querySelectorAll('.nav-links li a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    mobileBtn.classList.remove('open');
                });
            });
        }
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const originalBtnText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'അയക്കുന്നു...'; // Sending... in Malayalam
            
            const formData = new FormData(this);
            
            fetch('send_mail.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    contactForm.reset();
                } else {
                    alert(data.message || 'Error sending message');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('ഒരു പിശക് സംഭവിച്ചു. ദയവായി പിന്നീട് ശ്രമിക്കുക.');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }
});
