// Common project list rendering engine
function renderProjectList(containerId, dataUrl) {
    const listContainer = document.getElementById(containerId);
    if (!listContainer) return;

    // Render Skeleton Loaders first
    showSkeletons(listContainer);

    fetch(dataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load data: ${dataUrl}`);
            }
            return response.json();
        })
        .then(projects => {
            listContainer.innerHTML = ''; // Remove skeleton loaders

            // Sort projects by start date in descending order automatically
            projects.sort((a, b) => {
                const getStart = p => p ? p.split('~')[0].trim() : '';
                return getStart(b.period).localeCompare(getStart(a.period));
            });

            projects.forEach(project => {
                const article = document.createElement('article');
                article.className = 'project-item';
                article.id = project.id;

                const headerDiv = document.createElement('div');
                headerDiv.className = 'project-header';

                const titleWrapper = document.createElement('div');
                titleWrapper.className = 'project-title-wrapper';

                const h2 = document.createElement('h2');
                h2.textContent = project.title;
                titleWrapper.appendChild(h2);
                headerDiv.appendChild(titleWrapper);

                // Row 2: Icons & Category
                const metaRow = document.createElement('div');
                metaRow.className = 'project-meta-row';

                const iconsWrapper = document.createElement('div');
                iconsWrapper.className = 'project-icons-wrapper';

                // Dynamically render company marker
                if (project.isCompany) {
                    const companyMarker = document.createElement('span');
                    companyMarker.className = 'company-marker';
                    companyMarker.setAttribute('title', 'Company Project');
                    companyMarker.setAttribute('aria-label', 'Company Project');
                    companyMarker.innerHTML = `
                        <svg class="company-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
                        </svg>
                    `;
                    iconsWrapper.appendChild(companyMarker);
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
                    // Prevent sidebar item click when clicking GitHub link
                    githubLink.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                    iconsWrapper.appendChild(githubLink);
                }

                // Dynamically render in-progress marker
                if (project.inProgress) {
                    const progressMarker = document.createElement('span');
                    progressMarker.className = 'progress-marker';
                    progressMarker.setAttribute('title', 'In-progress Project');
                    progressMarker.setAttribute('aria-label', 'In-progress Project');
                    progressMarker.innerHTML = `
                        <svg class="progress-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    `;
                    iconsWrapper.appendChild(progressMarker);
                }

                metaRow.appendChild(iconsWrapper);

                const categorySpan = document.createElement('span');
                categorySpan.className = 'category';
                categorySpan.textContent = project.category;
                metaRow.appendChild(categorySpan);

                article.appendChild(headerDiv);
                article.appendChild(metaRow);

                // Dynamically render description
                if (project.description) {
                    const descP = document.createElement('p');
                    descP.className = 'description';
                    descP.textContent = project.description;
                    article.appendChild(descP);
                }

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

                // Bind Master-Detail click event for 2-column layout
                article.addEventListener('click', () => {
                    // Control active highlight state in list
                    const siblingCards = listContainer.querySelectorAll('.project-item');
                    siblingCards.forEach(card => card.classList.remove('active'));
                    article.classList.add('active');



                    // Select right container components
                    const welcomeView = document.getElementById('welcome-view');
                    const detailFrameView = document.getElementById('detail-frame-view');
                    const iframe = document.getElementById('project-iframe');

                    if (welcomeView && detailFrameView && iframe) {
                        welcomeView.style.display = 'none';
                        detailFrameView.style.display = 'flex';
                        iframe.src = project.link;

                        const detailTitle = document.getElementById('detail-project-title');
                        if (detailTitle) {
                            detailTitle.textContent = project.title;
                        }

                        adjustIframeScale();
                    }

                    // Mobile view slide transition control
                    const mainContent = document.getElementById('portfolio-main-content');
                    if (mainContent && window.innerWidth <= 768) {
                        mainContent.classList.add('active');
                    }
                });

                listContainer.appendChild(article);
            });
            renderDashboard(projects);
            bindCategoryFilters(containerId);
        })
        .catch(error => {
            console.error(error);
            listContainer.innerHTML = `<p class="error-msg" style="color: #ef4444; font-size: 0.85rem; text-align: center; width: 100%;">An error occurred while loading the list.</p>`;
        });
}

// Display skeleton loaders
function showSkeletons(container) {
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const item = document.createElement('div');
        item.className = 'skeleton-item';
        item.innerHTML = `
            <div class="skeleton-line title"></div>
            <div class="skeleton-line desc1"></div>
            <div class="skeleton-line desc2"></div>
            <div class="skeleton-line meta"></div>
        `;
        container.appendChild(item);
    }
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
                const normalizedCategory = category.replace(/[^a-z0-9]+/g, '_');

                let isMatch = false;
                if (filterVal === 'all') {
                    isMatch = true;
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
    // Bind mouse wheel horizontally for the filter bar
    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
        filterBar.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                filterBar.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        // Mouse Drag to Scroll
        let isDown = false;
        let startX;
        let scrollLeftVal;

        filterBar.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - filterBar.offsetLeft;
            scrollLeftVal = filterBar.scrollLeft;
        });

        filterBar.addEventListener('mouseleave', () => {
            isDown = false;
        });

        filterBar.addEventListener('mouseup', () => {
            isDown = false;
        });

        filterBar.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - filterBar.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed
            filterBar.scrollLeft = scrollLeftVal - walk;
        });
    }

    // Call when portfolio main list is detected
    if (document.getElementById('portfolio-list')) {
        renderProjectList('portfolio-list', 'projects.json');

        const sidebar = document.querySelector('.portfolio-sidebar');
        // Restore sidebar collapsed state from localStorage or set default on desktop
        if (sidebar) {
            const savedState = localStorage.getItem('portfolio_sidebar_collapsed');
            if (savedState === 'true') {
                sidebar.classList.add('collapsed');
            } else if (savedState === 'false') {
                sidebar.classList.remove('collapsed');
            } else if (window.innerWidth > 768) {
                sidebar.classList.add('collapsed');
            }
        }

        // Bind Sidebar toggle menu button
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('portfolio_sidebar_collapsed', isCollapsed ? 'true' : 'false');
            });
        }

        // Bind Close Detail View (Back to Dashboard) button logic
        const closeDetailBtn = document.getElementById('close-detail-btn');
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', () => {
                const welcomeView = document.getElementById('welcome-view');
                const detailFrameView = document.getElementById('detail-frame-view');
                const iframeEl = document.getElementById('project-iframe');
                const cards = document.querySelectorAll('.project-item');

                if (welcomeView && detailFrameView && iframeEl) {
                    welcomeView.style.display = 'block';
                    detailFrameView.style.display = 'none';
                    iframeEl.src = ''; // Unload page to save resources
                }

                // Remove active states from sidebar
                cards.forEach(card => card.classList.remove('active'));

                // Mobile transition reset
                const mainContent = document.getElementById('portfolio-main-content');
                if (mainContent) {
                    mainContent.classList.remove('active');
                }
            });
        }

        // Active interception of iframe load events to purge internal back controls (bypasses browser caches)
        const iframe = document.getElementById('project-iframe');
        if (iframe) {
            iframe.addEventListener('load', adjustIframeScale);
            window.addEventListener('resize', adjustIframeScale);

            iframe.addEventListener('load', () => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc) {
                        // Find any duplicate back link elements or custom element anchors inside the iframe
                        const duplicateBackLinks = iframeDoc.querySelectorAll('.back-link, .back-btn, .back-icon, portfolio-header a, portfolio-header .back-link');
                        duplicateBackLinks.forEach(el => {
                            el.style.display = 'none';
                            el.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            });
                            el.remove(); // Erase from DOM
                        });
                    }
                } catch (err) {
                    console.warn("Cross-origin or initialization lock prevented direct iframe DOM cleanup:", err);
                }
            });
        }
    }
});

// Render dashboard overview grid for the welcome screen
function renderDashboard(projects) {
    const dashboardCategories = document.getElementById('dashboard-categories');
    if (!dashboardCategories) return;

    dashboardCategories.innerHTML = '';

    // We have 4 clean categories: AI & ML, Computer Vision, Automation, Analytics
    const categories = ['AI & ML', 'Computer Vision', 'Automation', 'Analytics'];

    categories.forEach(catName => {
        const catProjects = projects.filter(p => p.category === catName);
        if (catProjects.length === 0) return;

        // Create category section
        const section = document.createElement('div');
        section.className = 'dashboard-section';
        section.setAttribute('data-category', catName.toLowerCase().replace(/[^a-z0-9]+/g, '_'));

        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = catName;
        section.appendChild(sectionTitle);

        const cardGrid = document.createElement('div');
        cardGrid.className = 'dashboard-grid';

        catProjects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'dashboard-card';
            
            // Build card tags HTML
            let tagsHtml = '';
            if (project.tags && project.tags.length > 0) {
                tagsHtml = `<div class="card-tags">` + 
                    project.tags.map(t => `<span class="card-tag ${t.toLowerCase().replace(/[^a-z0-9]/g, '-')}">${t}</span>`).join('') + 
                    `</div>`;
            }

            // Build meta icons for the dashboard card
            let iconsHtml = '';
            if (project.isCompany) {
                iconsHtml += `
                    <span class="company-marker" title="Company Project" aria-label="Company Project">
                        <svg class="company-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
                        </svg>
                    </span>
                `;
            }
            if (project.github) {
                iconsHtml += `
                    <a href="${project.github}" class="github-link" target="_blank" rel="noopener noreferrer" aria-label="View source code" onclick="event.stopPropagation();">
                        <svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                    </a>
                `;
            }
            if (project.inProgress) {
                iconsHtml += `
                    <span class="progress-marker" title="In-progress Project" aria-label="In-progress Project">
                        <svg class="progress-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </span>
                `;
            }

            card.innerHTML = `
                <div class="card-header-row">
                    <h3 class="card-title">${project.title}</h3>
                    ${iconsHtml ? `<div class="card-icons-wrapper">${iconsHtml}</div>` : ''}
                </div>
                <div class="card-meta">
                    <span class="card-period">${project.period}</span>
                    ${project.affiliation ? `<span class="card-affiliation">${project.affiliation}</span>` : ''}
                </div>
                <p class="card-desc">${project.description || ''}</p>
                ${tagsHtml}
            `;
            
            // Clicking the dashboard card behaves exactly like clicking the sidebar card
            card.addEventListener('click', () => {
                const sidebarItem = document.getElementById(project.id);
                if (sidebarItem) {
                    sidebarItem.click(); // Trigger sidebar item click event to load project detail
                }
            });

            cardGrid.appendChild(card);
        });

        section.appendChild(cardGrid);
        dashboardCategories.appendChild(section);
    });
}

// Automatically scale the iframe contents for mobile viewport fit
function adjustIframeScale() {
    const iframe = document.getElementById('project-iframe');
    if (!iframe) return;

    const container = iframe.parentElement;
    if (!container) return;

    // Reset styles first
    iframe.style.width = '100%';
    iframe.style.height = 'calc(100% - 52px)';
    iframe.style.transform = 'none';
    iframe.style.transformOrigin = 'top left';

    // Access inner iframe document (same origin)
    let iframeDoc = null;
    try {
        iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    } catch (e) {
        console.warn("Cross-origin prevents viewport check:", e);
    }

    if (window.innerWidth <= 768) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight - 52; // subtract detail-header height

        // Optimal desktop presentation baseline width
        const baselineWidth = 1200;
        const scale = containerWidth / baselineWidth;

        // Inject/Modify inner viewport to force desktop layout rendering inside mobile iframe
        if (iframeDoc) {
            let metaViewport = iframeDoc.querySelector('meta[name="viewport"]');
            if (!metaViewport) {
                metaViewport = iframeDoc.createElement('meta');
                metaViewport.name = 'viewport';
                iframeDoc.head.appendChild(metaViewport);
            }
            metaViewport.content = `width=${baselineWidth}, initial-scale=1.0, maximum-scale=1.0`;
        }

        iframe.style.width = `${baselineWidth}px`;
        iframe.style.height = `${containerHeight / scale}px`;
        iframe.style.transform = `scale(${scale})`;
        iframe.style.transformOrigin = 'top left';
    } else {
        // Restore standard meta viewport for desktop if viewport was modified
        if (iframeDoc) {
            const metaViewport = iframeDoc.querySelector('meta[name="viewport"]');
            if (metaViewport) {
                metaViewport.content = 'width=device-width, initial-scale=1.0';
            }
        }
    }
}
