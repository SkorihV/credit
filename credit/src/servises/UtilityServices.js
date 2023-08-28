/**
 *
 * @param value
 * @param exp
 * @param type
 * @returns {*|number|null}
 */
const decimalAdjust = function (value, exp = 0, type = "round") {
  if (typeof exp === "undefined" || +exp === 0) {
    try {
      return Math[type](value);
    } catch (e) {
      console.error(`Функции вида "${type}" - не существует ${e.message}`);
      return value;
    }
  }
  value = +value;
  exp = +exp;
  // Если значение не является числом, либо степень не является целым числом...
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return null;
  }
  // Сдвиг разрядов
  value = value.toString().split("e");
  value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  // Обратный сдвиг
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
};

/**
 *
 * @param value
 * @returns {boolean}
 */
const checkedValueOnVoid = (value) => {
  return value?.length !== 0 && value !== undefined && value !== null;
};

/**
 * приводим число к кратному например 60
 * @param originalNumber
 * @param multiple
 * @returns {*}
 */
function makeMultiple(originalNumber, multiple) {
  if (multiple === 0) {
    throw new Error("Multiple cannot be zero");
  }

  const remainder = originalNumber % multiple;
  return originalNumber - remainder + multiple;
}

/**
 * отрезаем количество знаков после запятой указываем сотни
 * @param value
 * @param factor
 * @returns {number}
 */
function aroundCeil(value, factor = 1) {
  return Math.ceil(value * factor) / factor;
}

/**
 *
 * @param value
 * @returns {string|*}
 */
function splitNumberIntoHundreds(value) {
  return  value ? value.toLocaleString("ru-RU", {
        useGrouping: true,
        maximumFractionDigits: 5,
      })
      : value
}



export {
  decimalAdjust,
  checkedValueOnVoid,
  makeMultiple,
  aroundCeil,
  splitNumberIntoHundreds
};
