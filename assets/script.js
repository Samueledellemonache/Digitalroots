document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    // DOM elements configuration
    const dom = {
        header: document.querySelector(".sticky-header"),
        navToggler: document.getElementById("navbar-toggler"),
        navMenu: document.getElementById("navbar-collapse"),
        navLinks: document.querySelectorAll(".nav-link"),
        modal: document.getElementById("successModal"),
        modalContent: document.querySelector(".modal-content"),
        closeBtn: document.querySelector(".modal .close"),
        contactForm: document.getElementById("contact-form"),
        pdfLinks: document.querySelectorAll('.open-pdf'),
        mainContent: document.querySelector('main')
    };

    // Main initialization
    function initApp() {
        initNavigation();
        setupHeaderScroll();
        setupContactForm();
        handlePDFLinks();
        initTooltips();
        setupModal();
    }

    // Navigation system
    function initNavigation() {
        let isMenuOpen = false;

        const toggleMenu = (forceClose = false) => {
            isMenuOpen = forceClose ? false : !isMenuOpen;
            
            if(dom.navToggler) dom.navToggler.setAttribute('aria-expanded', isMenuOpen);
            if(dom.navMenu) dom.navMenu.setAttribute('aria-hidden', !isMenuOpen);
            
            if(dom.navMenu) dom.navMenu.classList.toggle('active', isMenuOpen);
            document.body.classList.toggle('no-scroll', isMenuOpen);

            if(isMenuOpen && dom.navLinks.length > 0) {
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

        if(dom.navToggler) {
            dom.navToggler.addEventListener('click', () => toggleMenu());
        }
        
        dom.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if(window.innerWidth < 992) closeMenu();
            });
        });

        window.addEventListener('resize', () => {
            if(window.innerWidth > 991 && isMenuOpen) {
                closeMenu();
            }
        });
    }

    // Header scroll behavior
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

    // Contact form handling
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
                    headers: { 
                        'Accept': 'application/json',
                        'Origin': window.location.origin
                    },
                    mode: 'cors'
                });

                if(response.ok) {
                    showModal('Grazie per avermi contattato! Riceverai una risposta entro 24 ore');
                    dom.contactForm.reset();
                } else {
                    throw new Error('HTTP error ' + response.status);
                }
            } catch(error) {
                console.error('Form error:', error);
                showModal("Errore nell'invio del messaggio. Riprova più tardi.", true);
            } finally {
                submitButton.removeAttribute('aria-busy');
            }
        });
    }

    // PDF links handler
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

    // Tooltips system
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

    // Modal system
    function setupModal() {
        if(!dom.modal || !dom.closeBtn) return;

        const closeModal = () => {
            if(dom.modal) {
                dom.modal.style.display = 'none';
                dom.modal.setAttribute('aria-hidden', 'true');
            }
            if(dom.mainContent) dom.mainContent.setAttribute('aria-hidden', 'false');
        };

        dom.closeBtn.addEventListener('click', closeModal);
        
        window.addEventListener('click', (e) => {
            if(e.target === dom.modal) closeModal();
        });

        window.addEventListener('keydown', (e) => {
            if(e.key === 'Escape') closeModal();
        });
    }

    function showModal(message, isError = false) {
        if(!dom.modalContent) return;

        const messageElement = dom.modalContent.querySelector('p');
        if(messageElement) {
            messageElement.textContent = message;
            messageElement.style.color = isError ? '#ff4444' : '#2c5951';
        }
        
        if(dom.modal) {
            dom.modal.style.display = 'block';
            dom.modal.setAttribute('aria-hidden', 'false');
        }
        if(dom.mainContent) dom.mainContent.setAttribute('aria-hidden', 'true');
        if(dom.modalContent) dom.modalContent.focus();
    }

    // Start application
    initApp();
});
