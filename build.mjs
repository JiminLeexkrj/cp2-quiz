// content/*.md → assets/data.js
// 문제·해설 마크다운을 파싱해 미리 HTML로 렌더링한다. 사이트는 이 data.js만 읽는다.
import fs from 'node:fs';
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('python', python);

const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const language = lang === 'python' ? 'python' : null;
      const html = language
        ? hljs.highlight(text, { language }).value
        : text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
      return `<pre class="code" data-lang="${lang || 'text'}"><code>${html}</code></pre>\n`;
    },
  },
});

// "1~8"처럼 범위를 뜻하는 물결표가 GFM 취소선으로 바뀌지 않도록 코드 밖의 ~를 이스케이프한다.
function escapeTildes(md) {
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (line.startsWith('```')) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line
        .split(/(`[^`]*`)/)
        .map((seg, i) => (i % 2 ? seg : seg.replace(/~/g, '\\~')))
        .join('');
    })
    .join('\n');
}

const read = (p) => escapeTildes(fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'));

// "## 섹션" / "### 001" 구조를 나눈다.
function parse(md) {
  const lines = md.split('\n');
  const intro = [];
  const sections = [];
  const items = new Map();
  let current = null;
  let section = null;
  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (\d{3})\s*$/);
    if (h2) {
      section = { title: h2[1].trim(), body: [] };
      sections.push(section);
      current = null;
    } else if (h3) {
      current = { id: Number(h3[1]), section: section?.title ?? '', body: [] };
      items.set(current.id, current);
    } else if (line.startsWith('# ')) {
      // 문서 제목은 사용하지 않는다.
    } else if (current) {
      current.body.push(line);
    } else if (section) {
      section.body.push(line);
    } else {
      intro.push(line);
    }
  }
  return { intro: intro.join('\n').trim(), sections, items };
}

const q = parse(read('content/questions.md'));
const a = parse(read('content/answers.md'));

const CATEGORIES = [
  { key: 'concept', label: '개념', range: [1, 30] },
  { key: 'trace', label: '코드 해석·수정', range: [31, 60] },
  { key: 'impl', label: '실전 구현', range: [61, 100] },
];
const categoryOf = (id) => CATEGORIES.find((c) => id >= c.range[0] && id <= c.range[1]).key;

const questions = [];
for (let id = 1; id <= 100; id++) {
  const qi = q.items.get(id);
  const ai = a.items.get(id);
  if (!qi || !ai) throw new Error(`문제 또는 해설 ${id} 누락`);

  let body = qi.body.join('\n');
  let stdin = '';
  let note = '';
  body = body.replace(/<!--\s*stdin:\s*([\s\S]*?)\s*-->/, (_, s) => {
    stdin = s.replace(/\\n/g, '\n');
    return '';
  });
  body = body.replace(/<!--\s*note:\s*([\s\S]*?)\s*-->/, (_, s) => {
    note = s;
    return '';
  });
  body = body.trim();
  const codeMatch = body.match(/```python\n([\s\S]*?)```/);

  questions.push({
    id,
    category: categoryOf(id),
    questionHtml: marked.parse(body),
    answerHtml: marked.parse(ai.body.join('\n').trim()),
    code: codeMatch ? codeMatch[1].replace(/\n$/, '') : '',
    stdin,
    note,
  });
}

const outro = a.sections.find((s) => s.title.startsWith('채점 후'));
const data = {
  introHtml: marked.parse(q.intro),
  outroHtml: outro ? marked.parse(outro.body.join('\n').trim()) : '',
  categories: CATEGORIES,
  questions,
};

fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/data.js', `// 자동 생성 파일: npm run build\nwindow.QUIZ_DATA = ${JSON.stringify(data)};\n`);
console.log(`assets/data.js: ${questions.length}문제, 수정 표시 ${questions.filter((x) => x.note).length}개`);
