document.addEventListener("DOMContentLoaded", function() {
    // Configurazione elementi
    const dom = {
        header: document.querySelector(".sticky-header"),
        navToggler: document.getElementById("navbar-toggler"),
        navMenu: document.getElementById("navbar-collapse"),
        navItems: document.querySelectorAll(".nav-link"),
        modal: document.getElementById("successModal"),
        closeModal: document.querySelector(".close"),
        contactForm: document.querySelector('form'),
        pdfLinks: document.querySelectorAll('.open-pdf')
    };

    // Funzionalità principali
    function setupPage() {
        configureHeaderScroll();
        initNavigation();
        setupContactForm();
        handlePDFLinks();
        checkAnchorPosition();
    }

    // Scroll header dinamico
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

    // Gestione menu navigazione
    function initNavigation() {
        const toggleMenu = () => {
            dom.navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        };

        const closeMenu = () => {
            dom.navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        };

        dom.navToggler.addEventListener('click', toggleMenu);

        dom.navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if(this.pathname === location.pathname && this.hash) {
                    e.preventDefault();
                    const section = document.querySelector(this.hash);
                    if(section) section.scrollIntoView({ behavior: 'smooth' });
                }
                closeMenu();
            });
        });

        window.addEventListener('resize', () => {
            if(window.innerWidth > 768) closeMenu();
        });
    }

    // Gestione form contatti
    function setupContactForm() {
        if(!dom.contactForm) return;

        dom.contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formInfo = new FormData(this);

            fetch('https://formspree.io/f/xnnjlaly', {
                method: 'POST',
                body: formInfo,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if(response.ok && dom.modal) {
                    dom.modal.style.display = "block";
                    this.reset();
                }
            })
            .catch(error => console.error('Errore:', error));
        });

        if(dom.closeModal) {
            dom.closeModal.addEventListener('click', () => {
                dom.modal.style.display = "none";
            });
        }

        window.addEventListener('click', (e) => {
            if(e.target === dom.modal) dom.modal.style.display = "none";
        });
    }

    // Gestione link PDF
    function handlePDFLinks() {
        dom.pdfLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const filePath = this.dataset.pdf;

                if(!filePath) {
                    console.warn('PDF non disponibile');
                    return;
                }

                // Animazione pulsante
                this.classList.add('click-effect');
                setTimeout(() => this.classList.remove('click-effect'), 200);

                // Apertura documento
                const tempLink = document.createElement('a');
                tempLink.href = filePath;
                tempLink.target = '_blank';
                tempLink.rel = 'noopener';
                tempLink.click();
            });
        });
    }

    // Scroll a sezioni specifiche
    function checkAnchorPosition() {
        const sectionHash = window.location.hash;
        if(!sectionHash) return;

        const targetSection = document.querySelector(sectionHash);
        if(targetSection) {
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }

    // Avvio applicazione
    setupPage();
});