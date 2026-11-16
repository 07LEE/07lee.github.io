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

// projects.html: company work first, then personal, then education; newest first within each.
const KIND_ORDER = ['company', 'personal', 'education'];
function byKindThenRecent(a, b) {
    return KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || byRecent(a, b);
}

// The fields closest to data engineering come first; any other field follows alphabetically.
const CATEGORY_ORDER = ['Data Pipeline', 'Data Collection', 'Data Processing', 'AI Automation', 'NLP', 'Data Analysis'];
function categoryRank(c) {
    const i = CATEGORY_ORDER.indexOf(c);
    return i === -1 ? CATEGORY_ORDER.length : i;
}

// One row of field buttons. Several can be on at once; none on shows every project.
// The chosen fields are kept in the address, e.g. ?category=Data Pipeline,NLP
function setupFilters(container, projects) {
    const fromAddress = new URLSearchParams(location.search).get('category');
    const chosen = new Set(fromAddress ? fromAddress.split(',') : []);
    const categories = [...new Set(projects.map(p => p.category))]
        .sort((a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b));

    container.innerHTML = categories
        .map(c => `<button type="button" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
        .join('');

    const apply = () => {
        container.querySelectorAll('button').forEach(b => {
            const on = chosen.has(b.dataset.category);
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on);
        });
        const shown = projects.filter(p => !chosen.size || chosen.has(p.category)).sort(byKindThenRecent);
        projectGrid.innerHTML = '';
        shown.forEach(p => projectGrid.appendChild(buildCard(p)));
        const query = chosen.size ? `?category=${encodeURIComponent([...chosen].join(','))}` : '';
        history.replaceState(null, '', query || location.pathname);
    };

    container.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        const c = button.dataset.category;
        if (chosen.has(c)) chosen.delete(c); else chosen.add(c);
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
