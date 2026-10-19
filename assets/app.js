(function () {
  'use strict';

  const DATA = window.QUIZ_DATA;
  const QUESTIONS = DATA.questions;
  const CATS = Object.fromEntries(DATA.categories.map((c) => [c.key, c]));
  const STORE_KEY = 'cp2quiz:v1';
  const GRADES = {
    good: { label: '맞았다', short: '맞음' },
    meh: { label: '헷갈렸다', short: '헷갈림' },
    bad: { label: '틀렸다', short: '틀림' },
  };

  // ---------- 저장소 (브라우저마다 따로 저장, 실패해도 동작) ----------
  function loadState() {
    const empty = { results: {}, stars: {}, notes: {}, code: {}, stdin: {}, last: null };
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? Object.assign(empty, JSON.parse(raw)) : empty;
    } catch (e) {
      return empty;
    }
  }
  const state = loadState();
  let saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    const write = () => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* 저장 불가 환경 */ }
    };
    if (now) write(); else saveTimer = setTimeout(write, 300);
  }

  const view = { cat: 'all', status: 'all', current: null, revealed: false };

  // ---------- 유틸 ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(3, '0');
  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return node;
  };

  function toast(message) {
    let box = $('#toast');
    if (!box) {
      box = el('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.append(box);
    }
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => box.classList.remove('show'), 1600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('복사했습니다');
    } catch (e) {
      toast('복사하지 못했습니다');
    }
  }

  // ---------- 필터 ----------
  function matches(q) {
    if (view.cat !== 'all' && q.category !== view.cat) return false;
    const r = state.results[q.id];
    if (view.status === 'todo') return !r;
    if (view.status === 'review') return r === 'meh' || r === 'bad';
    if (view.status === 'star') return !!state.stars[q.id];
    return true;
  }
  const filtered = () => QUESTIONS.filter(matches);

  // ---------- 사이드바 ----------
  function renderGrid() {
    const grid = $('#grid');
    grid.innerHTML = '';
    const list = filtered();
    if (!list.length) {
      grid.append(el('p', { class: 'grid-empty' }, view.status === 'review' ? '복습할 문제가 없습니다. 잘하고 있어요!' : '조건에 맞는 문제가 없습니다.'));
      return;
    }
    for (const cat of DATA.categories) {
      const items = list.filter((q) => q.category === cat.key);
      if (!items.length) continue;
      const group = el('div', { class: 'grid-group' },
        el('div', { class: 'grid-title' }, `${cat.label}`, el('span', {}, `${pad(cat.range[0])}–${pad(cat.range[1])}`)));
      const cells = el('div', { class: 'grid-cells' });
      for (const q of items) {
        const r = state.results[q.id];
        cells.append(el('a', {
          href: `#/q/${q.id}`,
          class: ['cell', r || '', state.stars[q.id] ? 'starred' : '', view.current === q.id ? 'current' : ''].join(' ').trim(),
          'aria-label': `${q.id}번${r ? ', ' + GRADES[r].short : ''}${state.stars[q.id] ? ', 북마크' : ''}`,
          'aria-current': view.current === q.id ? 'page' : null,
          onclick: closeNav,
        }, String(q.id)));
      }
      group.append(cells);
      grid.append(group);
    }
  }

  function counts(list = QUESTIONS) {
    const c = { good: 0, meh: 0, bad: 0, total: list.length };
    for (const q of list) {
      const r = state.results[q.id];
      if (r) c[r]++;
    }
    c.done = c.good + c.meh + c.bad;
    return c;
  }

  function renderProgress() {
    const c = counts();
    const segs = $$('#progressBar .seg');
    segs[0].style.width = `${c.good}%`;
    segs[1].style.width = `${c.meh}%`;
    segs[2].style.width = `${c.bad}%`;
    $('#progressText').textContent = `${c.done} / 100`;

    const stats = $('#stats');
    stats.innerHTML = '';
    for (const cat of DATA.categories) {
      const cc = counts(QUESTIONS.filter((q) => q.category === cat.key));
      stats.append(el('div', { class: 'stat-row' },
        el('span', { class: 'stat-name' }, cat.label),
        el('span', { class: 'stat-bar', 'aria-hidden': 'true' },
          el('i', { class: 'good', style: `width:${(cc.good / cc.total) * 100}%` }),
          el('i', { class: 'meh', style: `width:${(cc.meh / cc.total) * 100}%` }),
          el('i', { class: 'bad', style: `width:${(cc.bad / cc.total) * 100}%` })),
        el('span', { class: 'stat-num' }, `${cc.good}/${cc.total}`)));
    }
  }

  function syncChips() {
    $$('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === view.cat)));
    $$('[data-status]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.status === view.status)));
  }

  function refreshSidebar() {
    syncChips();
    renderGrid();
    renderProgress();
  }

  // ---------- 모바일 내비게이션 ----------
  function openNav() { document.body.classList.add('nav-open'); }
  function closeNav() { document.body.classList.remove('nav-open'); }

  // ---------- 홈 화면 ----------
  function renderHome() {
    view.current = null;
    view.revealed = false;
    const main = $('#main');
    main.innerHTML = '';
    const c = counts();
    const resumeId = state.last || (QUESTIONS.find((q) => !state.results[q.id]) || QUESTIONS[0]).id;

    const cards = DATA.categories.map((cat) => {
      const list = QUESTIONS.filter((q) => q.category === cat.key);
      const cc = counts(list);
      const first = list.find((q) => !state.results[q.id]) || list[0];
      return el('a', { class: 'cat-card', href: `#/q/${first.id}` },
        el('span', { class: 'cat-range' }, `${pad(cat.range[0])}–${pad(cat.range[1])}`),
        el('strong', {}, cat.label),
        el('span', { class: 'cat-desc' }, {
          concept: '이유까지 말로 설명하기',
          trace: '실행 전에 출력 예측하기',
          impl: '직접 코드 짜고 실행해 보기',
        }[cat.key]),
        el('span', { class: 'cat-progress' }, `${cc.done}/${cc.total} 풀이 · ${cc.good} 맞음`));
    });

    main.append(
      el('section', { class: 'home' },
        el('p', { class: 'eyebrow' }, '컴퓨터프로그래밍 2 · 이해 확인'),
        el('h1', {}, '100문제, 한 문제씩', el('br'), '바로 채점하며 풀기'),
        el('div', { class: 'home-actions' },
          el('a', { class: 'btn primary', href: `#/q/${resumeId}` }, c.done ? `이어서 풀기 · ${resumeId}번` : '1번부터 시작하기'),
          c.bad + c.meh ? el('button', { class: 'btn', onclick: () => { view.status = 'review'; view.cat = 'all'; const f = filtered(); refreshSidebar(); location.hash = `#/q/${f[0].id}`; } }, `복습할 문제 ${c.bad + c.meh}개`) : null),
        el('div', { class: 'cat-cards' }, cards),
        el('div', { class: 'how' },
          el('h2', {}, '이렇게 쓰세요'),
          el('ol', {},
            el('li', {}, '문제를 읽고 ', el('b', {}, '내 답'), ' 칸이나 Python 실행기에 먼저 답을 적습니다. 적은 내용은 이 브라우저에 자동 저장됩니다.'),
            el('li', {}, el('b', {}, '정답과 해설 보기'), '(', el('kbd', {}, 'Space'), ')로 바로 확인합니다.'),
            el('li', {}, '스스로 ', el('b', {}, '맞았다 · 헷갈렸다 · 틀렸다'), '(', el('kbd', {}, '1'), el('kbd', {}, '2'), el('kbd', {}, '3'), ')로 채점하면 왼쪽 목록에 색으로 표시됩니다.'),
            el('li', {}, el('kbd', {}, '←'), el('kbd', {}, '→'), '로 이동, ', el('kbd', {}, 'B'), '로 북마크, 실행기에서는 ', el('kbd', {}, 'Ctrl'), '+', el('kbd', {}, 'Enter'), '로 실행합니다.'),
            el('li', {}, '“복습 필요” 필터로 헷갈리거나 틀린 문제만 다시 풉니다.'))),
        el('details', { class: 'guide', open: !c.done },
          el('summary', {}, '원본 문제집의 안내'),
          el('div', { class: 'prose', html: DATA.introHtml })),
        el('details', { class: 'guide' },
          el('summary', {}, '채점 후 다시 공부할 곳'),
          el('div', { class: 'prose', html: DATA.outroHtml })),
        el('p', { class: 'fineprint' }, '사이트로 옮기며 문맥이 부족하거나 예시가 실제 출력과 달랐던 일부 문제는 다듬었습니다. 해당 문제에는 ', el('span', { class: 'badge-edit' }, '수정됨'), ' 표시가 있습니다.')));
    refreshSidebar();
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // ---------- 문제 화면 ----------
  function neighbors(id) {
    let list = filtered();
    if (!list.some((q) => q.id === id)) list = QUESTIONS;
    const i = list.findIndex((q) => q.id === id);
    return { prev: list[i - 1] || null, next: list[i + 1] || null, index: i, size: list.length };
  }

  function renderQuestion(id) {
    const q = QUESTIONS[id - 1];
    if (!q) return renderHome();
    view.current = id;
    view.revealed = false;
    state.last = id;
    save();

    const main = $('#main');
    main.innerHTML = '';
    const cat = CATS[q.category];
    const nb = neighbors(id);
    const hasRunner = q.category !== 'concept';

    const starBtn = el('button', {
      class: 'star-btn', 'aria-pressed': String(!!state.stars[id]), title: '북마크 (B)',
      'aria-label': '북마크', onclick: () => toggleStar(id),
    }, '★');

    const head = el('div', { class: 'qhead' },
      el('span', { class: 'qnum' }, pad(id)),
      el('span', { class: `qcat ${q.category}` }, cat.label),
      q.note ? el('span', { class: 'badge-edit', title: q.note }, '수정됨') : null,
      el('span', { class: 'grow' }),
      el('span', { class: 'grade-chip', id: 'gradeChip' }),
      starBtn);

    const body = el('div', { class: 'qbody prose', html: q.questionHtml });
    const note = q.note ? el('p', { class: 'edit-note' }, el('b', {}, '사이트 수정: '), q.note) : null;

    // 내 답 메모 (구현 문제는 코드 편집기가 답 칸)
    let memo = null;
    if (q.category !== 'impl') {
      const ta = el('textarea', {
        class: 'memo', id: 'memo', rows: q.category === 'concept' ? 4 : 3, spellcheck: 'false',
        placeholder: q.category === 'concept' ? '내 말로 답을 적어 보세요. (자동 저장)' : '실행하기 전에 출력을 예측해 적어 보세요. (자동 저장)',
      });
      ta.value = state.notes[id] || '';
      ta.addEventListener('input', () => { state.notes[id] = ta.value; if (!ta.value) delete state.notes[id]; save(); });
      memo = el('div', { class: 'field' }, el('label', { for: 'memo', class: 'field-label' }, '내 답'), ta);
    }

    const runner = hasRunner ? buildRunner(q) : null;

    const answer = el('section', { class: 'answer', id: 'answer', hidden: true, 'aria-labelledby': 'answerTitle' },
      el('div', { class: 'answer-title', id: 'answerTitle' }, '정답과 해설'),
      el('div', { class: 'prose', html: q.answerHtml }),
      el('div', { class: 'grade', role: 'group', 'aria-label': '스스로 채점' },
        el('span', { class: 'grade-label' }, '스스로 채점'),
        ...Object.entries(GRADES).map(([key, g], i) =>
          el('button', { class: `grade-btn ${key}`, 'data-grade': key, 'aria-pressed': String(state.results[id] === key), onclick: () => grade(id, key) },
            g.label, el('kbd', {}, String(i + 1))))));
    decorateCodeBlocks(answer, hasRunner);

    const revealBtn = el('button', { class: 'btn primary reveal', id: 'revealBtn', onclick: toggleReveal },
      el('span', { class: 'reveal-text' }, '정답과 해설 보기'), el('kbd', {}, 'Space'));

    const pager = el('nav', { class: 'pager', 'aria-label': '문제 이동' },
      el('a', { class: 'btn ghost', href: nb.prev ? `#/q/${nb.prev.id}` : null, 'aria-disabled': String(!nb.prev) }, '← 이전'),
      el('span', { class: 'pager-pos' }, view.status !== 'all' || view.cat !== 'all' ? `필터 ${nb.index + 1} / ${nb.size}` : `${id} / 100`),
      el('a', { class: 'btn ghost', id: 'nextBtn', href: nb.next ? `#/q/${nb.next.id}` : null, 'aria-disabled': String(!nb.next) }, '다음 →'));

    main.append(el('article', { class: 'qcard' }, head, body, note, memo, runner, el('div', { class: 'reveal-row' }, revealBtn), answer, pager));

    updateGradeChip(id);
    refreshSidebar();
    const cur = $('.cell.current');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function decorateCodeBlocks(root, canRun) {
    $$('pre.code', root).forEach((pre) => {
      const code = pre.textContent;
      const bar = el('div', { class: 'code-tools' },
        canRun && pre.dataset.lang === 'python'
          ? el('button', { class: 'mini-btn', onclick: () => loadIntoEditor(code) }, '실행기로 불러오기')
          : null,
        el('button', { class: 'mini-btn', onclick: () => copyText(code) }, '복사'));
      const wrap = el('div', { class: 'code-wrap' }, bar);
      pre.replaceWith(wrap);
      wrap.append(pre);
    });
  }

  function toggleReveal() {
    const answer = $('#answer');
    if (!answer) return;
    view.revealed = !view.revealed;
    answer.hidden = !view.revealed;
    const btn = $('#revealBtn');
    btn.classList.toggle('open', view.revealed);
    $('.reveal-text', btn).textContent = view.revealed ? '해설 접기' : '정답과 해설 보기';
    if (view.revealed) answer.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  function grade(id, key) {
    if (state.results[id] === key) delete state.results[id];
    else state.results[id] = key;
    save(true);
    $$('.grade-btn').forEach((b) => b.setAttribute('aria-pressed', String(state.results[id] === b.dataset.grade)));
    updateGradeChip(id);
    // 필터 목록은 채점 직전 기준으로 이동해야 하므로 사이드바만 갱신
    renderGrid();
    renderProgress();
    if (state.results[id]) {
      const next = $('#nextBtn');
      if (next && next.getAttribute('aria-disabled') === 'false') next.focus({ preventScroll: true });
    }
  }

  function updateGradeChip(id) {
    const chip = $('#gradeChip');
    if (!chip) return;
    const r = state.results[id];
    chip.className = `grade-chip ${r || ''}`;
    chip.textContent = r ? GRADES[r].short : '';
  }

  function toggleStar(id) {
    if (state.stars[id]) delete state.stars[id];
    else state.stars[id] = true;
    save(true);
    const btn = $('.star-btn');
    if (btn) btn.setAttribute('aria-pressed', String(!!state.stars[id]));
    renderGrid();
  }

  // ---------- Python 실행기 ----------
  function buildRunner(q) {
    const id = q.id;
    const isImpl = q.category === 'impl';
    const editor = el('textarea', {
      class: 'editor', id: 'editor', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', wrap: 'off',
      rows: isImpl ? 12 : 8, 'aria-label': '코드 편집기',
      placeholder: isImpl ? '# 여기에 직접 코드를 작성하고 실행해 보세요.\n' : '# 예측을 적은 뒤, "문제 코드 불러오기"로 불러와 실행해 확인하세요.\n',
    });
    editor.value = state.code[id] != null ? state.code[id] : '';
    editor.addEventListener('input', () => { state.code[id] = editor.value; if (!editor.value) delete state.code[id]; save(); });
    editor.addEventListener('keydown', editorKeys);

    const stdin = el('textarea', {
      class: 'stdin', id: 'stdin', spellcheck: 'false', rows: 2, wrap: 'off',
      placeholder: 'input()이 읽을 값을 한 줄에 하나씩', 'aria-label': '입력(stdin)',
    });
    stdin.value = state.stdin[id] != null ? state.stdin[id] : q.stdin;
    stdin.addEventListener('input', () => { state.stdin[id] = stdin.value; save(); });
    stdin.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); } });

    const output = el('pre', { class: 'output', id: 'output', 'aria-live': 'polite' });
    output.append(el('span', { class: 'muted' }, '실행 결과가 여기에 표시됩니다.'));

    const runBtn = el('button', { class: 'btn run', id: 'runBtn', onclick: runCode }, '▶ 실행', el('kbd', {}, 'Ctrl+Enter'));
    const stopBtn = el('button', { class: 'btn ghost', id: 'stopBtn', hidden: true, onclick: () => { window.PyRunner.stop(); } }, '■ 중지');

    const tools = el('div', { class: 'runner-tools' },
      q.code ? el('button', { class: 'mini-btn', onclick: () => loadIntoEditor(q.code) }, '문제 코드 불러오기') : null,
      q.stdin ? el('button', { class: 'mini-btn', onclick: () => { stdin.value = q.stdin; state.stdin[id] = q.stdin; save(); } }, '예시 입력 넣기') : null,
      el('button', { class: 'mini-btn', onclick: () => { editor.value = ''; delete state.code[id]; save(); editor.focus(); } }, '지우기'));

    const box = el('details', { class: 'runner', open: isImpl || !!state.code[id] },
      el('summary', {}, el('span', { class: 'runner-title' }, 'Python 실행기'),
        el('span', { class: 'runner-sub', id: 'runnerStatus' }, window.PyRunner && window.PyRunner.ready ? '준비됨' : '브라우저에서 바로 실행')),
      el('div', { class: 'runner-body' },
        tools,
        editor,
        el('div', { class: 'runner-io' },
          el('div', { class: 'field' }, el('label', { for: 'stdin', class: 'field-label' }, '입력(stdin)'), stdin),
          el('div', { class: 'runner-actions' }, runBtn, stopBtn)),
        el('div', { class: 'field' }, el('div', { class: 'field-label' }, '출력'), output)));
    box.addEventListener('toggle', () => { if (box.open && window.PyRunner) window.PyRunner.warmup(); });
    if (box.open && window.PyRunner) setTimeout(() => window.PyRunner.warmup(), 300);
    return box;
  }

  function loadIntoEditor(code) {
    const editor = $('#editor');
    if (!editor) return;
    const runner = editor.closest('details');
    if (runner) runner.open = true;
    editor.value = code;
    state.code[view.current] = code;
    save();
    editor.focus();
    editor.scrollIntoView({ block: 'center', behavior: 'smooth' });
    toast('실행기에 불러왔습니다');
  }

  function editorKeys(e) {
    const ta = e.target;
    const { selectionStart: s, selectionEnd: end, value } = ta;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
      return;
    }
    if (e.key === 'Escape') { ta.blur(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      if (e.shiftKey) {
        const lineEnd = value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end);
        const block = value.slice(lineStart, lineEnd);
        const dedented = block.replace(/^ {1,4}/gm, '');
        const firstRemoved = (block.match(/^ {1,4}/) || [''])[0].length;
        const removed = block.length - dedented.length;
        ta.setRangeText(dedented, lineStart, lineEnd, 'preserve');
        ta.selectionStart = Math.max(lineStart, s - firstRemoved);
        ta.selectionEnd = Math.max(ta.selectionStart, end - removed);
      } else if (s !== end && value.slice(s, end).includes('\n')) {
        const block = value.slice(lineStart, end);
        const indented = block.replace(/^/gm, '    ');
        ta.setRangeText(indented, lineStart, end, 'preserve');
        ta.selectionStart = s + 4;
        ta.selectionEnd = end + (indented.length - block.length);
      } else {
        ta.setRangeText('    ', s, end, 'end');
      }
      ta.dispatchEvent(new Event('input'));
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const line = value.slice(lineStart, s);
      let indent = line.match(/^ */)[0];
      if (/:\s*(#.*)?$/.test(line)) indent += '    ';
      e.preventDefault();
      ta.setRangeText('\n' + indent, s, end, 'end');
      ta.dispatchEvent(new Event('input'));
      return;
    }
    if (e.key === 'Backspace' && s === end && s > 0) {
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const before = value.slice(lineStart, s);
      if (before.length && /^ +$/.test(before)) {
        e.preventDefault();
        const remove = before.length % 4 || 4;
        ta.setRangeText('', s - remove, s, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    }
  }

  let running = false;
  async function runCode() {
    const editor = $('#editor');
    if (!editor || running || !window.PyRunner) return;
    const output = $('#output');
    const runBtn = $('#runBtn');
    const stopBtn = $('#stopBtn');
    const code = editor.value;
    if (!code.trim()) {
      output.innerHTML = '';
      output.append(el('span', { class: 'muted' }, '실행할 코드가 없습니다.'));
      return;
    }
    let stdinText = $('#stdin').value;
    if (stdinText && !stdinText.endsWith('\n')) stdinText += '\n';

    running = true;
    const forId = view.current;
    runBtn.disabled = true;
    stopBtn.hidden = false;
    output.innerHTML = '';
    output.append(el('span', { class: 'muted' }, window.PyRunner.ready ? '실행 중…' : 'Python을 불러오는 중… (처음 한 번만 몇 초 걸립니다)'));
    const started = performance.now();
    const res = await window.PyRunner.run(code, stdinText);
    running = false;
    if (view.current !== forId || !$('#output')) return; // 다른 문제로 이동함
    runBtn.disabled = false;
    stopBtn.hidden = true;
    output.innerHTML = '';

    if (res.type === 'result') {
      if (res.stdout) output.append(el('span', {}, res.stdout));
      if (res.error) output.append(el('span', { class: 'err' }, (res.stdout && !res.stdout.endsWith('\n') ? '\n' : '') + res.error));
      if (!res.stdout && !res.error) output.append(el('span', { class: 'muted' }, '(출력 없음)'));
      const endsWithNewline = !res.error && res.stdout.endsWith('\n');
      output.append(el('span', { class: 'meta' }, `${endsWithNewline ? '' : '\n'}— ${res.error ? '오류로 종료' : '정상 종료'} · ${Math.round(performance.now() - started)}ms`));
    } else if (res.type === 'timeout') {
      output.append(el('span', { class: 'err' }, `${window.PyRunner.TIMEOUT_MS / 1000}초 안에 끝나지 않아 중단했습니다. 무한 반복이거나 입력(stdin)이 부족한지 확인하세요.`));
    } else if (res.type === 'stopped') {
      output.append(el('span', { class: 'muted' }, '실행을 중지했습니다.'));
    } else {
      output.append(el('span', { class: 'err' }, `Python 실행기를 불러오지 못했습니다. 인터넷 연결을 확인하세요.\n${res.message || ''}`));
    }
  }

  if (window.PyRunner) {
    window.PyRunner.onState((s) => {
      const status = $('#runnerStatus');
      if (!status) return;
      status.textContent = { loading: 'Python 불러오는 중…', ready: '준비됨', idle: '브라우저에서 바로 실행' }[s] || '';
      status.dataset.state = s;
    });
  }

  // ---------- 라우팅 ----------
  function route() {
    const m = location.hash.match(/^#\/q\/(\d+)$/);
    if (m && QUESTIONS[Number(m[1]) - 1]) renderQuestion(Number(m[1]));
    else renderHome();
  }

  function go(id) {
    if (id) location.hash = `#/q/${id}`;
  }

  // ---------- 이벤트 ----------
  $$('[data-cat]').forEach((b) => b.addEventListener('click', () => { view.cat = b.dataset.cat; refreshSidebar(); }));
  $$('[data-status]').forEach((b) => b.addEventListener('click', () => { view.status = b.dataset.status; refreshSidebar(); }));
  $('#openNav').addEventListener('click', openNav);
  $('#closeNav').addEventListener('click', closeNav);
  $('#scrim').addEventListener('click', closeNav);
  $('#homeLink').addEventListener('click', (e) => { e.preventDefault(); closeNav(); location.hash = '#/'; });
  $('#guideBtn').addEventListener('click', () => { closeNav(); location.hash = '#/'; });
  $('#randomBtn').addEventListener('click', () => {
    let list = filtered().filter((q) => q.id !== view.current);
    if (!list.length) list = QUESTIONS;
    closeNav();
    go(list[Math.floor(Math.random() * list.length)].id);
  });

  const resetBtn = $('#resetBtn');
  resetBtn.addEventListener('click', () => {
    if (!resetBtn.classList.contains('confirm')) {
      resetBtn.classList.add('confirm');
      resetBtn.textContent = '정말 지울까요? 한 번 더 누르기';
      setTimeout(() => { resetBtn.classList.remove('confirm'); resetBtn.textContent = '기록 초기화'; }, 3500);
      return;
    }
    Object.assign(state, { results: {}, stars: {}, notes: {}, code: {}, stdin: {}, last: null });
    save(true);
    resetBtn.classList.remove('confirm');
    resetBtn.textContent = '기록 초기화';
    toast('채점·메모·코드 기록을 지웠습니다');
    route();
  });

  // 테마
  const themeBtn = $('#themeToggle');
  themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('cp2quiz:theme', root.dataset.theme); } catch (e) {}
  });

  document.addEventListener('keydown', (e) => {
    const t = e.target;
    const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (typing) {
      if (e.key === 'Escape') t.blur();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { closeNav(); return; }
    if (view.current == null) return;
    const nb = neighbors(view.current);
    switch (e.key) {
      case 'ArrowRight': if (nb.next) { e.preventDefault(); go(nb.next.id); } break;
      case 'ArrowLeft': if (nb.prev) { e.preventDefault(); go(nb.prev.id); } break;
      case ' ':
        if (t instanceof HTMLElement && /^(BUTTON|A|SUMMARY)$/.test(t.tagName) && t.id !== 'revealBtn') return;
        e.preventDefault();
        toggleReveal();
        break;
      case '1': case '2': case '3':
        if (view.revealed) grade(view.current, ['good', 'meh', 'bad'][Number(e.key) - 1]);
        break;
      case 'b': case 'B': toggleStar(view.current); break;
      default:
    }
  });

  window.addEventListener('hashchange', route);
  route();
})();
