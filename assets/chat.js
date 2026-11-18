/* Beyond Tech signal console — FAQ shell; swap replyFor() for an API later */
(() => {
  'use strict';
  const root = document.getElementById('bt-chat');
  if (!root) return;

  const fab = document.getElementById('bt-chat-fab');
  const panel = document.getElementById('bt-chat-panel');
  const closeBtn = document.getElementById('bt-chat-close');
  const messages = document.getElementById('bt-chat-messages');
  const chips = document.getElementById('bt-chat-chips');
  const form = document.getElementById('bt-chat-form');
  const input = document.getElementById('bt-chat-input');
  const statusEl = document.getElementById('bt-chat-status');
  const handoff = document.getElementById('bt-chat-handoff');
  const reduce =
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STARTERS = [
    { label: 'What', ask: 'What do you do?', key: 'what' },
    { label: 'Where', ask: 'Where do you work?', key: 'where' },
    { label: 'Start', ask: 'How do engagements start?', key: 'start' },
    { label: 'Book', ask: 'Book a session', key: 'book' },
  ];

  const STATUS = {
    ready: 'Ready',
    thinking: 'Thinking…',
    handoff: 'Handoff',
  };

  const REPLIES = {
    what: 'We help enterprises turn AI ambition into measurable outcomes — strategy, agentic workflows, governance, and transformation advisory. Business-led. Human-governed.',
    where: 'We are Sweden-based, with focus markets in Sweden, the United Arab Emirates, and Saudi Arabia.',
    start: 'Most engagements begin with a focused strategy conversation: priorities, constraints, and a credible first step. No hype demo required.',
    book: 'Gladly. Use Book a strategy session below, or email hej@beyondtech.se — we will respond with times that fit.',
    default:
      'I can help with what we do, where we work, and how engagements start. For anything specific to your enterprise, book a short strategy conversation.',
  };

  let busy = false;
  let openTimer = null;

  function replyFor(text) {
    const t = (text || '').toLowerCase();
    if (/book|meeting|call|session|talk|contact/.test(t)) return { key: 'book', text: REPLIES.book };
    if (/where|market|sweden|uae|saudi|location|office/.test(t)) return { key: 'where', text: REPLIES.where };
    if (/start|engage|begin|first|how do/.test(t)) return { key: 'start', text: REPLIES.start };
    if (/what|do you|offer|service|help|ai/.test(t)) return { key: 'what', text: REPLIES.what };
    return { key: 'default', text: REPLIES.default };
  }

  function setStatus(key) {
    root.dataset.status = key;
    if (statusEl) statusEl.textContent = STATUS[key] || STATUS.ready;
  }

  function setChipPressed(key) {
    chips.querySelectorAll('button').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.key === key ? 'true' : 'false');
    });
  }

  function addRow(text, who, opts) {
    const options = opts || {};
    const el = document.createElement('div');
    el.className = 'bt-chat__row bt-chat__row--' + who;
    const whoEl = document.createElement('span');
    whoEl.className = 'bt-chat__who';
    whoEl.textContent = who === 'bot' ? 'BT ›' : 'YOU ›';
    const textEl = document.createElement('div');
    textEl.className = 'bt-chat__text';
    textEl.textContent = text;
    el.appendChild(whoEl);
    el.appendChild(textEl);
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;

    if (options.typeIn && who === 'bot' && !reduce && text.length > 0) {
      el.classList.add('is-typing');
      textEl.textContent = '';
      let i = 0;
      const step = Math.max(12, Math.min(28, Math.floor(900 / text.length)));
      const tick = () => {
        i += 1;
        textEl.textContent = text.slice(0, i);
        messages.scrollTop = messages.scrollHeight;
        if (i < text.length) {
          setTimeout(tick, step);
        } else {
          el.classList.remove('is-typing');
          if (typeof options.onDone === 'function') options.onDone();
        }
      };
      setTimeout(tick, 40);
      return el;
    }

    if (typeof options.onDone === 'function') options.onDone();
    return el;
  }

  function showPanel() {
    panel.hidden = false;
    // Force reflow so the open transition runs
    void panel.offsetWidth;
    panel.classList.add('is-visible');
    root.classList.add('is-open');
    fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('aria-label', 'Close signal channel');
    setStatus('ready');
    if (!messages.childElementCount) {
      addRow('Signal open. Ask about Beyond Tech, or choose a path.', 'bot', {
        typeIn: !reduce,
      });
    }
    clearTimeout(openTimer);
    openTimer = setTimeout(() => input && input.focus(), reduce ? 0 : 280);
  }

  function hidePanel() {
    panel.classList.remove('is-visible');
    root.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'Open signal channel');
    setStatus('ready');
    const finish = () => {
      panel.hidden = true;
      fab.focus();
    };
    if (reduce) finish();
    else setTimeout(finish, 280);
  }

  function openPanel() {
    if (!panel.hidden && panel.classList.contains('is-visible')) return;
    showPanel();
  }

  function closePanel() {
    if (panel.hidden) return;
    hidePanel();
  }

  function ask(text, keyHint) {
    const q = (text || '').trim();
    if (!q || busy) return;
    busy = true;
    addRow(q, 'user');
    const reply = replyFor(q);
    const key = keyHint || reply.key;
    setChipPressed(key === 'default' ? '' : key);
    setStatus('thinking');

    const delay = reduce ? 0 : 380 + Math.floor(Math.random() * 220);
    setTimeout(() => {
      addRow(reply.text, 'bot', {
        typeIn: !reduce,
        onDone: () => {
          busy = false;
          setStatus(key === 'book' ? 'handoff' : 'ready');
          if (key === 'book' && handoff) handoff.focus();
        },
      });
    }, delay);
  }

  STARTERS.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.label;
    b.dataset.key = s.key;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => ask(s.ask, s.key));
    chips.appendChild(b);
  });

  fab.addEventListener('click', () => {
    if (panel.hidden || !panel.classList.contains('is-visible')) openPanel();
    else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    ask(v);
  });
  if (handoff) {
    handoff.addEventListener('click', () => setStatus('handoff'));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });
})();
