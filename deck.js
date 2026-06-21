document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('btn-prev') || document.getElementById('prev-btn');
    const nextBtn = document.getElementById('btn-next') || document.getElementById('next-btn');
    const dotsContainer = document.getElementById('dots-container') || document.querySelector('.indicators') || document.querySelector('.slide-indicators') || document.querySelector('.indicator-dots');
    const labelEl = document.getElementById('slide-label');
    const deckContainer = document.querySelector('.deck-container');

    let current = 0;
    const totalSlides = slides.length;

    // Dynamically generate slide indicators if they do not exist
    if (dotsContainer && dotsContainer.children.length === 0 && totalSlides > 0) {
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add(dotsContainer.classList.contains('indicator-dots') || dotsContainer.id === 'dots-container' ? 'dot' : 'indicator');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('data-slide', i);
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
    }

    const indicators = dotsContainer ? (dotsContainer.querySelectorAll('.dot') || dotsContainer.querySelectorAll('.indicator') || dotsContainer.children) : [];

    function goTo(index) {
        if (index < 0 || index >= totalSlides) return;
        slides.forEach(slide => slide.classList.remove('active'));
        
        if (indicators.length > 0) {
            Array.from(indicators).forEach(ind => ind.classList.remove('active'));
            if (indicators[index]) {
                indicators[index].classList.add('active');
            }
        }

        slides[index].classList.add('active');

        if (labelEl) {
            labelEl.textContent = slides[index].getAttribute('data-label') || '';
        }

        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === totalSlides - 1;
        current = index;

        // Sync active status of sidebar buttons for segments-ai-api
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        if (sidebarItems.length > 0) {
            sidebarItems.forEach(item => item.classList.remove('active'));
            if (sidebarItems[index]) {
                sidebarItems[index].classList.add('active');
            }
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (current < totalSlides - 1) goTo(current + 1); });

    if (indicators.length > 0) {
        Array.from(indicators).forEach((indicator, idx) => {
            indicator.addEventListener('click', () => goTo(idx));
        });
    }

    // Map click events for segments-ai-api sidebar buttons
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    if (sidebarItems.length > 0) {
        sidebarItems.forEach((item, idx) => {
            item.addEventListener('click', () => goTo(idx));
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') e.preventDefault();
            if (current < totalSlides - 1) goTo(current + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (current > 0) goTo(current - 1);
        }
    });

    let wheelLocked = false;
    document.addEventListener('wheel', (e) => {
        if (!deckContainer) return;
        // Prevent wheel navigation in dashboard layouts
        if (document.querySelector('.dashboard-container') || deckContainer.classList.contains('dashboard-container')) {
            return;
        }
        e.preventDefault();
        if (wheelLocked) return;
        wheelLocked = true;
        setTimeout(() => { wheelLocked = false; }, 700);
        if (e.deltaY > 0) {
            if (current < totalSlides - 1) goTo(current + 1);
        } else {
            if (current > 0) goTo(current - 1);
        }
    }, { passive: false });

    // Auto-fit function for 16:9 slide aspect ratio
    function autoFitDeck() {
        if (!deckContainer) return;
        if (document.querySelector('.dashboard-container') || deckContainer.classList.contains('dashboard-container')) {
            return;
        }
        const scaleX = (window.innerWidth * 0.96) / 1280;
        const scaleY = (window.innerHeight * 0.96) / 720;
        let scale = Math.min(scaleX, scaleY, 1.1);
        deckContainer.style.transform = `scale(${scale})`;
        deckContainer.style.transformOrigin = 'center center';
    }

    if (deckContainer) {
        window.addEventListener('resize', autoFitDeck);
        autoFitDeck();
    }

    // Sync tab preview for invoice-simplifier
    const featureItems = document.querySelectorAll('.feature-item');
    const previews = document.querySelectorAll('.preview-inner');
    if (featureItems.length > 0 && previews.length > 0) {
        featureItems.forEach(item => {
            item.addEventListener('click', () => {
                featureItems.forEach(fi => fi.classList.remove('active'));
                item.classList.add('active');
                const targetId = item.getAttribute('data-target');
                previews.forEach(p => {
                    if (p.id === targetId) {
                        p.classList.remove('hidden');
                    } else {
                        p.classList.add('hidden');
                    }
                });
            });
        });
    }

    goTo(0);
});
