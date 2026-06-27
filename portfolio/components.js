class PortfolioHeader extends HTMLElement {
    connectedCallback() {
        if (this.querySelector('.topbar') || this.querySelector('.back-link')) return;

        const backHref = this.getAttribute('back-href') || '../index.html';
        const title = this.getAttribute('title') || '';
        const hasSlide = this.hasAttribute('has-slide');
        const onlyBack = this.hasAttribute('only-back');

        if (onlyBack) {
            this.innerHTML = `
                <a href="${backHref}" class="back-link" aria-label="포트폴리오 목록으로 이동">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Portfolio
                </a>
            `;
        } else {
            this.innerHTML = `
                <header class="topbar">
                    <a href="${backHref}" class="back-link" aria-label="포트폴리오 목록으로 이동">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                    </a>
                    <div class="topbar-brand">
                        <span class="topbar-dot"></span>
                        <span class="topbar-title">${title}</span>
                    </div>
                    ${hasSlide ? '<div class="topbar-slide-label" id="slide-label">01 / 타이틀</div>' : ''}
                </header>
            `;
        }
    }
}
customElements.define('portfolio-header', PortfolioHeader);

class PortfolioDeckNav extends HTMLElement {
    connectedCallback() {
        if (this.querySelector('.bottombar') || this.querySelector('.deck-controls') || this.querySelector('.nav-controls')) return;

        const path = window.location.pathname;

        if (path.includes('nmap-reservation-analyzer')) {
            this.innerHTML = `
                <nav class="deck-controls">
                    <button id="prev-btn" class="nav-btn" disabled>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <div class="indicator-dots" id="dots-container"></div>
                    <button id="next-btn" class="nav-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </nav>
            `;
        } else if (path.includes('novel-transformation') || path.includes('segments-ai-api')) {
            this.innerHTML = `
                <div class="nav-controls">
                    <button id="btn-prev" class="nav-btn" disabled>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <div class="slide-indicators"></div>
                    <button id="btn-next" class="nav-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            this.innerHTML = `
                <nav class="bottombar">
                    <button id="btn-prev" class="nav-btn" disabled>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <div class="indicators" id="dots-container"></div>
                    <button id="btn-next" class="nav-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </nav>
            `;
        }
    }
}
customElements.define('portfolio-deck-nav', PortfolioDeckNav);
