<script setup>

//https://mortgage-calculator.ru/%D1%84%D0%BE%D1%80%D0%BC%D1%83%D0%BB%D0%B0-%D1%80%D0%B0%D1%81%D1%87%D0%B5%D1%82%D0%B0-%D0%B8%D0%BF%D0%BE%D1%82%D0%B5%D0%BA%D0%B8/
//https://www.calc.ru/kreditnyi-kalkulyator.html
//https://calcus.ru/kalkulyator-ipoteki


import {ref, computed, reactive, watch} from 'vue'
import UiInput from "@/components/UiInput.vue";
import UiRadio from "@/components/UiRadio.vue";
import UiSelect from "@/components/UiSelect.vue";
import UiTableData from "@/components/UiTableData.vue";

import '@vuepic/vue-datepicker/dist/main.css'
import UiDatePicker from "@/components/UiDatePicker.vue";


const startCreditSum = ref(2000000) // сумма кредита
const firstPayment = ref(500000) // первоначальный взнос
const timeCredit = ref(20) // срок кредита в месяцах
const typeTime = ref('year') // тип времени
const interestRate = ref(9.6) //процентная ставка
const typeCredit = ref('A')  // тип расчета кредита
const dateTime = ref('') // дата первого платежа
const tableData = ref([])
const totalData = reactive({
  payLocal: 0,
  mainDebtLocal: 0,
  percentLocal: 0,
  balanceLocal: 0,

  get pay() {
    return this.payLocal
  },
  set pay(value) {
    this.payLocal = aroundCeil(value, 100)
  },
  get mainDebt() {
    return this.mainDebtLocal
  },
  set mainDebt(value) {
    this.mainDebtLocal = aroundCeil(value, 100)
  },
  get percent() {
    return this.percentLocal
  },
  set percent(value) {
    this.percentLocal = aroundCeil(value, 100)
  },
  get balance() {
    return this.balanceLocal
  },
  set balance(value) {
    this.balanceLocal = aroundCeil(value, 100)
  },

})

const radioDataTypeCredit = [
  {
    radioLabel: "аннуитетный",
    radioValue: "A"
  },
  {
    radioLabel: "дифференцированный",
    radioValue: "D"
  }
]

const selectDataTypeTime = [
  {
    selectLabel: "Год",
    selectValue: "year"
  },
  {
    selectLabel: "Месяц",
    selectValue: "month"
  }
]



/**
 * СРОК_ИПОТЕКИ_МЕСЯЦЕВ
 * срок кредита в месяцах
 * @type {ComputedRef<number>}
 */
const amountMonth = computed(() => {
    if (typeTime.value === "year") {
      return timeCredit.value * 12;
    }
    return timeCredit.value;
  })
/**
 * ЕЖЕМЕСЯЧНАЯ_СТАВКА = ПРОЦЕНТНАЯ_СТАВКА_ГОДОВЫХ / 12 / 100
 * ежемесячная процентная ставка по кредиту
 * @type {ComputedRef<number>}
 */
const monthRate = computed(() => {
  return interestRate.value / 12 / 100
})


/**
 * ОБЩАЯ_СТАВКА = (1 + ЕЖЕМЕСЯЧНАЯ_СТАВКА) ^ СРОК_ИПОТЕКИ_МЕСЯЦЕВ
 * @type {ComputedRef<number>}
 */
const totalRate = computed(() => {
  return aroundCeil(Math.pow( (1 + monthRate.value), amountMonth.value), 1000000)
})

/**
 * месячный платеж
 * @type {ComputedRef<number>}
 */
const annuityCoefficient = computed(() => {
  const top = totalRate.value * monthRate.value
  const bottom = totalRate.value - 1
  const result =  top / bottom
  return isNaN(result) ? 0 : result
})

/**
 * СУММА_КРЕДИТА
 * Сума кредита требуемая - первоначальная ставка.
 * @type {ComputedRef<number>}
 */
const computedStartCreditSum = computed(() => {
  return startCreditSum.value - firstPayment.value
})

/**
 * ЕЖЕМЕСЯЧНЫЙ_ПЛАТЕЖ = СУММА_КРЕДИТА * ЕЖЕМЕСЯЧНАЯ_СТАВКА * ОБЩАЯ_СТАВКА / (ОБЩАЯ_СТАВКА - 1)
 * сумма оплаты в месяц
 * @type {ComputedRef<number>}
 */
const monthlyPayment = computed(() => {
  return aroundCeil((computedStartCreditSum.value  * annuityCoefficient.value), 100)
})


/**
 * ОБЩАЯ_СУММА_КРЕДИТА = ЕЖЕМЕСЯЧНЫЙ_ПЛАТЕЖ * СРОК_ИПОТЕКИ_МЕСЯЦЕВ
 * общая сумма кредита (долг + проценты)
 * @type {ComputedRef<*>}
 */
const totalSumCredit = computed(() => {
    return aroundCeil(monthlyPayment.value * amountMonth.value);
  })

/**
 * ПЕРЕПЛАТА = ОБЩАЯ_СУММА_КРЕДИТА - СУММА_КРЕДИТА
 * сумма переплаты (начисленные проценты)
 * @type {ComputedRef<*>}
 */
const overpaymentAmount = computed(() => {
  return aroundCeil(totalData.pay - totalData.mainDebt, 100);
})

const localDateTime = computed(() => {
  if (!dateTime.value.length) {
    return Math.floor(Date.now())
  }
  let newDate = new Date(dateTime.value)
  return newDate.getTime()

})



watch([computedStartCreditSum, localDateTime, interestRate, typeCredit, amountMonth], () => {
  initCalculate()
})


function aroundCeil(value, factor = 1) {
  return Math.ceil(value * factor) / factor;
}



function initCalculate() {
  if (isNaN(monthlyPayment.value) && startCreditSum.value > firstPayment.value && monthRate.value && amountMonth.value){
    tableData.value = []
    return null;
  }
  tableData.value = []
  totalData.pay = 0;
  totalData.mainDebt = 0;
  totalData.balance = 0;
  totalData.percent = 0;


  let currentSumCredit = computedStartCreditSum.value
  let newLocalDateTime = localDateTime.value

  for (let i = 1; i <= amountMonth.value; i++) {
    let pay = 0
    let percent = 0
    let mainDebt = 0
    let balance = 0

    let date = new Date(newLocalDateTime)

    if (typeCredit.value === 'A') {
      pay = getPay(currentSumCredit)
      percent = getPercentPiece(currentSumCredit)
      mainDebt = getMainPiece(monthlyPayment.value, percent)
      currentSumCredit = aroundCeil(currentSumCredit - mainDebt, 100 )
      balance = currentSumCredit
      percent = balance === 0 && mainDebt > pay ? 0 : percent

    } else if (typeCredit.value === "D") {

      percent = getPercentPiece(currentSumCredit)
      mainDebt = getMonthlyDebtRepayment(currentSumCredit)
      pay = percent + mainDebt
      currentSumCredit = aroundCeil(currentSumCredit - mainDebt, 100 )
      balance = currentSumCredit
    }

    tableData.value.push({
      id: i,
      date: `${date.toLocaleString('default', { month: 'long' })}  ${date.getFullYear()} г`,
      pay,
      percent,
      mainDebt,
      balance
    })
    totalData.pay += pay
    totalData.mainDebt += mainDebt
    totalData.percent += percent
    date.setMonth(date.getMonth() + 1)
    newLocalDateTime = date.getTime()
  }
  totalData.balance = totalData.percent


}


/**
 * Расчет по аннуитетному варианту
 */
function calculateAnnuity() {
  let currentSumCredit = computedStartCreditSum.value

  for (let i = 1; i <= amountMonth.value; i++) {
    const pay = getPay(currentSumCredit)
    let percent = getPercentPiece(currentSumCredit)
    let mainDebt = getMainPiece(monthlyPayment.value, percent)
    currentSumCredit = aroundCeil(currentSumCredit - mainDebt, 100 )

    const balance = currentSumCredit
    percent = balance === 0 && mainDebt > pay ? 0 : percent

    tableData.value.push({
      id: i,
      date: i,
      pay,
      percent,
      mainDebt,
      balance
    })
    totalData.pay += pay
    totalData.mainDebt += mainDebt
    totalData.percent += percent

  }
  totalData.balance = totalData.percent
}

function calculateDifferentiated() {
  let currentSumCredit = computedStartCreditSum.value

  for (let i =1; i <= amountMonth.value; i++) {

    let percent = getPercentPiece(currentSumCredit)
    const mainDebt = getMonthlyDebtRepayment(currentSumCredit)
    const pay = percent + mainDebt
    currentSumCredit = aroundCeil(currentSumCredit - mainDebt, 100 )

    const balance = currentSumCredit

    tableData.value.push({
      id: i,
      date: i,
      pay,
      percent,
      mainDebt,
      balance
    })
    totalData.pay += pay
    totalData.mainDebt += mainDebt
    totalData.percent += percent

  }

  totalData.balance = totalData.percent
}



/**
 * ПРОЦЕНТНАЯ_ЧАСТЬ = ОСТАТОК_ДОЛГА * ЕЖЕМЕСЯЧНАЯ_СТАВКА
 * @param debtBalance
 */
function getPercentPiece(debtBalance) {
  return aroundCeil(debtBalance * monthRate.value, 100 );
}


/**
 * ОСНОВНАЯ_ЧАСТЬ = ЕЖЕМЕСЯЧНЫЙ_ПЛАТЕЖ - ПРОЦЕНТНАЯ_ЧАСТЬ
 */
function getMainPiece(monthlyPayment, percentPiece) {
  return aroundCeil(monthlyPayment - percentPiece, 100 )
}

function getPay(currentSumCredit) {
  return aroundCeil(monthlyPayment.value < currentSumCredit ? monthlyPayment.value : currentSumCredit, 100 )
}


/**
 * ЕЖЕМЕСЯЧНОЕ_ПОГАШЕНИЕ_ДОЛГА = СУММА_КРЕДИТА / СРОК_ИПОТЕКИ_МЕСЯЦЕВ
 * @param currentSumDebt
 * @returns {number}
 */
function getMonthlyDebtRepayment(currentSumDebt) {
  return aroundCeil(currentSumDebt / amountMonth.value, 100)
}


function aroundNumber(value, aroundNum) {
    return  Math.floor(value / aroundNum) * aroundNum
}


function changeSum (value) {
  startCreditSum.value = value
}
function changeFirstPayment (value) {
  firstPayment.value = value
}
function changeTimeCredit (value) {
  timeCredit.value = value
}
function changeInterestRate (value) {
  timeCredit.value = value
}
function changeTypeCredit (value) {
  typeCredit.value = value
}
function changeTypeTime (value) {
  typeTime.value = value
}


</script>


<template>
  <div class="credit__main-wrapper">
      <pre>
        Сумма кредита: {{computedStartCreditSum}}
        Ежемесячный платеж (аннуитет): {{monthlyPayment}}
        Переплата по кредиту: {{overpaymentAmount}}
        Общая выплата: {{totalData.pay}}
        {{localDateTime}}
      </pre>

    <div class="credit__data-wrapper">
      <UiInput
        label="Сумма кредита:"
        unit="руб"
        :controls="true"
        data-type="onlyInteger"
        :input-value="startCreditSum"
        :max="100000000"
        min="100"
        step="50"
        :discrete-step="false"
        @changed-value="changeSum"
      />
    </div>

    <div class="credit__data-wrapper">
      <UiInput
        label="Первоначальный взнос кредита:"
        unit="руб"
        :controls="true"
        data-type="onlyInteger"
        :input-value="firstPayment"
        :max="100000000"
        min="100"
        step="100"
        :discrete-step="true"
        @changed-value="changeFirstPayment"
      />
    </div>

    <div class="credit__data-wrapper">
      <UiInput
        label="Срок кредита:"
        :controls="true"
        data-type="onlyInteger"
        :input-value="timeCredit"
        :max="20"
        :min="1"
        :step="2"
        :discrete-step="true"
        @changed-value="changeTimeCredit"
      />
      <UiSelect
        :select-data="selectDataTypeTime"
        @changed-value="changeTypeTime"
      />
    </div>

    <div class="credit__data-wrapper">
      <UiInput
        label="Процентная ставка:"
        :controls="true"
        data-type="onlyNumber"
        :input-value="interestRate"
        :max="50"
        :min="0"
        :step="0.5"
        :discrete-step="false"
        unit="% годовых"
        @changed-value="changeInterestRate"
      />
    </div>

    <div class="credit__data-wrapper">
      <UiRadio
        label="Тип платежей:"
        :radioData="radioDataTypeCredit"
        @changed-value="changeTypeCredit"
      />
    </div>

    <div class="credit__data-wrapper">
      <UiDatePicker
        :date-time="localDateTime"
        label="Дата первого платежа:"
      />

<!--      <div class="credit__data-value">-->
<!--        <input type="date" v-model.trim="dateTime">-->
<!--      </div>-->
<!--      <div class="credit__unit"></div>-->
    </div>

    <UiTableData
      :table-data="tableData"
      :total-data="totalData"
    />

<!--    <PaymentSchedule-->
<!--      :start-credit__sum="startCreditSum"-->
<!--      :start-date="localDateTime"-->
<!--      :credit__term-month="amountMonth"-->
<!--      :monthly-payment="monthlyPayment"-->
<!--      :monthly-interest-rate="interestRate"-->
<!--      :type-current-calculation="typeCredit"-->
<!--    />-->
  </div>

</template>


<style lang="scss">

$c_base_title: #000000;
$c_base_error_color: #e80000;
$c_base_error_bg: #ffffff;
$c_base_error_border: #e80000;
$c_base_error_border_radius: 5px;
$c_base_error_border_width: 1px;

$c_base_button_text_color: #ffffff;
$c_base_button_text_color_hover: #ffffff;

$c_base_button_bg: #464657;
$c_base_button_bg_hover: #ff5e00;

$c_base_button_border: #464657;
$c_base_button_border_hover: #ff5e00;

$c_base_button_border_radius: 5px;
$c_base_button_border_width: 1px;



$c_decor_text_default: #000000;
$c_decor_text_hover: #ff5e00;
$c_decor_text_selected: #ffffff;

$c_decor_bg_color: #f9f9f9;
$c_decor_bg_color_hover: #f9f9f9;
$c_decor_bg_color_selected: #ff6531;

$c_decor_border_color: #cccccc;
$c_decor_border_color_hover: #ff6531;
$c_decor_border_color_selected: #ff6531;
$c_decor_border_radius: 5px;
$c_decor_border_width: 1px;




$c_element_text_default: #000000;
$c_element_text_hover: #ff5e00;
$c_element_text_selected: #ffffff;

$c_element_bg_color: #f9f9f9;
$c_element_bg_color_hover: #f9f9f9;
$c_element_bg_color_selected: #ff6531;

$c_element_border_color: #cccccc;
$c_element_border_color_hover: #ff6531;
$c_element_border_color_selected: #ff6531;
$c_element_border_radius: 5px;
$c_element_border_width: 1px;

$c_element_input_color: #f9f9f9;
$c_element_range_color: #cccccc;


@mixin style-decor-border-radius {
  border-radius: $c_decor_border_radius;
}

@mixin style-title-main {
  font-size: 17px;
  line-height: 20px;
  color: $c_base_title;
}

@mixin style-label-sub {
  font-size: 12px;
  line-height: 14px;
  color: $c_base_title;
}

@mixin transition {
  transition: all 0.2s ease-in-out;
}

@mixin style-prompt-absolute-shift {
  position: absolute;
  top: 0;
  right: 0;
  margin: 5px;
}

@mixin style-element-main-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  width: 100%;
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

@mixin style-horizontal-elements {
  flex-direction: row;
  flex-wrap: wrap;
  > .calc__template-main-wrapper {
    width: auto;
    flex: 0 1 auto;
    &.isRange {
      flex: 1 1 auto;
    }
  }

  > .calc__template-main-wrapper {
    padding: 0 10px;
    &:first-child {
      padding-left: 0;
    }
    &:last-child {
      padding-right: 0;
    }
  }
}



.credit {
  &-main-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 100px;
  }
  &__data {
    &-wrapper {
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: center;
      gap: 5px;
      margin: 5px 0;
    }
    &-value {
      display: flex;
      gap: 5px;
    }

  }

  &__unit {
    margin-left: 5px;
    font-size: 17px;
    line-height: 20px;
    color: $c_element_text_default;
  }

  &__input {
    &-wrapper {
      @include style-element-main-wrapper;
      &-data {
        display: flex;
        align-items: center;
        position: relative;
        gap: 2px;
        flex: 1 1 100%;
        &.stretch {
          width: 100%;
        }
      }
    }

    &-label {
      &-text {
        @include style-title-main;
        align-items: flex-start;
        display: flex;
        gap: 5px;
      }
    }

    &-item {
      font-size: 16px;
      line-height: 20px;
      padding: 20px 35px;
      max-width: 304px;
      background: $c_element_input_color;
      color: $c_element_text_default;
      border: $c_element_border-width solid $c_element_border_color;
      text-align: center;
      border-radius: $c_element_border_radius;
      @media all and (max-width: 480px) {
        padding: 10px 15px;
      }
      &:focus,
      &:hover {
        outline: none;
        border-color: $c_element_border_color_hover;
        background: $c_element_bg_color_hover;
        color: $c_element_text_hover;
      }
    }
  }




  &__radio {
    &-wrapper {
      @include style-element-main-wrapper;
      &-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        flex: 1 1 100%;
        width: 100%;
      }
      &.base {
        .calc__radio-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid $c_element_text_default;
          position: relative;

          &:after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            width: 10px;
            height: 10px;
          }
        }
      }
    }
    &-label-button {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      padding: 20px 30px;
      background-color: $c_element_bg_color;
      border-radius: $c_element_border_radius;
      border: $c_element_border_width solid $c_element_border_color;
      cursor: pointer;
      @include transition;
      gap: 8px;
      text-align: start;
      &.stretch {
        flex: 1 1 auto;
      }
      .calc__icon-element-label-wrapper {
        //flex: none;
      }
      @media all and (max-width: 480px) {
        padding: 11px 15px;
      }
      @media all and (max-width: 360px) {
        flex: 1 1 100%;
      }
      &.onlyImage {
        padding: 10px;
      }
      &.isShowPrompt {
        padding-right: 35px;
      }
      .calc__prompt-wrapper {
        @include style-prompt-absolute-shift;
      }
      &:hover {
        background-color: $c_element_bg_color_hover;
        border-color: $c_element_border_color_hover;
        .calc__radio-name,
        .calc__radio-subname {
          color: $c_element_text_hover;
        }
        .calc__radio-indicator {
          border-color: $c_element_text_hover;
          &:after {
            background-color: $c_element_text_hover;
          }
        }
      }
      &.checked {
        background-color: $c_element_bg_color_selected;
        border-color: $c_element_border_color_selected;
        .calc__radio-name,
        .calc__radio-subname {
          color: $c_element_text_selected;
        }
        .calc__radio-indicator {
          border-color: $c_element_text_selected;
          &:after {
            background-color: $c_element_text_selected;
          }
        }
      }
      &.error {
        border-color: $c_base_error_color;
        .calc__radio-text {
          color: $c_base_error_color;
        }
        .calc__radio-indicator {
          border-color: $c_base_error_color;
          &:after {
            background-color: $c_base_error_color;
          }
        }
      }
    }
    &-text {
      display: flex;
      align-items: flex-start;
      flex-direction: column;

      &-wrapper {
        display: flex;
        gap: 5px;
        align-items: center;
      }
    }
  }








  &__button {
    @include style-decor-border-radius;
    background-color: $c_decor_bg_color_selected;
    color: $c_decor_text_selected;
    font-weight: 900;
    font-size: 17px;
    line-height: 23px;
    display: flex;
    align-items: center;
    text-align: center;
    text-transform: uppercase;
    padding: 21px 25px;
    border: none;
    &:hover{
      cursor: pointer;
      background-color: $c_decor_bg_color_hover;
      color: $c_decor_text_hover;
    }
  }

  &__table {
    border: 1px solid #eee;
    table-layout: fixed;
    width: 100%;
    border-collapse: collapse;
    margin: 50px auto;
  }
  &__caption {
    background: $c_decor_bg_color;
    border-top: 1px solid $c_decor_text_default;
    font-weight: bold;
    padding: 5px;
  }
  &__thead {
    position: sticky;
    top:0;
  }
  &__th {
    font-weight: bold;
    padding: 5px;
    background: $c_decor_bg_color_selected;
    border: 1px solid $c_decor_text_default;
    color: $c_decor_text_selected
  }

  &__td {
    padding: 5px 10px;
    border: 1px solid $c_decor_text_default;
    text-align: left;
  }



  &__table tbody .credit__tr:nth-child(odd){
    background: #fff;
  }
  &__table tbody .credit__tr:nth-child(even){
    background: $c_decor_bg_color;
  }

  &__table tr td:first-child, &__table tr th:first-child {
    border-left: none;
  }
  &__table tr td:last-child, &__table tr th:last-child {
    border-right: none;
  }
}


.calc {
  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    &-group-data {
      display: flex;
      width: 100%;
      padding-bottom: 10px;
      position: relative;
      flex-direction: column;
      &.is-highlight {
        border: 2px dashed blue;
        background: repeating-linear-gradient(
            -60deg,
            blue 0,
            blue 1px,
            transparent 1px,
            transparent 15px
        );
        background-color: #fff;
      }
      &.indent {
        padding-left: 10px;
        padding-right: 10px;
      }
    }
  }

  &__input {
    &-wrapper {
      @include style-element-main-wrapper;
      &.is-stretch {
        flex: 1 1 100%;
      }
      &-data {
        display: flex;
        align-items: center;
        position: relative;
        gap: 2px;
        flex: 1 1 100%;
        &.stretch {
          width: 100%;
        }
      }
      &.column {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    &-label {
      &-text {
        @include style-title-main;
        align-items: flex-start;
        display: flex;
        gap: 5px;
      }
    }

    &-item {
      font-size: 16px;
      line-height: 20px;
      padding: 20px 35px;
      max-width: 304px;
      background: $c_element_input_color;
      color: $c_element_text_default;
      border: $c_element_border-width solid $c_element_border_color;
      text-align: center;
      border-radius: $c_element_border_radius;
      @media all and (max-width: 480px) {
        padding: 10px 15px;
      }
      &:focus,
      &:hover {
        outline: none;
        border-color: $c_element_border_color_hover;
        background: $c_element_bg_color_hover;
        color: $c_element_text_hover;
      }
      &.number {
        max-width: 150px;
        padding: 20px 15px;
        @media all and (max-width: 480px) {
          padding: 10px 15px;
        }
      }
      &.stretch {
        width: 100%;
        max-width: none;
      }

      &.error {
        outline-color: $c_base_error_color;
        border-color: $c_base_error_color;
      }
    }
    &-buttons {
      &-plus,
      &-minus {
        width: 26px;
        height: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $c_base_title;
        font-size: 28px;
        line-height: 26px;
        font-weight: 600;
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        &:hover {
          cursor: pointer;
        }
        &.disabled {
          opacity: 0.6;
          &:hover {
            cursor: not-allowed;
          }
        }
      }
    }
    &-unit {
      margin-left: 5px;
      font-size: 17px;
      line-height: 20px;
      color: $c_element_text_default;
    }
  }

  &__radio {
    &-wrapper {
      @include style-element-main-wrapper;
      &-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        flex: 1 1 100%;
        width: 100%;
      }
      &.column {
        flex-direction: column;
        align-items: flex-start;
      }
      &.base {
        .calc__radio-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid $c_element_text_default;
          position: relative;

          &:after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            width: 10px;
            height: 10px;
          }
        }
      }
    }
    &-label-text {
      @include style-title-main;
      align-items: flex-start;
      display: flex;
      gap: 5px;
    }
    &-label-button {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      padding: 20px 30px;
      background-color: $c_element_bg_color;
      border-radius: $c_element_border_radius;
      border: $c_element_border_width solid $c_element_border_color;
      cursor: pointer;
      @include transition;
      gap: 8px;
      text-align: start;
      &.stretch {
        flex: 1 1 auto;
      }
      .calc__icon-element-label-wrapper {
        //flex: none;
      }
      @media all and (max-width: 480px) {
        padding: 11px 15px;
      }
      @media all and (max-width: 360px) {
        flex: 1 1 100%;
      }
      &.onlyImage {
        padding: 10px;
      }
      &.isShowPrompt {
        padding-right: 35px;
      }
      .calc__prompt-wrapper {
        @include style-prompt-absolute-shift;
      }
      &:hover {
        background-color: $c_element_bg_color_hover;
        border-color: $c_element_border_color_hover;
        .calc__radio-name,
        .calc__radio-subname {
          color: $c_element_text_hover;
        }
        .calc__radio-indicator {
          border-color: $c_element_text_hover;
          &:after {
            background-color: $c_element_text_hover;
          }
        }
      }
      &.checked {
        background-color: $c_element_bg_color_selected;
        border-color: $c_element_border_color_selected;
        .calc__radio-name,
        .calc__radio-subname {
          color: $c_element_text_selected;
        }
        .calc__radio-indicator {
          border-color: $c_element_text_selected;
          &:after {
            background-color: $c_element_text_selected;
          }
        }
      }
      &.error {
        border-color: $c_base_error_color;
        .calc__radio-text {
          color: $c_base_error_color;
        }
        .calc__radio-indicator {
          border-color: $c_base_error_color;
          &:after {
            background-color: $c_base_error_color;
          }
        }
      }
    }
    &-text {
      display: flex;
      align-items: flex-start;
      flex-direction: column;

      &-wrapper {
        display: flex;
        gap: 5px;
        align-items: center;
      }
    }
    &-name {
      font-size: 16px;
      line-height: 20px;
      color: $c_element_text_default;
    }
    &-subname {
      @include style-label-sub;
      color: $c_element_text_default;
    }
  }

  &__select {
    &-wrapper {
      @include style-element-main-wrapper;
      &.column {
        flex-direction: column;
        align-items: flex-start;
      }
      &.open {
        .calc__select-arrow {
          border-color: $c_element_text_default;
          transform: rotate(-135deg);
          -webkit-transform: rotate(-135deg);
        }
        .calc__select-change-item {
          border-color: $c_element_border_color;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        .calc__select-option-wrapper {
          border-color: $c_element_border_color;
        }
      }
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
      &-right-side {
        display: flex;
        flex: 1 1 100%;
        width: 100%;
      }
    }
    &-label {
      &-text {
        @include style-title-main;
        align-items: flex-start;
        display: flex;
        gap: 5px;
      }
    }
    &-change {
      &-wrapper {
        cursor: pointer;
        font-size: 15px;
        line-height: 16px;
        position: relative;
        //flex: 1 1 100%;
        min-width: 200px;
        @media all and (max-width: 480px) {
          width: 100%;
        }
        &.error {
          .calc__select-change-item {
            border-color: $c_base_error_color;
            color: $c_base_error_color;
          }
          .calc__select-arrow {
            border-color: $c_base_error_color;
          }
          .calc__select-option-wrapper {
            border-color: $c_base_error_color;
          }
        }
      }
      &-item {
        color: $c_element_text_default;
        border-radius: $c_element_border_radius;
        border: $c_element_border_width solid $c_element_border_color;
        background-color: $c_element_bg_color;
        padding: 20px 50px 20px 40px;
        font-weight: 400;
        font-size: 16px;
        line-height: 20px;
        gap: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        text-align: start;
        position: relative;
        @media all and (max-width: 360px) {
          padding: 10px 50px 10px 10px;
        }
        &:hover {
          border-color: $c_element_border_color_hover;
          background-color: $c_element_bg_color_hover;
          color: $c_element_text_hover;
          .calc__select-arrow {
            border-color: $c_element_text_hover;
          }
        }
        .calc__select-arrow {
          width: 10px;
          height: 10px;
          border: solid $c_element_text_default;
          border-width: 0 $c_element_border_width $c_element_border_width 0;
          display: inline-block;
          margin-left: auto;
          flex: 0 0 auto;
          transform: rotate(45deg);
          -webkit-transform: rotate(45deg);
          position: absolute;
          right: 30px;
        }

        .calc__prompt-wrapper {
          @include style-prompt-absolute-shift;
        }
      }
    }
    &-option {
      &-wrapper {
        display: flex;
        flex-direction: column;
        position: absolute;
        border-bottom-left-radius: $c_element_border-radius;
        border-bottom-right-radius: $c_element_border-radius;
        z-index: 99;
        left: 50%;
        overflow: hidden;
        transform: translateX(-50%);
        border-left: $c_element_border_width solid
        $c_element_border_color_selected;
        border-right: $c_element_border_width solid
        $c_element_border_color_selected;
        border-bottom: $c_element_border_width solid
        $c_element_border_color_selected;
      }
      &-list {
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow: auto;
        max-height: 300px;
      }
      &-item {
        background-color: $c_element_bg_color;
        display: flex;
        align-items: center;
        gap: 20px;
        text-align: start;
        padding: 10px 50px 10px 40px;
        cursor: pointer;
        width: 100%;
        position: relative;
        &-text {
          font-weight: 400;
          font-size: 16px;
          line-height: 20px;
          text-align: start;
          color: $c_element_text_default;
        }
        &:hover {
          background-color: $c_element_bg_color_hover;
          .calc__select-option-item-text {
            color: $c_element_text_hover;
          }
        }
      }
    }
  }
}

</style>
