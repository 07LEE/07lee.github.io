document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('toy-sidebar-list');
    const welcomeView = document.getElementById('welcome-view');
    const toolView = document.getElementById('tool-view');
    const toolIframe = document.getElementById('tool-iframe');

    if (!listContainer) return;

    fetch('toys.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load toys list.');
            }
            return response.json();
        })
        .then(toys => {
            listContainer.innerHTML = ''; // 로딩 메시지 제거

            toys.forEach(toy => {
                const item = document.createElement('div');
                item.className = 'toy-item';
                item.textContent = toy.title;
                item.setAttribute('aria-label', `Run ${toy.title}`);
                item.title = toy.description || toy.title;

                item.addEventListener('click', () => {
                    // 기존 액티브 아이템 해제
                    document.querySelectorAll('.toy-item').forEach(el => el.classList.remove('active'));
                    item.classList.add('active');

                    // iframe 소스 매핑 및 뷰 전환
                    if (welcomeView) welcomeView.style.display = 'none';
                    if (toolView) toolView.style.display = 'flex';
                    if (toolIframe) {
                        toolIframe.src = toy.link;
                    }
                });

                listContainer.appendChild(item);
            });
        })
        .catch(error => {
            console.error(error);
            listContainer.innerHTML = `<p class="error-msg" style="color: #ef4444; font-size: 0.8rem; padding: 10px;">에러가 발생했습니다.</p>`;
        });
});
