/**
 * Parses raw terminal input into structured command objects.
 * Handles flags, quoted strings, file arguments, and pipes.
 */

export function parseCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return null;

  const baseCommand = tokens[0];

  // Handle non-git commands
  if (['ls', 'cat', 'echo', 'touch', 'mkdir', 'cd', 'pwd', 'clear', 'help'].includes(baseCommand)) {
    return {
      type: 'shell',
      command: baseCommand,
      args: tokens.slice(1),
      raw: trimmed,
    };
  }

  // Handle git commands
  if (baseCommand === 'git') {
    if (tokens.length < 2) {
      return {
        type: 'git',
        command: 'git',
        subcommand: null,
        args: [],
        flags: {},
        raw: trimmed,
      };
    }

    const subcommand = tokens[1];
    const rest = tokens.slice(2);
    const { args, flags } = parseFlags(rest);

    return {
      type: 'git',
      command: 'git',
      subcommand,
      args,
      flags,
      raw: trimmed,
    };
  }

  return {
    type: 'unknown',
    command: baseCommand,
    args: tokens.slice(1),
    raw: trimmed,
  };
}

function tokenize(input) {
  const tokens = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

function parseFlags(tokens) {
  const args = [];
  const flags = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith('--')) {
      const flagName = token.substring(2);
      // Check if next token is a value (not a flag)
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        flags[flagName] = tokens[i + 1];
        i++;
      } else {
        flags[flagName] = true;
      }
    } else if (token.startsWith('-') && token.length > 1) {
      // Short flags like -m, -b, -i, -d
      const flagChars = token.substring(1);
      
      if (flagChars.length === 1) {
        // Single short flag — might have a value
        if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
          flags[flagChars] = tokens[i + 1];
          i++;
        } else {
          flags[flagChars] = true;
        }
      } else {
        // Multiple short flags combined, e.g., -am
        for (const char of flagChars) {
          flags[char] = true;
        }
      }
    } else {
      args.push(token);
    }
  }

  return { args, flags };
}

// Handle echo with redirect: echo "content" > filename
export function parseEchoRedirect(raw) {
  const match = raw.match(/^echo\s+(.+?)\s*>\s*(.+)$/);
  if (match) {
    let content = match[1].trim();
    const filename = match[2].trim();
    // Remove surrounding quotes
    if ((content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))) {
      content = content.slice(1, -1);
    }
    return { content, filename };
  }
  
  // Handle append >>
  const appendMatch = raw.match(/^echo\s+(.+?)\s*>>\s*(.+)$/);
  if (appendMatch) {
    let content = appendMatch[1].trim();
    const filename = appendMatch[2].trim();
    if ((content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))) {
      content = content.slice(1, -1);
    }
    return { content, filename, append: true };
  }

  return null;
}
