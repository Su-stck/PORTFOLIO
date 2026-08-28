/* ==========================================================================
   PORTFOLIO FUNCTIONALITY - SUMIT KUMAR
   Vanilla JavaScript for interactive elements, validation, and animations.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Mobile Navigation Menu Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navbar) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navbar.classList.toggle('open');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navbar.classList.remove('open');
            });
        });
    }

    // --- 2. Header Scroll Effect & Active Navigation Link (Scroll Spy) ---
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');

    const handleScrollEffects = () => {
        const scrollPosition = window.scrollY;

        // Header Background transition
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Section Navigation Link Highlight
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset for sticky header
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    };

    window.addEventListener('scroll', handleScrollEffects);
    handleScrollEffects(); // Run on initial load

    // --- 3. Back-to-Top Button Control ---
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 4. Profile Photo Upload, Preview, & Local Cache ---
    const imageUpload = document.getElementById('image-upload');
    const profilePlaceholder = document.getElementById('profile-placeholder');
    const profilePreview = document.getElementById('profile-preview');

    // Load cached profile photo if it exists
    const loadCachedProfile = () => {
        const cachedImg = localStorage.getItem('sumit_portfolio_profile');
        if (cachedImg && profilePreview && profilePlaceholder) {
            profilePreview.src = cachedImg;
            profilePreview.classList.remove('hide');
            profilePlaceholder.classList.add('hide');
        }
    };

    if (imageUpload && profilePlaceholder && profilePreview) {
        imageUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.addEventListener('load', function() {
                    const imageDataUrl = this.result;
                    
                    // Render Image preview
                    profilePreview.src = imageDataUrl;
                    profilePreview.classList.remove('hide');
                    profilePlaceholder.classList.add('hide');
                    
                    // Save to local storage for persistence across reloads
                    try {
                        localStorage.setItem('sumit_portfolio_profile', imageDataUrl);
                    } catch (error) {
                        console.warn('Unable to cache profile photo in LocalStorage due to space constraints.', error);
                    }
                });
                reader.readAsDataURL(file);
            }
        });

        loadCachedProfile();
    }

    // --- 5. Contact Form — Formspree Async Submission ---
    const contactForm    = document.getElementById('contact-form');
    const submitBtn      = document.getElementById('submit-btn');
    const btnSpinner     = document.getElementById('btn-spinner');
    const btnLabel       = document.getElementById('btn-label');

    // Success toast elements
    const successToast   = document.getElementById('success-toast');
    const toastCloseBtn  = document.getElementById('toast-close-btn');

    // Error toast elements
    const errorToast     = document.getElementById('error-toast');
    const errorCloseBtn  = document.getElementById('error-toast-close-btn');

    let toastTimeout, errorTimeout;

    // --- Email regex ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // --- Field validator: marks .form-group invalid/valid ---
    const validateField = (inputEl, validationFn) => {
        const group   = inputEl.closest('.form-group');
        const isValid = validationFn(inputEl.value.trim());
        group.classList.toggle('invalid', !isValid);
        return isValid;
    };

    // --- Show a toast (success or error) ---
    const showToast = (toastEl, timeoutRef, durationMs = 5000) => {
        toastEl.classList.remove('hide');
        clearTimeout(timeoutRef);
        return setTimeout(() => toastEl.classList.add('hide'), durationMs);
    };

    // --- Set button loading state ---
    const setLoading = (loading) => {
        submitBtn.disabled = loading;
        btnSpinner.classList.toggle('visible', loading);
        btnLabel.textContent = loading ? 'Sending Message…' : 'Send Message';
    };

    // --- Inline validation on blur for better UX ---
    if (contactForm) {
        ['form-name', 'form-subject'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('blur', () => validateField(el, val => val.length > 0));
        });
        const emailEl = document.getElementById('form-email');
        if (emailEl) emailEl.addEventListener('blur', () => validateField(emailEl, val => emailRegex.test(val)));
        const msgEl = document.getElementById('form-message');
        if (msgEl) msgEl.addEventListener('blur', () => validateField(msgEl, val => val.length > 0));

        // --- Form submit ---
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput    = document.getElementById('form-name');
            const emailInput   = document.getElementById('form-email');
            const subjectInput = document.getElementById('form-subject');
            const messageInput = document.getElementById('form-message');

            // Run all validations
            const isNameValid    = validateField(nameInput,    val => val.length > 0);
            const isEmailValid   = validateField(emailInput,   val => emailRegex.test(val));
            const isSubjectValid = validateField(subjectInput, val => val.length > 0);
            const isMessageValid = validateField(messageInput, val => val.length > 0);

            if (!(isNameValid && isEmailValid && isSubjectValid && isMessageValid)) return;

            // Start loading state
            setLoading(true);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                setLoading(false);

                if (response.ok) {
                    // ✅ Success
                    contactForm.reset();
                    document.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));
                    toastTimeout = showToast(successToast, toastTimeout, 5000);
                } else {
                    // ❌ Formspree returned an error status
                    errorTimeout = showToast(errorToast, errorTimeout, 6000);
                }
            } catch (_err) {
                // ❌ Network / fetch failure
                setLoading(false);
                errorTimeout = showToast(errorToast, errorTimeout, 6000);
            }
        });
    }

    // --- Toast close buttons ---
    if (toastCloseBtn && successToast) {
        toastCloseBtn.addEventListener('click', () => {
            successToast.classList.add('hide');
            clearTimeout(toastTimeout);
        });
    }
    if (errorCloseBtn && errorToast) {
        errorCloseBtn.addEventListener('click', () => {
            errorToast.classList.add('hide');
            clearTimeout(errorTimeout);
        });
    }

    // --- 6. Scroll Reveal Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Trigger only once
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of element is in view
            rootMargin: '0px 0px -50px 0px' // Offset trigger for improved page flow
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for older browsers: show elements immediately
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }
});
