/* Chess Monochrome Presentation Controller Script (script.js) */

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    const updateSlides = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === totalSlides - 1;
        currentSlide = index;
    };

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            updateSlides(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            updateSlides(currentSlide - 1);
        }
    };

    // Navigation button events
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Indicator click events
    indicators.forEach((indicator, idx) => {
        indicator.addEventListener('click', () => {
            updateSlides(idx);
        });
    });

    // Keyboard navigation events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
    });
});
