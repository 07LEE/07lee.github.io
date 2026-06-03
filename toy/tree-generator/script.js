document.getElementById('raw-input').addEventListener('input', updateTree);
document.getElementById('root-name-input').addEventListener('input', updateTree);
document.getElementById('show-hidden-toggle').addEventListener('change', updateTree);
document.getElementById('show-double-underscore-toggle').addEventListener('change', updateTree);
document.getElementById('copy-btn').addEventListener('click', copyToClipboard);

// Initialize tree output on page load
updateTree();

function updateTree() {
  const input = document.getElementById('raw-input').value.trim();
  const rootInputEl = document.getElementById('root-name-input');
  const showHidden = document.getElementById('show-hidden-toggle').checked;
  const showDoubleUnderscore = document.getElementById('show-double-underscore-toggle').checked;
  const outputEl = document.getElementById('tree-output');

  if (!input) {
    outputEl.textContent = '';
    return;
  }

  // Auto-detect project folder name from terminal prompt
  const promptRegex = /:\~\/([a-zA-Z0-9_\-\.]+)\$\s*(?:find|ls)/;
  const match = input.match(promptRegex);
  if (match && match[1]) {
    rootInputEl.value = match[1];
  }

  const rootName = rootInputEl.value.trim() || 'project';

  const paths = parseInput(input, showHidden, showDoubleUnderscore);
  const tree = buildTreeStructure(paths);
  
  // Render root node itself without connector
  let rendered = rootName + '\n';
  // Render children of root
  rendered += renderTree(tree, '');
  outputEl.textContent = rendered;
}

function parseInput(text, showHidden, showDoubleUnderscore) {
  // Parse input text and extract path tokens split by spaces, tabs, or newlines
  const lines = text.split('\n');
  const tokens = [];
  lines.forEach(line => {
    let trimmed = line.trim();
    if (!trimmed) return;
    
    // Skip terminal prompt lines
    if (trimmed.includes('$ find') || trimmed.includes('$ ls')) return;
    
    // Strip leading './' prefix from paths
    if (trimmed.startsWith('./')) {
      trimmed = trimmed.substring(2);
    }
    
    // Filter out dot hidden files and directories if showHidden is false
    if (!showHidden) {
      const segments = trimmed.split('/');
      const hasHidden = segments.some(seg => seg.startsWith('.') && seg !== '.' && seg !== '..');
      if (hasHidden) return;
    }

    // Filter out double underscore files and directories if showDoubleUnderscore is false
    if (!showDoubleUnderscore) {
      const segments = trimmed.split('/');
      const hasDoubleUnderscore = segments.some(seg => seg.startsWith('__'));
      if (hasDoubleUnderscore) return;
    }

    // Ignore single '.' lines
    if (trimmed === '.') return;
    
    // Handle inline files split by multiple spaces (e.g. ls output)
    if (trimmed.includes('   ') || trimmed.includes('\t') || !trimmed.includes('/')) {
      const parts = trimmed.split(/\s+/);
      parts.forEach(p => { 
        let cleanPart = p;
        if (cleanPart.startsWith('./')) cleanPart = cleanPart.substring(2);
        if (!showHidden) {
          const segments = cleanPart.split('/');
          if (segments.some(seg => seg.startsWith('.') && seg !== '.' && seg !== '..')) return;
        }
        if (!showDoubleUnderscore) {
          const segments = cleanPart.split('/');
          if (segments.some(seg => seg.startsWith('__'))) return;
        }
        if (cleanPart && cleanPart !== '.') tokens.push(cleanPart);
      });
    } else {
      tokens.push(trimmed);
    }
  });
  return tokens;
}

function buildTreeStructure(paths) {
  const root = {};
  paths.forEach(path => {
    const segments = path.split('/');
    let current = root;
    segments.forEach(seg => {
      if (!seg) return;
      if (!current[seg]) {
        current[seg] = {};
      }
      current = current[seg];
    });
  });
  return root;
}

function renderTree(node, prefix = '') {
  const keys = Object.keys(node).sort((a, b) => {
    // Sort keys alphabetically
    return a.localeCompare(b);
  });
  let result = '';
  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    result += prefix + connector + key + '\n';
    
    const childKeys = Object.keys(node[key]);
    if (childKeys.length > 0) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      result += renderTree(node[key], newPrefix);
    }
  });
  return result;
}

function copyToClipboard() {
  const treeText = document.getElementById('tree-output').textContent;
  if (!treeText) return;
  navigator.clipboard.writeText(treeText).then(() => {
    const btn = document.getElementById('copy-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = originalText; }, 2000);
  });
}
