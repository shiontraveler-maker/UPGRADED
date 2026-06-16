/* ============================================================
   AHCA — AI Tax Assistant
   Powered by OpenAI GPT-4o mini
   ============================================================ */

(function () {
  'use strict';

  const WORKER_URL = 'https://ahca-taxbot.abedalfattah-91p.workers.dev';

  const SYSTEM_PROMPT = `You are an expert UAE tax advisor working for AHCA — a UAE FTA-Approved Tax Agent based in Dubai and Abu Dhabi.

Your expertise covers:
- UAE Corporate Tax (CT): 9% rate on taxable income above AED 375,000 (effective June 2023). 0% for income up to AED 375,000.
- Small Business Relief: businesses with revenue under AED 3 million can elect for 0% CT until 2026.
- UAE VAT: 5% standard rate, introduced January 2018. Mandatory registration threshold AED 375,000 taxable supplies.
- Voluntary VAT registration threshold: AED 187,500.
- Zero-rated supplies: exports, international transport, healthcare, education, residential property (first sale).
- Exempt supplies: financial services, residential property (subsequent sales), bare land, local passenger transport.
- FTA compliance: filing deadlines, penalties, voluntary disclosure.
- Free zone businesses: Qualifying Free Zone Persons (QFZP) can benefit from 0% CT on qualifying income.
- Transfer pricing: arm's length principle applies to related party transactions.
- Economic Substance Regulations (ESR).
- Country-by-Country Reporting (CbCR) for large multinationals.

Rules:
1. Answer clearly and professionally in the same language the user writes in (Arabic or English).
2. Always give practical, actionable advice.
3. For complex situations always recommend booking a consultation with AHCA.
4. Keep answers concise — 3-5 sentences max for simple questions.
5. Never give advice that could be illegal or misleading.
6. If asked about AHCA services, mention they offer: Corporate Tax Filing, VAT Services, Bookkeeping, Financial Planning, FTA Compliance.
7. AHCA contact: WhatsApp +971 54 505 0689, located in Dubai & Abu Dhabi.
8. Always end complex answers with: "For personalised advice, book a free consultation with AHCA."`;

  // State
  const history = [{ role: 'system', content: SYSTEM_PROMPT }];

  // Elements
  const btn      = document.getElementById('aiChatBtn');
  const panel    = document.getElementById('aiChat');
  const closeBtn = document.getElementById('aiChatClose');
  const messages = document.getElementById('aiChatMessages');
  const input    = document.getElementById('aiChatInput');
  const send     = document.getElementById('aiChatSend');
  const typing   = document.getElementById('aiChatTyping');

  if (!btn || !panel) return;

  /* ── Open / Close ── */
  const setOpen = open => {
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
  };

  btn.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  closeBtn.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

  /* ── Quick buttons ── */
  document.querySelectorAll('.ai-quick-btn').forEach(b => {
    b.addEventListener('click', () => {
      input.value = b.dataset.q;
      sendMessage();
      // hide quick buttons after first use
      document.querySelector('.ai-quick-btns').style.display = 'none';
    });
  });

  /* ── Send on Enter ── */
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  send.addEventListener('click', sendMessage);

  /* ── Append message bubble ── */
  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `ai-msg ai-msg--${role === 'user' ? 'user' : 'bot'}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  /* ── Typewriter effect ── */
  function typeWriter(el, text, speed = 18) {
    return new Promise(resolve => {
      let i = 0;
      el.textContent = '';
      const tick = () => {
        if (i < text.length) {
          el.textContent += text[i++];
          messages.scrollTop = messages.scrollHeight;
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      };
      tick();
    });
  }

  /* ── Main send ── */
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || send.disabled) return;

    input.value = '';
    send.disabled = true;
    appendMsg('user', text);
    history.push({ role: 'user', content: text });

    // Show thinking dots while waiting for API
    typing.hidden = false;
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data  = await res.json();
      const reply = data.choices[0].message.content.trim();
      history.push({ role: 'assistant', content: reply });

      // Hide dots, create empty bubble, then type it out
      typing.hidden = true;
      const bubble = document.createElement('div');
      bubble.className = 'ai-msg ai-msg--bot';
      messages.appendChild(bubble);
      await typeWriter(bubble, reply, 16);

    } catch (err) {
      typing.hidden = true;
      appendMsg('assistant', 'Sorry, I encountered an error. Please try again or contact AHCA directly on WhatsApp: +971 54 505 0689');
      console.error('TaxBot error:', err);
    }

    send.disabled = false;
    input.focus();
  }

})();
