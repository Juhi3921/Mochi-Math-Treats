
let currentNumber = "0";
let firstNumber = null;
let selectedTreat = null;
let startNewNumber = false;
let justServed = false;
let currentReceipt = null;
const displayElement = document.getElementById("calc-display");
const receiptContainer = document.getElementById("receipt-container");
const clearButton = document.getElementById("btn-clear");
const backspaceButton = document.getElementById("btn-backspace");
const dotButton = document.getElementById("btn-dot");
const serveHeartButton = document.getElementById("btn-serve-heart");
const serveLargeButton = document.getElementById("btn-serve-large");

function makeNumberLookNice(num) {
  if (!Number.isFinite(num)) {
    return "oops";
  }
  const rounded = Math.round(num * 100000) / 100000;
  const text = String(rounded);
  
  if (text.length > 12) {
    return rounded.toPrecision(8);
  }
  return text;
}

function doMath(num1, num2, treat) {
  if (treat === "latte") {
    return num1 + num2; 
  }
  if (treat === "matcha") {
    return num1 - num2; 
  }
  if (treat === "cupcake") {
    return num1 * num2; 
  }
  // Berry is Divide (/)
  if (num2 === 0) {
    return NaN; 
  }
  return num1 / num2;
}
function updateScreen() {
  if (displayElement) {
    displayElement.innerText = currentNumber;
  }
  drawReceipt();
}
function drawReceipt() {
  if (!receiptContainer) return;

  if (!currentReceipt) {
    receiptContainer.innerHTML = "";
    return;
  }
  const itemsHtml = currentReceipt.items
    .map(
      (item) => `
    <div class="flex-between">
      <span>${item.name}</span>
      <span>${item.value}</span>
    </div>
  `
    )
    .join("");

  receiptContainer.innerHTML = `
    <div class="receipt-paper">
      <div style="text-align: center; font-weight: bold; font-family: var(--font-display);">— Mochi Math Café —</div>
      <div class="dashed-line"></div>
      ${itemsHtml}
      <div class="dashed-line"></div>
      <div class="flex-between font-bold">
        <span>Total</span>
        <span>${currentReceipt.total}</span>
      </div>
    </div>
  `;
}

function clickDigit(digit) {
  if (justServed) {
    currentNumber = digit;
    firstNumber = null;
    selectedTreat = null;
    currentReceipt = null;
    justServed = false;
    startNewNumber = false;
    updateScreen();
    return;
  }

  if (startNewNumber) {
    currentNumber = digit;
    startNewNumber = false;
    updateScreen();
    return;
  }

  if (currentNumber === "0") {
    currentNumber = digit;
  } else if (currentNumber.length < 12) {
    currentNumber = currentNumber + digit;
  }
  updateScreen();
}

function clickDot() {
  if (justServed) {
    currentNumber = "0.";
    currentReceipt = null;
    firstNumber = null;
    selectedTreat = null;
    justServed = false;
    startNewNumber = false;
    updateScreen();
    return;
  }

  if (startNewNumber) {
    currentNumber = "0.";
    startNewNumber = false;
    updateScreen();
    return;
  }
  if (!currentNumber.includes(".")) {
    currentNumber = currentNumber + ".";
  }
  updateScreen();
}
function clickBackspace() {
  if (startNewNumber || justServed) return;

  // If there's only 1 character left, set it to 0
  if (currentNumber.length <= 1 || (currentNumber.length === 2 && currentNumber.startsWith("-"))) {
    currentNumber = "0";
  } else {
    currentNumber = currentNumber.slice(0, -1);
  }
  updateScreen();
}

function clickOperator(treatName) {
  const numValue = parseFloat(currentNumber);

  if (firstNumber === null) {
    firstNumber = numValue;
  } else if (!startNewNumber) {
    const result = doMath(firstNumber, numValue, selectedTreat ?? "latte");
    firstNumber = result;
    currentNumber = makeNumberLookNice(result);
  }

  selectedTreat = treatName;
  startNewNumber = true;
  justServed = false;
  updateScreen();
}

function clickClear() {
  currentNumber = "0";
  firstNumber = null;
  selectedTreat = null;
  currentReceipt = null;
  startNewNumber = false;
  justServed = false;
  updateScreen();
}

function clickServe() {
  if (firstNumber === null || selectedTreat === null) {
    return;
  }

  const secondNumber = parseFloat(currentNumber);
  const result = doMath(firstNumber, secondNumber, selectedTreat);

  if (!Number.isFinite(result)) {
    currentReceipt = null;
    updateScreen();
    return;
  }

  currentReceipt = {
    items: [{ name: "Order", value: makeNumberLookNice(secondNumber) }],
    total: makeNumberLookNice(result),
  };
  currentNumber = makeNumberLookNice(result);
  firstNumber = null;
  selectedTreat = null;
  justServed = true;
  startNewNumber = false;
  updateScreen();
}


document.querySelectorAll(".btn-digit").forEach((button) => {
  button.addEventListener("click", () => {
    clickDigit(button.getAttribute("data-digit"));
  });
});

if (clearButton) clearButton.addEventListener("click", clickClear);
if (backspaceButton) backspaceButton.addEventListener("click", clickBackspace);
if (dotButton) dotButton.addEventListener("click", clickDot);
if (serveHeartButton) serveHeartButton.addEventListener("click", clickServe);
if (serveLargeButton) serveLargeButton.addEventListener("click", clickServe);

const opBerry = document.getElementById("btn-op-berry");
const opCupcake = document.getElementById("btn-op-cupcake");
const opMatcha = document.getElementById("btn-op-matcha");
const opLatte = document.getElementById("btn-op-latte");

if (opBerry) opBerry.addEventListener("click", () => clickOperator("berry"));
if (opCupcake) opCupcake.addEventListener("click", () => clickOperator("cupcake"));
if (opMatcha) opMatcha.addEventListener("click", () => clickOperator("matcha"));
if (opLatte) opLatte.addEventListener("click", () => clickOperator("latte"));


function createSparkles() {
  const container = document.getElementById("sparkles-container");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "absolute text-yellow-400 pointer-events-none";
    sparkle.innerText = "✦";

    const top = 10 + Math.random() * 80;
    const left = 10 + Math.random() * 80;
    const size = 8 + Math.round(Math.random() * 10);
    const delay = (Math.random() * 4).toFixed(2);

    sparkle.style.top = `${top}%`;
    sparkle.style.left = `${left}%`;
    sparkle.style.fontSize = `${size}px`;
    sparkle.style.animation = "mm-sparkle 5s ease-in-out infinite";
    sparkle.style.animationDelay = `${delay}s`;

    container.appendChild(sparkle);
  }
}
createSparkles();
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    clickDigit(key);
  } else if (key === ".") {
    clickDot();
  } else if (key === "Backspace") {
    clickBackspace();
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    clickClear();
  } else if (key === "+") {
    clickOperator("latte");
  } else if (key === "-") {
    clickOperator("matcha");
  } else if (key === "*") {
    clickOperator("cupcake");
  } else if (key === "/") {
    event.preventDefault(); // Prevent standard browser search overlay
    clickOperator("berry");
  } else if (key === "Enter" || key === "=") {
    clickServe();
  }
});
