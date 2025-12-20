/* =========================
   SETTINGS
========================= */

const SETTINGS = {
  SKIP_FILLED_FIELDS: true,
  CHECK_NEW_FIELDS: true,
  MAX_PASSES: 2
};

/* =========================
   ENTRY POINT
========================= */

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "FILL_FORM") {
    fillFormWithRecheck();
  }
});

/* =========================
   MAIN FLOW
========================= */

async function fillFormWithRecheck() {
  let pass = 0;
  while (pass < SETTINGS.MAX_PASSES) {
    const filled = await fillFormSequentially();
    if (!SETTINGS.CHECK_NEW_FIELDS || !filled) break;
    pass++;
  }
}

/* =========================
   SEQUENTIAL FILL
========================= */

async function fillFormSequentially() {
  let filledSomething = false;

  const fields = Array.from(
    document.querySelectorAll("input, textarea, select")
  ).filter(f =>
    !f.disabled &&
    !f.readOnly &&
    f.offsetParent !== null
  );

  for (const field of fields) {
    try {
      if (SETTINGS.SKIP_FILLED_FIELDS && isFieldFilled(field)) continue;
      await fillSingleField(field);
      filledSomething = true;
      await delay(300);
    } catch (e) {
      console.warn("Skip field:", field, e);
    }
  }

  return filledSomething;
}

/* =========================
   FILLED CHECK
========================= */

function isFieldFilled(field) {
  if (isN2OMultiSelect(field)) {
    return field.closest(".zireael-multiple-selector")
      ?.querySelector(".zireael-tag") !== null;
  }

  const radioGroup = field.closest(".zireael-radio-group");
  if (radioGroup) {
    return radioGroup.querySelector("input:checked") !== null;
  }

  const checkbox = field.closest(".zireael-checkbox");
  if (checkbox) {
    return checkbox.classList.contains("zireael-checkbox_checked");
  }

  return field.value && field.value.trim() !== "";
}

/* =========================
   FIELD ROUTER
========================= */

async function fillSingleField(field) {
  const meta = getFieldMeta(field);

  if (isN2OCheckbox(field)) {
    fillN2OCheckbox(field);
    return;
  }

  if (isN2OMultiSelect(field)) {
    await fillN2OMultiSelect(field);
    return;
  }

  if (isN2OSelect(field)) {
    await fillN2OSelect(field);
    return;
  }

  const radioGroup = field.closest(".zireael-radio-group");
  if (radioGroup) {
    fillN2ORadioGroup(radioGroup);
    return;
  }

  if (isN2ONumberField(field)) {
    fillN2ONumberField(field);
    return;
  }

  if (isDateField(meta)) {
    fillDateField(field);
    return;
  }

  if (field.tagName === "SELECT") {
    fillNativeSelect(field);
    return;
  }

  simulateTyping(field, generateValue(meta));
}

/* =========================
   N2O CHECKBOX
========================= */

function isN2OCheckbox(field) {
  return (
    field.type === "checkbox" &&
    field.closest(".zireael-checkbox")
  );
}

function fillN2OCheckbox(field) {
  const label = field.closest("label.zireael-checkbox");
  if (!label) return;

  if (label.classList.contains("zireael-checkbox_unchecked")) {
    label.click();
  }
}

/* =========================
   N2O SELECT / MULTI
========================= */

function isN2OSelect(field) {
  return field.tagName === "INPUT"
    && field.classList.contains("zireael-input")
    && field.closest(".zireael-input-select")
    && !field.closest(".zireael-multiple-selector");
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

function isN2OMultiSelect(field) {
  return field.tagName === "INPUT"
    && field.classList.contains("zireael-input")
    && field.closest(".zireael-multiple-selector");
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

  const selected = Array.from(
    container.querySelectorAll(".zireael-tag__label")
  ).map(e => e.innerText.trim());

  const options = dropdown.querySelectorAll(".zireael-dropdown-option");

  let added = 0;
  for (const opt of options) {
    if (!selected.includes(opt.innerText.trim())) {
      opt.click();
      added++;
      await delay(200);
    }
    if (added >= 2) break;
  }
}

/* =========================
   RADIO / NUMBER
========================= */

function fillN2ORadioGroup(group) {
  const options = group.querySelectorAll("label.zireael-radio");
  if (options.length > 0) options[0].click();
}

function isN2ONumberField(field) {
  return field.tagName === "INPUT" && field.closest(".n2o-input-number");
}

function fillN2ONumberField(field) {
  simulateTyping(field, String(randomInt(1, 20)));
}

/* =========================
   META / VALUES / DATE
========================= */

function getFieldMeta(field) {
  return field.closest(".zireael-field")
    ?.querySelector(".zireael-field__label")
    ?.innerText
    ?.toLowerCase() || "";
}

function generateValue(meta) {
  if (meta.includes("фам")) return random(["Иванов", "Петров"]);
  if (meta.includes("имя")) return random(["Иван", "Алексей"]);
  if (meta.includes("отче")) return random(["Иванович", "Петрович"]);
  if (meta.includes("снилс")) return generateSnils();
  if (meta.includes("email")) return `test${Date.now()}@mail.ru`;
  return "Test";
}

function isDateField(meta) {
  return meta.includes("дата");
}

function fillDateField(field) {
  simulateTyping(field, generateRandomDate());
}

/* =========================
   HELPERS
========================= */

function simulateTyping(el, value) {
  el.focus();
  el.value = "";
  el.dispatchEvent(new Event("input", { bubbles: true }));
  for (const c of value) {
    el.value += c;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.blur();
}

function generateRandomDate() {
  const start = new Date(1995, 11, 17);
  const d = new Date(start.getTime() + Math.random() * (Date.now() - start));
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function generateSnils() {
  const d = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const sum = d.reduce((a, v, i) => a + v * (9 - i), 0);
  const c = sum < 100 ? sum : sum % 101;
  return `${d.slice(0,3).join("")}-${d.slice(3,6).join("")}-${d.slice(6).join("")} ${String(c).padStart(2,"0")}`;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
