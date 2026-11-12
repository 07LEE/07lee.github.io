// Renders solvedac.json into #ps-card (index.html).
// The JSON is a saved copy of https://solved.ac/api/v4/users/07lee, because that API does not allow browser calls from other sites.
// The section stays hidden when the file cannot be loaded.

(function () {
    const card = document.getElementById('ps-card');
    if (!card) return;

    const TIER_GROUPS = [
        { name: 'Bronze', color: '#ad5600' },
        { name: 'Silver', color: '#7c97b0' },
        { name: 'Gold', color: '#ec9a00' },
        { name: 'Platinum', color: '#27e2a4' },
        { name: 'Diamond', color: '#00b4fc' },
        { name: 'Ruby', color: '#ff0062' }
    ];
    const STEPS = ['V', 'IV', 'III', 'II', 'I'];

    function tierOf(level) {
        if (level >= 31) return { label: 'Master', color: '#b491ff' };
        if (!(level >= 1)) return { label: 'Unrated', color: 'var(--text-sub)' };
        const group = TIER_GROUPS[Math.floor((level - 1) / 5)];
        return { label: `${group.name} ${STEPS[(level - 1) % 5]}`, color: group.color };
    }

    function stat(label, value) {
        const cell = document.createElement('div');
        cell.className = 'ps-stat';
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        cell.append(dt, dd);
        return cell;
    }

    fetch('solvedac.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load solvedac.json');
            return res.json();
        })
        .then(data => {
            const tier = tierOf(data.tier);

            const head = document.createElement('div');
            head.className = 'ps-tier';
            const name = document.createElement('span');
            name.className = 'ps-tier-name';
            name.style.color = tier.color;
            name.textContent = tier.label;
            const meta = document.createElement('span');
            meta.className = 'ps-meta';
            meta.textContent = `${data.handle} · ${data.updatedAt} 기준`;
            head.append(name, meta);

            const stats = document.createElement('dl');
            stats.className = 'ps-stats';
            stats.append(
                stat('Rating', Number(data.rating).toLocaleString('en-US')),
                stat('Solved', Number(data.solvedCount).toLocaleString('en-US')),
                stat('Class', data.class)
            );

            card.append(head, stats);
            card.closest('section').hidden = false;
        })
        .catch(err => console.error(err));
})();
