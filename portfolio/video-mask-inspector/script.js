document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.tech-section');
    const appFrame = document.querySelector('.app-frame');
    const timeLine = document.getElementById('time-line');
    const timeHandle = document.getElementById('time-handle');
    const terminalScreen = document.getElementById('terminal-screen');

    // Section specific log databases
    const logsDb = {
        1: [
            { type: 'info', text: '> Loader: frame_0001.png parsed successfully. Ready.' },
            { type: 'info', text: '> Inference: Base model SAM 2.1 Large initialized.' }
        ],
        2: [
            { type: 'info', text: '> Loader: frame_0043.png loaded.' },
            { type: 'warn-log', text: '> Tracker: Occlusion detected at frame_0043.' },
            { type: 'warn-log', text: '> Warning: Object ID Switch warning triggered (Obj 12 <-> Obj 15)' }
        ],
        3: [
            { type: 'cmd-log', text: '> Interactive: User placed positive point at (345, 210).' },
            { type: 'cmd-log', text: '> Action: swap_id_current_to_end(12, 15, frame=43) executed.' },
            { type: 'success-log', text: '> System: ID switch corrected. Alignment complete.' }
        ],
        4: [
            { type: 'info', text: '> Memory: LRU garbage collector freed 24 frame masks from RAM.' },
            { type: 'info', text: '> IO: Serializing uint16 PNG mask structures... Done.' },
            { type: 'success-log', text: '> Sync: Smart sync uploaded 4 modified files to remote NAS.' }
        ],
        5: [
            { type: 'cmd-log', text: '> Server: FastAPI Web mode activated at http://localhost:8000.' },
            { type: 'info', text: '> Remote Client: WebSocket connection established with 192.168.1.105.' }
        ]
    };

    // Timeline position databases
    const timelineDb = {
        1: 5,
        2: 45,
        3: 45,
        4: 70,
        5: 95
    };

    const updateSimulatorState = (sectionId) => {
        // Remove all state classes
        for (let i = 1; i <= 5; i++) {
            appFrame.classList.remove(`active-state-${i}`);
        }

        // Add current state class
        appFrame.classList.add(`active-state-${sectionId}`);

        // Update Timeline
        const progressPercent = timelineDb[sectionId];
        timeLine.style.width = `${progressPercent}%`;
        timeHandle.style.left = `${progressPercent}%`;

        // Update Terminal Logs
        terminalScreen.innerHTML = '';
        const logs = logsDb[sectionId];
        logs.forEach(log => {
            const div = document.createElement('div');
            div.className = `log-line ${log.type}`;
            div.textContent = log.text;
            terminalScreen.appendChild(div);
        });
        
        // Auto scroll terminal to bottom
        terminalScreen.scrollTop = terminalScreen.scrollHeight;
    };

    // Setup Intersection Observer to detect scroll sections
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = parseInt(entry.target.getAttribute('data-section'), 10);
                if (sectionId) {
                    updateSimulatorState(sectionId);
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Default init to section 1
    updateSimulatorState(1);
});
