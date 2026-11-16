/* Beyond Tech experience lab — tabs inside #experience */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const E = window.BeyondEngine;
  if (!E || !$('#experience')) return;
  const fmt = (n, d = 0) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: d }).format(n);

  const tabs = $$('#experience [role="tab"]');
  function selectTab(name, focus = false) {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
      if (active && focus) tab.focus();
    });
    const details = $('.lab-mobile-summary');
    if (details) details.open = true;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.tab));
    tab.addEventListener('keydown', (event) => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) {
        event.preventDefault();
        selectTab(tabs[target].dataset.tab, true);
      }
    });
  });

  function renderOpportunity() {
    if (!$('#opportunity-result') || !$('#industry')) return;
    const o = E.getOpportunity($('#industry').value, $('#function').value, $('#challenge').value);
    $('#opportunity-result').innerHTML =
      `<div class="result-top"><p class="eyebrow">Your potential starting point</p><span class="result-badge">Illustrative use case</span></div>` +
      `<h3>${o.title}</h3>` +
      `<p class="result-description">${o.description}</p>` +
      `<p class="result-context">${o.industry} · ${$('#function').selectedOptions[0].text}</p>` +
      `<div class="result-metrics">` +
      `<div><span>Value lever</span><strong>${o.value}</strong><small>${o.measure}</small></div>` +
      `<div><span>Feasibility</span><strong>${o.feasibility}</strong><small>${o.dependency}</small></div>` +
      `<div><span>Risk / control</span><strong>${o.risk}</strong><small>${o.control}</small></div>` +
      `</div>` +
      `<p class="small">${o.context}</p>` +
      `<div class="next-step"><p class="eyebrow">Recommended next step</p><p>${o.next} ${o.pilot}</p></div>` +
      `<p class="result-note">Qualitative starting hypotheses, not a maturity assessment or forecast.</p>` +
      `<a href="#contact" class="result-link">Validate this opportunity with us →</a>`;
  }
  const findBtn = $('#find-opportunity');
  if (findBtn) findBtn.addEventListener('click', renderOpportunity);
  ['industry', 'function', 'challenge'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderOpportunity);
  });
  $$('[data-industry]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!$('#industry')) return;
      $('#industry').value = button.dataset.industry;
      renderOpportunity();
      selectTab('navigator');
      $('#experience').scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    })
  );

  const calcIds = ['volume', 'minutes', 'rate', 'suitability', 'saving'];
  function renderCalculator() {
    if (!$('#capacity-value')) return;
    calcIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.removeAttribute('aria-invalid');
    });
    if ($('#suitability-label')) $('#suitability-label').textContent = $('#suitability').value + '%';
    if ($('#saving-label')) $('#saving-label').textContent = $('#saving').value + '%';
    if ($('#value-currency')) $('#value-currency').textContent = $('#currency').value;
    try {
      const result = E.calculateCapacity(Object.fromEntries(calcIds.map((id) => [id, $('#' + id).value])));
      if ($('#calc-error')) $('#calc-error').textContent = '';
      $('#capacity-value').textContent = fmt(result.value);
      $('#capacity-hours').textContent = fmt(result.hours, 1);
      $('#baseline-hours').textContent = fmt(result.baseline, 1);
      $('#capacity-percent').textContent = fmt(result.percent, 1) + '%';
      $('#capacity-bar').style.width = result.percent + '%';
      $('#capacity-track').setAttribute(
        'aria-label',
        fmt(result.percent, 1) + ' percent of baseline time potentially released'
      );
    } catch (error) {
      if ($('#calc-error')) $('#calc-error').textContent = error.message;
      ['capacity-value', 'capacity-hours', 'baseline-hours', 'capacity-percent'].forEach((id) => {
        if ($('#' + id)) $('#' + id).textContent = '—';
      });
      if ($('#capacity-bar')) $('#capacity-bar').style.width = '0%';
      calcIds.forEach((id) => {
        const el = $('#' + id);
        if (el && (el.value === '' || !el.validity.valid)) el.setAttribute('aria-invalid', 'true');
      });
    }
  }
  [...calcIds, 'currency'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderCalculator);
  });
  const resetCalc = $('#reset-calculator');
  if (resetCalc)
    resetCalc.addEventListener('click', () => {
      Object.entries({ volume: 5000, minutes: 12, rate: 550, suitability: 60, saving: 50, currency: 'SEK' }).forEach(
        ([key, value]) => {
          if ($('#' + key)) $('#' + key).value = value;
        }
      );
      renderCalculator();
    });

  if ($('#invoice-total')) {
    const variance = E.invoiceVariance();
    const setText = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    setText('invoice-total', 'SEK ' + fmt(variance.invoiceTotal));
    setText('po-total', 'SEK ' + fmt(variance.poTotal));
    setText('variance-amount', 'SEK ' + fmt(variance.amount));
    setText('variance-percent', fmt(variance.percent, 0) + '%');
  }

  if ($('#workflow-steps')) {
    const workflow = new E.Workflow();
    const flowCopy = [
      {
        title: 'Compare the invoice with the purchase order.',
        description: 'The demonstration loads a synthetic invoice and purchase order. No ERP connection is used.',
        evidence: 'Sources: INV-DEMO-1042 and PO-DEMO-887. All values are fabricated for this browser session.',
        action: 'Run comparison →',
      },
      {
        title: 'A material variance is detected.',
        description:
          'Unit price is 20% above the purchase order. Quantity matches. The variance is SEK 2,000 on a SEK 10,000 PO line.',
        evidence: 'Detected fields: unit price and extended amount. Quantity, supplier and currency match the PO.',
        action: 'Classify exception →',
      },
      {
        title: 'Classify the exception. Verify the cause.',
        description:
          'Category: unit-price mismatch. A stale purchase order or a supplier pricing error are possible explanations, not established facts.',
        evidence:
          'Underlying cause: unverified. Ask the buyer to confirm the agreed unit price and any approved PO amendment.',
        action: 'Prepare recommendation →',
      },
      {
        title: 'Draft a recommendation for human review.',
        description:
          'Suggested action: request clarification from the supplier and keep the invoice on hold. No payment instruction is created.',
        evidence:
          'Recommendation cites INV-DEMO-1042, PO-DEMO-887 and the SEK 2,000 variance. Authority: recommend only.',
        action: 'Send to reviewer →',
      },
      {
        title: 'A person decides. The system does not.',
        description:
          'The simulated finance reviewer must approve, reject or escalate. Nothing executes without that decision.',
        evidence: 'Pending human decision. No message, ERP update or payment can proceed from this step alone.',
      },
    ];

    function renderWorkflow() {
      const step = workflow.step;
      const copy =
        step < 5
          ? flowCopy[step]
          : {
              title:
                workflow.decision === 'approved'
                  ? 'Approved next step. Full traceability.'
                  : 'Rejected. Escalated for investigation.',
              description:
                workflow.decision === 'approved'
                  ? 'The simulated reviewer approved asking for clarification. The invoice remains on hold pending verified evidence.'
                  : 'The simulated reviewer rejected the draft recommendation. A manual investigation is required before any further action.',
              evidence:
                'The session log records source values, classification, recommendation and human decision.',
            };
      const setText = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.textContent = v;
      };
      setText('workflow-step-label', `Step ${String(step + 1).padStart(2, '0')} / 06`);
      setText('workflow-title', copy.title);
      setText('workflow-description', copy.description);
      setText('workflow-evidence', copy.evidence);
      const next = $('#workflow-next');
      if (next) {
        next.hidden = step >= 4;
        if (step < 4) next.textContent = copy.action;
      }
      const decisions = $('#workflow-decisions');
      if (decisions) decisions.hidden = step !== 4;
      $$('#workflow-steps li').forEach((li, i) => li.classList.toggle('active', i === step));
      const log = $('#audit-log');
      if (log) log.innerHTML = workflow.events.map((e) => `<li>${e}</li>`).join('');
    }

    const wNext = $('#workflow-next');
    if (wNext)
      wNext.addEventListener('click', () => {
        workflow.advance();
        renderWorkflow();
      });
    const wApprove = $('#workflow-approve');
    if (wApprove)
      wApprove.addEventListener('click', () => {
        workflow.decide(true);
        renderWorkflow();
      });
    const wReject = $('#workflow-reject');
    if (wReject)
      wReject.addEventListener('click', () => {
        workflow.decide(false);
        renderWorkflow();
      });
    const wReset = $('#workflow-reset');
    if (wReset)
      wReset.addEventListener('click', () => {
        workflow.reset();
        renderWorkflow();
      });

    renderWorkflow();
  }

  if ($('#industry')) renderOpportunity();
  if ($('#capacity-value')) renderCalculator();
})();
