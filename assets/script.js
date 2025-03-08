document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    // DOM Elements Configuration
    const dom = {
        header: document.querySelector(".sticky-header"),
        navToggler: document.getElementById("navbar-toggler"),
        navMenu: document.getElementById("navbar-collapse"),
        navLinks: document.querySelectorAll(".nav-link"),
        modal: document.getElementById("successModal"),
        contactForm: document.getElementById("contact-form"),
        pdfLinks: document.querySelectorAll('.open-pdf'),
        mainContent: document.querySelector('main')
    };

    // Main Initialization
    function initApp() {
        initNavigation();
        setupHeaderScroll();
        setupContactForm();
        handlePDFLinks();
        initTooltips();
        setupModal();
    }

    // NAVIGATION SYSTEM
    function initNavigation() {
        let isMenuOpen = false;

        const toggleMenu = (forceClose = false) => {
            isMenuOpen = forceClose ? false : !isMenuOpen;
            
            // Update ARIA attributes
            dom.navToggler.setAttribute('aria-expanded', isMenuOpen);
            dom.navMenu.setAttribute('aria-hidden', !isMenuOpen);
            
            // Toggle classes
            dom.navMenu.classList.toggle('active', isMenuOpen);
            document.body.classList.toggle('no-scroll', isMenuOpen);

            // Manage focus
            if(isMenuOpen) {
                dom.navLinks[0].focus();
                addMenuClosureListeners();
            } else {
                removeMenuClosureListeners();
            }
        };

        const closeMenu = () => toggleMenu(true);

        const handleOutsideClick = (e) => {
            if(!dom.navMenu.contains(e.target) && 
               !dom.navToggler.contains(e.target) &&
               isMenuOpen) {
                closeMenu();
            }
        };

        const handleEscape = (e) => {
            if(e.key === 'Escape' && isMenuOpen) {
                closeMenu();
                dom.navToggler.focus();
            }
        };

        const addMenuClosureListeners = () => {
            document.addEventListener('click', handleOutsideClick);
            document.addEventListener('keydown', handleEscape);
        };

        const removeMenuClosureListeners = () => {
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };

        // Event Listeners
        dom.navToggler.addEventListener('click', () => toggleMenu());
        
        dom.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if(window.innerWidth < 992) closeMenu();
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if(window.innerWidth > 991 && isMenuOpen) {
                closeMenu();
            }
        });
    }

    // HEADER SCROLL BEHAVIOR
    function setupHeaderScroll() {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            const scrollDelta = currentScroll - lastScroll;
            
            if(scrollDelta > 20 && currentScroll > 100) {
                dom.header.style.transform = 'translateY(-100%)';
            } else if(scrollDelta < -10) {
                dom.header.style.transform = 'translateY(0)';
            }
            lastScroll = currentScroll;
        });
    }

    // CONTACT FORM HANDLING
    function setupContactForm() {
        if(!dom.contactForm) return;

        dom.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = dom.contactForm.querySelector('button[type="submit"]');
            
            try {
                submitButton.setAttribute('aria-busy', 'true');
                const response = await fetch('https://formspree.io/f/xnnjlaly', {
                    method: 'POST',
                    body: new FormData(dom.contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                if(response.ok) {
                    showModal('Grazie per avermi contattato! Riceverai una risposta entro 24 ore');
                    dom.contactForm.reset();
                }
            } catch(error) {
                showModal("Errore nell'invio del messaggio. Riprova più tardi.", true);
            } finally {
                submitButton.removeAttribute('aria-busy');
            }
        });
    }

    // PDF LINKS HANDLER
    function handlePDFLinks() {
        dom.pdfLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pdfUrl = this.dataset.pdf;
                
                if(pdfUrl) {
                    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                } else {
                    this.setAttribute('aria-invalid', 'true');
                }
            });
        });
    }

    // TOOLTIPS SYSTEM
    function initTooltips() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach((item, index) => {
            const tooltipText = item.dataset.tooltip;
            if(!tooltipText) return;

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            tooltip.id = `tooltip-${index}`;
            tooltip.setAttribute('role', 'tooltip');
            item.appendChild(tooltip);

            // Event Handlers
            const showTooltip = () => {
                tooltip.setAttribute('aria-hidden', 'false');
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            };

            const hideTooltip = () => {
                tooltip.setAttribute('aria-hidden', 'true');
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
            };

            item.addEventListener('mouseenter', showTooltip);
            item.addEventListener('mouseleave', hideTooltip);
            item.addEventListener('focus', showTooltip);
            item.addEventListener('blur', hideTooltip);
        });
    }

    // MODAL SYSTEM
    function setupModal() {
        const closeModal = () => {
            dom.modal.style.display = 'none';
            dom.modal.setAttribute('aria-hidden', 'true');
            dom.mainContent.setAttribute('aria-hidden', 'false');
        };

        dom.modal.querySelector('.close').addEventListener('click', closeModal);
        window.addEventListener('click', (e) => e.target === dom.modal && closeModal());
        window.addEventListener('keydown', (e) => e.key === 'Escape' && closeModal());
    }

    function showModal(message, isError = false) {
        const modalContent = dom.modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <p style="color: ${isError ? '#ff4444' : '#2c5951'}">${message}</p>
        `;
        dom.modal.style.display = 'block';
        dom.modal.setAttribute('aria-hidden', 'false');
        dom.mainContent.setAttribute('aria-hidden', 'true');
        modalContent.focus();
    }

    // Start Application
    initApp();
});
