(function () {
  const currentEl = document.getElementById('current');
  const prevEl = document.getElementById('prev');

  let current = '0';
  let previousValue = null;
  let pendingOp = null;
  let overwrite = true;

  function formatNumber(numStr) {
    if (numStr === 'Error') return numStr;
    const [intPart, decPart] = numStr.split('.');
    const sign = intPart.startsWith('-') ? '-' : '';
    const digits = sign ? intPart.slice(1) : intPart;
    const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return sign + withCommas + (decPart !== undefined ? '.' + decPart : '');
  }

  function render() {
    currentEl.textContent = formatNumber(current);
    if (pendingOp && previousValue !== null) {
      prevEl.textContent = formatNumber(previousValue) + ' ' + pendingOp;
    } else {
      prevEl.textContent = '';
    }
  }

  function inputDigit(d) {
    if (overwrite) {
      current = d === '.' ? '0.' : d;
      overwrite = false;
      return;
    }
    if (d === '.' ) {
      if (!current.includes('.')) current += '.';
      return;
    }
    if (current === '0') {
      current = d;
    } else {
      if (current.replace('-', '').replace('.', '').length >= 15) return;
      current += d;
    }
  }

  function compute(a, op, b) {
    a = parseFloat(a);
    b = parseFloat(b);
    let result;
    switch (op) {
      case '+': result = a + b; break;
      case '−': result = a - b; break;
      case '×': result = a * b; break;
      case '÷': result = b === 0 ? NaN : a / b; break;
      default: return b;
    }
    if (!isFinite(result)) return 'Error';
    return trimResult(result);
  }

  function trimResult(num) {
    let s = num.toPrecision(12);
    if (s.includes('.')) {
      s = s.replace(/0+$/, '').replace(/\.$/, '');
    }
    if (Math.abs(parseFloat(s)) < 1e-12) s = '0';
    return s;
  }

  function handleOp(op) {
    if (pendingOp && !overwrite) {
      current = compute(previousValue, pendingOp, current);
      previousValue = current;
    } else {
      previousValue = current;
    }
    pendingOp = op;
    overwrite = true;
  }

  function handleEquals() {
    if (pendingOp === null) return;
    current = compute(previousValue, pendingOp, current);
    pendingOp = null;
    previousValue = null;
    overwrite = true;
  }

  function handleClear() {
    current = '0';
    previousValue = null;
    pendingOp = null;
    overwrite = true;
  }

  function handleNegate() {
    if (current === '0') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
  }

  function handlePercent() {
    current = trimResult(parseFloat(current) / 100);
  }

  document.querySelector('.pad').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.dataset.num !== undefined) {
      inputDigit(btn.dataset.num);
    } else if (btn.dataset.action === 'decimal') {
      inputDigit('.');
    } else if (btn.dataset.action === 'op') {
      handleOp(btn.dataset.op);
    } else if (btn.dataset.action === 'equals') {
      handleEquals();
    } else if (btn.dataset.action === 'clear') {
      handleClear();
    } else if (btn.dataset.action === 'negate') {
      handleNegate();
    } else if (btn.dataset.action === 'percent') {
      handlePercent();
    }
    render();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
    else if (e.key === '.') inputDigit('.');
    else if (e.key === '+') handleOp('+');
    else if (e.key === '-') handleOp('−');
    else if (e.key === '*') handleOp('×');
    else if (e.key === '/') { e.preventDefault(); handleOp('÷'); }
    else if (e.key === 'Enter' || e.key === '=') handleEquals();
    else if (e.key === 'Backspace') {
      current = current.length > 1 ? current.slice(0, -1) : '0';
      if (current === '-') current = '0';
    }
    else if (e.key === 'Escape') handleClear();
    else if (e.key === '%') handlePercent();
    else return;
    render();
  });

  render();
})();
