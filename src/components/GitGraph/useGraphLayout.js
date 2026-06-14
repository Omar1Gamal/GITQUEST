/**
 * useGraphLayout — Computes positions for commit nodes and edges
 * using a lane-based layout algorithm (similar to gitk/data lineage).
 */

import { useMemo } from 'react';

const BRANCH_COLORS = [
  '#58a6ff', // cyan (main)
  '#f778ba', // magenta
  '#3fb950', // emerald
  '#d29922', // amber
  '#f85149', // coral
  '#bc8cff', // purple
  '#79c0ff', // light cyan
  '#ffa657', // orange
];

const NODE_RADIUS = 14;
const LANE_WIDTH = 80;
const ROW_HEIGHT = 70;
const PADDING_TOP = 40;
const PADDING_LEFT = 60;
const LABEL_OFFSET = 24;

export function useGraphLayout(commits, branches, head, detachedHead) {
  return useMemo(() => {
    if (!commits || commits.length === 0) {
      return { nodes: [], edges: [], branchColors: {}, width: 400, height: 200 };
    }

    // Assign colors to branches
    const branchNames = Object.keys(branches);
    const branchColors = {};
    branchNames.forEach((name, i) => {
      branchColors[name] = BRANCH_COLORS[i % BRANCH_COLORS.length];
    });

    // Build a map of hash -> commit
    const commitMap = new Map();
    commits.forEach(c => commitMap.set(c.hash, c));

    // Build forward graph (commit hash -> children)
    const children = new Map();
    commits.forEach(c => {
      if (c.parentHash) {
        c.parentHash.forEach(ph => {
          if (!children.has(ph)) children.set(ph, []);
          children.get(ph).push(c.hash);
        });
      }
    });

    // Topological sort (reverse chronological for display)
    // We want newest at the top
    const sortedCommits = [...commits].reverse();

    // Assign lanes to branches
    const branchLane = {};
    let nextLane = 0;

    // Main always gets lane 0
    if (branches.main !== undefined || branches.main !== null) {
      branchLane['main'] = 0;
      nextLane = 1;
    }

    branchNames.forEach(name => {
      if (name !== 'main' && branchLane[name] === undefined) {
        branchLane[name] = nextLane++;
      }
    });

    // Assign each commit to a lane based on its branch
    const commitLane = new Map();
    
    // First pass: assign lanes by branch label
    sortedCommits.forEach(c => {
      // Find which branches point to this commit
      const branchesAtCommit = [];
      for (const [bName, bHash] of Object.entries(branches)) {
        if (bHash === c.hash) branchesAtCommit.push(bName);
      }
      
      if (c.branch && branchLane[c.branch] !== undefined) {
        commitLane.set(c.hash, branchLane[c.branch]);
      } else if (branchesAtCommit.length > 0) {
        commitLane.set(c.hash, branchLane[branchesAtCommit[0]] || 0);
      }
    });

    // Second pass: inherit lane from children for unassigned
    sortedCommits.forEach(c => {
      if (!commitLane.has(c.hash)) {
        // Check if any child has a lane
        const childHashes = children.get(c.hash) || [];
        if (childHashes.length > 0) {
          const childLane = commitLane.get(childHashes[0]);
          if (childLane !== undefined) {
            commitLane.set(c.hash, childLane);
          }
        }
      }
      if (!commitLane.has(c.hash)) {
        commitLane.set(c.hash, 0);
      }
    });

    // Compute node positions
    const nodes = sortedCommits.map((commit, index) => {
      const lane = commitLane.get(commit.hash) || 0;
      const x = PADDING_LEFT + lane * LANE_WIDTH;
      const y = PADDING_TOP + index * ROW_HEIGHT;

      // Find branch labels for this commit
      const labels = [];
      for (const [bName, bHash] of Object.entries(branches)) {
        if (bHash === commit.hash) {
          labels.push({
            name: bName,
            color: branchColors[bName] || BRANCH_COLORS[0],
            isHead: bName === head && !detachedHead,
          });
        }
      }

      // Determine node color from branch
      let color = BRANCH_COLORS[0];
      if (commit.branch && branchColors[commit.branch]) {
        color = branchColors[commit.branch];
      } else if (labels.length > 0) {
        color = labels[0].color;
      }

      const isHead = (!detachedHead && labels.some(l => l.name === head)) ||
                      (detachedHead && commit.hash === head);

      return {
        hash: commit.hash,
        shortHash: commit.hash.substring(0, 7),
        message: commit.message,
        x,
        y,
        color,
        labels,
        isHead,
        isMerge: commit.parentHash && commit.parentHash.length > 1,
        radius: NODE_RADIUS,
        index,
      };
    });

    // Compute edges
    const nodeMap = new Map();
    nodes.forEach(n => nodeMap.set(n.hash, n));

    const edges = [];
    sortedCommits.forEach(commit => {
      if (!commit.parentHash) return;
      const childNode = nodeMap.get(commit.hash);
      if (!childNode) return;

      commit.parentHash.forEach(parentHash => {
        const parentNode = nodeMap.get(parentHash);
        if (!parentNode) return;

        // Create curved path
        const isSameLane = childNode.x === parentNode.x;
        let path;

        if (isSameLane) {
          // Straight vertical line
          path = `M ${childNode.x} ${childNode.y + NODE_RADIUS} L ${parentNode.x} ${parentNode.y - NODE_RADIUS}`;
        } else {
          // Curved bezier for cross-lane connections
          const midY = (childNode.y + parentNode.y) / 2;
          path = `M ${childNode.x} ${childNode.y + NODE_RADIUS} C ${childNode.x} ${midY}, ${parentNode.x} ${midY}, ${parentNode.x} ${parentNode.y - NODE_RADIUS}`;
        }

        edges.push({
          key: `${commit.hash}-${parentHash}`,
          path,
          color: childNode.color,
          isMerge: !isSameLane,
        });
      });
    });

    const maxLane = Math.max(...Array.from(commitLane.values()), 0);
    const width = Math.max(400, PADDING_LEFT * 2 + (maxLane + 1) * LANE_WIDTH + 200);
    const height = Math.max(200, PADDING_TOP * 2 + nodes.length * ROW_HEIGHT);

    return { nodes, edges, branchColors, width, height };
  }, [commits, branches, head, detachedHead]);
}

export { BRANCH_COLORS, NODE_RADIUS };
