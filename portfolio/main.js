document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('portfolio-list');
    if (!listContainer) return;

    fetch('projects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load project data.');
            }
            return response.json();
        })
        .then(projects => {
            listContainer.innerHTML = ''; // Clear fallback or existing content

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
                link.setAttribute('aria-label', `${project.title} 프로젝트 보기`);
                link.textContent = project.title;
                h2.appendChild(link);
                titleWrapper.appendChild(h2);

                if (project.isCompany) {
                    const companyMarker = document.createElement('span');
                    companyMarker.className = 'company-marker';
                    companyMarker.setAttribute('title', '회사 프로젝트');
                    companyMarker.setAttribute('aria-label', '회사 프로젝트');
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

                if (project.github) {
                    const githubLink = document.createElement('a');
                    githubLink.href = project.github;
                    githubLink.className = 'github-link';
                    githubLink.target = '_blank';
                    githubLink.rel = 'noopener noreferrer';
                    githubLink.setAttribute('aria-label', `${project.title} 소스 코드 보기`);

                    githubLink.innerHTML = `
                        <svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                    `;
                    titleWrapper.appendChild(githubLink);
                }

                const categorySpan = document.createElement('span');
                categorySpan.className = 'category';
                categorySpan.textContent = project.category;

                headerDiv.appendChild(titleWrapper);
                headerDiv.appendChild(categorySpan);

                const descP = document.createElement('p');
                descP.className = 'description';
                descP.textContent = project.description;

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

                article.appendChild(headerDiv);
                article.appendChild(descP);
                article.appendChild(tagsDiv);

                listContainer.appendChild(article);
            });
        })
        .catch(error => {
            console.error(error);
            listContainer.innerHTML = `<p class="error-msg" style="color: #ef4444; font-size: 0.95rem; text-align: center; width: 100%;">프로젝트 목록을 불러오는 중 오류가 발생했습니다.</p>`;
        });
});
