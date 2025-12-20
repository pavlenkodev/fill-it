// generators/date.js

function pad2(num) {
  return num < 10 ? "0" + num : String(num);
}

// Возвращает случайную дату в интервале [макс(сегодня - 2 года; 16.12.2023); сегодня]
function getRandomRecentDate() {
  var now = new Date();
  var twoYearsMs = 1000 * 60 * 60 * 24 * 365 * 2;
  var minBoundary = new Date(2023, 11, 16).getTime(); // 16.12.2023 (месяц 11)
  var minTime = Math.max(now.getTime() - twoYearsMs, minBoundary);
  var randomTime = minTime + Math.random() * (now.getTime() - minTime);
  return new Date(randomTime);
}

// Формат: YYYY-MM-DD (подходит для input[type="date"])
function generateDateOnly() {
  var d = getRandomRecentDate();
  var year = d.getFullYear();
  var month = pad2(d.getMonth() + 1);
  var day = pad2(d.getDate());
  return year + "-" + month + "-" + day;
}

// Формат: YYYY-MM-DDTHH:MM (для input[type="datetime-local"])
function generateDateTimeLocal() {
  var d = getRandomRecentDate();
  var year = d.getFullYear();
  var month = pad2(d.getMonth() + 1);
  var day = pad2(d.getDate());
  var hours = pad2(d.getHours());
  var minutes = pad2(d.getMinutes());
  return year + "-" + month + "-" + day + "T" + hours + ":" + minutes;
}

// Формат: DD.MM.YYYY (часто используют в текстовых полях)
function generateDateDisplay() {
  var d = getRandomRecentDate();
  var year = d.getFullYear();
  var month = pad2(d.getMonth() + 1);
  var day = pad2(d.getDate());
  return day + "." + month + "." + year;
}
