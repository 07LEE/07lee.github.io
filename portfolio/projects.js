// Project list: one grid ordered by most recent start date, then by latest end date.
// Each card opens its detail page as a full page.
const CATEGORY_ORDER = ['Data Pipeline', 'Data Processing', 'Data Collection', 'AI Automation', 'Personal Project', 'Education'];

function startOf(period) {
    return period ? period.split('~')[0].trim() : '';
}

function endOf(period) {
    // An open-ended period ("2025.08 ~") counts as ongoing.
    if (!period) return '';
    const parts = period.split('~');
    if (parts.length < 2) return parts[0].trim();
    return parts[1].trim() || '9999.99';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

function rank(category) {
    const i = CATEGORY_ORDER.indexOf(category);
    return i === -1 ? CATEGORY_ORDER.length : i;
}

function buildCard(project) {
    const card = document.createElement('article');
    card.className = 'featured-card';

    const tags = (project.tags || [])
        .map(t => `<span class="card-tag">${escapeHtml(t)}</span>`)
        .join('');
    const external = /^https?:\/\//.test(project.link || '')
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
    const github = project.github
        ? `<a class="card-github" href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
        : '';

    card.innerHTML = `
        <div class="card-category">${escapeHtml(project.category)}</div>
        <h3><a class="card-link" href="${escapeHtml(project.link)}"${external}>${escapeHtml(project.title)}</a></h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="card-meta">${escapeHtml(project.period)}</div>
        <div class="card-footer">
            <div class="card-tags">${tags}</div>
            ${github}
        </div>
    `;
    return card;
}

function render(projects) {
    const grid = document.getElementById('project-grid');
    grid.innerHTML = '';
    projects
        .slice()
        .sort((a, b) => startOf(b.period).localeCompare(startOf(a.period))
            || endOf(b.period).localeCompare(endOf(a.period)))
        .forEach(p => grid.appendChild(buildCard(p)));
}

fetch('projects.json')
    .then(res => {
        if (!res.ok) throw new Error('Failed to load projects.json');
        return res.json();
    })
    .then(render)
    .catch(err => {
        console.error(err);
        document.getElementById('project-grid').innerHTML =
            '<p class="error-msg">프로젝트 목록을 불러오지 못했습니다.</p>';
    });
