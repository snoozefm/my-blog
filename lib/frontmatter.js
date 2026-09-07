function parseFrontmatter(raw) {
  const lines = raw.split(/\r?\n/);

  if (lines[0].trim() !== '---') {
    return { data: {}, content: raw };
  }

  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    return { data: {}, content: raw };
  }

  const data = {};
  for (const line of lines.slice(1, closingIndex)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  const content = lines.slice(closingIndex + 1).join('\n');
  return { data, content };
}

module.exports = { parseFrontmatter };
