// Marks the contents link of the section being read on long-form project pages.
document.addEventListener('DOMContentLoaded', () => {
    const links = [...document.querySelectorAll('.article-toc a[href^="#"]')];
    const sections = links
        .map(link => document.getElementById(link.getAttribute('href').slice(1)))
        .filter(Boolean);
    if (!sections.length) return;

    const mark = () => {
        // The last section whose top has passed a third of the window.
        const line = window.innerHeight / 3;
        let current = sections[0];
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= line) current = section;
        }
        // At the bottom of the page the last section counts as read.
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            current = sections[sections.length - 1];
        }
        links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`));
    };

    mark();
    window.addEventListener('scroll', mark, { passive: true });
    window.addEventListener('resize', mark);
});
