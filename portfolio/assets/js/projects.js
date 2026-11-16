// Renders projects.json into the page.
// #project-grid (projects.html) gets every project; #featured-grid (index.html) gets the ones marked "featured".
// Both are ordered by most recent start date, then by latest end date.

function startOf(period) {
    return period ? period.split('~')[0].trim() : '';
}

function endOf(period) {
    // An open-ended period ("2025.08 ~ 현재") counts as ongoing.
    if (!period) return '';
    const parts = period.split('~');
    if (parts.length < 2) return parts[0].trim();
    const end = parts[1].trim();
    return /^\d/.test(end) ? end : '9999.99';
}

function byRecent(a, b) {
    return startOf(b.period).localeCompare(startOf(a.period))
        || endOf(b.period).localeCompare(endOf(a.period));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

function externalAttrs(link) {
    return /^https?:\/\//.test(link || '') ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function buildCard(project) {
    const card = document.createElement('article');
    card.className = 'featured-card';

    const tags = (project.tags || [])
        .map(t => `<span class="card-tag">${escapeHtml(t)}</span>`)
        .join('');
    const github = project.github
        ? `<a class="card-github" href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
        : '';

    card.innerHTML = `
        <div class="card-category">${escapeHtml(project.category)} · ${escapeHtml(KIND_LABELS[project.kind] || '')}</div>
        <h3><a class="card-link" href="${escapeHtml(project.link)}"${externalAttrs(project.link)}>${escapeHtml(project.title)}</a></h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="card-meta"><span>${escapeHtml(project.period)}</span>${github}</div>
        <div class="card-footer">
            <div class="card-tags">${tags}</div>
        </div>
    `;
    return card;
}

function buildFeaturedCard(project) {
    const card = document.createElement('a');
    card.className = 'featured-card';
    card.href = project.link;
    if (externalAttrs(project.link)) {
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
    }

    const meta = [project.period, ...(project.tags || [])].filter(Boolean).join(' · ');
    card.innerHTML = `
        <div class="card-category">${escapeHtml(project.category)}</div>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="card-meta"><span>${escapeHtml(meta)}</span></div>
    `;
    return card;
}

function fill(grid, projects, build) {
    grid.innerHTML = '';
    projects.slice().sort(byRecent).forEach(p => grid.appendChild(build(p)));
}

// Where the work was done. The category says what kind of work it was.
const KIND_LABELS = { company: '회사', personal: '개인', education: '교육' };

// projects.html: two rows of filters, by kind and by category, read from and kept in the address.
function setupFilters(container, projects) {
    const params = new URLSearchParams(location.search);
    const state = { kind: params.get('kind') || '', category: params.get('category') || '' };
    const kinds = Object.keys(KIND_LABELS).filter(k => projects.some(p => p.kind === k));
    const categories = [...new Set(projects.map(p => p.category))].sort();

    const row = (key, label, values, text) => {
        const buttons = ['', ...values].map(v =>
            `<button type="button" data-key="${key}" data-value="${escapeHtml(v)}">${escapeHtml(v ? text(v) : '전체')}</button>`
        ).join('');
        return `<div class="filter-row"><span class="filter-label">${label}</span>${buttons}</div>`;
    };
    container.innerHTML = row('kind', '구분', kinds, k => KIND_LABELS[k]) + row('category', '분야', categories, c => c);

    const apply = () => {
        container.querySelectorAll('button').forEach(b => {
            b.classList.toggle('active', state[b.dataset.key] === b.dataset.value);
        });
        const shown = projects.filter(p =>
            (!state.kind || p.kind === state.kind) && (!state.category || p.category === state.category)
        );
        fill(projectGrid, shown, buildCard);
        if (!shown.length) projectGrid.innerHTML = '<p class="error-msg">이 조건의 프로젝트가 없습니다.</p>';
        const query = new URLSearchParams(Object.entries(state).filter(([, v]) => v)).toString();
        history.replaceState(null, '', query ? `?${query}` : location.pathname);
    };

    container.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        state[button.dataset.key] = button.dataset.value;
        apply();
    });
    apply();
}

const projectGrid = document.getElementById('project-grid');
const projectFilters = document.getElementById('project-filters');
const featuredGrid = document.getElementById('featured-grid');

fetch('assets/data/projects.json')
    .then(res => {
        if (!res.ok) throw new Error('Failed to load projects.json');
        return res.json();
    })
    .then(projects => {
        if (projectGrid && projectFilters) setupFilters(projectFilters, projects);
        else if (projectGrid) fill(projectGrid, projects, buildCard);
        if (featuredGrid) fill(featuredGrid, projects.filter(p => p.featured), buildFeaturedCard);
    })
    .catch(err => {
        console.error(err);
        [projectGrid, featuredGrid].forEach(grid => {
            if (grid) grid.innerHTML = '<p class="error-msg">프로젝트 목록을 불러오지 못했습니다.</p>';
        });
    });
