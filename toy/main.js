document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('toy-list');
    if (!listContainer) return;

    fetch('toys.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load toy projects data.');
            }
            return response.json();
        })
        .then(toys => {
            listContainer.innerHTML = ''; // Clear fallback loading message

            toys.forEach(toy => {
                const article = document.createElement('article');
                article.className = 'project-item';
                article.id = toy.id;

                const headerDiv = document.createElement('div');
                headerDiv.className = 'project-header';

                const titleWrapper = document.createElement('div');
                titleWrapper.className = 'project-title-wrapper';

                const h2 = document.createElement('h2');
                const link = document.createElement('a');
                link.href = toy.link;
                link.className = 'link-item';
                link.setAttribute('aria-label', `${toy.title} 보기`);
                link.textContent = toy.title;

                h2.appendChild(link);
                titleWrapper.appendChild(h2);

                const categorySpan = document.createElement('span');
                categorySpan.className = 'category';
                categorySpan.textContent = toy.category;

                headerDiv.appendChild(titleWrapper);
                headerDiv.appendChild(categorySpan);
                article.appendChild(headerDiv);

                // Dynamically render description if present in the data object
                if (toy.description) {
                    const descP = document.createElement('p');
                    descP.className = 'description';
                    descP.textContent = toy.description;
                    article.appendChild(descP);
                }

                // Dynamically render technology tags if present in the data object
                if (toy.tags && toy.tags.length > 0) {
                    const tagsDiv = document.createElement('div');
                    tagsDiv.className = 'tech-tags';
                    toy.tags.forEach(tag => {
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
        })
        .catch(error => {
            console.error(error);
            listContainer.innerHTML = `<p class="error-msg" style="color: #ef4444; font-size: 0.95rem; text-align: center; width: 100%;">토이 프로젝트 목록을 불러오는 중 오류가 발생했습니다.</p>`;
        });
});
