document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const slides = document.querySelectorAll('.slide-section');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const indicators = document.querySelectorAll('.indicator');
    
    let activeIndex = 0;

    const switchSlide = (index) => {
        if (index < 0 || index >= slides.length) return;

        // Remove active class from all nav items, slides, and indicators
        sidebarItems.forEach(item => item.classList.remove('active'));
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));
        
        // Add active class to target items
        sidebarItems[index].classList.add('active');
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        // Update button status
        btnPrev.disabled = (index === 0);
        btnNext.disabled = (index === slides.length - 1);
        
        activeIndex = index;
    };

    // Sidebar navigation trigger
    sidebarItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            switchSlide(index);
        });
    });

    // Indicator navigation trigger
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            switchSlide(index);
        });
    });

    // Button controls navigation trigger
    btnPrev.addEventListener('click', () => {
        if (activeIndex > 0) {
            switchSlide(activeIndex - 1);
        }
    });

    btnNext.addEventListener('click', () => {
        if (activeIndex < slides.length - 1) {
            switchSlide(activeIndex + 1);
        }
    });

    // Keyboard navigation (Arrow keys integration)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (activeIndex < slides.length - 1) {
                switchSlide(activeIndex + 1);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (activeIndex > 0) {
                switchSlide(activeIndex - 1);
            }
        }
    });
});
