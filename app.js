function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function safeEval(expr) {
  // Only allow numbers, operators, parentheses, dots, spaces, Math.sqrt, **
  if (!/^[0-9+\-*/().\s*Mathsqrt^*]+$/.test(expr)) return null;
  try {
    // eslint-disable-next-line no-new-func
    return Function(`return (${expr});`)();
  } catch {
    return null;
  }
}

function fmt(n) {
  const rounded = Math.round(n * 1000) / 1000;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function makeBasicExpression() {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const d = randInt(2, 9);

  const patterns = [
    () => ({
      display: `${a} + ${b} × ${c}`,
      eval: `${a} + ${b} * ${c}`,
      steps: [`Multiply ${b} × ${c} first`, `Then add ${a}`]
    }),
    () => ({
      display: `(${a} + ${b}) × ${c}`,
      eval: `(${a} + ${b}) * ${c}`,
      steps: [`Do brackets: ${a} + ${b}`, `Then multiply by ${c}`]
    }),
    () => ({
      display: `${a} + ${b} − ${c} × ${d}`,
      eval: `${a} + ${b} - ${c} * ${d}`,
      steps: [`Multiply ${c} × ${d} first`, `Then add/subtract left to right`]
    }),
    () => ({
      display: `(${a} − ${b}) × (${c} + ${d})`,
      eval: `(${a} - ${b}) * (${c} + ${d})`,
      steps: [`Do each bracket`, `Then multiply the results`]
    }),
    () => ({
      display: `${a} × ${b} + ${c} × ${d}`,
      eval: `${a} * ${b} + ${c} * ${d}`,
      steps: [`Multiply both products`, `Then add them`]
    }),
    () => {
      // Division that stays integer
      const x = randInt(2, 9);
      const y = randInt(2, 9);
      const prod = x * y;
      return {
        display: `${prod} ÷ ${y} + ${a}`,
        eval: `${prod} / ${y} + ${a}`,
        steps: [`Divide ${prod} ÷ ${y} first`, `Then add ${a}`]
      };
    },
    () => ({
      display: `${a} + ${b} × (${c} − ${d})`,
      eval: `${a} + ${b} * (${c} - ${d})`,
      steps: [`Do brackets: ${c} − ${d}`, `Multiply by ${b}`, `Then add ${a}`]
    })
  ];

  return choice(patterns)();
}

function makeAdvancedExpression() {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const d = randInt(2, 9);
  const e = randInt(2, 5);

  const sq = randInt(2, 12);
  const sqVal = sq * sq;

  const patterns = [
    () => ({
      display: `${a} + ${b}<sup>2</sup> × ${c}`,
      eval: `${a} + (${b} ** 2) * ${c}`,
      steps: [`Do exponent: ${b}²`, `Multiply by ${c}`, `Then add ${a}`]
    }),
    () => ({
      display: `(${a} + ${b}) × ${c}<sup>2</sup>`,
      eval: `(${a} + ${b}) * (${c} ** 2)`,
      steps: [`Do brackets`, `Do exponent`, `Then multiply`]
    }),
    () => ({
      display: `√(${sqVal}) + ${a} × ${b}`,
      eval: `Math.sqrt(${sqVal}) + ${a} * ${b}`,
      steps: [`Do root: √${sqVal}`, `Multiply ${a} × ${b}`, `Then add`]
    }),
    () => ({
      display: `${a} + (${b} − ${c})<sup>2</sup>`,
      eval: `${a} + ((${b} - ${c}) ** 2)`,
      steps: [`Do brackets`, `Square the result`, `Then add ${a}`]
    }),
    () => ({
      display: `(${a} + ${b}) ÷ ${e} + √(${sqVal})`,
      eval: `(${a} + ${b}) / ${e} + Math.sqrt(${sqVal})`,
      steps: [`Do brackets`, `Divide by ${e}`, `Then add the root`]
    }),
    () => ({
      display: `${a} × (${b} + ${c}) − ${d}<sup>2</sup>`,
      eval: `${a} * (${b} + ${c}) - (${d} ** 2)`,
      steps: [`Do brackets`, `Multiply by ${a}`, `Do exponent`, `Then subtract`]
    })
  ];

  return choice(patterns)();
}

function buildProblem(index, mode) {
  const expr = mode === "advanced" ? makeAdvancedExpression() : makeBasicExpression();
  const answer = safeEval(expr.eval);

  const wrapper = document.createElement("div");
  wrapper.className = "problem";
  wrapper.dataset.answer = String(answer);
  wrapper.dataset.steps = JSON.stringify(expr.steps || []);
  wrapper.dataset.hintIndex = "0";

  const top = document.createElement("div");
  top.className = "problem-top";

  const qnum = document.createElement("div");
  qnum.className = "qnum";
  qnum.textContent = `${index}.`;

  const prompt = document.createElement("div");
  prompt.className = "prompt";
  prompt.textContent = "Solve:";

  top.appendChild(qnum);
  top.appendChild(prompt);

  const main = document.createElement("div");
  main.className = "problem-main";

  const panel = document.createElement("div");
  panel.className = "panel";

  const title = document.createElement("h3");
  title.textContent = "Expression";

  const expression = document.createElement("div");
  expression.className = "expression";
  expression.innerHTML = expr.display;

  const answerRow = document.createElement("div");
  answerRow.className = "answerRow";

  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "decimal";
  input.placeholder = "answer";
  input.className = "ans";

  const btnHint = document.createElement("button");
  btnHint.type = "button";
  btnHint.className = "smallBtn";
  btnHint.textContent = "Hint";

  const qfb = document.createElement("div");
  qfb.className = "qfeedback";

  btnHint.addEventListener("click", () => {
    const steps = JSON.parse(wrapper.dataset.steps || "[]");
    let idx = parseInt(wrapper.dataset.hintIndex, 10);
    if (steps.length === 0) {
      qfb.textContent = "Use PEMDAS: brackets → exponents/roots → multiply/divide → add/subtract.";
    } else {
      qfb.textContent = steps[Math.min(idx, steps.length - 1)];
      idx = Math.min(idx + 1, steps.length - 1);
      wrapper.dataset.hintIndex = String(idx);
    }
    qfb.style.color = "#6b7280";
  });

  input.addEventListener("input", () => {
    input.classList.remove("correct", "wrong");
    qfb.textContent = "";
    qfb.style.color = "";
  });

  answerRow.appendChild(input);
  answerRow.appendChild(btnHint);

  panel.appendChild(title);
  panel.appendChild(expression);
  panel.appendChild(answerRow);
  panel.appendChild(qfb);

  main.appendChild(panel);

  wrapper.appendChild(top);
  wrapper.appendChild(main);

  return wrapper;
}

function newSet() {
  const quiz = document.getElementById("quiz");
  const globalFeedback = document.getElementById("globalFeedback");
  quiz.innerHTML = "";
  globalFeedback.textContent = "";
  globalFeedback.style.color = "";

  const count = parseInt(document.getElementById("count").value, 10);
  const mode = document.getElementById("mode").value;

  for (let i = 1; i <= count; i++) {
    quiz.appendChild(buildProblem(i, mode));
  }
}

function checkAll() {
  const rows = document.querySelectorAll(".problem");
  const globalFeedback = document.getElementById("globalFeedback");
  let allCorrect = true;

  rows.forEach(row => {
    const answer = parseFloat(row.dataset.answer);
    const input = row.querySelector(".ans");
    const qfb = row.querySelector(".qfeedback");

    const user = parseFloat(String(input.value).trim());

    if (Number.isNaN(user)) {
      input.classList.add("wrong");
      qfb.textContent = "Enter a number";
      qfb.style.color = "#e74c3c";
      allCorrect = false;
      return;
    }

    const ok = Math.abs(user - answer) < 0.001;

    if (ok) {
      input.classList.remove("wrong");
      input.classList.add("correct");
      qfb.textContent = "✅ Correct";
      qfb.style.color = "#27ae60";
    } else {
      input.classList.remove("correct");
      input.classList.add("wrong");
      qfb.textContent = `Try again. Answer ≈ ${fmt(answer)}`;
      qfb.style.color = "#e74c3c";
      allCorrect = false;
    }
  });

  if (allCorrect) {
    globalFeedback.textContent = "🌟 Nailed it. Everything is correct.";
    globalFeedback.style.color = "#27ae60";
  } else {
    globalFeedback.textContent = "Some are off. Fix the red ones and check again.";
    globalFeedback.style.color = "#e74c3c";
  }
}

document.getElementById("btnNew").addEventListener("click", newSet);
document.getElementById("btnCheck").addEventListener("click", checkAll);

newSet();
