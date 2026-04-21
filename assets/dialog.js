/**
 * In-app feedback (no window.alert / confirm / prompt).
 * Uses theme CSS variables from app.css.
 */

let toastEl;

function ensureToast() {
  if (toastEl && document.body.contains(toastEl)) return toastEl;
  toastEl = document.createElement('div');
  toastEl.id = 'app-dialog-toast';
  toastEl.setAttribute('role', 'status');
  toastEl.style.cssText =
    'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(12px);' +
    'max-width:min(92vw,420px);padding:12px 18px;border-radius:12px;font-size:13.5px;' +
    'font-family:inherit;line-height:1.45;z-index:10001;opacity:0;pointer-events:none;' +
    'transition:opacity .2s,transform .2s;box-shadow:0 10px 30px rgba(0,0,0,.45);' +
    'border:1px solid var(--line);background:var(--card);color:var(--ink);text-align:center';
  document.body.appendChild(toastEl);
  return toastEl;
}

let toastTimer;

export function toast(message, opts = {}) {
  const el = ensureToast();
  const err = opts.error || opts.kind === 'err';
  el.textContent = String(message ?? '');
  el.style.borderColor = err ? '#ef4444' : 'var(--accent)';
  el.style.color = err ? '#ffa0a0' : 'var(--ink)';
  el.style.opacity = '1';
  el.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toastTimer);
  const ms = typeof opts.duration === 'number' ? opts.duration : 4200;
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(12px)';
  }, ms);
}

/**
 * @returns {Promise<boolean>} true if user confirmed
 */
/** Read-only message (replaces informational window.alert). */
export function infoDialog(message, opts = {}) {
  const title = opts.title || 'Details';
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:flex;' +
      'align-items:center;justify-content:center;padding:20px;font-family:inherit';

    const card = document.createElement('div');
    card.style.cssText =
      'background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;' +
      'max-width:520px;width:100%;box-sizing:border-box;max-height:85vh;overflow:auto';

    const h = document.createElement('div');
    h.textContent = title;
    h.style.cssText = 'font-weight:600;font-size:16px;margin:0 0 12px;color:var(--ink)';

    const p = document.createElement('pre');
    p.textContent = String(message ?? '');
    p.style.cssText =
      'margin:0 0 18px;font-size:13px;color:var(--muted);line-height:1.5;white-space:pre-wrap;' +
      'font-family:inherit;word-break:break-word';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:flex-end';

    function cleanup() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        cleanup();
        resolve();
      }
    }
    document.addEventListener('keydown', onKey);

    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.textContent = opts.okText || 'OK';
    btnOk.style.cssText =
      'padding:8px 18px;border-radius:8px;border:1px solid var(--accent);background:var(--accent);' +
      'color:var(--cta-ink,#0b0b10);font:inherit;font-weight:600;cursor:pointer';
    btnOk.onclick = () => {
      cleanup();
      resolve();
    };

    row.appendChild(btnOk);
    card.append(h, p, row);
    overlay.appendChild(card);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve();
      }
    });
    document.body.appendChild(overlay);
    btnOk.focus();
  });
}

export function confirmDialog(message, opts = {}) {
  const title = opts.title || 'Confirm';
  const ok = opts.confirmText || 'OK';
  const cancel = opts.cancelText || 'Cancel';
  const danger = !!opts.danger;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:flex;' +
      'align-items:center;justify-content:center;padding:20px;font-family:inherit';

    const card = document.createElement('div');
    card.style.cssText =
      'background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;' +
      'max-width:420px;width:100%;box-sizing:border-box';

    const h = document.createElement('div');
    h.textContent = title;
    h.style.cssText = 'font-weight:600;font-size:16px;margin:0 0 10px;color:var(--ink)';

    const p = document.createElement('p');
    p.textContent = String(message ?? '');
    p.style.cssText = 'margin:0 0 18px;font-size:14px;color:var(--muted);line-height:1.5;white-space:pre-wrap';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap';

    function cleanup() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        cleanup();
        resolve(false);
      }
    }
    document.addEventListener('keydown', onKey);

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.textContent = cancel;
    btnCancel.style.cssText =
      'padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:transparent;' +
      'color:var(--muted);font:inherit;cursor:pointer';
    btnCancel.onclick = () => {
      cleanup();
      resolve(false);
    };

    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.textContent = ok;
    btnOk.style.cssText =
      'padding:8px 14px;border-radius:8px;border:1px solid ' + (danger ? '#ef4444' : 'var(--accent)') + ';' +
      'background:' + (danger ? 'transparent' : 'var(--accent)') + ';' +
      'color:' + (danger ? '#ffa0a0' : 'var(--cta-ink,#0b0b10)') + ';font:inherit;font-weight:600;cursor:pointer';
    btnOk.onclick = () => {
      cleanup();
      resolve(true);
    };

    row.append(btnCancel, btnOk);
    card.append(h, p, row);
    overlay.appendChild(card);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });
    document.body.appendChild(overlay);
    btnOk.focus();
  });
}

const FIELD_STYLE =
  'width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid var(--line);' +
  'background:var(--input-bg,#06060c);color:var(--ink);font:inherit;font-size:14px';

/**
 * One text field (replaces window.prompt).
 * @param {{ title?: string, label?: string, defaultValue?: string, multiline?: boolean }} opts
 * @returns {Promise<string|null>} null if cancelled
 */
export function promptField(opts = {}) {
  const title = opts.title || 'Enter value';
  const label = opts.label || '';
  const defaultValue = opts.defaultValue ?? '';
  const multiline = !!opts.multiline;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:flex;' +
      'align-items:center;justify-content:center;padding:20px;font-family:inherit';

    const card = document.createElement('div');
    card.style.cssText =
      'background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;' +
      'max-width:480px;width:100%;box-sizing:border-box';

    const h = document.createElement('div');
    h.textContent = title;
    h.style.cssText = 'font-weight:600;font-size:16px;margin:0 0 14px;color:var(--ink)';

    const lab = document.createElement('label');
    lab.style.cssText = 'display:block;font-size:12px;color:var(--muted);margin-bottom:6px';
    lab.textContent = label || ' ';

    let input;
    if (multiline) {
      input = document.createElement('textarea');
      input.rows = 5;
      input.style.cssText = FIELD_STYLE + ';resize:vertical;min-height:100px';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.style.cssText = FIELD_STYLE;
    }
    input.value = defaultValue;

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap';

    function cleanup() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        cleanup();
        resolve(null);
      }
    }
    document.addEventListener('keydown', onKey);

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.textContent = 'Cancel';
    btnCancel.style.cssText =
      'padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:transparent;' +
      'color:var(--muted);font:inherit;cursor:pointer';
    btnCancel.onclick = () => {
      cleanup();
      resolve(null);
    };

    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.textContent = 'Save';
    btnOk.style.cssText =
      'padding:8px 14px;border-radius:8px;border:1px solid var(--accent);background:var(--accent);' +
      'color:var(--cta-ink,#0b0b10);font:inherit;font-weight:600;cursor:pointer';
    btnOk.onclick = () => {
      const v = multiline ? input.value : input.value.trim();
      cleanup();
      resolve(v);
    };

    row.append(btnCancel, btnOk);
    card.append(h, lab, input, row);
    overlay.appendChild(card);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(null);
      }
    });
    document.body.appendChild(overlay);
    input.focus();
    input.select?.();
  });
}
