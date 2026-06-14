import React from 'react';
import './Sandbox.css';

export default function Sandbox({ onBack }) {
  return (
    <div className="sandbox-panel">
      <div className="sandbox-header">
        <button className="btn btn-secondary sandbox-back-btn" onClick={onBack}>
          ← Menu
        </button>
        <h2 className="sandbox-title">Sandbox Mode</h2>
      </div>
      <div className="sandbox-content">
        <p>
          Welcome to the <strong>Sandbox</strong>! Here you have a completely unrestricted Git environment to experiment in.
        </p>
        <div className="sandbox-tips">
          <h3>💡 Pro Tips:</h3>
          <ul>
            <li>Try branching off and merging to see how the graph reacts.</li>
            <li>Use <code>git rebase</code> or <code>git cherry-pick</code> to manipulate history.</li>
            <li>Use <code>git reset --hard</code> to undo your mistakes.</li>
            <li>Click on any commit node in the graph to view the code changes (Diff Viewer)!</li>
          </ul>
        </div>
        <div className="sandbox-commands">
          <h3>🛠 Available Commands:</h3>
          <div className="command-grid">
            <span className="cmd">git init</span>
            <span className="cmd">git add .</span>
            <span className="cmd">git commit -m ""</span>
            <span className="cmd">git branch</span>
            <span className="cmd">git checkout</span>
            <span className="cmd">git merge</span>
            <span className="cmd">git rebase</span>
            <span className="cmd">git cherry-pick</span>
            <span className="cmd">git log</span>
            <span className="cmd">echo "text" &gt; file</span>
          </div>
        </div>
      </div>
    </div>
  );
}
