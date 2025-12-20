// generators/phone.js

function generatePhone() {
  // Формат: +7 900 123-45-67
  var parts = [];

  var operator = 900 + Math.floor(Math.random() * 100); // 900-999
  var p1 = 100 + Math.floor(Math.random() * 900); // 100-999
  var p2 = 10 + Math.floor(Math.random() * 90); // 10-99
  var p3 = 10 + Math.floor(Math.random() * 90); // 10-99

  return "+7 " + operator + " " + p1 + "-" + p2 + "-" + p3;
}
