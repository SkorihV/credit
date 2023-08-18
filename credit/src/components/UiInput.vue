<script setup>
import {
  onMounted,
  ref,
  watch,
  computed,
} from "vue";


import {checkedValueOnVoid} from "@/servises/UtilityServices";

// import { REGEXP_SPACES } from "@/constants/regexp";



const emits = defineEmits(["changedValue"]);
const props = defineProps({
  /**
   * данные для инпута
   */
  inputValue: {
    type: [Number, String],
    default: null,
  },
  /**
   * единицы измерения
   */
  unit: {
    type: String,
  },
  /**
   * отобразить элементы управления
   */
  controls: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   * шаг при нажатии на + / -
   */
  step: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   * Включить кратность шага для поля ввода
   */
  discreteStep: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   * Тип данных разрешенный вводить в поле
   * onlyNumber
   * onlyInteger
   */
  dataType: {
    type: String,
    default: "onlyNumber",
    validator(value) {
      return value === "onlyInteger" || value === "onlyNumber"
    }
  },
  /**
   * заголовок
   */
  label: {
    type: String,
    default: "",
  },
  min: {
    type: [Number, String],
    default: 0,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  max: {
    type: [Number, String],
    default: 10,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
});

const inputFocus = ref(false);
const focusTimerName = ref(null);
const localInputBufferValue = ref(null);
const localInputValue = ref(null);
const nameTimer = ref(null);



const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
});

const onlyNumberValue = computed(() => {
  return props.dataType === "onlyNumber";
});

const onlyIntegerValue = computed(() => {
  return props.dataType === "onlyInteger";
});

const localMax = computed(() => {
  return checkedValueOnVoid(props.max)
    ? Number(props.max)
    : null;
});

const localMin = computed(() => {
  return checkedValueOnVoid(props.min)
    ? Number(props.min)
    : null;
});

const localStep = computed(() => {
  return checkedValueOnVoid(props.step) ? Number(props.step) : 1;
});

const showControlsButton = computed(() => {
  return props.controls
});


const resultValue = computed(() => {
  return resultWitchNumberValid();
});

const valueIsNaN = computed(() => {
  return isNaN(parseFloat(localInputValue.value));
});

const isDisabledMin = computed(() => {
  return resultValue.value <= localMin.value;
});

const isDisabledMax = computed(() => {
  return resultValue.value >= localMax.value;
});

const isErrorNumber = computed(() => {
  return (
    valueIsNaN.value &&
    localInputValue.value?.toString()?.length
  );
});

const errorNumberText = computed(() => {
  return isErrorNumber.value ? "Только числа!" : null;
});


const isErrorMax = computed(() => {
  return (
    !valueIsNaN.value &&
    localMax.value !== null &&
    parseFloat(localInputValue.value) > localMax.value
  );
});

const errorMaxText = computed(() => {
  return localMax.value !== null &&
    !valueIsNaN.value &&
    parseFloat(localInputValue.value) > localMax.value
    ? `Максимальное значение ${localMax.value}`
    : null;
});

const isErrorMin = computed(() => {
  return (
    !valueIsNaN.value &&
    localMin.value !== null &&
    parseFloat(localInputValue.value) < localMin.value
  );
});

const errorMinText = computed(() => {
  return localMin.value !== null &&
    !valueIsNaN.value &&
    parseFloat(localInputValue.value) < localMin.value
    ? `Минимальное значение ${localMin.value}`
    : null;
});

const tooltipError = computed(() => {
  if (isErrorNumber.value) {
    return { error: isErrorNumber.value, errorText: errorNumberText.value };
  } else if (isErrorMax.value) {
    return { error: isErrorMax.value, errorText: errorMaxText.value };
  } else if (isErrorMin.value) {
    return { error: isErrorMin.value, errorText: errorMinText.value };
  } else {
    return false;
  }
});

const isErrorClass = computed(() => {
  return tooltipError.value?.error
});

const isErrorEmpty = computed(() => {
  return !localInputValue.value?.toString().length;
});

const needFixedResult = computed(() => {
  return Boolean(
    (props.discreteStep || props.controls) && onlyIntegerValue.value
  );
});

const numberSignsAfterComma = computed(() => {
  return props.step.toString().includes(".") && needFixedResult.value
    ? props.step.toString().split(".").pop().length
    : 0;
});


watch(inputFocus, (isFocus) => {
  if (!isFocus) {
    changeValue("notFocus");
    clearTimeout(focusTimerName.value);
  }
});

watch(localInputBufferValue, (newValue) => {
  localInputValue.value = parseFloat(
    newValue?.toString().replaceAll(/\s/g, "").replaceAll(/,/g, ".")
  );
  clearTimeout(focusTimerName.value);
  focusTimerName.value = setTimeout(() => {
    if (inputFocus.value) {
      setTimeout(() => (inputFocus.value = true), 1000);
    }
    inputFocus.value = false;
  }, 3000);
});

function resultWitchNumberValid() {
  try {
    clearTimer(nameTimer.value);
    localInputValue.value = parseFloat(
      localInputValue.value
        ?.toString()
        .replaceAll(/\s/g, "")
        .replaceAll(/,/g, ".")
    );

    if (
      localInputValue.value?.toString().slice(-1) === "." ||
      localInputValue.value?.toString().slice(0) === "-"
    ) {
      return localInputValue.value;
    }

    if (isErrorNumber.value || isErrorEmpty.value) {
      resetNumberValue();
      return null;
    }

    if (isErrorMin.value) {
      resetNumberValue();
    }

    if (isErrorMax.value) {
      changeValueWitchTimer(localMax.value);
    }

    if (props.discreteStep) {
      localInputValue.value =
        Math.round(parseFloat(localInputValue.value) / props.step) * props.step;
    } else {
      localInputValue.value = parseFloat(localInputValue.value);
    }

    if (valueIsNaN.value) {
      localInputValue.value = "";
    }

    if (onlyIntegerValue.value) {
      localInputValue.value = !valueIsNaN.value
        ? parseInt(localInputValue.value)
        : null;
    }

    localInputValue.value = updateValueAfterSignComma(localInputValue.value);

    if (!inputFocus.value) {
      addLocalInputBufferValue(localInputValue.value);
    }

    return localInputValue.value;
  } catch (e) {
    console.error(e.message);
  }
}
function changeValue(eventType = "input") {
  emits('changedValue', resultValue.value)
}

function changeValueWitchTimer(value) {
  nameTimer.value = setTimeout(() => {
    localInputValue.value = value;
    changeValue("timer");
  }, 2000);
}

function clearTimer(name) {
  if (name) clearTimeout(name);
}

function plus(payload) {
  if (valueIsNaN.value) {
    resetNumberValue();
  }

  let value = parseFloat(localInputValue.value) + localStep.value;

  if (checkedValueOnVoid(localMax.value)) {
    value = value <= localMax.value ? value : localMax.value;
  }

  value = updateValueAfterSignComma(value);

  localInputValue.value = value;
  addLocalInputBufferValue(value);
  if (payload !== "key") {
    changeValue("plus");
  }
}
function minus(payload) {
  if (valueIsNaN.value) {
    resetNumberValue();
  }

  let value = parseFloat(localInputValue.value) - localStep.value;

  if (checkedValueOnVoid(localMin.value)) {
    value = value >= localMin.value ? value : localMin.value;
  }
  value = updateValueAfterSignComma(value);
  localInputValue.value = value;
  addLocalInputBufferValue(value);
  if (payload !== "key") {
    changeValue("minus");
  }
}

function updateValueAfterSignComma(value) {
  return needFixedResult.value
    ? parseFloat(value.toFixed(numberSignsAfterComma.value))
    : value;
}

function resetNumberValue() {
  changeValueWitchTimer(localMin.value || 0);
}


function addLocalInputBufferValue(value) {
  localInputBufferValue.value = value.toLocaleString("ru-RU", {
    useGrouping: true,
    maximumFractionDigits: 5,
  });
}

onMounted(() => {
  if (localMin.value > Number(props.inputValue)) {
    localInputValue.value = localMin.value;
    changeValue("mounted");
  } else if (localMax.value < Number(props.inputValue)) {
    localInputValue.value = localMax.value;
    changeValue("mounted");
  } else {
    localInputValue.value = props.inputValue;
    changeValue("mounted");
  }
});

</script>

<template>
  <div
    class="calc__wrapper-group-data"
  >
    <div
      class="calc__input-wrapper"
    >
      <div class="calc__input-label-text" v-if="isExistLabel">
        {{ label }}
      </div>
      <div class="calc__input-wrapper-data">
        <div
          class="calc__input-buttons-minus"
          :class="{ disabled: isDisabledMin }"
          v-if="showControlsButton"
          @click="minus"
        >
          -
        </div>
        <input
          ref="trueInput"
          type="text"
          v-model.number="localInputBufferValue"
          @keydown.up="plus('key')"
          @keydown.down="minus('key')"
          @blur="inputFocus ? (inputFocus = false) : null"
          @focus="inputFocus = true"
          class="calc__input-item"
          :class="{
            error: isErrorClass,
          }"
          autocomplete="off"
        />
        <div
          class="calc__input-buttons-plus"
          :class="{ disabled: isDisabledMax }"
          v-if="showControlsButton"
          @click="plus"
        >
          +
        </div>
        <div v-if="unit?.length" class="calc__input-unit">{{ unit }}</div>
      </div>
    </div>
  </div>
</template>
