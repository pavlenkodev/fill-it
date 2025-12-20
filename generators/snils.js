// generators/snils.js

/**
 * Генерирует валидный СНИЛС в формате XXX-XXX-XXX YY.
 *
 * Алгоритм:
 * 1. Генерируем 9 цифр.
 * 2. Считаем сумму: цифра * вес (от 9 до 1).
 * 3. Если сумма < 100 → контрольное число = сумма.
 * 4. Если сумма == 100 или 101 → контрольное число = 00.
 * 5. Если сумма > 101 → контрольное число = (сумма % 101).
 * 6. Контрольное число всегда двухзначное.
 */
function generateSnils() {
  var digits = [];

  for (var i = 0; i < 9; i++) {
    // Первая цифра не должна быть 0 для реалистичности, но это не строго обязательно
    var d = Math.floor(Math.random() * 10);
    if (i === 0 && d === 0) {
      d = 1 + Math.floor(Math.random() * 9);
    }
    digits.push(d);
  }

  // Сумма: d1*9 + d2*8 + ... + d9*1
  var sum = 0;
  for (var j = 0; j < 9; j++) {
    var weight = 9 - j;
    sum += digits[j] * weight;
  }

  var control;
  if (sum < 100) {
    control = sum;
  } else if (sum === 100 || sum === 101) {
    control = 0;
  } else {
    var mod = sum % 101;
    if (mod === 100) {
      control = 0;
    } else {
      control = mod;
    }
  }

  var controlStr = control.toString();
  if (controlStr.length === 1) {
    controlStr = "0" + controlStr;
  }

  // Формат XXX-XXX-XXX
  var n1 = "" + digits[0] + digits[1] + digits[2];
  var n2 = "" + digits[3] + digits[4] + digits[5];
  var n3 = "" + digits[6] + digits[7] + digits[8];

  return n1 + "-" + n2 + "-" + n3 + " " + controlStr;
}
