/* Beyond Tech guided chat — FAQ shell; swap replyFor() for an API later */
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

  const STARTERS = [
    { label: 'What do you do?', key: 'what' },
    { label: 'Where do you work?', key: 'where' },
    { label: 'How do engagements start?', key: 'start' },
    { label: 'Book a session', key: 'book' },
  ];

  const REPLIES = {
    what: 'We help enterprises turn AI ambition into measurable outcomes — strategy, agentic workflows, governance, and transformation advisory. Business-led. Human-governed.',
    where: 'We are Sweden-based, with focus markets in Sweden, the United Arab Emirates, and Saudi Arabia.',
    start: 'Most engagements begin with a focused strategy conversation: priorities, constraints, and a credible first step. No hype demo required.',
    book: 'Gladly. Use Book a strategy session below, or email hej@beyondtech.se — we will respond with times that fit.',
    default:
      'I can help with what we do, where we work, and how engagements start. For anything specific to your enterprise, book a short strategy conversation.',
  };

  function replyFor(text) {
    const t = (text || '').toLowerCase();
    if (/book|meeting|call|session|talk|contact/.test(t)) return REPLIES.book;
    if (/where|market|sweden|uae|saudi|location|office/.test(t)) return REPLIES.where;
    if (/start|engage|begin|first|how do/.test(t)) return REPLIES.start;
    if (/what|do you|offer|service|help|ai/.test(t)) return REPLIES.what;
    return REPLIES.default;
  }

  function addBubble(text, who) {
    const el = document.createElement('div');
    el.className = 'bt-chat__bubble bt-chat__bubble--' + who;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function openPanel() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    if (!messages.childElementCount) {
      addBubble('Ask about Beyond Tech, or pick a prompt below.', 'bot');
    }
    setTimeout(() => input && input.focus(), 50);
  }

  function closePanel() {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  function ask(text) {
    const q = (text || '').trim();
    if (!q) return;
    addBubble(q, 'user');
    addBubble(replyFor(q), 'bot');
  }

  STARTERS.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.label;
    b.addEventListener('click', () => ask(s.label));
    chips.appendChild(b);
  });

  fab.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    ask(v);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });
})();
