/**
 * GitEngine — A virtual Git repository that runs entirely in-memory.
 * Simulates core Git operations for educational purposes.
 */

import { generateHash } from './hashGenerator.js';
import { parseCommand, parseEchoRedirect } from './commandParser.js';

// Sanitize HTML entities to prevent XSS in terminal output
function sanitizeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class GitEngine {
  constructor(initialState = null) {
    if (initialState) {
      this.loadState(initialState);
    } else {
      this.reset();
    }
  }

  reset() {
    this.initialized = false;
    this.workingDirectory = new Map(); // filename -> content
    this.stagingArea = new Map();      // filename -> content (staged)
    this.commits = [];                 // array of commit objects
    this.branches = {};                // branchName -> commitHash
    this.head = 'main';               // current branch name or commit hash
    this.detachedHead = false;
    this.reflog = [];                  // array of reflog entries
    this.stashStack = [];             // array of stashed states
    this.remote = null;               // simulated remote repo
    this.remoteUrl = '';
    this.cwd = '~/project';
  }

  // ─── State Serialization ─────────────────────────────
  getState() {
    return {
      initialized: this.initialized,
      workingDirectory: Object.fromEntries(this.workingDirectory),
      stagingArea: Object.fromEntries(this.stagingArea),
      commits: [...this.commits],
      branches: { ...this.branches },
      head: this.head,
      detachedHead: this.detachedHead,
      reflog: [...this.reflog],
      stashStack: [...this.stashStack],
      remote: this.remote ? { ...this.remote, commits: [...this.remote.commits], branches: { ...this.remote.branches } } : null,
      remoteUrl: this.remoteUrl,
      cwd: this.cwd,
    };
  }

  loadState(state) {
    this.initialized = state.initialized || false;
    this.workingDirectory = new Map(Object.entries(state.workingDirectory || {}));
    this.stagingArea = new Map(Object.entries(state.stagingArea || {}));
    this.commits = state.commits || [];
    this.branches = state.branches || {};
    this.head = state.head || 'main';
    this.detachedHead = state.detachedHead || false;
    this.reflog = state.reflog || [];
    this.stashStack = state.stashStack || [];
    this.remote = state.remote || null;
    this.remoteUrl = state.remoteUrl || '';
    this.cwd = state.cwd || '~/project';
  }

  // ─── Main Command Executor ──────────────────────────
  execute(rawInput) {
    const parsed = parseCommand(rawInput);
    if (!parsed) {
      return { success: false, output: '' };
    }

    try {
      if (parsed.type === 'shell') {
        return this.executeShellCommand(parsed);
      }

      if (parsed.type === 'git') {
        if (!parsed.subcommand) {
          return { success: true, output: this.getGitHelp() };
        }

        // Check if repo is initialized for non-init commands
        if (parsed.subcommand !== 'init' && parsed.subcommand !== 'clone' && !this.initialized) {
          return {
            success: false,
            output: 'fatal: not a git repository (or any of the parent directories): .git'
          };
        }

        return this.executeGitCommand(parsed);
      }

      return {
        success: false,
        output: `command not found: ${parsed.command}\nType 'help' for available commands.`
      };
    } catch (error) {
      return {
        success: false,
        output: `error: ${error.message}`
      };
    }
  }

  // ─── Shell Commands ──────────────────────────────────
  executeShellCommand(parsed) {
    switch (parsed.command) {
      case 'help':
        return { success: true, output: this.getHelp() };

      case 'clear':
        return { success: true, output: '__CLEAR__' };

      case 'pwd':
        return { success: true, output: this.cwd };

      case 'ls': {
        const files = Array.from(this.workingDirectory.keys());
        if (files.length === 0) {
          return { success: true, output: '' };
        }
        return { success: true, output: files.join('  ') };
      }

      case 'touch': {
        if (parsed.args.length === 0) {
          return { success: false, output: 'touch: missing file operand' };
        }
        for (const filename of parsed.args) {
          if (!this.workingDirectory.has(filename)) {
            this.workingDirectory.set(filename, '');
          }
        }
        return { success: true, output: '' };
      }

      case 'mkdir': {
        // Simplified — we don't track directories, just acknowledge
        if (parsed.args.length === 0) {
          return { success: false, output: 'mkdir: missing operand' };
        }
        return { success: true, output: '' };
      }

      case 'cat': {
        if (parsed.args.length === 0) {
          return { success: false, output: 'cat: missing file operand' };
        }
        const filename = parsed.args[0];
        if (!this.workingDirectory.has(filename)) {
          return { success: false, output: `cat: ${filename}: No such file or directory` };
        }
        return { success: true, output: this.workingDirectory.get(filename) };
      }

      case 'echo': {
        const redirect = parseEchoRedirect(parsed.raw);
        if (redirect) {
          // Sanitize file content to prevent XSS
          const safeContent = sanitizeHtml(redirect.content);
          if (redirect.append && this.workingDirectory.has(redirect.filename)) {
            const existing = this.workingDirectory.get(redirect.filename);
            this.workingDirectory.set(redirect.filename, existing + '\n' + safeContent);
          } else {
            this.workingDirectory.set(redirect.filename, safeContent);
          }
          return { success: true, output: '' };
        }
        return { success: true, output: sanitizeHtml(parsed.args.join(' ')) };
      }

      case 'cd':
        return { success: true, output: '' };

      default:
        return { success: false, output: `command not found: ${parsed.command}` };
    }
  }

  // ─── Git Commands ────────────────────────────────────
  executeGitCommand(parsed) {
    const { subcommand, args, flags } = parsed;

    switch (subcommand) {
      case 'init':     return this.gitInit();
      case 'add':      return this.gitAdd(args, flags);
      case 'status':   return this.gitStatus();
      case 'commit':   return this.gitCommit(args, flags);
      case 'log':      return this.gitLog(flags);
      case 'branch':   return this.gitBranch(args, flags);
      case 'checkout': return this.gitCheckout(args, flags);
      case 'switch':   return this.gitSwitch(args, flags);
      case 'merge':    return this.gitMerge(args, flags);
      case 'rebase':   return this.gitRebase(args, flags);
      case 'cherry-pick': return this.gitCherryPick(args);
      case 'stash':    return this.gitStash(args);
      case 'reset':    return this.gitReset(args, flags);
      case 'revert':   return this.gitRevert(args);
      case 'reflog':   return this.gitReflog();
      case 'remote':   return this.gitRemote(args, flags);
      case 'clone':    return this.gitClone(args);
      case 'fetch':    return this.gitFetch();
      case 'pull':     return this.gitPull();
      case 'push':     return this.gitPush(args, flags);
      case 'diff':     return this.gitDiff();
      default:
        return {
          success: false,
          output: `git: '${subcommand}' is not a git command. See 'git help'.`
        };
    }
  }

  // ─── git init ────────────────────────────────────────
  gitInit() {
    if (this.initialized) {
      return {
        success: true,
        output: `Reinitialized existing Git repository in ${this.cwd}/.git/`
      };
    }

    this.initialized = true;
    this.branches['main'] = null;
    this.head = 'main';
    this.addReflog('init', 'initial');

    return {
      success: true,
      output: `Initialized empty Git repository in ${this.cwd}/.git/`
    };
  }

  // ─── git add ─────────────────────────────────────────
  gitAdd(args, flags) {
    if (args.length === 0 && !flags.A && !flags.a) {
      return {
        success: false,
        output: "Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?"
      };
    }

    const filesToAdd = (args[0] === '.' || flags.A || flags.a)
      ? Array.from(this.workingDirectory.keys())
      : args;

    let addedCount = 0;

    for (const filename of filesToAdd) {
      if (this.workingDirectory.has(filename)) {
        this.stagingArea.set(filename, this.workingDirectory.get(filename));
        addedCount++;
      } else if (args[0] !== '.') {
        return {
          success: false,
          output: `fatal: pathspec '${filename}' did not match any files`
        };
      }
    }

    return {
      success: true,
      output: addedCount > 0 ? '' : ''
    };
  }

  // ─── git status ──────────────────────────────────────
  gitStatus() {
    const branch = this.detachedHead ? `HEAD detached at ${this.head.substring(0, 7)}` : `On branch ${this.head}`;
    let output = `${branch}\n`;

    // Get the last commit's tree for comparison
    const lastCommitTree = this.getLastCommitTree();

    // Check for staged changes
    const stagedChanges = [];
    const unstagedChanges = [];
    const untrackedFiles = [];

    for (const [filename, content] of this.stagingArea) {
      if (!lastCommitTree.has(filename)) {
        stagedChanges.push(`\tnew file:   ${filename}`);
      } else if (lastCommitTree.get(filename) !== content) {
        stagedChanges.push(`\tmodified:   ${filename}`);
      }
    }

    for (const [filename, content] of this.workingDirectory) {
      if (this.stagingArea.has(filename)) {
        if (this.stagingArea.get(filename) !== content) {
          unstagedChanges.push(`\tmodified:   ${filename}`);
        }
      } else if (lastCommitTree.has(filename)) {
        unstagedChanges.push(`\tmodified:   ${filename}`);
      } else {
        untrackedFiles.push(`\t${filename}`);
      }
    }

    if (stagedChanges.length === 0 && unstagedChanges.length === 0 && untrackedFiles.length === 0) {
      if (this.commits.length === 0) {
        output += '\nNo commits yet\n\nnothing to commit (create/copy files and use "git add" to track)';
      } else {
        output += '\nnothing to commit, working tree clean';
      }
      return { success: true, output };
    }

    if (stagedChanges.length > 0) {
      output += '\nChanges to be committed:\n';
      output += '  (use "git restore --staged <file>..." to unstage)\n';
      output += stagedChanges.map(s => `\x1b[32m${s}\x1b[0m`).join('\n') + '\n';
    }

    if (unstagedChanges.length > 0) {
      output += '\nChanges not staged for commit:\n';
      output += '  (use "git add <file>..." to update what will be committed)\n';
      output += unstagedChanges.map(s => `\x1b[31m${s}\x1b[0m`).join('\n') + '\n';
    }

    if (untrackedFiles.length > 0) {
      output += '\nUntracked files:\n';
      output += '  (use "git add <file>..." to include in what will be committed)\n';
      output += untrackedFiles.map(s => `\x1b[31m${s}\x1b[0m`).join('\n') + '\n';
    }

    return { success: true, output };
  }

  // ─── git commit ──────────────────────────────────────
  gitCommit(args, flags) {
    const message = flags.m || (flags.a && flags.m) || null;

    // Handle -a flag: stage all tracked files
    if (flags.a) {
      const lastTree = this.getLastCommitTree();
      for (const [filename] of this.workingDirectory) {
        if (lastTree.has(filename)) {
          this.stagingArea.set(filename, this.workingDirectory.get(filename));
        }
      }
    }

    if (!message) {
      return {
        success: false,
        output: 'Aborting commit due to empty commit message.\nUsage: git commit -m "your message"'
      };
    }

    if (this.stagingArea.size === 0) {
      return {
        success: false,
        output: 'nothing to commit (use "git add" to stage files first)'
      };
    }

    const parentHash = this.getCurrentCommitHash();
    const hash = generateHash();
    const tree = Object.fromEntries(this.stagingArea);

    const commit = {
      hash,
      message,
      timestamp: new Date().toISOString(),
      parentHash: parentHash ? [parentHash] : [],
      tree,
      branch: this.detachedHead ? null : this.head,
    };

    this.commits.push(commit);

    if (!this.detachedHead) {
      this.branches[this.head] = hash;
    }

    // Copy staging area to be the new baseline
    // Don't clear — keep as current state
    this.addReflog('commit', message, hash);

    const filesChanged = this.stagingArea.size;
    const shortH = hash.substring(0, 7);
    const branch = this.detachedHead ? `(HEAD detached)` : this.head;

    return {
      success: true,
      output: `[${branch} ${shortH}] ${message}\n ${filesChanged} file${filesChanged !== 1 ? 's' : ''} changed`
    };
  }

  // ─── git log ─────────────────────────────────────────
  gitLog(flags) {
    if (this.commits.length === 0) {
      return {
        success: false,
        output: "fatal: your current branch 'main' does not have any commits yet"
      };
    }

    const oneline = flags.oneline || false;
    const currentHash = this.getCurrentCommitHash();

    // Walk from current commit backwards
    const logCommits = this.getCommitHistory(currentHash);

    if (oneline) {
      const lines = logCommits.map(c => {
        const branchLabels = this.getBranchLabels(c.hash);
        const labels = branchLabels.length > 0 ? ` \x1b[33m(${branchLabels.join(', ')})\x1b[0m` : '';
        return `\x1b[33m${c.hash.substring(0, 7)}\x1b[0m${labels} ${c.message}`;
      });
      return { success: true, output: lines.join('\n') };
    }

    const entries = logCommits.map(c => {
      const branchLabels = this.getBranchLabels(c.hash);
      const labels = branchLabels.length > 0 ? ` \x1b[33m(${branchLabels.join(', ')})\x1b[0m` : '';
      return [
        `\x1b[33mcommit ${c.hash}\x1b[0m${labels}`,
        `Date:   ${c.timestamp}`,
        ``,
        `    ${c.message}`,
        ``
      ].join('\n');
    });

    return { success: true, output: entries.join('\n') };
  }

  // ─── git branch ──────────────────────────────────────
  gitBranch(args, flags) {
    // Delete branch
    if (flags.d || flags.D) {
      const branchName = args[0] || flags.d || flags.D;
      if (typeof branchName !== 'string') {
        return { success: false, output: 'fatal: branch name required' };
      }
      if (branchName === this.head) {
        return { success: false, output: `error: Cannot delete branch '${branchName}' checked out at '${this.cwd}'` };
      }
      if (!this.branches[branchName]) {
        return { success: false, output: `error: branch '${branchName}' not found.` };
      }
      delete this.branches[branchName];
      return { success: true, output: `Deleted branch ${branchName}.` };
    }

    // List branches
    if (args.length === 0) {
      const branchList = Object.keys(this.branches).map(name => {
        const isCurrent = (name === this.head && !this.detachedHead);
        return isCurrent
          ? `\x1b[32m* ${name}\x1b[0m`
          : `  ${name}`;
      });
      return { success: true, output: branchList.join('\n') };
    }

    // Create new branch
    const newBranch = args[0];
    if (this.branches[newBranch] !== undefined) {
      return { success: false, output: `fatal: A branch named '${newBranch}' already exists.` };
    }

    const currentHash = this.getCurrentCommitHash();
    if (!currentHash) {
      return { success: false, output: "fatal: Not a valid object name: 'main'." };
    }

    this.branches[newBranch] = currentHash;
    return { success: true, output: '' };
  }

  // ─── git checkout ────────────────────────────────────
  gitCheckout(args, flags) {
    // Create and switch: git checkout -b new-branch
    if (flags.b) {
      const branchName = typeof flags.b === 'string' ? flags.b : args[0];
      if (!branchName) {
        return { success: false, output: "fatal: branch name required" };
      }
      if (this.branches[branchName] !== undefined) {
        return { success: false, output: `fatal: A branch named '${branchName}' already exists.` };
      }
      const currentHash = this.getCurrentCommitHash();
      if (!currentHash) {
        return { success: false, output: "fatal: Not a valid object name: 'main'." };
      }
      this.branches[branchName] = currentHash;
      this.head = branchName;
      this.detachedHead = false;
      this.addReflog('checkout', `moving from ${this.head} to ${branchName}`);

      // Update working directory and staging area to match branch
      this.updateWorkingDirectoryToCommit(currentHash);

      return {
        success: true,
        output: `Switched to a new branch '${branchName}'`
      };
    }

    // Switch to existing branch or commit
    const target = args[0];
    if (!target) {
      return { success: false, output: 'error: no branch or commit specified' };
    }

    // Check if it's a branch
    if (this.branches[target] !== undefined) {
      const oldHead = this.head;
      this.head = target;
      this.detachedHead = false;
      this.addReflog('checkout', `moving from ${oldHead} to ${target}`);
      this.updateWorkingDirectoryToCommit(this.branches[target]);
      return {
        success: true,
        output: `Switched to branch '${target}'`
      };
    }

    // Check if it's a commit hash
    const commit = this.findCommitByHash(target);
    if (commit) {
      this.head = commit.hash;
      this.detachedHead = true;
      this.addReflog('checkout', `moving to ${commit.hash.substring(0, 7)}`);
      this.updateWorkingDirectoryToCommit(commit.hash);
      return {
        success: true,
        output: `Note: switching to '${commit.hash.substring(0, 7)}'.\n\nYou are in 'detached HEAD' state.`
      };
    }

    return {
      success: false,
      output: `error: pathspec '${target}' did not match any file(s) known to git`
    };
  }

  // ─── git switch ──────────────────────────────────────
  gitSwitch(args, flags) {
    if (flags.c) {
      const branchName = typeof flags.c === 'string' ? flags.c : args[0];
      return this.gitCheckout([], { b: branchName });
    }

    if (args.length === 0) {
      return { success: false, output: 'fatal: missing branch name' };
    }

    const target = args[0];
    if (this.branches[target] === undefined) {
      return { success: false, output: `fatal: invalid reference: ${target}` };
    }

    return this.gitCheckout([target], {});
  }

  // ─── git merge ───────────────────────────────────────
  gitMerge(args, flags) {
    if (args.length === 0) {
      return { success: false, output: 'fatal: no branch specified to merge' };
    }

    const sourceBranch = args[0];
    if (this.branches[sourceBranch] === undefined) {
      return { success: false, output: `merge: ${sourceBranch} - not something we can merge` };
    }

    const currentHash = this.getCurrentCommitHash();
    const sourceHash = this.branches[sourceBranch];

    if (currentHash === sourceHash) {
      return { success: true, output: 'Already up to date.' };
    }

    // Check if fast-forward is possible
    const sourceHistory = this.getCommitHistory(sourceHash);
    const isFastForward = sourceHistory.some(c => c.hash === currentHash);

    if (isFastForward) {
      // Fast-forward merge
      if (!this.detachedHead) {
        this.branches[this.head] = sourceHash;
      }
      this.updateWorkingDirectoryToCommit(sourceHash);
      this.addReflog('merge', `fast-forward to ${sourceBranch}`);

      return {
        success: true,
        output: `Updating ${currentHash.substring(0, 7)}..${sourceHash.substring(0, 7)}\nFast-forward`
      };
    }

    // Three-way merge — check for conflicts
    const currentTree = this.getCommitTree(currentHash);
    const sourceTree = this.getCommitTree(sourceHash);
    const baseHash = this.findMergeBase(currentHash, sourceHash);
    const baseTree = baseHash ? this.getCommitTree(baseHash) : new Map();

    // Detect conflicts
    const conflicts = [];
    const allFiles = new Set([...currentTree.keys(), ...sourceTree.keys()]);

    for (const file of allFiles) {
      const currentContent = currentTree.get(file);
      const sourceContent = sourceTree.get(file);
      const baseContent = baseTree.get(file);

      if (currentContent !== sourceContent && currentContent !== baseContent && sourceContent !== baseContent) {
        if (currentContent !== undefined && sourceContent !== undefined) {
          conflicts.push(file);
          // Create conflict markers
          const conflictContent = `<<<<<<< HEAD\n${currentContent}\n=======\n${sourceContent}\n>>>>>>> ${sourceBranch}`;
          this.workingDirectory.set(file, conflictContent);
          this.stagingArea.set(file, conflictContent);
        }
      }
    }

    if (conflicts.length > 0) {
      return {
        success: false,
        output: `Auto-merging ${conflicts.join(', ')}\nCONFLICT (content): Merge conflict in ${conflicts.join(', ')}\nAutomatic merge failed; fix conflicts and then commit the result.`
      };
    }

    // No conflicts — create merge commit
    const mergedTree = new Map([...currentTree, ...sourceTree]);
    for (const [file, content] of mergedTree) {
      this.workingDirectory.set(file, content);
      this.stagingArea.set(file, content);
    }

    const hash = generateHash();
    const message = flags.m || `Merge branch '${sourceBranch}' into ${this.head}`;

    const mergeCommit = {
      hash,
      message,
      timestamp: new Date().toISOString(),
      parentHash: [currentHash, sourceHash],
      tree: Object.fromEntries(mergedTree),
      branch: this.detachedHead ? null : this.head,
    };

    this.commits.push(mergeCommit);
    if (!this.detachedHead) {
      this.branches[this.head] = hash;
    }
    this.addReflog('merge', `branch '${sourceBranch}'`);

    return {
      success: true,
      output: `Merge made by the 'ort' strategy.\n[${this.head} ${hash.substring(0, 7)}] ${message}`
    };
  }

  // ─── git rebase ──────────────────────────────────────
  gitRebase(args, flags) {
    if (flags.i) {
      return this.gitInteractiveRebase(args, flags);
    }

    if (args.length === 0) {
      return { success: false, output: 'fatal: no upstream branch specified' };
    }

    const targetBranch = args[0];
    if (this.branches[targetBranch] === undefined) {
      return { success: false, output: `fatal: invalid upstream '${targetBranch}'` };
    }

    const currentHash = this.getCurrentCommitHash();
    const targetHash = this.branches[targetBranch];

    // Find common ancestor
    const baseHash = this.findMergeBase(currentHash, targetHash);

    // Get commits unique to current branch (after base)
    const currentHistory = this.getCommitHistory(currentHash);
    const commitsToReplay = [];

    for (const commit of currentHistory) {
      if (commit.hash === baseHash) break;
      commitsToReplay.unshift(commit); // reverse order
    }

    if (commitsToReplay.length === 0) {
      return { success: true, output: 'Current branch is up to date.' };
    }

    // Replay commits on top of target
    let parentHash = targetHash;
    const rebasedCommits = [];

    for (const commit of commitsToReplay) {
      const newHash = generateHash();
      const newCommit = {
        hash: newHash,
        message: commit.message,
        timestamp: new Date().toISOString(),
        parentHash: [parentHash],
        tree: { ...commit.tree },
        branch: this.detachedHead ? null : this.head,
      };
      this.commits.push(newCommit);
      rebasedCommits.push(newCommit);
      parentHash = newHash;
    }

    if (!this.detachedHead) {
      this.branches[this.head] = parentHash;
    }

    this.updateWorkingDirectoryToCommit(parentHash);
    this.addReflog('rebase', `finished onto ${targetHash.substring(0, 7)}`);

    return {
      success: true,
      output: `Successfully rebased and updated refs/heads/${this.head}.\n${commitsToReplay.length} commit(s) replayed.`
    };
  }

  // ─── git rebase -i (interactive) ─────────────────────
  gitInteractiveRebase(args, flags) {
    // For the learning platform, we simulate interactive rebase
    // by accepting commands like: squash, reword, drop
    const target = typeof flags.i === 'string' ? flags.i : args[0];
    if (!target) {
      return { success: false, output: 'fatal: no upstream specified for interactive rebase' };
    }

    // Parse HEAD~N syntax
    const headMatch = target.match(/^HEAD~(\d+)$/);
    if (!headMatch) {
      return { success: false, output: `fatal: invalid upstream '${target}'. Try HEAD~N format.` };
    }

    const count = parseInt(headMatch[1]);
    const currentHash = this.getCurrentCommitHash();
    const history = this.getCommitHistory(currentHash);

    if (count > history.length) {
      return { success: false, output: `fatal: invalid upstream: only ${history.length} commits exist` };
    }

    const commitsToEdit = history.slice(0, count).reverse();

    let output = 'Interactive rebase started. Available commands:\n';
    output += '  pick   - use commit as-is\n';
    output += '  squash - combine with previous commit\n';
    output += '  reword - change commit message\n';
    output += '  drop   - remove commit\n\n';
    output += 'Commits to edit:\n';
    commitsToEdit.forEach((c, i) => {
      output += `  ${i + 1}. pick ${c.hash.substring(0, 7)} ${c.message}\n`;
    });
    output += '\nUse: git rebase --squash <N> | --reword <N> "msg" | --drop <N>';

    return {
      success: true,
      output,
      interactiveRebase: {
        commits: commitsToEdit,
        count,
      }
    };
  }

  // ─── git cherry-pick ─────────────────────────────────
  gitCherryPick(args) {
    if (args.length === 0) {
      return { success: false, output: 'fatal: no commit specified to cherry-pick' };
    }

    const targetHash = args[0];
    const commit = this.findCommitByHash(targetHash);

    if (!commit) {
      return { success: false, output: `fatal: bad revision '${targetHash}'` };
    }

    const currentHash = this.getCurrentCommitHash();
    const newHash = generateHash();

    const newCommit = {
      hash: newHash,
      message: commit.message,
      timestamp: new Date().toISOString(),
      parentHash: [currentHash],
      tree: { ...this.getCommitTreeObj(currentHash), ...commit.tree },
      branch: this.detachedHead ? null : this.head,
    };

    this.commits.push(newCommit);
    if (!this.detachedHead) {
      this.branches[this.head] = newHash;
    }

    // Update working directory
    for (const [file, content] of Object.entries(commit.tree)) {
      this.workingDirectory.set(file, content);
      this.stagingArea.set(file, content);
    }

    this.addReflog('cherry-pick', commit.message);

    return {
      success: true,
      output: `[${this.head} ${newHash.substring(0, 7)}] ${commit.message}\n 1 file changed`
    };
  }

  // ─── git stash ───────────────────────────────────────
  gitStash(args) {
    const subcommand = args[0] || 'push';

    if (subcommand === 'push' || subcommand === 'save') {
      const currentTree = this.getLastCommitTree();
      const hasChanges = this.hasUncommittedChanges(currentTree);

      if (!hasChanges) {
        return { success: true, output: 'No local changes to save' };
      }

      this.stashStack.push({
        workingDirectory: Object.fromEntries(this.workingDirectory),
        stagingArea: Object.fromEntries(this.stagingArea),
        branch: this.head,
        message: `WIP on ${this.head}`,
      });

      // Revert working directory to last commit state
      this.updateWorkingDirectoryToCommit(this.getCurrentCommitHash());

      return {
        success: true,
        output: `Saved working directory and index state WIP on ${this.head}`
      };
    }

    if (subcommand === 'pop') {
      if (this.stashStack.length === 0) {
        return { success: false, output: 'error: No stash entries found.' };
      }

      const stash = this.stashStack.pop();
      this.workingDirectory = new Map(Object.entries(stash.workingDirectory));
      this.stagingArea = new Map(Object.entries(stash.stagingArea));

      return {
        success: true,
        output: `On branch ${this.head}\nChanges restored from stash.`
      };
    }

    if (subcommand === 'list') {
      if (this.stashStack.length === 0) {
        return { success: true, output: '' };
      }
      const list = this.stashStack.map((s, i) =>
        `stash@{${i}}: ${s.message}`
      ).reverse();
      return { success: true, output: list.join('\n') };
    }

    return { success: false, output: `error: unknown stash subcommand '${subcommand}'` };
  }

  // ─── git reset ───────────────────────────────────────
  gitReset(args, flags) {
    const isSoft = flags.soft || false;
    const isHard = flags.hard || false;

    let target = args[0] || 'HEAD~1';

    // Parse HEAD~N
    let targetHash;
    const headMatch = target.match(/^HEAD~(\d+)$/);
    if (headMatch) {
      const steps = parseInt(headMatch[1]);
      const history = this.getCommitHistory(this.getCurrentCommitHash());
      if (steps >= history.length) {
        return { success: false, output: `fatal: ambiguous argument '${target}'` };
      }
      targetHash = history[steps].hash;
    } else {
      const commit = this.findCommitByHash(target);
      if (!commit) {
        return { success: false, output: `fatal: ambiguous argument '${target}'` };
      }
      targetHash = commit.hash;
    }

    if (!this.detachedHead) {
      this.branches[this.head] = targetHash;
    }

    if (isHard) {
      this.updateWorkingDirectoryToCommit(targetHash);
    } else if (isSoft) {
      // Keep staging area and working directory as-is
    } else {
      // Default (mixed): reset staging area but keep working directory
      const tree = this.getCommitTree(targetHash);
      this.stagingArea = new Map(tree);
    }

    this.addReflog('reset', `moving to ${targetHash.substring(0, 7)}`);

    const mode = isHard ? 'hard' : (isSoft ? 'soft' : 'mixed');
    return {
      success: true,
      output: `HEAD is now at ${targetHash.substring(0, 7)} (${mode} reset)`
    };
  }

  // ─── git revert ──────────────────────────────────────
  gitRevert(args) {
    if (args.length === 0) {
      return { success: false, output: 'fatal: no commit specified to revert' };
    }

    const targetHash = args[0];
    const commit = this.findCommitByHash(targetHash);
    if (!commit) {
      return { success: false, output: `fatal: bad revision '${targetHash}'` };
    }

    const currentHash = this.getCurrentCommitHash();
    const currentTree = this.getCommitTree(currentHash);

    // Create revert by undoing the target commit's changes
    const parentHash = commit.parentHash[0];
    const parentTree = parentHash ? this.getCommitTree(parentHash) : new Map();

    // Revert: apply inverse of the commit
    const revertedTree = new Map(currentTree);
    for (const file of Object.keys(commit.tree)) {
      if (parentTree.has(file)) {
        revertedTree.set(file, parentTree.get(file));
      } else {
        revertedTree.delete(file);
      }
    }

    const newHash = generateHash();
    const message = `Revert "${commit.message}"`;

    const revertCommit = {
      hash: newHash,
      message,
      timestamp: new Date().toISOString(),
      parentHash: [currentHash],
      tree: Object.fromEntries(revertedTree),
      branch: this.detachedHead ? null : this.head,
    };

    this.commits.push(revertCommit);
    if (!this.detachedHead) {
      this.branches[this.head] = newHash;
    }

    this.workingDirectory = new Map(revertedTree);
    this.stagingArea = new Map(revertedTree);
    this.addReflog('revert', message);

    return {
      success: true,
      output: `[${this.head} ${newHash.substring(0, 7)}] ${message}`
    };
  }

  // ─── git reflog ──────────────────────────────────────
  gitReflog() {
    if (this.reflog.length === 0) {
      return { success: true, output: '' };
    }

    const lines = this.reflog.map((entry, i) => {
      const hash = entry.hash ? entry.hash.substring(0, 7) : '0000000';
      return `\x1b[33m${hash}\x1b[0m HEAD@{${i}}: ${entry.action}: ${entry.message}`;
    }).reverse();

    return { success: true, output: lines.join('\n') };
  }

  // ─── git remote ──────────────────────────────────────
  gitRemote(args, flags) {
    const subcommand = args[0];

    if (!subcommand) {
      if (!this.remote) return { success: true, output: '' };
      return { success: true, output: 'origin' };
    }

    if (subcommand === 'add') {
      const name = args[1];
      const url = args[2] || 'https://github.com/user/repo.git';
      this.remoteUrl = url;
      this.remote = {
        name: name || 'origin',
        url,
        commits: [...this.commits],
        branches: { ...this.branches },
      };
      return { success: true, output: '' };
    }

    if (subcommand === '-v' || flags.v) {
      if (!this.remote) return { success: true, output: '' };
      return {
        success: true,
        output: `origin\t${this.remoteUrl} (fetch)\norigin\t${this.remoteUrl} (push)`
      };
    }

    return { success: false, output: `error: unknown subcommand '${subcommand}'` };
  }

  // ─── git clone ───────────────────────────────────────
  gitClone(args) {
    const url = args[0] || 'https://github.com/user/repo.git';

    this.initialized = true;
    this.remoteUrl = url;
    this.branches['main'] = null;
    this.head = 'main';
    this.remote = {
      name: 'origin',
      url,
      commits: [],
      branches: { main: null },
    };

    this.addReflog('clone', `from ${url}`);

    return {
      success: true,
      output: `Cloning into 'project'...\nremote: Enumerating objects: done.\nremote: Counting objects: 100% done.\nReceiving objects: 100% done.`
    };
  }

  // ─── git fetch ───────────────────────────────────────
  gitFetch() {
    if (!this.remote) {
      return { success: false, output: "fatal: no remote configured" };
    }

    return {
      success: true,
      output: `From ${this.remoteUrl}\n * [up to date] main -> origin/main`
    };
  }

  // ─── git pull ────────────────────────────────────────
  gitPull() {
    if (!this.remote) {
      return { success: false, output: "fatal: no remote configured" };
    }

    // Simulate fetching remote changes
    if (this.remote.commits.length > this.commits.length) {
      // Apply remote commits
      const newCommits = this.remote.commits.slice(this.commits.length);
      this.commits.push(...newCommits);
      const latestHash = this.remote.branches[this.head] || this.remote.branches['main'];
      if (latestHash) {
        this.branches[this.head] = latestHash;
        this.updateWorkingDirectoryToCommit(latestHash);
      }
      return {
        success: true,
        output: `Updating...\nFast-forward\n ${newCommits.length} commit(s) pulled.`
      };
    }

    return {
      success: true,
      output: 'Already up to date.'
    };
  }

  // ─── git push ────────────────────────────────────────
  gitPush(args, flags) {
    if (!this.remote) {
      // Auto-create remote for learning
      this.remote = {
        name: 'origin',
        url: 'https://github.com/student/project.git',
        commits: [],
        branches: {},
      };
      this.remoteUrl = this.remote.url;
    }

    const setUpstream = flags.u || flags['set-upstream'];

    this.remote.commits = [...this.commits];
    this.remote.branches = { ...this.branches };

    const branch = this.head;
    let output = `Enumerating objects: done.\nCounting objects: 100% done.\nWriting objects: 100% done.`;

    if (setUpstream) {
      output += `\nBranch '${branch}' set up to track remote branch '${branch}' from 'origin'.`;
    }

    output += `\nTo ${this.remoteUrl}\n   main -> main`;

    return { success: true, output };
  }

  // ─── git diff ────────────────────────────────────────
  gitDiff() {
    const lastTree = this.getLastCommitTree();
    const diffs = [];

    for (const [filename, content] of this.workingDirectory) {
      const lastContent = lastTree.get(filename);
      if (lastContent === undefined) {
        diffs.push(`\x1b[1mdiff --git a/${filename} b/${filename}\x1b[0m\nnew file mode 100644\n\x1b[32m+++ b/${filename}\x1b[0m\n\x1b[32m+${content}\x1b[0m`);
      } else if (lastContent !== content) {
        diffs.push(`\x1b[1mdiff --git a/${filename} b/${filename}\x1b[0m\n\x1b[31m--- a/${filename}\x1b[0m\n\x1b[32m+++ b/${filename}\x1b[0m\n\x1b[31m-${lastContent}\x1b[0m\n\x1b[32m+${content}\x1b[0m`);
      }
    }

    if (diffs.length === 0) {
      return { success: true, output: '' };
    }

    return { success: true, output: diffs.join('\n\n') };
  }

  // ─── Helper Methods ─────────────────────────────────
  getCurrentCommitHash() {
    if (this.detachedHead) return this.head;
    return this.branches[this.head] || null;
  }

  getLastCommitTree() {
    const hash = this.getCurrentCommitHash();
    return this.getCommitTree(hash);
  }

  getCommitTree(hash) {
    if (!hash) return new Map();
    const commit = this.commits.find(c => c.hash === hash);
    if (!commit) return new Map();
    return new Map(Object.entries(commit.tree));
  }

  getCommitTreeObj(hash) {
    if (!hash) return {};
    const commit = this.commits.find(c => c.hash === hash);
    return commit ? { ...commit.tree } : {};
  }

  findCommitByHash(hash) {
    // Support short hashes
    return this.commits.find(c =>
      c.hash === hash || c.hash.startsWith(hash)
    );
  }

  getCommitHistory(hash) {
    if (!hash) return [];
    const history = [];
    const visited = new Set();
    const queue = [hash];

    while (queue.length > 0) {
      const currentHash = queue.shift();
      if (visited.has(currentHash)) continue;
      visited.add(currentHash);

      const commit = this.commits.find(c => c.hash === currentHash);
      if (!commit) continue;

      history.push(commit);
      if (commit.parentHash) {
        for (const parent of commit.parentHash) {
          if (parent && !visited.has(parent)) {
            queue.push(parent);
          }
        }
      }
    }

    return history;
  }

  getBranchLabels(hash) {
    const labels = [];
    for (const [name, branchHash] of Object.entries(this.branches)) {
      if (branchHash === hash) {
        if (name === this.head && !this.detachedHead) {
          labels.unshift(`HEAD -> ${name}`);
        } else {
          labels.push(name);
        }
      }
    }
    return labels;
  }

  findMergeBase(hash1, hash2) {
    const history1 = new Set(this.getCommitHistory(hash1).map(c => c.hash));
    const history2 = this.getCommitHistory(hash2);

    for (const commit of history2) {
      if (history1.has(commit.hash)) {
        return commit.hash;
      }
    }
    return null;
  }

  updateWorkingDirectoryToCommit(hash) {
    if (!hash) {
      this.workingDirectory = new Map();
      this.stagingArea = new Map();
      return;
    }
    const tree = this.getCommitTree(hash);
    this.workingDirectory = new Map(tree);
    this.stagingArea = new Map(tree);
  }

  hasUncommittedChanges(lastTree) {
    if (this.workingDirectory.size !== lastTree.size) return true;
    for (const [file, content] of this.workingDirectory) {
      if (!lastTree.has(file) || lastTree.get(file) !== content) return true;
    }
    return false;
  }

  addReflog(action, message, hash = null) {
    this.reflog.push({
      hash: hash || this.getCurrentCommitHash() || '0000000',
      action,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  getHelp() {
    return `Available commands:

  Git Commands:
    git init              Initialize a new repository
    git add <file>        Stage files (use . for all)
    git commit -m "msg"   Commit staged changes
    git status            Show working tree status
    git log               Show commit history
    git branch [name]     List or create branches
    git checkout <branch> Switch branches
    git switch <branch>   Switch branches (modern)
    git merge <branch>    Merge a branch
    git rebase <branch>   Rebase onto a branch
    git cherry-pick <hash> Apply a specific commit
    git stash             Save uncommitted changes
    git reset [--soft|--hard] Reset to a commit
    git revert <hash>     Create a revert commit
    git reflog            Show reference log
    git remote            Manage remotes
    git push              Push to remote
    git pull              Pull from remote

  Shell Commands:
    ls                    List files
    cat <file>            Show file contents
    echo "text" > file    Write to file
    touch <file>          Create empty file
    clear                 Clear terminal
    help                  Show this help`;
  }

  getGitHelp() {
    return `usage: git <command> [<args>]

These are common Git commands used in various situations:

   init       Create an empty Git repository
   add        Add file contents to the index
   commit     Record changes to the repository
   status     Show the working tree status
   log        Show commit logs
   branch     List, create, or delete branches
   checkout   Switch branches or restore files
   merge      Join two development histories
   rebase     Reapply commits on top of another base

Type 'help' for the full list of available commands.`;
  }
}
