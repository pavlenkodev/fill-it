/* =========================
   RUNTIME OPTIONS
========================= */

let RUNTIME_OPTIONS = {
  onlyRequired: false,
  skipFilled: true
};

const SETTINGS = {
  CHECK_NEW_FIELDS: true,
  MAX_PASSES: 2
};

/* =========================
   ENTRY POINT
========================= */

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "FILL_FORM") {
    RUNTIME_OPTIONS = {
      ...RUNTIME_OPTIONS,
      ...(message.options || {})
    };
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
  ).filter(field => {
    if (field.disabled || field.offsetParent === null) {
      return false;
    }

    // N2O select и Zireael date — readonly по дизайну, их нельзя пропускать
    if (field.readOnly && !isN2OSelect(field) && !isN2OMultiSelect(field) && !isZiraelDateInput(field) && !isZiraelDateTimeInput(field)) {
      return false;
    }

    if (RUNTIME_OPTIONS.onlyRequired) {
      return (
        field.required ||
        field.getAttribute("aria-required") === "true" ||
        field.closest(".zireael-field_required")
      );
    }

    return true;
  });

  for (const field of fields) {
    try {
      if (RUNTIME_OPTIONS.skipFilled && isFieldFilled(field)) continue;

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
    return field.value && field.value.trim() !== "";
  }

  if (isN2OSelect(field)) {
    return field.value && field.value.trim() !== "";
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

  if (isZiraelDateTimeInput(field)) {
    fillZiraelDateTimeInput(field);
    return;
  }

  if (isZiraelDateInput(field)) {
    fillZiraelDateInput(field);
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
   N2O SELECT (SINGLE)
========================= */

function isN2OSelect(field) {
  return (
    field.tagName === "INPUT" &&
    field.classList.contains("n2o-inp") &&
    field.closest(".egisz-select-wrapper")
  );
}

async function fillN2OSelect(input) {
  const wrapper = input.closest(".egisz-select-wrapper");
  if (!wrapper) return;

  // Кликаем по toggle-кнопке чтобы открыть дропдаун
  const toggle = wrapper.querySelector(".n2o-input-select__toggle");
  if (!toggle) return;

  simulateClick(toggle);
  await delay(500);

  // Находим меню и кликаем первую опцию
  const menu = wrapper.querySelector(".n2o-input-select__menu");
  if (!menu) return;

  const option = menu.querySelector("button.dropdown-item");
  if (option) {
    simulateClick(option);
    await delay(200);
  }
}

/* =========================
   N2O MULTI SELECT
========================= */

function isN2OMultiSelect(field) {
  return (
    field.tagName === "TEXTAREA" &&
    field.classList.contains("n2o-inp--multi") &&
    field.closest(".egisz-select-wrapper")
  );
}

async function fillN2OMultiSelect(input) {
  const wrapper = input.closest(".egisz-select-wrapper");
  if (!wrapper) return;

  const toggle = wrapper.querySelector(".n2o-input-select__toggle");
  if (!toggle) return;

  simulateClick(toggle);
  await delay(500);

  const menu = wrapper.querySelector(".n2o-input-select__menu");
  if (!menu) return;

  const option = menu.querySelector("button.dropdown-item");
  if (option) {
    simulateClick(option);
    await delay(200);
  }

  // Закрываем дропдаун повторным кликом по toggle
  simulateClick(toggle);
  await delay(200);
}

/* =========================
   CHECKBOX / RADIO
========================= */

function isN2OCheckbox(field) {
  return field.type === "checkbox" && field.closest(".zireael-checkbox");
}

function fillN2OCheckbox(field) {
  const label = field.closest("label.zireael-checkbox");
  if (!label) return;

  if (label.classList.contains("zireael-checkbox_unchecked")) {
    label.click();
  }
}

function fillN2ORadioGroup(group) {
  const options = group.querySelectorAll("label.zireael-radio");
  if (options.length > 0) options[0].click();
}

/* =========================
   NUMBER
========================= */

function isN2ONumberField(field) {
  return field.tagName === "INPUT" && field.closest(".n2o-input-number");
}

function fillN2ONumberField(field) {
  simulateTyping(field, String(randomInt(1, 20)));
}

/* =========================
   ZIREAEL DATE PICKER
========================= */

function isZiraelDateTimeInput(field) {
  return (
    field.tagName === "INPUT" &&
    field.classList.contains("zireael-input") &&
    field.closest(".zireael-datepicker")
  );
}

function fillZiraelDateTimeInput(field) {
  const date = generateRandomDate();
  const hh = String(randomInt(8, 20)).padStart(2, "0");
  const mm = String(randomInt(0, 59)).padStart(2, "0");
  const ss = String(randomInt(0, 59)).padStart(2, "0");
  const value = `${date} ${hh}:${mm}:${ss}`;

  field.focus();

  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  nativeSetter.call(field, value);

  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  field.blur();
}

function isZiraelDateInput(field) {
  return (
    field.tagName === "INPUT" &&
    field.classList.contains("zireael-input") &&
    field.closest(".zireael-date-range-picker")
  );
}

function fillZiraelDateInput(field) {
  const date = generateRandomDate();
  const value = date + " — " + date;

  field.focus();

  // Используем нативный setter для совместимости с React
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  nativeSetter.call(field, value);

  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  field.blur();
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

function simulateClick(el) {
  el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
  el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

function closeOpenDropdown() {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", keyCode: 27, bubbles: true }));
}

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
