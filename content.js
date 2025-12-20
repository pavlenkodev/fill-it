chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "FILL_FORM") {
    fillFormSequentially();
  }
});

/* =========================
   SEQUENTIAL FLOW
========================= */

async function fillFormSequentially() {
  const fields = Array.from(
    document.querySelectorAll("input, textarea, select")
  ).filter(f =>
    !f.disabled &&
    !f.readOnly &&
    f.offsetParent !== null
  );

  for (const field of fields) {
    try {
      await fillSingleField(field);
      await delay(300);
    } catch (e) {
      console.warn("Skip field:", field, e);
    }
  }
}

/* =========================
   FIELD ROUTER
========================= */

async function fillSingleField(field) {
  const meta = getFieldMeta(field);

  // 1️⃣ N2O MULTI SELECT
  if (isN2OMultiSelect(field)) {
    await fillN2OMultiSelect(field);
    return;
  }

  // 2️⃣ N2O SELECT
  if (isN2OSelect(field)) {
    await fillN2OSelect(field);
    return;
  }

  // 3️⃣ N2O RADIO / CHECKBOX GROUP
  const radioGroup = field.closest(".zireael-radio-group");
  if (radioGroup) {
    fillN2ORadioGroup(radioGroup);
    return;
  }

  // 4️⃣ N2O NUMBER
  if (isN2ONumberField(field)) {
    fillN2ONumberField(field);
    return;
  }

  // 5️⃣ DATE
  if (isDateField(meta)) {
    fillDateField(field);
    return;
  }

  // 6️⃣ NATIVE SELECT
  if (field.tagName === "SELECT") {
    fillNativeSelect(field);
    return;
  }

  // 7️⃣ REGULAR INPUT
  simulateTyping(field, generateValue(meta));
}

/* =========================
   N2O SELECT (SINGLE)
========================= */

function isN2OSelect(field) {
  return (
    field.tagName === "INPUT" &&
    field.classList.contains("zireael-input") &&
    field.closest(".zireael-input-select") &&
    !field.closest(".zireael-multiple-selector")
  );
}

async function fillN2OSelect(input) {
  input.focus();
  input.click();
  await delay(400);

  const dropdown = document.querySelector(
    ".zireael-dropdown-popover_opened .zireael-dropdown-options"
  );
  if (!dropdown) return;

  const option = dropdown.querySelector(".zireael-dropdown-option");
  if (option) option.click();
}

/* =========================
   N2O MULTI SELECT
========================= */

function isN2OMultiSelect(field) {
  return (
    field.tagName === "INPUT" &&
    field.classList.contains("zireael-input") &&
    field.closest(".zireael-multiple-selector")
  );
}

async function fillN2OMultiSelect(input) {
  const container = input.closest(".zireael-multiple-selector");
  if (!container) return;

  input.focus();
  input.click();
  await delay(400);

  const dropdown = document.querySelector(
    ".zireael-dropdown-popover_opened .zireael-dropdown-options"
  );
  if (!dropdown) return;

  const selectedLabels = Array.from(
    container.querySelectorAll(".zireael-tag__label")
  ).map(el => el.innerText.trim());

  const options = Array.from(
    dropdown.querySelectorAll(".zireael-dropdown-option")
  );

  let added = 0;
  for (const option of options) {
    const label = option.innerText.trim();
    if (!selectedLabels.includes(label)) {
      option.click();
      added++;
      await delay(200);
    }
    if (added >= 2) break;
  }
}

/* =========================
   N2O RADIO / CHECKBOX
========================= */

function fillN2ORadioGroup(group) {
  const options = group.querySelectorAll("label.zireael-radio");
  if (options.length > 0) {
    options[0].click();
  }
}

/* =========================
   N2O NUMBER INPUT
========================= */

function isN2ONumberField(field) {
  return (
    field.tagName === "INPUT" &&
    field.closest(".n2o-input-number")
  );
}

function fillN2ONumberField(field) {
  const min = field.min !== "" ? parseInt(field.min, 10) : 0;
  const max = field.max !== "" ? parseInt(field.max, 10) : min + 100;

  const value = randomInt(min, Math.min(max, min + 50));

  simulateTyping(field, String(value));
}

/* =========================
   META EXTRACTION
========================= */

function getFieldMeta(field) {
  const fieldBlock = field.closest(".zireael-field");

  const label =
    fieldBlock?.querySelector(".zireael-field__label")?.innerText ||
    field.getAttribute("aria-label") ||
    field.name ||
    field.id ||
    "";

  return [
    label,
    field.placeholder,
    field.name,
    field.id,
    field.className
  ]
    .join(" ")
    .toLowerCase();
}

/* =========================
   INPUT SIMULATION
========================= */

function simulateTyping(el, value) {
  if (!value) return;

  el.focus();
  el.value = "";
  el.dispatchEvent(new Event("input", { bubbles: true }));

  for (const char of value) {
    el.value += char;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.blur();
}

/* =========================
   VALUE GENERATION
========================= */

function generateValue(meta) {
  if (meta.includes("фам")) return generateLastName();
  if (meta.includes("имя")) return generateFirstName();
  if (meta.includes("отче")) return generatePatronymic();
  if (meta.includes("email")) return generateEmail();
  if (meta.includes("тел")) return generatePhone();
  if (meta.includes("snils") || meta.includes("снилс")) return generateSnils();
  return "Test value";
}

function generateFirstName() {
  return random(["Иван", "Пётр", "Алексей", "Дмитрий"]);
}

function generateLastName() {
  return random(["Иванов", "Петров", "Сидоров", "Смирнов"]);
}

function generatePatronymic() {
  return random(["Иванович", "Петрович", "Алексеевич"]);
}

function generateEmail() {
  return `test${Math.floor(Math.random() * 10000)}@gmail.com`;
}

function generatePhone() {
  return `+7${Math.floor(9000000000 + Math.random() * 999999999)}`;
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/* =========================
   SNILS
========================= */

function generateSnils() {
  const digits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );

  const sum = digits.reduce(
    (acc, d, i) => acc + d * (9 - i),
    0
  );

  let control;
  if (sum < 100) control = sum;
  else if (sum === 100 || sum === 101) control = 0;
  else control = sum % 101;

  return `${digits.slice(0,3).join("")}-${digits.slice(3,6).join("")}-${digits.slice(6).join("")} ${String(control).padStart(2,"0")}`;
}

/* =========================
   DATE
========================= */

function isDateField(meta) {
  return meta.includes("дата");
}

function fillDateField(field) {
  simulateTyping(field, generateRandomDate());
}

function generateRandomDate() {
  const start = new Date(1995, 11, 17);
  const end = new Date();
  const d = new Date(
    start.getTime() + Math.random() * (end - start)
  );

  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

/* =========================
   NATIVE SELECT
========================= */

function fillNativeSelect(select) {
  const options = Array.from(select.options).filter(o => o.value);
  if (options.length > 0) {
    select.value = options[0].value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

/* =========================
   UTILS
========================= */

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
