// --- CALCULATOR VARIABLES (These keep track of our math!) ---

// This is the number currently shown on our cute calculator screen
let currentNumber = "0";

// This stores the first number when you want to do a math sum, like 5 + 3. (5 is the first number!)
let firstNumber = null;

// This stores the sweet treat operation we want to do (+, -, *, /)
let selectedTreat = null;

// If we just clicked a treat button (like ☕ Latte +), the next number we click should start fresh
let startNewNumber = false;

// If we just clicked the serve button, we are showing the result!
let justServed = false;

// This will store our order receipt so we can print it
let currentReceipt = null;

// --- DOM ELEMENTS (These connect our JavaScript to our HTML page!) ---
const displayElement = document.getElementById("calc-display");
const receiptContainer = document.getElementById("receipt-container");
const clearButton = document.getElementById("btn-clear");
const backspaceButton = document.getElementById("btn-backspace");
const dotButton = document.getElementById("btn-dot");
const serveHeartButton = document.getElementById("btn-serve-heart");
const serveLargeButton = document.getElementById("btn-serve-large");

// --- HELPER FUNCTIONS ---

// This function makes numbers look nice on the screen!
// If it's too long, it rounds it up. If you divide by zero, it says "oops"!
function makeNumberLookNice(num) {
  if (!Number.isFinite(num)) {
    return "oops";
  }
  // Round to 5 decimal places so it fits nicely
  const rounded = Math.round(num * 100000) / 100000;
  const text = String(rounded);
  
  // If the number is too long, we make it fit
  if (text.length > 12) {
    return rounded.toPrecision(8);
  }
  return text;
}

// This function does the actual math when you choose a treat!
function doMath(num1, num2, treat) {
  if (treat === "latte") {
    return num1 + num2; // Latte is Plus (+)
  }
  if (treat === "matcha") {
    return num1 - num2; // Matcha is Minus (-)
  }
  if (treat === "cupcake") {
    return num1 * num2; // Cupcake is Multiply (*)
  }
  // Berry is Divide (/)
  if (num2 === 0) {
    return NaN; // Can't divide by zero!
  }
  return num1 / num2;
}

// This function updates what you see on the screen and prints the receipt
function updateScreen() {
  if (displayElement) {
    displayElement.innerText = currentNumber;
  }
  drawReceipt();
}

// This function prints out our receipt paper!
function drawReceipt() {
  if (!receiptContainer) return;

  // If there is no receipt to show, keep it hidden
  if (!currentReceipt) {
    receiptContainer.innerHTML = "";
    return;
  }

  // Generate the HTML for our items
  const itemsHtml = currentReceipt.items
    .map(
      (item) => `
    <div class="flex justify-between">
      <span>${item.name}</span>
      <span>${item.value}</span>
    </div>
  `
    )
    .join("");

  // Insert the receipt paper layout into our container
  receiptContainer.innerHTML = `
    <div class="receipt-paper mt-6 text-sm leading-6">
      <div class="text-center font-display text-base font-bold">— Mochi Math Café —</div>
      <div class="my-2 border-t border-dashed border-cocoa/30"></div>
      ${itemsHtml}
      <div class="my-2 border-t border-dashed border-cocoa/30"></div>
      <div class="flex justify-between font-bold">
        <span>Total</span>
        <span>${currentReceipt.total}</span>
      </div>
    </div>
  `;
}

// --- BUTTON CLICK HANDLERS ---

// When you click a number button (0-9)
function clickDigit(digit) {
  // If we just clicked "Serve", start a whole new calculation!
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

  // If we just clicked an operator (like +), clear screen to type the second number
  if (startNewNumber) {
    currentNumber = digit;
    startNewNumber = false;
    updateScreen();
    return;
  }

  // If screen shows 0, replace it. Otherwise, add the digit to the end
  if (currentNumber === "0") {
    currentNumber = digit;
  } else if (currentNumber.length < 12) {
    currentNumber = currentNumber + digit;
  }
  updateScreen();
}

// When you click the dot (.) button
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

  // Only add a dot if there isn't one already!
  if (!currentNumber.includes(".")) {
    currentNumber = currentNumber + ".";
  }
  updateScreen();
}

// When you click the backspace (⌫) button
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

// When you click a treat operator (☕, 🍵, 🧁, 🍓)
function clickOperator(treatName) {
  const numValue = parseFloat(currentNumber);

  if (firstNumber === null) {
    firstNumber = numValue;
  } else if (!startNewNumber) {
    // If we already typed two numbers, calculate the result first!
    const result = doMath(firstNumber, numValue, selectedTreat ?? "latte");
    firstNumber = result;
    currentNumber = makeNumberLookNice(result);
  }

  selectedTreat = treatName;
  startNewNumber = true;
  justServed = false;
  updateScreen();
}

// When you click the AC button (All Clear!)
function clickClear() {
  currentNumber = "0";
  firstNumber = null;
  selectedTreat = null;
  currentReceipt = null;
  startNewNumber = false;
  justServed = false;
  updateScreen();
}

// When you click the Serve button (equals!)
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

  // Print receipt!
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

// --- CONNECTING EVENTS TO BUTTONS ---

// Loop through all number buttons and listen for clicks!
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

// Treat buttons connections
const opBerry = document.getElementById("btn-op-berry");
const opCupcake = document.getElementById("btn-op-cupcake");
const opMatcha = document.getElementById("btn-op-matcha");
const opLatte = document.getElementById("btn-op-latte");

if (opBerry) opBerry.addEventListener("click", () => clickOperator("berry"));
if (opCupcake) opCupcake.addEventListener("click", () => clickOperator("cupcake"));
if (opMatcha) opMatcha.addEventListener("click", () => clickOperator("matcha"));
if (opLatte) opLatte.addEventListener("click", () => clickOperator("latte"));

// --- DYNAMIC SPARKLES EFFECT ---
// This places cute sparkling stars around the screen
function createSparkles() {
  const container = document.getElementById("sparkles-container");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "absolute text-yellow-400 pointer-events-none";
    sparkle.innerText = "✦";

    // Place them randomly
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

// Make sparkles when the page starts!
createSparkles();

// --- KEYBOARD SUPPORT ---
// Let's also listen to the computer keys!
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
