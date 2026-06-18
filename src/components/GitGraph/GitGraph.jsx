/**
 * GitGraph — Real-time SVG visualization of the commit graph.
 * Features: animated nodes, curved edges, branch labels, HEAD indicator, tooltips.
 */

import { useState, useRef, useEffect } from 'react';
import { useGraphLayout } from './useGraphLayout.js';
import './GitGraph.css';

export default function GitGraph({ commits = [], branches = {}, head = 'main', detachedHead = false, onNodeClick }) {
  const { nodes, edges, branchColors, width, height } = useGraphLayout(commits, branches, head, detachedHead);
  const [tooltip, setTooltip] = useState(null);
  const [animatedNodes, setAnimatedNodes] = useState(new Set());
  const prevCommitCount = useRef(0);
  const containerRef = useRef(null);
  const bodyRef = useRef(null);

  // Track new commits for animation
  useEffect(() => {
    if (commits.length > prevCommitCount.current) {
      const newHashes = new Set();
      commits.slice(prevCommitCount.current).forEach(c => newHashes.add(c.hash));
      setAnimatedNodes(newHashes);
      
      // Auto-scroll to show the latest commit
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }

      // Clear animation class after animation completes
      const timer = setTimeout(() => setAnimatedNodes(new Set()), 600);
      return () => clearTimeout(timer);
    }
    prevCommitCount.current = commits.length;
  }, [commits]);

  const handleNodeHover = (node, event) => {
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      ...node,
      x: event.clientX - rect.left + 10,
      y: event.clientY - rect.top - 10,
    });
  };

  const handleNodeLeave = () => setTooltip(null);

  // Branch legend data
  const activeBranches = Object.entries(branchColors).filter(([name]) => branches[name] !== undefined);

  if (commits.length === 0) {
    return (
      <div className="git-graph-container" ref={containerRef}>
        <div className="git-graph-header">
          <span className="git-graph-title">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8 12.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
            </svg>
            Commit Graph
          </span>
        </div>
        <div className="git-graph-empty">
          <div className="git-graph-empty-icon">🌳</div>
          <div className="git-graph-empty-text">
            No commits yet. Initialize a repository and make your first commit to see the graph come alive!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="git-graph-container" ref={containerRef}>
      <div className="git-graph-header">
        <span className="git-graph-title">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8 12.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          Commit Graph
        </span>
        <div className="git-graph-branch-legend">
          {activeBranches.map(([name, color]) => (
            <div key={name} className="branch-legend-item">
              <span className="branch-legend-dot" style={{ backgroundColor: color }} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="git-graph-body" ref={bodyRef}>
        <svg 
          className="git-graph-svg" 
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
        >
          {/* Edges (drawn behind nodes) */}
          {edges.map(edge => (
            <path
              key={edge.key}
              d={edge.path}
              className={`commit-edge ${animatedNodes.size > 0 ? 'animated' : ''}`}
              stroke={edge.color}
              strokeDasharray={edge.isMerge ? '5,5' : 'none'}
              style={{ opacity: edge.isMerge ? 0.4 : 0.6 }}
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => (
            <g
              key={node.hash}
              className={`commit-node ${animatedNodes.has(node.hash) ? 'node-enter' : ''}`}
              onMouseEnter={(e) => handleNodeHover(node, e)}
              onMouseLeave={handleNodeLeave}
              onClick={() => onNodeClick && onNodeClick(node.hash)}
              style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            >
              {/* Glow ring for HEAD */}
              {node.isHead && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + 6}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="2"
                  opacity="0.3"
                  style={{ animation: 'glow 2s ease-in-out infinite' }}
                />
              )}

              {/* Main circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={node.isMerge ? 'transparent' : node.color}
                stroke={node.color}
                strokeWidth={node.isHead ? 3 : 2}
                className={`commit-circle ${node.isHead ? 'head-commit' : ''}`}
                style={{ '--current-branch-color': node.color }}
              />

              {/* Inner circle for merge commits */}
              {node.isMerge && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius - 4}
                  fill={node.color}
                  opacity="0.5"
                />
              )}

              {/* Hash label */}
              <text
                x={node.x + node.radius + 10}
                y={node.y - 6}
                className="commit-hash-label"
              >
                {node.shortHash}
              </text>

              {/* Message label */}
              <text
                x={node.x + node.radius + 10}
                y={node.y + 10}
                className="commit-message-label"
              >
                {node.message.length > 35 ? node.message.substring(0, 35) + '…' : node.message}
              </text>

              {/* Branch labels */}
              {node.labels.map((label, i) => {
                const labelX = node.x + node.radius + 10;
                const labelY = node.y - 24 - i * 20;
                const textWidth = label.name.length * 7 + (label.isHead ? 50 : 16);

                return (
                  <g key={label.name} className="branch-label">
                    <rect
                      className="branch-label-bg"
                      x={labelX - 4}
                      y={labelY - 9}
                      width={textWidth}
                      height={18}
                      fill={label.color}
                    />
                    <text
                      className="branch-label-text"
                      x={labelX + textWidth / 2 - 4}
                      y={labelY}
                    >
                      {label.isHead ? `HEAD → ${label.name}` : label.name}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="commit-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="commit-tooltip-hash">{tooltip.hash}</div>
          <div className="commit-tooltip-message">{tooltip.message}</div>
          {tooltip.labels.map(l => (
            <span
              key={l.name}
              className="commit-tooltip-branch"
              style={{
                backgroundColor: `${l.color}20`,
                color: l.color,
                border: `1px solid ${l.color}40`,
              }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
