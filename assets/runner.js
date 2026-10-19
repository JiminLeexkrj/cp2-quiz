// 브라우저 안 Python 실행기 (Pyodide를 Web Worker에서 실행).
// 무한 반복도 "중지"나 시간 초과로 워커를 종료해 멈출 수 있다.
(function () {
  const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/';
  const TIMEOUT_MS = 8000;

  const PY_RUNNER = `
import sys, io, json, traceback, linecache

class _OutputLimit(BaseException):
    pass

class _LimitedOut(io.StringIO):
    LIMIT = 20000
    def write(self, s):
        if self.tell() + len(s) > self.LIMIT:
            super().write(s[: max(0, self.LIMIT - self.tell())])
            raise _OutputLimit()
        return super().write(s)

def __run_user(code, stdin_text):
    out = _LimitedOut()
    saved = sys.stdin, sys.stdout, sys.stderr
    sys.stdin, sys.stdout, sys.stderr = io.StringIO(stdin_text), out, out
    error = None
    # 오류 메시지에 해당 코드 줄이 보이도록 소스를 등록한다.
    linecache.cache['<내 코드>'] = (len(code), None, code.splitlines(True), '<내 코드>')
    try:
        compiled = compile(code, '<내 코드>', 'exec')
        exec(compiled, {'__name__': '__main__'})
    except _OutputLimit:
        error = '출력이 너무 길어 중단했습니다 (20,000자 초과). 무한 반복인지 확인하세요.'
    except SyntaxError as e:
        error = ''.join(traceback.format_exception_only(type(e), e))
    except EOFError as e:
        error = 'EOFError: 입력이 더 없습니다. 아래 "입력(stdin)" 칸에 input()이 읽을 값을 한 줄씩 적어 주세요.'
    except BaseException as e:
        tb = e.__traceback__
        while tb is not None and tb.tb_frame.f_code.co_filename != '<내 코드>':
            tb = tb.tb_next
        error = ''.join(traceback.format_exception(type(e), e, tb))
    finally:
        sys.stdin, sys.stdout, sys.stderr = saved
    return json.dumps({'stdout': out.getvalue(), 'error': error.rstrip() if error else None})
`;

  const WORKER_SRC = `
let pyodidePromise = null;
function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      importScripts(${JSON.stringify(PYODIDE_URL)} + 'pyodide.js');
      const py = await loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_URL)} });
      py.runPython(${JSON.stringify(PY_RUNNER)});
      return py;
    })();
  }
  return pyodidePromise;
}
self.onmessage = async (event) => {
  const { id, type, code, stdin } = event.data;
  try {
    const py = await getPyodide();
    if (type === 'warmup') { self.postMessage({ id, type: 'ready' }); return; }
    const run = py.globals.get('__run_user');
    const result = JSON.parse(run(code, stdin));
    run.destroy();
    self.postMessage({ id, type: 'result', ...result });
  } catch (err) {
    self.postMessage({ id, type: 'fatal', message: String(err && err.message || err) });
  }
};
`;

  let worker = null;
  let ready = false;
  let warmPromise = null;
  let seq = 0;
  const pending = new Map();
  const listeners = new Set();

  function emit(state) {
    listeners.forEach((fn) => fn(state));
  }

  function createWorker() {
    const blob = new Blob([WORKER_SRC], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    worker = new Worker(url);
    URL.revokeObjectURL(url);
    ready = false;
    worker.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === 'ready' || msg.type === 'result') {
        if (!ready) { ready = true; emit('ready'); }
      }
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      clearTimeout(p.timer);
      p.resolve(msg);
    };
    worker.onerror = (event) => {
      pending.forEach((p) => { clearTimeout(p.timer); p.resolve({ type: 'fatal', message: event.message || 'Python 실행기를 불러오지 못했습니다.' }); });
      pending.clear();
      worker = null;
      warmPromise = null;
      emit('idle');
    };
  }

  function post(message, timeoutMs) {
    if (!worker) createWorker();
    const id = ++seq;
    return new Promise((resolve) => {
      const timer = timeoutMs
        ? setTimeout(() => {
            pending.delete(id);
            hardReset();
            resolve({ type: 'timeout' });
          }, timeoutMs)
        : null;
      pending.set(id, { resolve, timer });
      worker.postMessage({ id, ...message });
    });
  }

  function hardReset() {
    if (worker) worker.terminate();
    worker = null;
    ready = false;
    warmPromise = null;
    pending.forEach((p) => { clearTimeout(p.timer); p.resolve({ type: 'stopped' }); });
    pending.clear();
    emit('idle');
  }

  window.PyRunner = {
    get ready() { return ready; },
    onState(fn) { listeners.add(fn); },
    // Pyodide 내려받기·초기화는 시간 제한 없이 한 번만 하고, 실제 실행에만 시간 제한을 둔다.
    warmup() {
      if (!warmPromise) {
        emit('loading');
        warmPromise = post({ type: 'warmup' }, 0).then((msg) => {
          if (msg.type !== 'ready') { warmPromise = null; emit('idle'); }
          return msg;
        });
      }
      return warmPromise;
    },
    async run(code, stdin) {
      const warm = await this.warmup();
      if (warm.type !== 'ready') return warm;
      return post({ type: 'run', code, stdin }, TIMEOUT_MS);
    },
    stop: hardReset,
    TIMEOUT_MS,
  };
})();
