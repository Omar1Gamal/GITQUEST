/**
 * Complete curriculum data for GitQuest.
 * 18 lessons across 3 modules (Beginner, Intermediate, Advanced).
 */

export const MODULES = {
  beginner: {
    id: 'beginner',
    title: 'The Fundamentals',
    subtitle: 'Start your Git journey',
    icon: '🌱',
    color: '#3fb950',
    description: 'Learn the core building blocks: initializing repos, staging, committing, and reading history.',
  },
  intermediate: {
    id: 'intermediate',
    title: 'Collaboration & Branching',
    subtitle: 'Work with others',
    icon: '🌿',
    color: '#58a6ff',
    description: 'Master branching, merging, conflict resolution, and working with remote repositories.',
  },
  advanced: {
    id: 'advanced',
    title: 'Rewriting History',
    subtitle: 'Precision Git mastery',
    icon: '🔥',
    color: '#f778ba',
    description: 'Learn powerful tools: rebasing, cherry-picking, stashing, and recovering lost work.',
  },
};

export const ACHIEVEMENTS = [
  { id: 'first-init', title: 'Repository Born', description: 'Initialize your first repository', icon: '🎉' },
  { id: 'first-commit', title: 'First Snapshot', description: 'Make your first commit', icon: '📸' },
  { id: 'five-commits', title: 'Consistent Contributor', description: 'Make 5 commits in a lesson', icon: '⭐' },
  { id: 'first-branch', title: 'Branching Out', description: 'Create your first branch', icon: '🌿' },
  { id: 'first-merge', title: 'Merge Master', description: 'Complete your first merge', icon: '🔀' },
  { id: 'conflict-resolver', title: 'Conflict Resolver', description: 'Resolve a merge conflict', icon: '⚔️' },
  { id: 'rebase-rebel', title: 'Rebase Rebel', description: 'Complete a rebase operation', icon: '♻️' },
  { id: 'cherry-picker', title: 'Cherry Picker', description: 'Cherry-pick a commit', icon: '🍒' },
  { id: 'stash-master', title: 'Stash Master', description: 'Use git stash successfully', icon: '📦' },
  { id: 'time-traveler', title: 'Time Traveler', description: 'Use git reflog to find history', icon: '⏳' },
  { id: 'beginner-complete', title: 'Foundation Builder', description: 'Complete all beginner lessons', icon: '🏗️' },
  { id: 'intermediate-complete', title: 'Team Player', description: 'Complete all intermediate lessons', icon: '🤝' },
  { id: 'advanced-complete', title: 'Git Grandmaster', description: 'Complete all advanced lessons', icon: '👑' },
];

export const lessons = [
  // ═══════════════════════════════════════════════════════
  // MODULE 1: BEGINNER — The Fundamentals
  // ═══════════════════════════════════════════════════════
  {
    id: 'beginner-1',
    title: 'Hello, Git',
    module: 'beginner',
    description: 'Every great project starts with a single command. Learn how to initialize a Git repository and understand what happens behind the scenes.',
    conceptExplanation: 'Git is a distributed version control system. When you run `git init`, it creates a hidden `.git` folder in your project directory. This folder is the "brain" of your repository, storing all the snapshots, history, and configuration. Without this folder, your project is just a regular set of files.',
    objectives: [
      'Initialize a new Git repository',
      'Create your first file',
      'Understand the .git directory',
    ],
    instructions: [
      {
        text: "Welcome to GitQuest! 🚀\n\nGit is the world's most popular version control system. Think of it as a time machine for your code — it lets you save snapshots of your work, go back in time, and collaborate with others.\n\nLet's start by creating a Git repository. Type the following command:",
        command: 'git init',
      },
      {
        text: "Excellent! You just created a Git repository. Git is now tracking this directory.\n\nNow let's create a file. We'll use the `echo` command to write some content to a file:",
        command: 'echo "Hello, World!" > hello.txt',
      },
      {
        text: "Great! You've created a file. But Git doesn't automatically track new files. Let's check the status of our repository:",
        command: 'git status',
      },
    ],
    initialState: null,
    validator: (state) => {
      return state.initialized && 
             state.workingDirectory['hello.txt'] !== undefined;
    },
    hints: [
      'Type `git init` to initialize a new repository.',
      'Use `echo "Hello, World!" > hello.txt` to create a file.',
      'Run `git status` to see untracked files.',
    ],
    xpReward: 100,
    achievement: 'first-init',
  },

  {
    id: 'beginner-2',
    title: 'Tracking Changes',
    module: 'beginner',
    description: 'Learn about the staging area — Git\'s "preparation zone" where you decide exactly what goes into your next snapshot.',
    conceptExplanation: 'Git has a unique concept called the **Staging Area** (or "index"). When you make changes to files, they don\'t automatically go into the next commit. You have to explicitly tell Git which files to include by "staging" them using `git add`. Think of the staging area like a loading dock before a truck leaves — you pack the boxes (stage files) before the truck departs (commit).',
    objectives: [
      'Understand the staging area concept',
      'Stage files with git add',
      'See the difference between staged and unstaged files',
    ],
    instructions: [
      {
        text: "In the previous lesson, we created a file, but Git isn't tracking it yet. The file is \"untracked\".\n\nBefore Git saves a snapshot (commit), you need to tell it which files to include. This is called **staging**.\n\nFirst, let's create a couple of files:",
        command: 'echo "# My Project" > README.md',
      },
      {
        text: "Now create another file:",
        command: 'echo "console.log(\'Hello\')" > app.js',
      },
      {
        text: "Let's stage the README file using `git add`:",
        command: 'git add README.md',
      },
      {
        text: "Now check the status. Notice how README.md is green (staged) while app.js is still red (untracked):",
        command: 'git status',
      },
      {
        text: "To stage all files at once, you can use `git add .` (the dot means \"everything in current directory\"):",
        command: 'git add .',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.stagingArea['README.md'] !== undefined &&
             state.stagingArea['app.js'] !== undefined;
    },
    hints: [
      'Create files with echo "content" > filename',
      'Use `git add <filename>` to stage a specific file.',
      'Use `git add .` to stage everything at once.',
    ],
    xpReward: 100,
  },

  {
    id: 'beginner-3',
    title: 'Saving Snapshots',
    module: 'beginner',
    description: 'A commit is like taking a photograph of your code at a moment in time. Learn to create meaningful commits with clear messages.',
    conceptExplanation: 'A **commit** in Git is a permanent snapshot of your staged files at a specific point in time. It records the state of your project, the author, the time, and a descriptive message. Commits form a timeline of your project\'s history, allowing you to track changes, see who made them, and revert to older versions if needed. Writing clear, concise commit messages is crucial for collaboration.',
    objectives: [
      'Create your first commit',
      'Write a descriptive commit message',
      'Understand what a commit contains',
    ],
    instructions: [
      {
        text: "Your staged files are ready to be committed! A commit is a **permanent snapshot** of your staged changes.\n\nEvery commit needs a message explaining what you changed and why. Good commit messages are invaluable when looking back through history.\n\nLet's create a file and stage it:",
        command: 'echo "# GitQuest Project" > README.md',
      },
      {
        text: "Stage the file:",
        command: 'git add README.md',
      },
      {
        text: "Now commit with a descriptive message using the `-m` flag:",
        command: 'git commit -m "Initial commit: add README"',
      },
      {
        text: "🎉 You just made your first commit! Notice the output shows a unique hash (like `a1b2c3d`) — this is your commit's ID.\n\nLet's make another change and commit:",
        command: 'echo "function main() { }" > app.js',
      },
      {
        text: "Stage and commit in separate steps:",
        command: 'git add app.js',
      },
      {
        text: "Commit with a message:",
        command: 'git commit -m "Add main application file"',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 2;
    },
    hints: [
      'Create a file, then `git add` it.',
      'Use `git commit -m "your message"` to commit.',
      'Make at least 2 commits to complete this lesson.',
    ],
    xpReward: 150,
    achievement: 'first-commit',
  },

  {
    id: 'beginner-4',
    title: 'Time Travel',
    module: 'beginner',
    description: 'Every commit tells a story. Learn to read the history of your project and understand commit hashes.',
    conceptExplanation: 'The `git log` command displays the commit history. Each commit has a unique **SHA-1 hash** (a long string of characters) that serves as its identifier. The log shows the hash, author, date, and message. This history is invaluable for understanding how a project evolved. The `--oneline` flag provides a condensed view, which is often easier to scan.',
    objectives: [
      'View commit history with git log',
      'Understand commit hashes',
      'Use the one-line log format',
    ],
    instructions: [
      {
        text: "Your repository now has commits. Let's travel back in time and explore the history!\n\nFirst, let's create some commits to have a richer history. Create a file:",
        command: 'echo "# My App" > README.md',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Add more files:",
        command: 'echo "body { margin: 0; }" > style.css',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add stylesheet"',
      },
      {
        text: "Now view the full commit log:",
        command: 'git log',
      },
      {
        text: "That's a lot of detail! For a compact view, try the one-line format:",
        command: 'git log --oneline',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 2;
    },
    hints: [
      'Make at least 2 commits first.',
      'Use `git log` to see full history.',
      'Use `git log --oneline` for a compact view.',
    ],
    xpReward: 100,
  },

  {
    id: 'beginner-5',
    title: 'Checking Status',
    module: 'beginner',
    description: 'Master the art of understanding your repository state. Know exactly what\'s modified, staged, and ready to commit.',
    conceptExplanation: '`git status` is arguably the most frequently used Git command. It provides a real-time overview of your working directory and staging area. It tells you which files are tracked, untracked, modified, or staged. A "clean working tree" means all your changes have been committed and there are no outstanding modifications.',
    objectives: [
      'Use git status effectively',
      'Understand modified vs staged vs committed',
      'Create a clean working tree',
    ],
    instructions: [
      {
        text: "Understanding `git status` is essential. It tells you exactly what state your files are in.\n\nLet's create a commit first, then modify things:",
        command: 'echo "Version 1" > config.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add . && git commit -m "Add config file"',
      },
      {
        text: "Hmm, this terminal doesn't support `&&`. Let's do it step by step.\nStage:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add config file"',
      },
      {
        text: "Now check the status — it should say 'working tree clean':",
        command: 'git status',
      },
      {
        text: "Now let's modify the file and create a new one:",
        command: 'echo "Version 2" > config.txt',
      },
      {
        text: "Create an untracked file:",
        command: 'echo "notes" > notes.txt',
      },
      {
        text: "Check status again — you'll see modified and untracked files:",
        command: 'git status',
      },
      {
        text: "Stage everything and commit to achieve a clean tree:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Update config and add notes"',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 2 && 
             Object.keys(state.workingDirectory).length >= 2;
    },
    hints: [
      'Create files, commit them, then modify and commit again.',
      'Use `git status` to see your repo state.',
      'Make at least 2 commits with 2+ files.',
    ],
    xpReward: 100,
  },
  {
      id: 'beginner-6',
      title: 'Ignoring Files',
      module: 'beginner',
      description: 'Learn how to keep unwanted files out of your Git repository using .gitignore.',
      conceptExplanation: 'Sometimes you have files in your project directory that you *don\'t* want Git to track (like log files, build artifacts, or secret API keys). You can tell Git to ignore these files by creating a `.gitignore` file and listing the patterns of files to exclude.',
      objectives: [
        'Create a .gitignore file',
        'Ignore specific files and patterns',
        'Verify files are ignored',
      ],
      instructions: [
        {
            text: "Let's say we have a secret file we don't want to commit:",
            command: 'echo "secret_key=123" > secrets.env',
        },
        {
            text: "If we run `git status`, it will show as untracked. We want Git to completely ignore it. We do this by creating a `.gitignore` file:",
            command: 'echo "secrets.env" > .gitignore',
        },
        {
             text: "Now run `git status` again. Notice that `secrets.env` is gone! Only `.gitignore` is listed.",
             command: 'git status',
        },
        {
            text: "Let's stage and commit our `.gitignore` file so everyone on the team uses the same rules:",
            command: 'git add .gitignore',
        },
        {
            text: "Commit it:",
            command: 'git commit -m "Add .gitignore"',
        }
      ],
      initialState: {
        initialized: true,
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: { main: null },
        head: 'main',
        detachedHead: false,
        reflog: [],
        stashStack: [],
        remote: null,
        remoteUrl: '',
        cwd: '~/project',
      },
      validator: (state) => {
          return state.commits.length >= 1 && state.workingDirectory['.gitignore'] !== undefined;
      },
      hints: [
          'Create `secrets.env` and then `.gitignore` containing "secrets.env".',
          'Add and commit `.gitignore`.',
      ],
      xpReward: 100,
  },

  // ═══════════════════════════════════════════════════════
  // MODULE 2: INTERMEDIATE — Collaboration & Branching
  // ═══════════════════════════════════════════════════════
  {
    id: 'intermediate-1',
    title: 'Branching Out',
    module: 'intermediate',
    description: 'Branches are parallel universes for your code. Learn to create and switch between them without affecting your main work.',
    conceptExplanation: 'A **branch** in Git is simply a lightweight movable pointer to a commit. The default branch is usually called `main` (or `master`). When you create a branch, you diverge from the main line of development and can work independently without affecting others. It allows multiple people to work on different features simultaneously in the same repository.',
    objectives: [
      'Create a new branch',
      'Switch between branches',
      'Understand HEAD and branch pointers',
    ],
    instructions: [
      {
        text: "Branches let you work on new features without affecting the main codebase. Think of them as parallel timelines.\n\nLet's set up a base commit first:",
        command: 'echo "# Main App" > README.md',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Now create a new branch called `feature/login`:",
        command: 'git branch feature/login',
      },
      {
        text: "List all branches — the `*` shows your current branch:",
        command: 'git branch',
      },
      {
        text: "Switch to the new branch:",
        command: 'git checkout feature/login',
      },
      {
        text: "🌿 You're now on `feature/login`. Watch the graph on the right — you'll see the branch pointer.\n\nMake a commit on this branch:",
        command: 'echo "function login() { }" > login.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit on the feature branch:",
        command: 'git commit -m "Add login function"',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.branches['feature/login'] !== undefined &&
             state.commits.length >= 2;
    },
    hints: [
      'Use `git branch feature/login` to create a branch.',
      'Use `git checkout feature/login` to switch to it.',
      'Make a commit on the feature branch.',
    ],
    xpReward: 150,
    achievement: 'first-branch',
  },

  {
    id: 'intermediate-2',
    title: 'Parallel Universes',
    module: 'intermediate',
    description: 'Work on multiple branches simultaneously. See how changes on one branch don\'t affect another.',
    conceptExplanation: 'When you switch branches using `git checkout`, Git automatically updates the files in your working directory to match the state of that branch. This is the core magic of branching: you can have entirely different sets of files or code states in the same folder, just by switching branches.',
    objectives: [
      'Make commits on different branches',
      'Switch between branches and see different files',
      'Understand branch isolation',
    ],
    instructions: [
      {
        text: "Let's see how branches keep work isolated. Start with a commit on main:",
        command: 'echo "# App" > README.md',
      },
      {
        text: "Stage and commit on main:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Create and switch to a feature branch using the `-b` shorthand:",
        command: 'git checkout -b feature/dark-mode',
      },
      {
        text: "Make a change on the feature branch:",
        command: 'echo "body { background: #000; }" > dark-mode.css',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add dark mode styles"',
      },
      {
        text: "Now switch back to main and notice dark-mode.css is GONE! It only exists on the feature branch:",
        command: 'git checkout main',
      },
      {
        text: "Check the files:",
        command: 'ls',
      },
      {
        text: "Make a different commit on main:",
        command: 'echo "console.log(\"app\")" > index.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add entry point"',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.branches['feature/dark-mode'] !== undefined &&
             state.commits.length >= 3 &&
             state.head === 'main';
    },
    hints: [
      'Use `git checkout -b feature/dark-mode` to create and switch.',
      'Make a commit on the feature branch.',
      'Switch back to main with `git checkout main`.',
      'Make a commit on main too.',
    ],
    xpReward: 150,
  },

  {
    id: 'intermediate-3',
    title: 'The Merge',
    module: 'intermediate',
    description: 'Bring your work together! Learn to merge branches and understand fast-forward vs three-way merges.',
    conceptExplanation: 'Merging is how you bring the changes from one branch into another (e.g., merging a feature branch into `main`). If `main` hasn\'t changed since you created the feature branch, Git performs a "fast-forward" merge (just moving the pointer). If `main` *has* changed, Git creates a new "merge commit" that ties the two histories together.',
    objectives: [
      'Merge a feature branch into main',
      'Understand fast-forward merges',
      'See the merge commit in the graph',
    ],
    instructions: [
      {
        text: "Merging combines the work from two branches. Let's create a scenario with divergent branches.\n\nStart with a commit on main:",
        command: 'echo "# Project" > README.md',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Create a feature branch and add work:",
        command: 'git checkout -b feature/navbar',
      },
      {
        text: "Add a file on the feature branch:",
        command: 'echo "<nav>Home | About</nav>" > navbar.html',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add navigation bar"',
      },
      {
        text: "Now switch back to main:",
        command: 'git checkout main',
      },
      {
        text: "Merge the feature branch! Watch the graph update:",
        command: 'git merge feature/navbar',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.branches['feature/navbar'] !== undefined &&
             state.head === 'main' &&
             state.workingDirectory['navbar.html'] !== undefined;
    },
    hints: [
      'Create a feature branch, add a commit, switch back to main.',
      'Use `git merge feature/navbar` to merge.',
      'Watch the graph for the merge visualization!',
    ],
    xpReward: 200,
    achievement: 'first-merge',
  },

  {
    id: 'intermediate-4',
    title: 'Conflict Resolution',
    module: 'intermediate',
    description: 'When two branches change the same file, Git needs your help. Learn to resolve merge conflicts like a pro.',
    conceptExplanation: 'A **merge conflict** occurs when Git cannot automatically resolve differences in code between two commits. This usually happens when the same line in a file has been modified differently in the branches being merged. Git pauses the merge and marks the conflicted files. You must manually edit the files to choose the correct changes, then stage and commit them to finish the merge.',
    objectives: [
      'Create a merge conflict scenario',
      'Understand conflict markers',
      'Resolve the conflict and complete the merge',
    ],
    instructions: [
      {
        text: "Merge conflicts happen when two branches modify the same file differently. Git can't automatically decide which version to keep, so it asks you!\n\nLet's create a conflict. Start with a shared file:",
        command: 'echo "Welcome to our app" > greeting.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add greeting"',
      },
      {
        text: "Create a feature branch:",
        command: 'git checkout -b feature/formal',
      },
      {
        text: "Modify the greeting on the feature branch:",
        command: 'echo "Good day, esteemed user" > greeting.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Make greeting formal"',
      },
      {
        text: "Switch back to main and make a different change to the same file:",
        command: 'git checkout main',
      },
      {
        text: "Change the greeting differently on main:",
        command: 'echo "Hey there, welcome!" > greeting.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Make greeting casual"',
      },
      {
        text: "Now try to merge — this will create a conflict!",
        command: 'git merge feature/formal',
      },
      {
        text: "⚠️ CONFLICT! Git shows you the conflict markers. To resolve it, choose the version you want by editing the file. Let's pick a resolution:",
        command: 'echo "Hey there, welcome to our premium app!" > greeting.txt',
      },
      {
        text: "Stage the resolved file:",
        command: 'git add greeting.txt',
      },
      {
        text: "Complete the merge with a commit:",
        command: 'git commit -m "Resolve greeting conflict"',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 4 &&
             state.head === 'main' &&
             state.workingDirectory['greeting.txt'] &&
             !state.workingDirectory['greeting.txt'].includes('<<<<<<<');
    },
    hints: [
      'Create the same file on both branches with different content.',
      'When merge conflicts, edit the file to resolve it.',
      'Stage and commit after resolving.',
    ],
    xpReward: 250,
    achievement: 'conflict-resolver',
  },

  {
    id: 'intermediate-5',
    title: 'The Remote',
    module: 'intermediate',
    description: 'Connect your local repository to the cloud. Learn to push, pull, and collaborate through remote repositories.',
    conceptExplanation: 'A **remote** is a version of your repository hosted on the internet or network (like GitHub, GitLab, or Bitbucket). Connecting to a remote allows you to back up your work, share it with others, and collaborate. `git remote add` links your local repo to the remote URL. `git push` uploads your local commits to the remote.',
    objectives: [
      'Add a remote repository',
      'Push commits to the remote',
      'Understand origin',
    ],
    instructions: [
      {
        text: "Remotes let you share your code with the world.\n\nFirst, let's create some commits:",
        command: 'echo "# My Open Source Project" > README.md',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Add a remote called 'origin' (the conventional name for your primary remote):",
        command: 'git remote add origin https://github.com/student/project.git',
      },
      {
        text: "Check the remote was added:",
        command: 'git remote -v',
      },
      {
        text: "Push your commits to the remote! The `-u` flag sets up tracking, so future pushes can just be `git push`:",
        command: 'git push -u origin main',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.remote !== null && state.commits.length >= 1;
    },
    hints: [
      'Create a commit first.',
      'Use `git remote add origin <url>` to add a remote.',
      'Use `git push -u origin main` to push.',
    ],
    xpReward: 150,
  },

  {
    id: 'intermediate-6',
    title: 'Staying in Sync',
    module: 'intermediate',
    description: 'Learn the difference between fetch and pull, and how to keep your local repository up to date with the remote.',
    conceptExplanation: 'When working with others, the remote repository will be updated with their commits. To get these changes locally, you use `git fetch` or `git pull`. `git fetch` downloads the changes but does NOT merge them into your working files (safe to inspect). `git pull` does a fetch AND automatically merges the changes into your current branch.',
    objectives: [
      'Understand git fetch vs git pull',
      'Pull changes from the remote',
    ],
    instructions: [
      {
        text: "When working with a team, others push changes to the remote. You need to stay in sync!\n\nLet's set up a repo with a remote:",
        command: 'echo "# Team Project" > README.md',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Set up the remote:",
        command: 'git remote add origin https://github.com/team/project.git',
      },
      {
        text: "Push to remote:",
        command: 'git push -u origin main',
      },
      {
        text: "`git fetch` downloads changes but doesn't apply them. `git pull` does both — it's essentially fetch + merge.\n\nLet's fetch (simulating new changes arriving):",
        command: 'git fetch',
      },
      {
        text: "Now pull to actually apply changes (if there were any):",
        command: 'git pull',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.remote !== null && state.commits.length >= 1;
    },
    hints: [
      'Set up a repo with commits and a remote.',
      'Use `git fetch` then `git pull`.',
    ],
    xpReward: 150,
  },
  {
      id: 'intermediate-7',
      title: 'Deleting Branches',
      module: 'intermediate',
      description: 'Clean up your repository by deleting branches you no longer need after merging.',
      conceptExplanation: 'Once a feature branch has been successfully merged into `main`, it\'s good practice to delete it to keep your repository tidy. This doesn\'t delete the commits (they are now part of `main`), it just removes the branch pointer. Use `git branch -d` for a safe delete (Git warns you if it\'s unmerged) or `-D` to force delete.',
      objectives: [
          'Merge a branch',
          'Safely delete the merged branch'
      ],
      instructions: [
          {
              text: "Start by creating a feature branch and adding a commit.",
              command: 'git checkout -b feature/cleanup',
          },
          {
              text: "Add a file:",
              command: 'echo "cleanup" > cleanup.txt',
          },
          {
              text: "Stage and commit:",
              command: 'git add .',
          },
          {
              text: "Commit:",
              command: 'git commit -m "Add cleanup file"',
          },
          {
              text: "Switch to main and merge the branch.",
              command: 'git checkout main',
          },
          {
              text: "Merge:",
              command: 'git merge feature/cleanup',
          },
          {
              text: "Now that it's merged, we don't need the branch pointer anymore. Let's delete it safely (-d):",
              command: 'git branch -d feature/cleanup',
          }
      ],
      initialState: {
          initialized: true,
          workingDirectory: {},
          stagingArea: {},
          commits: [],
          branches: { main: null },
          head: 'main',
          detachedHead: false,
          reflog: [],
          stashStack: [],
          remote: null,
          remoteUrl: '',
          cwd: '~/project',
      },
      validator: (state) => {
          return state.commits.length >= 1 && state.branches['feature/cleanup'] === undefined;
      },
      hints: [
          'Create a branch, commit, checkout main, merge, then `git branch -d <branch_name>`.',
      ],
      xpReward: 100,
  },

  // ═══════════════════════════════════════════════════════
  // MODULE 3: ADVANCED — Rewriting History & Precision
  // ═══════════════════════════════════════════════════════
  {
    id: 'advanced-1',
    title: 'The Rebase',
    module: 'advanced',
    description: 'Rebase creates a clean, linear history by replaying your commits on top of another branch. Compare this to merging and understand when to use each.',
    conceptExplanation: '**Rebasing** is an alternative to merging. While merging creates a new commit that ties two histories together, rebasing rewrites the history by moving the base of your branch to the tip of another branch. It takes your commits and "replays" them one by one. This results in a much cleaner, perfectly linear history, but it rewrites commit hashes (which is why you shouldn\'t rebase branches you\'ve already shared with others).',
    objectives: [
      'Understand rebase vs merge',
      'Rebase a feature branch onto main',
      'See the linear history in the graph',
    ],
    instructions: [
      {
        text: "Rebase is one of Git's most powerful tools. While merge creates a 'merge commit', rebase moves your commits to sit on top of another branch — creating a clean, linear history.\n\nLet's see this in action. Create a base commit:",
        command: 'echo "# App v1" > README.md',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Create a feature branch:",
        command: 'git checkout -b feature/api',
      },
      {
        text: "Add work on the feature branch:",
        command: 'echo "const api = fetch(\"/data\")" > api.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add API module"',
      },
      {
        text: "Switch to main and make another commit (simulating teammate work):",
        command: 'git checkout main',
      },
      {
        text: "Add work on main:",
        command: 'echo "const utils = {}" > utils.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add utility functions"',
      },
      {
        text: "Now switch to the feature branch and rebase onto main. Watch the graph change!",
        command: 'git checkout feature/api',
      },
      {
        text: "Rebase onto main:",
        command: 'git rebase main',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 3 &&
             state.branches['feature/api'] !== undefined;
    },
    hints: [
      'Create divergent branches like in the merge lesson.',
      'Use `git rebase main` while on the feature branch.',
      'Watch the linear history appear in the graph!',
    ],
    xpReward: 250,
    achievement: 'rebase-rebel',
  },

  {
    id: 'advanced-2',
    title: 'Cherry Picking',
    module: 'advanced',
    description: 'Sometimes you need just one specific commit from another branch. Cherry-pick lets you grab exactly what you need.',
    conceptExplanation: '**Cherry-picking** allows you to select a specific commit from one branch and apply it to another. This is incredibly useful if a bug fix was made on an experimental branch, and you only want to bring that fix into `main` without merging the entire experimental branch.',
    objectives: [
      'Identify a commit hash from another branch',
      'Cherry-pick it onto your current branch',
      'Understand when cherry-picking is useful',
    ],
    instructions: [
      {
        text: "Cherry-pick lets you apply a specific commit from any branch onto your current branch. It's like reaching into another timeline and grabbing exactly what you need.\n\nLet's set up the scenario:",
        command: 'echo "# Main App" > README.md',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Create a feature branch with multiple commits:",
        command: 'git checkout -b feature/experiments',
      },
      {
        text: "Experiment 1:",
        command: 'echo "const logger = console.log" > logger.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit experiment 1:",
        command: 'git commit -m "Add logger utility"',
      },
      {
        text: "Experiment 2:",
        command: 'echo "const cache = new Map()" > cache.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit experiment 2:",
        command: 'git commit -m "Add cache module"',
      },
      {
        text: "Now let's find the hash of the logger commit (we want only this one):",
        command: 'git log --oneline',
      },
      {
        text: "Switch to main — we want the logger but NOT the cache:",
        command: 'git checkout main',
      },
      {
        text: "Cherry-pick the logger commit! Use the hash shown in your log (use the hash of the 'Add logger utility' commit).\n\nFor this lesson, you can type the hash from the log output, or type the first few characters:",
        command: null,
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 4 &&
             state.head === 'main' &&
             state.workingDirectory['logger.js'] !== undefined;
    },
    hints: [
      'Create commits on a feature branch.',
      'Use `git log --oneline` to find the commit hash.',
      'Use `git cherry-pick <hash>` on main.',
    ],
    xpReward: 200,
    achievement: 'cherry-picker',
  },

  {
    id: 'advanced-3',
    title: 'The Stash',
    module: 'advanced',
    description: 'Need to quickly switch contexts? Stash saves your uncommitted work safely and lets you apply it later.',
    conceptExplanation: '**git stash** takes your modified tracked files and staged changes, saves them on a stack of unfinished changes, and leaves you with a clean working directory. This allows you to quickly switch branches to work on something else without having to commit half-done work. You can later restore the stashed work using `git stash pop`.',
    objectives: [
      'Stash uncommitted changes',
      'Switch branches safely',
      'Pop stashed changes back',
    ],
    instructions: [
      {
        text: "Stash is your safety deposit box. When you're in the middle of work and need to switch branches urgently, stash saves your changes without committing.\n\nLet's start:",
        command: 'echo "# Project" > README.md',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Initial commit"',
      },
      {
        text: "Start working on a new feature:",
        command: 'echo "work in progress..." > feature.js',
      },
      {
        text: "Oh no! A critical bug needs fixing on main. But your work isn't ready to commit. Stash it!",
        command: 'git stash',
      },
      {
        text: "Check — your working directory is clean now:",
        command: 'ls',
      },
      {
        text: "List your stashes:",
        command: 'git stash list',
      },
      {
        text: "Now you could fix the bug and come back. Let's restore your stashed work:",
        command: 'git stash pop',
      },
      {
        text: "Your work is back! Check:",
        command: 'ls',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 1 &&
             state.workingDirectory['feature.js'] !== undefined;
    },
    hints: [
      'Create a commit, then create a new file without committing.',
      'Use `git stash` to save work.',
      'Use `git stash pop` to restore.',
    ],
    xpReward: 200,
    achievement: 'stash-master',
  },

  {
    id: 'advanced-4',
    title: 'Undo! Undo!',
    module: 'advanced',
    description: 'Learn the different ways to undo changes in Git: soft reset keeps your work, hard reset destroys it.',
    conceptExplanation: '`git reset` is a powerful tool for undoing commits. It moves the branch pointer backward. The `--soft` flag moves the pointer but keeps your files exactly as they were (staged), allowing you to rewrite the commit message or add more files. The `--hard` flag moves the pointer AND destroys any changes in your working directory, making it look exactly like the old commit. Use `--hard` with extreme caution.',
    objectives: [
      'Understand soft vs hard reset',
      'Reset to a previous commit',
      'See how --soft preserves staging',
    ],
    instructions: [
      {
        text: "`git reset` moves your branch pointer backwards. The key difference:\n\n• `--soft`: Keeps changes in staging area (ready to re-commit)\n• `--hard`: Destroys all changes completely\n\nLet's see both in action:",
        command: 'echo "version 1" > app.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Version 1"',
      },
      {
        text: "Add version 2:",
        command: 'echo "version 2" > app.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Version 2"',
      },
      {
        text: "Add version 3:",
        command: 'echo "version 3" > app.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Version 3"',
      },
      {
        text: "Now let's soft reset to undo the last commit. The changes stay staged:",
        command: 'git reset --soft HEAD~1',
      },
      {
        text: "Check status — your V3 changes are still staged!",
        command: 'git status',
      },
      {
        text: "Recommit with a better message:",
        command: 'git commit -m "Version 3 (improved)"',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 3;
    },
    hints: [
      'Create 3 commits.',
      'Use `git reset --soft HEAD~1` to undo the last one.',
      'Re-commit with a new message.',
    ],
    xpReward: 200,
  },

  {
    id: 'advanced-5',
    title: 'Clean Reverts',
    module: 'advanced',
    description: 'Unlike reset, revert creates a NEW commit that undoes an old one. This is the safe way to undo changes in shared branches.',
    conceptExplanation: 'While `reset` erases history, `git revert` is a "safe" undo. It figures out how to invert the changes introduced by a specific commit and creates a brand new commit with those inverse changes. Because it doesn\'t rewrite history, it is the safest way to undo a bug that has already been pushed and shared with other developers.',
    objectives: [
      'Understand revert vs reset',
      'Revert a specific commit',
      'See the revert commit in history',
    ],
    instructions: [
      {
        text: "`git revert` is the safe undo. Instead of erasing history (like reset), it creates a new commit that undoes a previous one. This is perfect for shared branches where you can't rewrite history.\n\nLet's see it in action:",
        command: 'echo "feature A" > a.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add feature A"',
      },
      {
        text: "Add feature B (this one has a bug!):",
        command: 'echo "buggy feature B" > b.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add feature B (buggy)"',
      },
      {
        text: "Add feature C:",
        command: 'echo "feature C" > c.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add feature C"',
      },
      {
        text: "Now we want to undo Feature B without losing Feature C. Check the log to find B's hash:",
        command: 'git log --oneline',
      },
      {
        text: "Revert the buggy commit (use the hash of 'Add feature B').\nCopy the hash from the log and use:\n`git revert <hash>`",
        command: null,
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 4 &&
             state.commits.some(c => c.message.startsWith('Revert'));
    },
    hints: [
      'Create 3 commits.',
      'Use `git log --oneline` to find the hash.',
      'Use `git revert <hash>` on the buggy commit.',
    ],
    xpReward: 200,
  },

  {
    id: 'advanced-6',
    title: 'The Safety Net',
    module: 'advanced',
    description: 'Even if you mess up badly, git reflog remembers everything. Learn to use this safety net to recover lost commits.',
    conceptExplanation: '`git reflog` (reference log) is Git\'s hidden diary. It records every single time the tip of your branch (HEAD) moves, even if a commit was seemingly "deleted" by a hard reset or a bad rebase. As long as the commit still exists in Git\'s database (which it usually does for 30-90 days), you can find its hash in the reflog and recover it using `checkout` or `reset`.',
    objectives: [
      'Understand what reflog tracks',
      'Find a "lost" commit after a hard reset',
      'Recover using the reflog hash',
    ],
    instructions: [
      {
        text: "`git reflog` is Git's secret diary. It records every time HEAD moves — even when you reset, checkout, or do anything that might \"lose\" commits. It's your ultimate safety net.\n\nLet's create some commits:",
        command: 'echo "important work" > important.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Very important work"',
      },
      {
        text: "Add more work:",
        command: 'echo "critical data" > critical.txt',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "Add critical data"',
      },
      {
        text: "Oh no! Someone does a hard reset, 'destroying' the last commit:",
        command: 'git reset --hard HEAD~1',
      },
      {
        text: "The critical commit seems gone! But the reflog remembers:",
        command: 'git reflog',
      },
      {
        text: "You can see every HEAD movement. The \"lost\" commit hash is right there. You could use `git checkout <hash>` or `git reset --hard <hash>` to recover it.\n\nLet's verify our files:",
        command: 'ls',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 1 &&
             state.reflog.length >= 3;
    },
    hints: [
      'Create 2 commits.',
      'Use `git reset --hard HEAD~1` to "lose" one.',
      'Use `git reflog` to see the history.',
    ],
    xpReward: 250,
    achievement: 'time-traveler',
  },

  {
    id: 'advanced-7',
    title: 'Interactive Rebase',
    module: 'advanced',
    description: 'The ultimate history editing tool. Squash, reword, reorder, or drop commits with interactive rebase.',
    conceptExplanation: 'Interactive rebase (`git rebase -i`) is the ultimate tool for cleaning up history before sharing it. It opens an editor allowing you to combine multiple small commits into one coherent commit (squash), change a typo in a commit message (reword), completely delete a commit (drop), or even change the order in which commits were applied. It ensures your project history is clean and understandable.',
    objectives: [
      'Understand interactive rebase commands',
      'Initiate an interactive rebase',
      'Learn squash, reword, and drop concepts',
    ],
    instructions: [
      {
        text: "Interactive rebase (`git rebase -i`) is the Swiss Army knife of Git. It lets you:\n\n• **squash**: Combine multiple commits into one\n• **reword**: Change a commit message\n• **drop**: Remove a commit entirely\n• **reorder**: Change the order of commits\n\nLet's create some messy commits:",
        command: 'echo "start" > app.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "wip"',
      },
      {
        text: "Add more:",
        command: 'echo "more work" > app.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "fixup"',
      },
      {
        text: "And another:",
        command: 'echo "final version" > app.js',
      },
      {
        text: "Stage and commit:",
        command: 'git add .',
      },
      {
        text: "Commit:",
        command: 'git commit -m "more wip"',
      },
      {
        text: "That's 3 messy commits! Let's clean them up with interactive rebase. This will show us the 3 most recent commits:",
        command: 'git rebase -i HEAD~3',
      },
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [],
      branches: { main: null },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.length >= 3;
    },
    hints: [
      'Create 3 commits with messy messages.',
      'Use `git rebase -i HEAD~3` to start interactive rebase.',
    ],
    xpReward: 300,
  },
  {
      id: 'advanced-8',
      title: 'Amending Commits',
      module: 'advanced',
      description: 'Forgot to add a file? Made a typo in the message? Learn how to fix the last commit quickly.',
      conceptExplanation: '`git commit --amend` is a shortcut for fixing the very last commit you made. If you forgot to stage a file, or if you made a typo in the commit message, you can simply stage the forgotten file, run `commit --amend`, and Git will seamlessly combine the new changes into the previous commit. Like rebasing, it rewrites history, so only amend commits you haven\'t pushed yet.',
      objectives: [
          'Fix a mistake in the last commit',
          'Use the --amend flag',
      ],
      instructions: [
          {
              text: "You just finished a feature, but you forgot one tiny detail.",
              command: 'echo "main code" > main.js',
          },
          {
              text: "Stage and commit it:",
              command: 'git add main.js && git commit -m "Add main logic"',
          },
          {
              text: "Oh no! You forgot to add the config file. Let's create it:",
              command: 'echo "config" > config.json',
          },
          {
              text: "Instead of making a messy new commit just for the config, let's amend it to the previous one. First, stage the file:",
              command: 'git add config.json',
          },
          {
              text: "Now amend the commit! (This usually opens an editor to change the message, but we'll use --no-edit to keep the same message):",
              command: 'git commit --amend --no-edit',
          },
          {
              text: "Check your log — the config file is now part of the 'Add main logic' commit!",
              command: 'git log --oneline',
          }
      ],
      initialState: {
          initialized: true,
          workingDirectory: {},
          stagingArea: {},
          commits: [],
          branches: { main: null },
          head: 'main',
          detachedHead: false,
          reflog: [],
          stashStack: [],
          remote: null,
          remoteUrl: '',
          cwd: '~/project',
      },
      validator: (state) => {
          return state.commits.length === 1 && state.commits[0].files.includes('config.json');
      },
      hints: [
          'Create a commit, add a new file, stage it, then run `git commit --amend --no-edit`.',
      ],
      xpReward: 150,
  },
  {
    id: 'advanced-9',
    title: 'Team Workflow Simulation',
    module: 'advanced',
    isOptional: true,
    description: 'Experience a real-world team workflow: creating feature branches, committing, pushing, and merging via a simulated Pull Request.',
    conceptExplanation: 'In professional teams, you rarely push directly to `main` or `dev`. Instead, you create a **feature branch** with a clear naming convention (e.g., `feat/login`, `fix/header`). You make your commits on this branch, push it to a remote repository, and open a **Pull Request (PR)**. Your teammates review your code, and once approved, the branch is merged into the main development branch. This ensures code quality and prevents broken code from affecting everyone.',
    objectives: [
      'Fetch latest changes from dev',
      'Create a properly named feature branch',
      'Commit a new feature',
      'Push the branch to the remote',
      'Merge the branch into dev (simulating an approved PR)'
    ],
    instructions: [
      {
        text: "Welcome to the team! We use a `dev` branch as our main integration branch. First, let's make sure we have the latest code from the remote repository.",
        command: 'git fetch origin',
      },
      {
        text: "Switch to the `dev` branch to see what's there:",
        command: 'git checkout dev',
      },
      {
        text: "Your task is to add a new header component. Following our naming convention, create and switch to a new branch called `feat/header`:",
        command: 'git checkout -b feat/header',
      },
      {
        text: "Great! Now let's create the header file:",
        command: 'echo "<header>GitQuest</header>" > header.html',
      },
      {
        text: "Stage and commit your new feature with a descriptive message:",
        command: 'git add header.html && git commit -m "Add header component"',
      },
      {
        text: "Now it's time to share your work with the team. Push your feature branch to the remote repository:",
        command: 'git push -u origin feat/header',
      },
      {
        text: "🎉 Simulated Pull Request Created! 🎉\n\n*In a real environment, you would go to GitHub/GitLab and click 'Create Pull Request'. Your teammates would review your code here.*\n\nLet's imagine your teammate reviewed it and said: \"Looks great! Approved.\" 🚀\n\nNow, merge your approved feature into the `dev` branch:",
        command: 'git checkout dev',
      },
      {
        text: "Merge the feature branch:",
        command: 'git merge feat/header',
      },
      {
        text: "Finally, clean up by deleting your local feature branch (since it's now safely in `dev`):",
        command: 'git branch -d feat/header',
      }
    ],
    initialState: {
      initialized: true,
      workingDirectory: {},
      stagingArea: {},
      commits: [
        {id: '1a2b', message: 'Init dev', files: ['index.html'], author: 'Team', date: new Date().toISOString()}
      ],
      branches: { main: '1a2b', dev: '1a2b' },
      head: 'dev',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: {
        url: 'https://github.com/team/project.git',
        branches: { main: '1a2b', dev: '1a2b' }
      },
      remoteUrl: 'https://github.com/team/project.git',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.head === 'dev' &&
             state.branches['feat/header'] === undefined &&
             state.commits.some(c => c.message === 'Add header component') &&
             state.workingDirectory['header.html'] !== undefined;
    },
    hints: [
      'Use `git checkout -b feat/header`',
      'Use `echo "text" > file` then add and commit',
      'Use `git push -u origin feat/header`',
      'Switch to dev and merge feat/header, then delete the branch'
    ],
    xpReward: 300,
  },
  {
    id: 'beginner-assessment',
    title: 'Beginner Assessment',
    module: 'beginner',
    isAssessment: true,
    description: 'Final challenge for the Beginner module. Test your fundamental Git skills.',
    conceptExplanation: 'MISSION: Initialize a new repository, create a file named `app.js`, and commit it with the message `Initial commit`. You must do this without step-by-step instructions. Good luck!',
    objectives: [
      'Initialize a repository',
      'Create app.js',
      'Commit with message "Initial commit"'
    ],
    instructions: [],
    initialState: null,
    validator: (state) => {
      return state.initialized && 
             state.workingDirectory['app.js'] !== undefined &&
             state.commits.length >= 1 &&
             state.commits[0].message === 'Initial commit';
    },
    hints: ['Use `git init`', 'Use `echo "code" > app.js`', 'Use `git add .`', 'Use `git commit -m "Initial commit"`'],
    xpReward: 500,
    achievement: 'beginner-complete',
  },
  {
    id: 'intermediate-assessment',
    title: 'Intermediate Assessment',
    module: 'intermediate',
    isAssessment: true,
    description: 'Final challenge for the Intermediate module. Test your branching and merging skills.',
    conceptExplanation: 'MISSION: Create a new branch called `feature/test`. Add a file named `test.txt` and commit it. Then switch back to `main`, merge the feature branch into main, and finally delete the `feature/test` branch. You must do this without step-by-step instructions. Good luck!',
    objectives: [
      'Create and checkout branch feature/test',
      'Commit test.txt on feature/test',
      'Merge feature/test into main',
      'Delete feature/test branch'
    ],
    instructions: [],
    initialState: {
      initialized: true,
      workingDirectory: {'README.md': '# Project'},
      stagingArea: {},
      commits: [{id: 'abc1234', message: 'Init', files: ['README.md'], author: 'User', date: new Date().toISOString()}],
      branches: { main: 'abc1234' },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.head === 'main' &&
             state.workingDirectory['test.txt'] !== undefined &&
             state.branches['feature/test'] === undefined &&
             state.commits.length >= 2;
    },
    hints: ['git checkout -b feature/test', 'echo "test" > test.txt', 'git add .', 'git commit -m "Add test"', 'git checkout main', 'git merge feature/test', 'git branch -d feature/test'],
    xpReward: 500,
    achievement: 'intermediate-complete',
  },
  {
    id: 'advanced-assessment',
    title: 'Advanced Assessment',
    module: 'advanced',
    isAssessment: true,
    description: 'Final challenge for the Advanced module. Test your history manipulation skills.',
    conceptExplanation: 'MISSION: A repository is provided. You are working on `index.js`, but there is a buggy commit in the history. First, stash your uncommitted work on `index.js`. Next, use `git log` to find the commit message "Add feature B (buggy)" and revert it. Finally, pop your stash to get your work back. Good luck!',
    objectives: [
      'Stash changes in index.js',
      'Revert the buggy commit',
      'Pop your stash'
    ],
    instructions: [],
    initialState: {
      initialized: true,
      workingDirectory: {'app.js': 'buggy code', 'index.js': 'const work = "wip";'},
      stagingArea: {},
      commits: [
        {id: '1a2b3c4', message: 'Init', files: ['app.js'], author: 'User', date: new Date().toISOString()},
        {id: '2b3c4d5', message: 'Add feature B (buggy)', files: ['app.js'], author: 'User', date: new Date().toISOString()},
        {id: '3c4d5e6', message: 'Add style', files: ['style.css'], author: 'User', date: new Date().toISOString()}
      ],
      branches: { main: '3c4d5e6' },
      head: 'main',
      detachedHead: false,
      reflog: [],
      stashStack: [],
      remote: null,
      remoteUrl: '',
      cwd: '~/project',
    },
    validator: (state) => {
      return state.commits.some(c => c.message.startsWith('Revert')) &&
             state.workingDirectory['index.js'] === 'const work = "wip";' &&
             state.stashStack.length === 0;
    },
    hints: ['git stash', 'git log --oneline', 'git revert <hash_of_buggy_commit>', 'git stash pop'],
    xpReward: 1000,
    achievement: 'advanced-complete',
  }
];

export function getLessonsByModule(module) {
  return lessons.filter(l => l.module === module);
}

export function getLessonById(id) {
  return lessons.find(l => l.id === id);
}

export function getNextLesson(currentId) {
  const current = getLessonById(currentId);
  if (!current) return null;
  
  const moduleLessons = getLessonsByModule(current.module);
  const idx = moduleLessons.findIndex(l => l.id === currentId);
  
  if (idx !== -1 && idx < moduleLessons.length - 1) {
    // If the next lesson is the assessment, ensure standard lessons are done first
    // Actually, if they are here, they just finished the last standard lesson!
    return moduleLessons[idx + 1];
  }
  
  // If at the end of the module (or finished assessment), return null to go back to menu
  return null;
}
