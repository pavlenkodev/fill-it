// generators/name.js

function generateFirstName() {
  var firstNames = [
    "Иван",
    "Пётр",
    "Алексей",
    "Мария",
    "Екатерина",
    "Сергей",
    "Анна"
  ];
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

function generateLastName() {
  var lastNames = [
    "Иванов",
    "Петров",
    "Сидоров",
    "Кузнецов",
    "Смирнов",
    "Васильев",
    "Фёдоров"
  ];
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

function generatePatronymic() {
  // Простейший генератор отчеств для мужских имён
  var patronymics = [
    "Иванович",
    "Петрович",
    "Фёдорович",
    "Сергеевич",
    "Алексеевич",
    "Андреевич",
    "Дмитриевич"
  ];
  return patronymics[Math.floor(Math.random() * patronymics.length)];
}

function generateFullName() {
  return generateLastName() + " " + generateFirstName();
}
