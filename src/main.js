
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
  // Round to 5 decimal places so it fits nicely
  const rounded = Math.round(num * 100000) / 100000;
  const text = String(rounded);
  
  // If the number is too long, we make it fit
  if (text.length > 12) {
    return rounded.toPrecision(8);
  }
  return text;
}

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

function changeCatCheeks(treat) {
  const blushLeft = document.querySelector(".cat-blush-left");
  const blushRight = document.querySelector(".cat-blush-right");
  if (!blushLeft || !blushRight) return;

  if (treat === "latte") {
    // Latte is coffee color!
    blushLeft.style.background = "#d2b48c";
    blushRight.style.background = "#d2b48c";
  } else if (treat === "matcha") {
    // Matcha is soft green!
    blushLeft.style.background = "#a3e4d7";
    blushRight.style.background = "#a3e4d7";
  } else if (treat === "cupcake") {
    // Cupcake is strawberry pink!
    blushLeft.style.background = "#ffb8c6";
    blushRight.style.background = "#ffb8c6";
  } else if (treat === "berry") {
    // Berry is red!
    blushLeft.style.background = "#ff8a8a";
    blushRight.style.background = "#ff8a8a";
  } else {
    // Default cheeks are cute pastel pink
    blushLeft.style.background = "rgba(255, 209, 220, 0.85)";
    blushRight.style.background = "rgba(255, 209, 220, 0.85)";
  }
}


function playPopSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // sine wave gives a sweet, clear tone
  oscillator.type = "sine";
  
  // Frequency slides down fast from 400Hz to 100Hz (creates the bubble "pop!")
  oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
  
  // Fade the volume down quickly
  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

// Plays a happy chirp sound when you pet the cat
function playChirpSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const audioCtx = new AudioContext();
  
  // Two quick tones in a row to sound like a happy chirp
  const tones = [500, 700];
  tones.forEach((frequency, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + (index * 0.08));
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime + (index * 0.08));
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (index * 0.08) + 0.08);
    
    osc.start(audioCtx.currentTime + (index * 0.08));
    osc.stop(audioCtx.currentTime + (index * 0.08) + 0.08);
  });
}


function spawnHeart(event) {
  if (!event || !event.clientX) return;

  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.innerText = "♥";

  heart.style.left = `${event.clientX}px`;
  heart.style.top = `${event.clientY}px`;

  const driftX = (Math.random() * 80 - 40).toFixed(0);
  heart.style.setProperty("--target-x", `${driftX}px`);

  document.body.appendChild(heart);

  // Remove the heart from the website once the float animation finishes
  setTimeout(() => {
    heart.remove();
  }, 800);
}

// --- BUTTON CLICK HANDLERS ---

// When you click a number button (0-9)
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
    const result = doMath(firstNumber, numValue, selectedTreat ?? "latte");
    firstNumber = result;
    currentNumber = makeNumberLookNice(result);
  }

  selectedTreat = treatName;
  startNewNumber = true;
  justServed = false;

  // Make cheeks match the selected treat color
  changeCatCheeks(treatName);

  updateScreen();
}

function clickClear() {
  currentNumber = "0";
  firstNumber = null;
  selectedTreat = null;
  currentReceipt = null;
  startNewNumber = false;
  justServed = false;

  changeCatCheeks(null);

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

  // Reset cheeks back to default pink after serving
  changeCatCheeks(null);

  updateScreen();
}


document.querySelectorAll(".cafe-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    playPopSound();
    spawnHeart(event);
  });
});

// Digits inputs
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

const catContainer = document.querySelector(".pixel-cat-container");
const speechBubble = document.getElementById("speech-bubble");
const catMouth = document.querySelector(".cat-mouth");
const blushLeft = document.querySelector(".cat-blush-left");
const blushRight = document.querySelector(".cat-blush-right");

if (catContainer) {
  catContainer.addEventListener("click", () => {
    playChirpSound();
    
    // Make cat happy face
    if (catMouth) catMouth.innerText = "▽";
    
    if (blushLeft) blushLeft.style.background = "#ff69b4";
    if (blushRight) blushRight.style.background = "#ff69b4";
    
    // Update speech bubble
    if (speechBubble) speechBubble.innerText = "Purr... happy math! ♡";
    
    // Reset cat face and bubble after 2 seconds
    setTimeout(() => {
      if (catMouth) catMouth.innerText = "w";
      if (speechBubble) speechBubble.innerText = "Let's make it sweet!";
      // Restore cheeks to current selected treat color (or default pink)
      changeCatCheeks(selectedTreat);
    }, 2000);
  });
}

// --- DYNAMIC SPARKLES EFFECT ---
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
    event.preventDefault(); 
    clickOperator("berry");
  } else if (key === "Enter" || key === "=") {
    clickServe();
  }
});
