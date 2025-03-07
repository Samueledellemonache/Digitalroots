document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    // Element configuration
    const dom = {
        header: document.querySelector(".sticky-header"),
        navToggler: document.getElementById("navbar-toggler"),
        navMenu: document.getElementById("navbar-collapse"),
        navItems: document.querySelectorAll(".nav-link"),
        modal: document.getElementById("successModal"),
        closeModal: document.querySelector(".close"),
        contactForm: document.querySelector('form'),
        pdfLinks: document.querySelectorAll('.open-pdf'),
        mainContent: document.querySelector('main')
    };

    // Main functionalities
    function setupPage() {
        configureHeaderScroll();
        initNavigation();
        setupContactForm();
        handlePDFLinks();
        checkAnchorPosition();
        initAriaRoles();
        initTooltips(); 
    }

    // Initialize ARIA roles
    function initAriaRoles() {
        if(dom.modal) {
            dom.modal.setAttribute('role', 'dialog');
            dom.modal.setAttribute('aria-labelledby', 'modalTitle');
            const modalContent = dom.modal.querySelector('.modal-content');
            if(modalContent) modalContent.setAttribute('role', 'document');
        }

        dom.pdfLinks.forEach(link => {
            link.setAttribute('role', 'button');
        });
    }

    // Dynamic header scroll
    function configureHeaderScroll() {
        window.addEventListener('scroll', () => {
            if(!dom.header) return;
            
            const scrollActive = window.scrollY > 50;
            dom.header.style.backgroundColor = scrollActive 
                ? "rgba(19, 19, 19, 0.9)" 
                : "rgba(19, 19, 19, 1)";
            
            dom.header.style.boxShadow = scrollActive 
                ? "0 2px 10px rgba(0, 0, 0, 0.5)" 
                : "none";
        });
    }

    // Navigation menu management
    function initNavigation() {
        const toggleMenu = () => {
            const isExpanded = dom.navMenu.classList.contains('active');
            dom.navToggler.setAttribute('aria-expanded', !isExpanded);
            dom.navMenu.setAttribute('aria-hidden', isExpanded);
            
            dom.navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
            
            if(!isExpanded) {
                const firstNavItem = dom.navItems[0];
                if(firstNavItem) firstNavItem.focus();
            }
        };

        const closeMenu = () => {
            dom.navToggler.setAttribute('aria-expanded', 'false');
            dom.navMenu.setAttribute('aria-hidden', 'true');
            dom.navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        };

        dom.navToggler.addEventListener('click', toggleMenu);

        dom.navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if(this.pathname === location.pathname && this.hash) {
                    e.preventDefault();
                    const section = document.querySelector(this.hash);
                    if(section) {
                        section.scrollIntoView({ behavior: 'smooth' });
                        section.setAttribute('tabindex', '-1');
                        section.focus();
                    }
                }
                closeMenu();
            });
        });

        window.addEventListener('resize', () => {
            if(window.innerWidth > 768) {
                closeMenu();
            }
        });
    }

    // Contact form management
    function setupContactForm() {
        if(!dom.contactForm) return;

        dom.contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formInfo = new FormData(this);

            const submitButton = this.querySelector('button[type="submit"]');
            if(submitButton) {
                submitButton.setAttribute('aria-busy', 'true');
                submitButton.disabled = true;
            }

            fetch('https://formspree.io/f/xnnjlaly', {
                method: 'POST',
                body: formInfo,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if(response.ok && dom.modal) {
                    dom.modal.style.display = "block";
                    dom.modal.setAttribute('aria-hidden', 'false');
                    dom.mainContent.setAttribute('aria-hidden', 'true');
                    this.reset();
                    
                    const modalContent = dom.modal.querySelector('.modal-content');
                    if(modalContent) modalContent.focus();
                }
            })
            .catch(error => console.error('Error:', error))
            .finally (() => {
                if(submitButton) {
                    submitButton.removeAttribute('aria-busy');
                    submitButton.disabled = false;
                }
            });
        });

        if(dom.closeModal ) {
            dom.closeModal.addEventListener('click', () => {
                dom.modal.style.display = "none";
                dom.modal.setAttribute('aria-hidden', 'true');
                dom.mainContent.setAttribute('aria-hidden', 'false');
                dom.contactForm.focus();
            });
        }

        window.addEventListener('click', (e) => {
            if(e.target === dom.modal) {
                dom.modal.style.display = "none";
                dom.modal.setAttribute('aria-hidden', 'true');
                dom.mainContent.setAttribute('aria-hidden', 'false');
            }
        });
    }

    // PDF link management
    function handlePDFLinks() {
        dom.pdfLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const filePath = this.dataset.pdf;

                if(!filePath) {
                    this.setAttribute('aria-invalid', 'true');
                    console.warn('PDF not available');
                    return;
                }

                this.classList.add('click-effect');
                this.setAttribute('aria-busy', 'true');
                setTimeout(() => {
                    this.classList.remove('click-effect');
                    this.removeAttribute('aria-busy');
                }, 200);

                const tempLink = document.createElement('a');
                tempLink.href = filePath;
                tempLink.target = '_blank';
                tempLink.rel = 'noopener';
                tempLink.click();
            });
        });
    }

    // Scroll to specific sections
    function checkAnchorPosition() {
        const sectionHash = window.location.hash;
        if(!sectionHash) return;

        const targetSection = document.querySelector(sectionHash);
        if(targetSection) {
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                targetSection.setAttribute('tabindex', '-1');
                targetSection.focus();
            }, 300);
        }
    }

    // Tooltip
    function initTooltips() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach(item => {
            const tooltipText = item.dataset.tooltip;
            if(!tooltipText) return;

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            item.appendChild(tooltip);

            const updateTooltip = () => {
                tooltip.style.width = `${item.offsetWidth}px`;
                tooltip.style.height = `${item.offsetHeight}px`;
            };

            item.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            });

            item.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
            });

            // Touch event management
            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            });

            document.addEventListener('touchstart', (e) => {
                if(!item.contains(e.target)) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                }
            });

            window.addEventListener('resize', updateTooltip);
            updateTooltip();
        });
    }

    // Start application
    setupPage();
});
