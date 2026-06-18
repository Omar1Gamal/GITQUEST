/**
 * Terminal Component — xterm.js integration for the Git simulator.
 * Features: custom prompt, command history, branch-aware prompt.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import './Terminal.css';

const TERMINAL_THEME = {
  background: '#0a0e14',
  foreground: '#e6edf3',
  cursor: '#58a6ff',
  cursorAccent: '#0a0e14',
  selectionBackground: 'rgba(88, 166, 255, 0.3)',
  black: '#0d1117',
  red: '#f85149',
  green: '#3fb950',
  yellow: '#d29922',
  blue: '#58a6ff',
  magenta: '#f778ba',
  cyan: '#58a6ff',
  white: '#e6edf3',
  brightBlack: '#6e7681',
  brightRed: '#f85149',
  brightGreen: '#3fb950',
  brightYellow: '#d29922',
  brightBlue: '#58a6ff',
  brightMagenta: '#f778ba',
  brightCyan: '#79c0ff',
  brightWhite: '#ffffff',
};

export default function Terminal({ onCommand, currentBranch = 'main', suggestedCommand = null, onSuggestClick }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const inputBufferRef = useRef('');
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [isReady, setIsReady] = useState(false);

  const getPrompt = useCallback(() => {
    return `\x1b[38;2;88;166;255mstudent@gitquest\x1b[0m:\x1b[38;2;210;153;34m~/project\x1b[0m \x1b[38;2;247;120;186m(${currentBranch})\x1b[0m$ `;
  }, [currentBranch]);

  const writePrompt = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.write('\r\n' + getPrompt());
    }
  }, [getPrompt]);

  // Initialize xterm
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: TERMINAL_THEME,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'bar',
      cursorWidth: 2,
      scrollback: 1000,
      allowProposedApi: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    
    // Delay fit to ensure container is rendered
    setTimeout(() => {
      try { fitAddon.fit(); } catch { /* ignore initial fit error */ }
    }, 50);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.write('\x1b[38;2;88;166;255m');
    term.write('  ╔══════════════════════════════════════════╗\r\n');
    term.write('  ║        🚀 Welcome to GitQuest! 🚀       ║\r\n');
    term.write('  ║   Interactive Git Learning Platform      ║\r\n');
    term.write('  ╚══════════════════════════════════════════╝\r\n');
    term.write('\x1b[0m');
    term.write('\r\n  Type \x1b[33mhelp\x1b[0m for available commands.\r\n');
    term.write(getPrompt());

    setIsReady(true);

    // Handle resize
    const handleResize = () => {
      try { fitAddon.fit(); } catch { /* ignore */ }
    };
    window.addEventListener('resize', handleResize);

    // Also observe container resize
    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch { /* ignore */ }
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [getPrompt]);

  // Handle key input
  useEffect(() => {
    if (!xtermRef.current || !isReady) return;

    const term = xtermRef.current;

    const handleData = (data) => {
      const code = data.charCodeAt(0);

      // Enter key
      if (code === 13) {
        const input = inputBufferRef.current.trim();
        inputBufferRef.current = '';

        if (input) {
          historyRef.current.unshift(input);
          if (historyRef.current.length > 50) historyRef.current.pop();
          historyIndexRef.current = -1;

          term.write('\r\n');

          if (input === 'clear') {
            term.clear();
            term.write(getPrompt());
            return;
          }

          // Execute command
          if (onCommand) {
            const result = onCommand(input);
            if (result && result.output) {
              // Write output line by line
              const lines = result.output.split('\n');
              lines.forEach((line) => {
                term.write(line + '\r\n');
              });
            }
          }

          term.write(getPrompt());
        } else {
          writePrompt();
        }
        return;
      }

      // Backspace
      if (code === 127) {
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          term.write('\b \b');
        }
        return;
      }

      // Tab — auto-complete
      if (code === 9) {
        const buf = inputBufferRef.current;
        const completions = getCompletions(buf);
        if (completions.length === 1) {
          const remaining = completions[0].slice(buf.length);
          inputBufferRef.current += remaining;
          term.write(remaining);
        } else if (completions.length > 1) {
          term.write('\r\n' + completions.join('  ') + '\r\n');
          term.write(getPrompt() + inputBufferRef.current);
        }
        return;
      }

      // Arrow keys (escape sequences)
      if (data === '\x1b[A') {
        // Up arrow — history
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyIndexRef.current++;
          const entry = historyRef.current[historyIndexRef.current];
          // Clear current input
          const clearLen = inputBufferRef.current.length;
          term.write('\b \b'.repeat(clearLen));
          inputBufferRef.current = entry;
          term.write(entry);
        }
        return;
      }

      if (data === '\x1b[B') {
        // Down arrow — history
        const clearLen = inputBufferRef.current.length;
        term.write('\b \b'.repeat(clearLen));
        
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
          const entry = historyRef.current[historyIndexRef.current];
          inputBufferRef.current = entry;
          term.write(entry);
        } else {
          historyIndexRef.current = -1;
          inputBufferRef.current = '';
        }
        return;
      }

      // Ctrl+C
      if (code === 3) {
        inputBufferRef.current = '';
        term.write('^C');
        writePrompt();
        return;
      }

      // Ctrl+L (clear)
      if (code === 12) {
        term.clear();
        term.write(getPrompt() + inputBufferRef.current);
        return;
      }

      // Ignore other escape sequences
      if (data.startsWith('\x1b')) return;

      // Regular character
      if (code >= 32) {
        inputBufferRef.current += data;
        term.write(data);
      }
    };

    const disposable = term.onData(handleData);
    return () => disposable.dispose();
  }, [isReady, onCommand, getPrompt, writePrompt, currentBranch]);

  // Update prompt when branch changes
  const prevBranchRef = useRef(currentBranch);
  useEffect(() => {
    if (prevBranchRef.current !== currentBranch && xtermRef.current && isReady) {
      prevBranchRef.current = currentBranch;
    }
  }, [currentBranch, isReady]);

  // Handle suggested command click
  const handleSuggestClick = useCallback(() => {
    if (suggestedCommand && xtermRef.current) {
      // Clear current input
      const clearLen = inputBufferRef.current.length;
      xtermRef.current.write('\b \b'.repeat(clearLen));
      
      // Type the suggestion
      inputBufferRef.current = suggestedCommand;
      xtermRef.current.write(suggestedCommand);
      
      if (onSuggestClick) onSuggestClick();
    }
  }, [suggestedCommand, onSuggestClick]);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
        </div>
        <span className="terminal-title">GitQuest Terminal — {currentBranch}</span>
      </div>
      <div className="terminal-body" ref={terminalRef} />
      {suggestedCommand && (
        <div className="terminal-suggestion" onClick={handleSuggestClick}>
          <span className="terminal-suggestion-label">💡 Hint:</span>
          <span className="terminal-suggestion-cmd">{suggestedCommand}</span>
        </div>
      )}
    </div>
  );
}

// Tab-completion helper
function getCompletions(input) {
  const commands = [
    'git init', 'git add', 'git commit', 'git status', 'git log',
    'git branch', 'git checkout', 'git switch', 'git merge',
    'git rebase', 'git cherry-pick', 'git stash', 'git reset',
    'git revert', 'git reflog', 'git remote', 'git push', 'git pull',
    'git fetch', 'git clone', 'git diff',
    'ls', 'cat', 'echo', 'touch', 'mkdir', 'clear', 'help', 'pwd',
  ];

  if (!input) return commands;
  return commands.filter(c => c.startsWith(input));
}
