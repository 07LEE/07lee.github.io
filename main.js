// Common project list rendering engine
function renderProjectList(containerId, dataUrl) {
    const listContainer = document.getElementById(containerId);
    if (!listContainer) return;

    fetch(dataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load data: ${dataUrl}`);
            }
            return response.json();
        })
        .then(projects => {
            listContainer.innerHTML = ''; // Remove fallback message

            projects.forEach(project => {
                const article = document.createElement('article');
                article.className = 'project-item';
                article.id = project.id;

                const headerDiv = document.createElement('div');
                headerDiv.className = 'project-header';

                const titleWrapper = document.createElement('div');
                titleWrapper.className = 'project-title-wrapper';

                const h2 = document.createElement('h2');
                const link = document.createElement('a');
                link.href = project.link;
                link.className = 'link-item';
                link.setAttribute('aria-label', `View ${project.title}`);
                link.textContent = project.title;
                h2.appendChild(link);
                titleWrapper.appendChild(h2);

                // Dynamically render company marker
                if (project.isCompany) {
                    const companyMarker = document.createElement('span');
                    companyMarker.className = 'company-marker';
                    companyMarker.setAttribute('title', 'Company Project');
                    companyMarker.setAttribute('aria-label', 'Company Project');
                    companyMarker.innerHTML = `
                        <svg class="company-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                            <line x1="9" y1="22" x2="9" y2="16"></line>
                            <line x1="15" y1="22" x2="15" y2="16"></line>
                            <line x1="9" y1="16" x2="15" y2="16"></line>
                            <path d="M8 6h.01"></path>
                            <path d="M16 6h.01"></path>
                            <path d="M8 10h.01"></path>
                            <path d="M16 10h.01"></path>
                            <path d="M12 6h.01"></path>
                            <path d="M12 10h.01"></path>
                            <path d="M8 14h.01"></path>
                            <path d="M16 14h.01"></path>
                            <path d="M12 14h.01"></path>
                        </svg>
                    `;
                    titleWrapper.appendChild(companyMarker);
                }

                // Dynamically render GitHub source link
                if (project.github) {
                    const githubLink = document.createElement('a');
                    githubLink.href = project.github;
                    githubLink.className = 'github-link';
                    githubLink.target = '_blank';
                    githubLink.rel = 'noopener noreferrer';
                    githubLink.setAttribute('aria-label', `View ${project.title} source code`);
                    githubLink.innerHTML = `
                        <svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                    `;
                    titleWrapper.appendChild(githubLink);
                }

                // Dynamically render in-progress marker
                if (project.inProgress) {
                    const progressMarker = document.createElement('span');
                    progressMarker.className = 'progress-marker';
                    progressMarker.setAttribute('title', 'In-progress Project');
                    progressMarker.setAttribute('aria-label', 'In-progress Project');
                    progressMarker.innerHTML = `
                        <svg class="progress-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    `;
                    titleWrapper.appendChild(progressMarker);
                }

                const categorySpan = document.createElement('span');
                categorySpan.className = 'category';
                categorySpan.textContent = project.category;

                headerDiv.appendChild(titleWrapper);
                headerDiv.appendChild(categorySpan);
                article.appendChild(headerDiv);

                // Dynamically render project period and affiliation
                if (project.period || project.affiliation) {
                    const metaP = document.createElement('p');
                    metaP.className = 'project-meta';
                    const parts = [];
                    if (project.period) parts.push(project.period);
                    if (project.affiliation) parts.push(project.affiliation);
                    metaP.textContent = parts.join('  ·  ');
                    article.appendChild(metaP);
                }

                // Dynamically render description
                if (project.description) {
                    const descP = document.createElement('p');
                    descP.className = 'description';
                    descP.textContent = project.description;
                    article.appendChild(descP);
                }

                // Dynamically render technology tags
                if (project.tags && project.tags.length > 0) {
                    const tagsDiv = document.createElement('div');
                    tagsDiv.className = 'tech-tags';
                    project.tags.forEach(tag => {
                        const tagSpan = document.createElement('span');
                        tagSpan.className = 'tech-tag';
                        const brandClass = tag.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        tagSpan.classList.add(brandClass);
                        tagSpan.textContent = tag;
                        tagsDiv.appendChild(tagSpan);
                    });
                    article.appendChild(tagsDiv);
                }

                listContainer.appendChild(article);
            });
            bindCategoryFilters(containerId);
        })
        .catch(error => {
            console.error(error);
            listContainer.innerHTML = `<p class="error-msg" style="color: #ef4444; font-size: 0.95rem; text-align: center; width: 100%;">An error occurred while loading the list.</p>`;
        });
}

// Filter logic binding
function bindCategoryFilters(listContainerId) {
    const filterBtns = document.querySelectorAll('.filter-bar .filter-btn');
    if (filterBtns.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterVal = btn.getAttribute('data-filter');
            const cards = document.querySelectorAll(`#${listContainerId} .project-item`);

            cards.forEach(card => {
                const categorySpan = card.querySelector('.category');
                const category = categorySpan ? categorySpan.textContent.toLowerCase().trim() : '';
                const normalizedCategory = category.replace(/[^a-z0-9]/g, '_');

                let isMatch = false;
                if (filterVal === 'all') {
                    isMatch = true;
                } else if (filterVal === 'etc') {
                    isMatch = !normalizedCategory.includes('automation');
                } else {
                    isMatch = normalizedCategory.includes(filterVal);
                }

                if (isMatch) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}


// Control common entry point
document.addEventListener('DOMContentLoaded', () => {
    // Call when portfolio main list is detected
    if (document.getElementById('portfolio-list')) {
        renderProjectList('portfolio-list', 'projects.json');
    }
    // Call when toy project list is detected
    if (document.getElementById('toy-list')) {
        renderProjectList('toy-list', 'toys.json');
    }
});
