import { useMemo, useState } from 'react';
import './DiffViewer.css';

// Simple LCS-based Diff Algorithm for line-by-line comparison
function computeDiff(oldText = '', newText = '') {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  const m = oldLines.length;
  const n = newLines.length;
  const c = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i-1] === newLines[j-1]) {
        c[i][j] = c[i-1][j-1] + 1;
      } else {
        c[i][j] = Math.max(c[i-1][j], c[i][j-1]);
      }
    }
  }
  
  const diff = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i-1] === newLines[j-1]) {
      diff.unshift({ type: 'unchanged', text: oldLines[i-1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || c[i][j-1] >= c[i-1][j])) {
      diff.unshift({ type: 'added', text: newLines[j-1] });
      j--;
    } else if (i > 0 && (j === 0 || c[i][j-1] < c[i-1][j])) {
      diff.unshift({ type: 'removed', text: oldLines[i-1] });
      i--;
    }
  }
  return diff;
}

export default function DiffViewer({ commit, parentCommit, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const { changedFiles, fileDiffs } = useMemo(() => {
    if (!commit) return { changedFiles: [], fileDiffs: {} };

    const currentTree = commit.tree || {};
    const parentTree = parentCommit?.tree || {};
    
    const allFiles = new Set([...Object.keys(currentTree), ...Object.keys(parentTree)]);
    const changes = [];
    const diffs = {};

    for (const file of allFiles) {
      const oldContent = parentTree[file];
      const newContent = currentTree[file];

      if (oldContent !== newContent) {
        let status = 'modified';
        if (oldContent === undefined) status = 'added';
        if (newContent === undefined) status = 'deleted';
        
        changes.push({ file, status });
        diffs[file] = computeDiff(oldContent || '', newContent || '');
      }
    }

    return { changedFiles: changes, fileDiffs: diffs };
  }, [commit, parentCommit]);

  // Derived state: if selectedFile is invalid or null, use the first changed file
  const activeFile = selectedFile && changedFiles.some(f => f.file === selectedFile)
    ? selectedFile
    : (changedFiles[0]?.file || null);

  if (!commit) return null;

  const currentDiff = activeFile ? fileDiffs[activeFile] : [];

  return (
    <div className="diff-modal-overlay" onClick={onClose}>
      <div className="diff-modal" onClick={e => e.stopPropagation()}>
        <div className="diff-header">
          <div className="diff-header-info">
            <h3>Commit: {commit.hash.substring(0, 7)}</h3>
            <p className="diff-message">{commit.message}</p>
          </div>
          <button className="diff-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="diff-body">
          {changedFiles.length === 0 ? (
            <div className="diff-empty">No file changes in this commit.</div>
          ) : (
            <>
              {/* File List Sidebar */}
              <div className="diff-sidebar">
                <div className="diff-sidebar-title">Changed Files ({changedFiles.length})</div>
                {changedFiles.map(({ file, status }) => (
                  <button
                    key={file}
                    className={`diff-file-item ${activeFile === file ? 'active' : ''}`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <span className={`diff-status-icon ${status}`}>{
                      status === 'added' ? '+' : status === 'deleted' ? '-' : 'M'
                    }</span>
                    {file}
                  </button>
                ))}
              </div>

              {/* Code Diff Area */}
              <div className="diff-content">
                {activeFile && (
                  <div className="diff-code-container">
                    <div className="diff-code-header">{activeFile}</div>
                    <pre className="diff-code-pre">
                      {currentDiff.map((line, idx) => (
                        <div key={idx} className={`diff-line diff-${line.type}`}>
                          <span className="diff-line-prefix">
                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                          </span>
                          <span className="diff-line-text">{line.text || ' '}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
