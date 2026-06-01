// Responsive deck autofit
const deckContainer = document.querySelector('.deck-container');

function autoFitDeck() {
  const scaleX = (window.innerWidth * 0.96) / 1280;
  const scaleY = (window.innerHeight * 0.96) / 720;
  const scale = Math.min(scaleX, scaleY, 1.1);
  deckContainer.style.transform = `scale(${scale})`;
  deckContainer.style.transformOrigin = 'center center';
}

window.addEventListener('resize', autoFitDeck);
autoFitDeck();

// Slide navigation
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
let current = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goTo(i));
  dotsContainer.appendChild(dot);
});

function goTo(index) {
  slides[current].classList.remove('active');
  dotsContainer.children[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');
  dotsContainer.children[current].classList.add('active');
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === slides.length - 1;
}

prevBtn.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
nextBtn.addEventListener('click', () => { if (current < slides.length - 1) goTo(current + 1); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (current < slides.length - 1) goTo(current + 1);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (current > 0) goTo(current - 1);
  }
});

let wheelLocked = false;
document.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (wheelLocked) return;
  wheelLocked = true;
  setTimeout(() => { wheelLocked = false; }, 700);
  if (e.deltaY > 0) { if (current < slides.length - 1) goTo(current + 1); }
  else              { if (current > 0) goTo(current - 1); }
}, { passive: false });

prevBtn.disabled = true;
