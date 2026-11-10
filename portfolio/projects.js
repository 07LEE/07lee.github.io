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
        <div class="card-category">${escapeHtml(project.category)}</div>
        <h3><a class="card-link" href="${escapeHtml(project.link)}"${externalAttrs(project.link)}>${escapeHtml(project.title)}</a></h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="card-meta">${escapeHtml(project.period)}</div>
        <div class="card-footer">
            <div class="card-tags">${tags}</div>
            ${github}
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

const projectGrid = document.getElementById('project-grid');
const featuredGrid = document.getElementById('featured-grid');

fetch('projects.json')
    .then(res => {
        if (!res.ok) throw new Error('Failed to load projects.json');
        return res.json();
    })
    .then(projects => {
        if (projectGrid) fill(projectGrid, projects, buildCard);
        if (featuredGrid) fill(featuredGrid, projects.filter(p => p.featured), buildFeaturedCard);
    })
    .catch(err => {
        console.error(err);
        [projectGrid, featuredGrid].forEach(grid => {
            if (grid) grid.innerHTML = '<p class="error-msg">프로젝트 목록을 불러오지 못했습니다.</p>';
        });
    });
