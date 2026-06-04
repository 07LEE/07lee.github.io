// Set pdf.js worker source from CDN matching the main library version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const scaleSelect = document.getElementById('scale-select');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const actionBar = document.getElementById('action-bar');
const downloadAllBtn = document.getElementById('download-all-btn');
const previewGrid = document.getElementById('preview-grid');

// List to store generated image blobs for zip compression
let convertedImages = [];

// Drag and drop event listeners
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        processPDF(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processPDF(e.target.files[0]);
    }
});

// Process uploaded PDF file
function processPDF(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const typedArray = new Uint8Array(event.target.result);
        renderPDF(typedArray);
    };
    reader.readAsArrayBuffer(file);
}

// Render PDF pages to HTML Canvas
async function renderPDF(data) {
    // Reset state
    previewGrid.innerHTML = '';
    convertedImages = [];
    actionBar.style.display = 'none';
    progressContainer.style.display = 'block';
    updateProgress(0, 'Loading PDF document...');

    try {
        const pdf = await pdfjsLib.getDocument({ data: data }).promise;
        const totalPages = pdf.numPages;
        const scale = parseFloat(scaleSelect.value);

        for (let i = 1; i <= totalPages; i++) {
            updateProgress(Math.round(((i - 1) / totalPages) * 100), `Converting page ${i} of ${totalPages}...`);

            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: scale });

            // Create canvas element
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render PDF page to canvas
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Generate image blob from canvas
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            convertedImages.push({
                pageNum: i,
                blob: blob
            });

            // Create preview card UI
            createPreviewCard(canvas, i, blob);
        }

        updateProgress(100, 'Conversion complete!');
        actionBar.style.display = 'flex';

    } catch (error) {
        console.error('PDF Conversion Error:', error);
        updateProgress(0, 'Failed to convert PDF. Please verify document formatting.');
    }
}

// Update UI progress bar and description text
function updateProgress(percentage, text) {
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = text;
}

// Dynamically generate preview card in DOM
function createPreviewCard(canvas, pageNum, blob) {
    const card = document.createElement('div');
    card.className = 'preview-card';

    const pageLabel = document.createElement('span');
    pageLabel.className = 'page-num';
    pageLabel.textContent = `Page ${pageNum}`;

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-single-btn';
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => {
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `page_${pageNum}.png`);
        URL.revokeObjectURL(url);
    });

    card.appendChild(canvas);
    card.appendChild(pageLabel);
    card.appendChild(downloadBtn);
    previewGrid.appendChild(card);
}

// Trigger browser download via dynamic link
function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Compress all page image blobs to ZIP file using JSZip
downloadAllBtn.addEventListener('click', () => {
    if (convertedImages.length === 0) return;

    const zip = new JSZip();
    convertedImages.forEach((img) => {
        zip.file(`page_${img.pageNum}.png`, img.blob);
    });

    updateProgress(100, 'Creating ZIP package...');

    zip.generateAsync({ type: 'blob' }).then((content) => {
        const url = URL.createObjectURL(content);
        triggerDownload(url, 'converted_pages.zip');
        URL.revokeObjectURL(url);
        updateProgress(100, 'Download complete!');
    });
});
