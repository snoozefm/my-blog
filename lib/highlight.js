const { escapeHtml } = require('./html-utils');

// Each rule list is checked in order; earlier rules win when patterns overlap.
// Comments/strings are listed before keywords/numbers so keyword-looking text
// inside them isn't re-matched as a keyword.
const LANGS = {
  javascript: [
    { type: 'comment', pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
    { type: 'string', pattern: /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    {
      type: 'keyword',
      pattern:
        /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|typeof|instanceof|in|of|try|catch|finally|throw|async|await|import|export|default|from|null|undefined|true|false|void|yield|static|get|set)\b/,
    },
    { type: 'function', pattern: /\b[A-Za-z_$][\w$]*(?=\s*\()/ },
    { type: 'number', pattern: /\b\d+(\.\d+)?\b/ },
  ],
  python: [
    { type: 'comment', pattern: /#[^\n]*/ },
    { type: 'string', pattern: /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    {
      type: 'keyword',
      pattern:
        /\b(def|return|if|elif|else|for|while|break|continue|class|import|from|as|try|except|finally|raise|with|pass|lambda|None|True|False|and|or|not|in|is|yield|global|nonlocal|async|await)\b/,
    },
    { type: 'function', pattern: /\b[A-Za-z_]\w*(?=\s*\()/ },
    { type: 'number', pattern: /\b\d+(\.\d+)?\b/ },
  ],
  html: [
    { type: 'comment', pattern: /<!--[\s\S]*?-->/ },
    { type: 'string', pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    { type: 'keyword', pattern: /<\/?[A-Za-z][\w-]*/ },
    { type: 'function', pattern: /[A-Za-z-]+(?==)/ },
  ],
  css: [
    { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },
    { type: 'string', pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    { type: 'function', pattern: /[.#]?[A-Za-z-]+(?=\s*\{)|[a-z-]+(?=\s*:)/ },
    { type: 'number', pattern: /\b\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms)?\b/ },
  ],
  bash: [
    { type: 'comment', pattern: /#[^\n]*/ },
    { type: 'string', pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    {
      type: 'keyword',
      pattern: /\b(if|then|else|fi|for|do|done|while|case|esac|function|return|export|local|echo|cd|exit)\b/,
    },
    { type: 'function', pattern: /(?<=^|\s)--?[A-Za-z-]+/ },
  ],
  json: [
    { type: 'string', pattern: /"(?:\\.|[^"\\])*"(?=\s*:)/ },
    { type: 'string', pattern: /"(?:\\.|[^"\\])*"/ },
    { type: 'keyword', pattern: /\b(true|false|null)\b/ },
    { type: 'number', pattern: /-?\b\d+(\.\d+)?\b/ },
  ],
};

function buildRegex(rules) {
  const parts = rules.map((rule, i) => `(?<g${i}>${rule.pattern.source})`);
  return new RegExp(parts.join('|'), 'g');
}

function highlightCode(code, lang) {
  const rules = LANGS[lang];
  if (!rules) return escapeHtml(code);

  const regex = buildRegex(rules);
  let output = '';
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      output += escapeHtml(code.slice(lastIndex, match.index));
    }
    const groupIndex = rules.findIndex((_, i) => match.groups[`g${i}`] !== undefined);
    const type = rules[groupIndex].type;
    output += `<span class="tok-${type}">${escapeHtml(match[0])}</span>`;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    output += escapeHtml(code.slice(lastIndex));
  }

  return output;
}

module.exports = { highlightCode };
