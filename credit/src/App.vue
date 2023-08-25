<script setup>

//https://mortgage-calculator.ru/%D1%84%D0%BE%D1%80%D0%BC%D1%83%D0%BB%D0%B0-%D1%80%D0%B0%D1%81%D1%87%D0%B5%D1%82%D0%B0-%D0%B8%D0%BF%D0%BE%D1%82%D0%B5%D0%BA%D0%B8/
//https://www.calc.ru/kreditnyi-kalkulyator.html
//https://calcus.ru/kalkulyator-ipoteki

import '@vuepic/vue-datepicker/dist/main.css'
import {ref, computed, reactive, watch, onMounted} from 'vue'
import {makeMultiple, aroundCeil} from "@/servises/UtilityServices";

import UiInput from "@/components/UiInput.vue";
import UiRadio from "@/components/UiRadio.vue";
import UiSelect from "@/components/UiSelect.vue";
import UiTableData from "@/components/UiTableData.vue";
import UiDatePicker from "@/components/UiDatePicker.vue";
import ResultInfoBlock from "@/components/resultInfoBlock.vue";

import {IS_LOCAL} from "@/constants";
const inputOptions = ref({})

const startCreditSum = ref(2000000) // сумма кредита

const firstPaymentCurrency = ref(500000) // первоначальный взнос в валюте
const firstPaymentPercent = ref(10) // первоначальный взнос в процентах

const firstPaymentType = ref('currency') // тип первоначального взноса
const timeCreditYear = ref(5) // срок кредита в годах
const timeCreditMonth = ref(240) // срок кредита в месяцах
const typeTime = ref('year') // тип времени

const interestRate = ref(9.6) //процентная ставка
const currentTypeCredit = ref('A')  // тип расчета кредита


const dateTime = ref(0) // дата первого платежа
const tableData = ref([])
const totalData = reactive({
  payLocal: 0,
  mainDebtLocal: 0,
  percentLocal: 0,
  balanceLocal: 0,
  earlyRepaymentLocal: 0,

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
  get earlyRepayment() {
    return this.earlyRepaymentLocal
  },
  set earlyRepayment(value) {
    this.earlyRepaymentLocal = aroundCeil(value, 100)
  },
})

/**
 * степень округления для общей ставки
 * @type {number}
 */
const roundupForTotal = 1000000
let roundUpPaymentSum = 100 // сумма округления при расчетах
const prepaymentType = ref('month')
const earlyRepaymentData = ref([]) // данные для досрочного погашения


let enabledEarlyRepayment = true
/**
 * both, annuity, differentiated
 * @type {Ref<UnwrapRef<string>>}
 */
const enabledCreditType = ref('both')
let enabledChangeFirstPay = true
let enabledFirstPayment = true
let currency = ref("руб")

const radioDataTypeCredit = computed(() => {
  return  [
    {
      radioLabel: inputOptions.value?.creditType?.annuity,
      radioValue: "A"
    },
    {
      radioLabel: inputOptions.value?.creditType?.differentiated,
      radioValue: "D"
    }
  ]
})
const nameTypeCredit = computed(() => {
  return currentTypeCredit.value === "A" ? inputOptions.value?.creditType?.annuity : inputOptions.value?.creditType?.differentiated
})

const localRadioDataTypeCredit = computed(() => {
  if (enabledCreditType.value === 'annuity') {
    return radioDataTypeCredit.value.filter(item => item.radioValue === 'A')
  } else if (enabledCreditType.value === 'differentiated') {
    return radioDataTypeCredit.value.filter(item => item.radioValue === 'D')
  } else {
    return radioDataTypeCredit.value
  }
})

const selectDataTypeTime = computed(() => {
  return [
    {
      selectLabel: inputOptions?.value?.timeCreditYear?.labelForSelect,
      selectValue: "year"
    },
    {
      selectLabel: inputOptions?.value?.timeCreditMonth?.labelForSelect,
      selectValue: "month"
    }
  ]
  })
const selectDataFirstPayType = computed(() => {
  return [
    {
      selectLabel: currency.value,
      selectValue: "currency"
    },
    {
      selectLabel: "%",
      selectValue: "percent"
    }
  ]
})

const selectDataPrepaymentType = computed(() => {
  return [
    {
      selectLabel: inputOptions?.value?.earlyRepayment?.repaymentTypeTime,
      selectValue: "month"
    },
    {
      selectLabel: inputOptions?.value?.earlyRepayment?.repaymentTypeSum,
      selectValue: "pay"
    }
  ]
})


/**
 * СРОК_ИПОТЕКИ_МЕСЯЦЕВ
 * срок кредита в месяцах
 * @type {ComputedRef<number>}
 */
const amountMonth = computed(() => {
    if (typeTime.value === "year") {
      return timeCreditYear.value * 12;
    }
    return timeCreditMonth.value;
  })

/**
 * ЕЖЕМЕСЯЧНАЯ_СТАВКА = ПРОЦЕНТНАЯ_СТАВКА_ГОДОВЫХ / 12 / 100
 * ежемесячная процентная ставка по кредиту
 * @type {ComputedRef<number>}
 */
const monthRate = computed(() => {
  return aroundCeil(aroundCeil(interestRate.value, 100) / 12 / 100, roundupForTotal)
})

/**
 * ОБЩАЯ_СТАВКА = (1 + ЕЖЕМЕСЯЧНАЯ_СТАВКА) ^ СРОК_ИПОТЕКИ_МЕСЯЦЕВ
 * @type {ComputedRef<number>}
 */
const totalRate = computed(() => {
  return aroundCeil(Math.pow( (1 + monthRate.value), amountMonth.value), roundupForTotal)
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
  return enabledFirstPayment ? startCreditSum.value - firstPaymentCurrency.value : startCreditSum.value
})

/**
 * ЕЖЕМЕСЯЧНЫЙ_ПЛАТЕЖ = СУММА_КРЕДИТА * ЕЖЕМЕСЯЧНАЯ_СТАВКА * ОБЩАЯ_СТАВКА / (ОБЩАЯ_СТАВКА - 1)
 * сумма оплаты в месяц
 * @type {ComputedRef<number>}
 */
const monthlyPaymentAnnuity = computed(() =>  aroundCeil((computedStartCreditSum.value  * annuityCoefficient.value), 100))
const monthlyPaymentDifferentiated = computed(() => tableData.value[0]?.pay ? `${tableData.value[0]?.pay} / ${tableData.value[tableData.value.length - 1].pay}` : null)


/**
 *
 * @type {ComputedRef<number>}
 */
const localDateTime = computed(() => {
  if (!dateTime.value) {
    return Math.floor(Date.now())
  }
  return dateTime.value

})

const isRoundSum = computed(() => {
  return roundUpPaymentSum > 0 && !isNaN(roundUpPaymentSum)
})

const isEarlyRepayment = computed(() => {
  return Boolean(earlyRepaymentData.value.length)
})

watch([computedStartCreditSum, localDateTime, interestRate, currentTypeCredit, amountMonth, prepaymentType], () => {
  initCalculate()
})

watch([startCreditSum, firstPaymentCurrency, firstPaymentPercent], () => {
  updatePercentCurrency()
})

function updatePercentCurrency() {
  if (firstPaymentType.value === 'currency') {
    firstPaymentPercent.value = aroundCeil(firstPaymentCurrency.value / startCreditSum.value / 100 * 10000, 100)
  }

  if (firstPaymentType.value === 'percent') {
    firstPaymentCurrency.value = aroundCeil(startCreditSum.value / 100 * firstPaymentPercent.value, 100)
  }
}

function initCalculate() {
  if (isNaN(monthlyPaymentAnnuity.value) && startCreditSum.value > firstPaymentCurrency.value && monthRate.value && amountMonth.value){
    tableData.value = []
    return null;
  }
  tableData.value = []
  totalData.pay = 0;
  totalData.mainDebt = 0;
  totalData.balance = 0;
  totalData.percent = 0;
  totalData.earlyRepayment = 0;


  let currentSumCredit = computedStartCreditSum.value
  let localMonthlyPaymentAnnuity = monthlyPaymentAnnuity.value
  let date = new Date(localDateTime.value)
  let earlyRepayment = 0

  for (let i = 1; i <= amountMonth.value; i++) {
    let pay = 0
    let percent = 0
    let mainDebt = 0
    let balance = 0

    if (isEarlyRepayment.value) {
      earlyRepayment = getValueEarlyRepayment(date.getTime())
    }



    if(earlyRepayment) {
      let newAmountMonth = amountMonth.value - i + 1
      currentSumCredit -= earlyRepayment

      tableData.value.push({
        id: i,
        date: `${date.toLocaleString(inputOptions.value?.datepickerLanguage, { month: 'long' })} ${date.getFullYear()}`,
        pay: null,
        percent: null,
        mainDebt: null,
        balance: currentSumCredit,
        earlyRepayment
      })

      if (prepaymentType.value === "pay") {
        localMonthlyPaymentAnnuity = getMonthlyPaymentAnnuity(currentSumCredit, newAmountMonth)
      }
    }

    if (currentTypeCredit.value === 'A') {

      if(earlyRepayment) {
        const newAmountMonth = amountMonth.value - i + 1
        if (prepaymentType.value === "pay") {
          localMonthlyPaymentAnnuity = getMonthlyPaymentAnnuity(currentSumCredit, newAmountMonth)
        }
      }

      percent = getPercentPiece(currentSumCredit)
      mainDebt = getMonthlyDebtRepaymentA(localMonthlyPaymentAnnuity, percent)
      mainDebt = mainDebt > currentSumCredit ? currentSumCredit : mainDebt

      pay = aroundCeil(percent + mainDebt, 100)

    } else if (currentTypeCredit.value === "D") {

      percent = getPercentPiece(currentSumCredit)
      mainDebt = getMonthlyDebtRepaymentD()
      mainDebt = mainDebt > currentSumCredit ? currentSumCredit : mainDebt
      pay = aroundCeil(percent + mainDebt, 100 )

    }
    currentSumCredit = makeMultiple(currentSumCredit - mainDebt, roundUpPaymentSum )
    balance = currentSumCredit >= 0 ? currentSumCredit : 0

    tableData.value.push({
      id: i,
      date: `${date.toLocaleString(inputOptions.value?.datepickerLanguage, { month: 'long' })} ${date.getFullYear()} г`,
      pay,
      percent,
      mainDebt,
      balance,
      earlyRepayment: 0
    })

    totalData.pay += pay + earlyRepayment
    totalData.mainDebt += mainDebt + earlyRepayment
    totalData.percent += percent
    totalData.earlyRepayment += earlyRepayment
    date.setMonth(date.getMonth() + 1)

    if (balance <= 5 ) {
      break
    }
  }
  totalData.balance = totalData.percent
}

function getValueEarlyRepayment(findTimestamp) {
  const findDate = new Date(findTimestamp)
  const findMonth = findDate.getMonth()
  const findYear = findDate.getFullYear()

  const findRepayment = earlyRepaymentData.value.filter(data => {

    const currentDate = new Date(data.timestamp)
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    return findMonth === currentMonth && findYear === currentYear
  })
  return findRepayment.reduce((accum, thisData) => {
    if (thisData?.value) {
      return accum + thisData?.value
    }
    return accum
  }, 0)
}

/**
 * ПРОЦЕНТНАЯ_ЧАСТЬ = ОСТАТОК_ДОЛГА * ЕЖЕМЕСЯЧНАЯ_СТАВКА
 * @param debtBalance
 */
function getPercentPiece(debtBalance) {
  if (isRoundSum.value) {
    const pay = aroundCeil(debtBalance * monthRate.value, 100 );
    return makeMultiple(pay, roundUpPaymentSum)
  }

  return aroundCeil(debtBalance * monthRate.value, 100 );
}

// function getPayAnnuity(currentSumCredit, monthlyPaymentAnnuity) {
//
//   if(isRoundSum.value) {
//     const pay = aroundCeil(monthlyPaymentAnnuity < currentSumCredit ? monthlyPaymentAnnuity : currentSumCredit, 100 )
//     return makeMultiple(pay, roundUpPaymentSum)
//   }
//
//   return aroundCeil(monthlyPaymentAnnuity < currentSumCredit ? monthlyPaymentAnnuity : currentSumCredit, 100 )
// }

/**
 * Аннуитет
 * ОСНОВНАЯ_ЧАСТЬ = ЕЖЕМЕСЯЧНЫЙ_ПЛАТЕЖ - ПРОЦЕНТНАЯ_ЧАСТЬ
 */
function getMonthlyDebtRepaymentA(monthlyPayment, percentPiece) {
  if(isRoundSum.value) {
    const mainDebt =  aroundCeil(monthlyPayment - percentPiece, 100 )
    return makeMultiple(mainDebt, roundUpPaymentSum)
  }

  return aroundCeil(monthlyPayment - percentPiece, 100 )
}

/**
 * ЕЖЕМЕСЯЧНОЕ_ПОГАШЕНИЕ_ДОЛГА = СУММА_КРЕДИТА / СРОК_ИПОТЕКИ_МЕСЯЦЕВ
 * @returns {number}
 */
function getMonthlyDebtRepaymentD() {
  if(isRoundSum.value) {
    const mainDebt =  aroundCeil(computedStartCreditSum.value / amountMonth.value, 100)
    return makeMultiple(mainDebt, roundUpPaymentSum)
  }
  return aroundCeil(computedStartCreditSum.value / amountMonth.value, 100)
}


/**
 * месячный платеж
 * @param currentAmountMonth
 * @returns {number|number}
 */
function getAnnuityCoefficient(currentAmountMonth) {
  const totalRate = aroundCeil(Math.pow( (1 + monthRate.value), currentAmountMonth), roundupForTotal)

  const top = totalRate * monthRate.value
  const bottom = totalRate - 1
  const result =  top / bottom
  return isNaN(result) ? 0 : result
}

/**
 * Получить Ежемесячный платеж при досрочном погашении
 * ЕЖЕМЕСЯЧНЫЙ_ПЛАТЕЖ = СУММА_КРЕДИТА * ЕЖЕМЕСЯЧНАЯ_СТАВКА * ОБЩАЯ_СТАВКА / (ОБЩАЯ_СТАВКА - 1)
 * сумма оплаты в месяц
 * @type {ComputedRef<number>}
 */
function getMonthlyPaymentAnnuity(currentCreditSum, currentAmountMonth) {
  const newAnnuityCoefficient = getAnnuityCoefficient(currentAmountMonth)
  return aroundCeil((currentCreditSum * newAnnuityCoefficient), 100)
}

function changeSum (value) {
  startCreditSum.value = value
}
function changeFirstPaymentCurrency (value) {
    if (value > startCreditSum.value) {
      firstPaymentCurrency.value = startCreditSum.value;
    } else {
      firstPaymentCurrency.value = value
    }
}
function changeFirstPaymentPercent (value) {

  firstPaymentPercent.value = value
}
function changeTimeCreditYear (value) {
  timeCreditYear.value = value
}
function changeTimeCreditMonth (value) {
  timeCreditMonth.value = value
}
function changeInterestRate (value) {
  interestRate.value = value
}
function changeTypeCredit (value) {
  currentTypeCredit.value = value
}
function changeTypeTime (value) {
  typeTime.value = value
}

function changeTimestamp(value) {
  dateTime.value = value
}

function addEarlyRepayment() {
  earlyRepaymentData.value.push({
    timestamp: Date.now(),
    value: inputOptions.value?.earlyRepayment?.earlyRepayment
  })
}
function changeDateEarlyRepayment({index, timestamp, value}){
  if (timestamp) {
    earlyRepaymentData.value[index].timestamp = timestamp
  }
  if (value) {
    earlyRepaymentData.value[index]['value'] = value
  }
  initCalculate()
}
function removeDateEarlyRepayment(idx){
  earlyRepaymentData.value = earlyRepaymentData.value.filter((item, index) => index !== idx)
  initCalculate()
}

function changeFirstPayType(typePay) {
  firstPaymentType.value = typePay
}

function chanePrepaymentType(type) {
  prepaymentType.value = type
}

onMounted(async () => {
  if (IS_LOCAL) {
    await fetch('http://localhost:5001/calculatorOptions')
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        inputOptions.value = data
      })
  } else {
    try {
      inputOptions.value = JSON.parse(
        JSON.stringify(window?.calculatorOptions)
      )
    } catch (e) {
      console.error(
        "Не удалось получить настройки для калькулятора" + e.message
      );
    }
  }

  startCreditSum.value = inputOptions.value?.startSum?.startCreditSum

  firstPaymentCurrency.value = inputOptions.value?.firstPaymentCurrency?.firstPaymentCurrency
  firstPaymentPercent.value = inputOptions.value?.firstPaymentPercent?.firstPaymentPercent
  timeCreditYear.value = inputOptions.value?.timeCreditYear?.timeCreditYear
  timeCreditMonth.value = inputOptions.value?.timeCreditMonth?.timeCreditMonth
  interestRate.value = inputOptions.value?.interestRate?.interestRate


  enabledEarlyRepayment = Boolean(inputOptions.value?.earlyRepayment?.enabledEarlyRepayment)
  enabledCreditType.value = inputOptions.value?.creditType?.enabledCreditType
  enabledChangeFirstPay = Boolean(inputOptions.value?.enabledChangeFirstPay)
  enabledFirstPayment = Boolean(inputOptions.value?.enabledFirstPayment)
  roundUpPaymentSum = parseFloat(inputOptions.value?.roundUpPaymentSum) === 0 ? 1 : parseFloat(inputOptions.value?.roundUpPaymentSum)
  currency.value = inputOptions.value?.currency

  updatePercentCurrency()
  initCalculate()
})

</script>


<template>
  <div class="credit__main-wrapper">
    <div class="credit__data-wrapper">
      <UiInput
        :label="inputOptions?.startSum?.title"
        :unit="currency"
        :controls="inputOptions?.startSum?.controls"
        data-type="onlyInteger"
        :input-value="startCreditSum"
        :max="inputOptions?.startSum?.max"
        :min="inputOptions?.startSum?.min"
        :step="inputOptions?.startSum?.step"
        :discrete-step="inputOptions?.startSum?.discreteStep"
        @changed-value="changeSum"
      />
    </div>

    <div class="credit__data-wrapper" v-if="enabledFirstPayment">
      <UiInput
        v-if="firstPaymentType === 'currency'"
        :label="inputOptions?.firstPaymentCurrency?.title"
        :controls="inputOptions?.firstPaymentCurrency?.controls"
        data-type="onlyInteger"
        :input-value="firstPaymentCurrency"
        :max="inputOptions?.firstPaymentCurrency?.max"
        :min="inputOptions?.firstPaymentCurrency?.min"
        :step="inputOptions?.firstPaymentCurrency?.step"
        :discrete-step="inputOptions?.firstPaymentCurrency?.discreteStep"
        @changed-value="changeFirstPaymentCurrency"
      />
      <UiInput
        v-if="firstPaymentType === 'percent'"
        :label="inputOptions?.firstPaymentPercent?.title"
        :controls="inputOptions?.firstPaymentPercent?.controls"
        data-type="onlyNumber"
        :input-value="firstPaymentPercent"
        :max="inputOptions?.firstPaymentPercent?.max"
        :min="inputOptions?.firstPaymentPercent?.min"
        :step="inputOptions?.firstPaymentPercent?.step"
        :discrete-step="inputOptions?.firstPaymentPercent?.discreteStep"
        @changed-value="changeFirstPaymentPercent"
      />
      <UiSelect
        :select-data="selectDataFirstPayType"
        @changed-value="changeFirstPayType"
      ></UiSelect>
    </div>

    <div class="credit__data-wrapper credit__data-wrapper_unite">
      <UiInput
        v-if="typeTime === 'year'"
        :label="inputOptions?.timeCreditYear?.title"
        :controls="inputOptions?.timeCreditYear?.controls"
        data-type="onlyNumber"
        :input-value="timeCreditYear"
        :max="inputOptions?.timeCreditYear?.max"
        :min="inputOptions?.timeCreditYear?.min"
        :step="inputOptions?.timeCreditYear?.step"
        :discrete-step="inputOptions?.timeCreditYear?.discreteStep"
        @changed-value="changeTimeCreditYear"
      />
      <UiInput
        v-if="typeTime === 'month'"
        :label="inputOptions?.timeCreditMonth?.title"
        :controls="inputOptions?.timeCreditMonth?.controls"
        data-type="onlyInteger"
        :input-value="timeCreditMonth"
        :max="inputOptions?.timeCreditMonth?.max"
        :min="inputOptions?.timeCreditMonth?.min"
        :step="inputOptions?.timeCreditMonth?.step"
        :discrete-step="inputOptions?.timeCreditMonth?.discreteStep"
        @changed-value="changeTimeCreditMonth"
      />
      <UiSelect
        :select-data="selectDataTypeTime"
        @changed-value="changeTypeTime"
      />
    </div>

    <div class="credit__data-wrapper">
      <UiInput
        :label="inputOptions?.interestRate?.title"
        :controls="inputOptions?.interestRate?.controls"
        data-type="onlyNumber"
        :input-value="interestRate"
        :max="inputOptions?.interestRate?.max"
        :min="inputOptions?.interestRate?.min"
        :step="inputOptions?.interestRate?.step"
        :discrete-step="inputOptions?.interestRate?.discreteStep"
        :unit="inputOptions?.interestRate?.unit"
        :is-disabled="inputOptions?.interestRate?.disabled"
        @changed-value="changeInterestRate"
      />
    </div>

    <div class="credit__data-wrapper">
      <UiRadio
        :label="inputOptions?.creditType?.title"
        :radioData="localRadioDataTypeCredit"
        @changed-value="changeTypeCredit"
      />
    </div>

    <div class="credit__data-wrapper" v-if="enabledChangeFirstPay">
      <UiDatePicker
        :date-time="localDateTime"
        label="Дата первого платежа:"
        :language="inputOptions?.datepickerLanguage"
        @change-timestamp="changeTimestamp"
      />

    </div>

    <template v-if="enabledEarlyRepayment">
      <div class="credit__data-wrapper">
        <button class="credit__button" @click="addEarlyRepayment">{{inputOptions?.earlyRepayment?.btnRepayment}}</button>
      </div>
      <div class="credit__data-wrapper" v-if="isEarlyRepayment && currentTypeCredit === 'A'">
        <ui-select
          :select-data="selectDataPrepaymentType"
          :label="inputOptions?.earlyRepayment?.labelRepaymentType"
          @changed-value="chanePrepaymentType"
        />
      </div>
      <div class="credit__data-wrapper" v-for="(data, idx) in earlyRepaymentData" :key="idx">
        <UiDatePicker
          :date-time="data.timestamp"
          :language="inputOptions?.datepickerLanguage"
          @change-timestamp="changeDateEarlyRepayment({index: idx, timestamp: $event, value: null})"
      />
        <UiInput
          @changed-value="changeDateEarlyRepayment({index: idx, timestamp: null, value: $event})"
          :input-value="inputOptions?.earlyRepayment?.earlyRepayment"
          data-type="onlyInteger"
          :min="inputOptions?.earlyRepayment?.min"
          :max="inputOptions?.earlyRepayment?.max"
          :step="inputOptions?.earlyRepayment?.earlyRepayment.step"
          :discrete-step="inputOptions?.earlyRepayment?.discreteStep"
          :controls="inputOptions?.earlyRepayment?.controls"
        >
          <template #button>
            <div class="credit__button credit__button_remove" @click="removeDateEarlyRepayment(idx)" >X</div>
          </template>
        </UiInput>
      </div>
    </template>

    <result-info-block
      :enabled-first-payment="enabledFirstPayment"
      :first-payment-currency="firstPaymentCurrency"
      :first-payment-percent="firstPaymentPercent"
      :type-time="typeTime"
      :start-credit-sum="startCreditSum"
      :monthly-payment-annuity="monthlyPaymentAnnuity"
      :monthly-payment-differentiated="monthlyPaymentDifferentiated"
      :total-data="totalData"
      :type-credit="currentTypeCredit"
      :label-type-credit="inputOptions?.creditType?.title"
      :nameTypeCredit="nameTypeCredit"

      :timeCreditMonth="timeCreditMonth"
      :timeCreditYear="timeCreditYear"
      :labelSum="inputOptions?.startSum?.title"
      :labelCurrency="inputOptions?.firstPaymentCurrency?.title"
      :labelPercent="inputOptions?.firstPaymentPercent?.title"
      :labelYear="inputOptions?.timeCreditYear?.title"
      :labelMonth="inputOptions?.timeCreditMonth?.title"
      :labelInterestRate="inputOptions?.interestRate?.title"
      :interest-rate="interestRate"
      :other-labels="inputOptions?.otherLabels"

    />
      <UiTableData
        :currency="currency"
        :table-data="tableData"
        :total-data="totalData"
        :is-early-repayment="isEarlyRepayment"
        :other-labels="inputOptions?.otherLabels"
      />
  </div>

</template>


<style lang="scss">

//$c_base_text: var(--c_base_text);
//$c_base_text_hover: var(--c_base_text_hover);
//$c_base_text_selected: var(--c_base_text_selected);


//$c_base_bg_color: var(--c_base_bg_color);
//$c_base_bg_color_hover: var(--c_base_bg_color_hover);
//$c_base_bg_color_selected: var(--c_base_bg_color_selected);


//$c_base_border_color: var(--c_base_border_color);
//$c_base_border_color_hover: var(--c_base_border_color_hover);
//$c_base_border_color_selected: var(--c_base_border_color_selected);

//$c_base_error_color: var(--c_base_error_color);


//$c_base_border_radius : var(--c_base_border_radius);
//$c_base_border_width : var(--c_base_border_width);


$c_base_text: #000000;
$c_base_text_hover: #ff5e00;
$c_base_text_selected: #ffffff;


$c_base_bg_color: #ffffff;
$c_base_bg_color_hover: #ffffff;
$c_base_bg_color_selected: #ff5e00;


$c_base_border_color: #ccc;
$c_base_border_color_hover: #ff5e00;
$c_base_border_color_selected: #ff5e00;

$c_base_error_color: #e80000;


$c_base_border_radius: 5px;
$c_base_border_width: 1px;


@mixin style-title-main {
  font-size: 17px;
  line-height: 20px;
  color: $c_base_text;
}


@mixin transition {
  transition: all 0.2s ease-in-out;
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

#credit_calculator {
  .dp__main {
    width: auto;
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
      align-items: baseline;
      gap: 5px;
      margin: 5px 0;
      &_unite {
        @media all and (max-width: 600px) {
          flex-direction: column;
        }
      }
    }
  }

  &__label-text {
    @include style-title-main;
    align-items: flex-start;
    display: flex;
    gap: 5px;
    flex: 1;
    max-width: 300px;
  }

  &__unit {
    margin-left: 5px;
    font-size: 17px;
    line-height: 20px;
    color: $c_base_text;
  }

  &__info-block {
    &-wrapper {
      display: flex;
      flex-direction: column;
      margin: 10px 0;
    }
    &-item {
      display: flex;
      gap: 5px;
    }
    &-title {
      @include style-title-main;

    }
  }

  &__button {
    border-radius: $c_base_border_radius;
    background-color: $c_base_bg_color;
    border: solid $c_base_border_width $c_base_border_color;
    color: $c_base_text;
    font-weight: 900;
    font-size: 17px;
    line-height: 23px;
    display: flex;
    align-items: center;
    text-align: center;
    padding: 21px 25px;
    &:hover{
      cursor: pointer;
      background-color: $c_base_bg_color_hover;
      color: $c_base_text_hover;
    }
    &_remove {
      background: $c_base_bg_color_selected;
      color: $c_base_text_selected;
      padding: 18px 10px;
    }
    @media all and (max-width: 480px) {
      padding: 10px;
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
    background: $c_base_bg_color;
    border-top: 1px solid $c_base_text;
    font-weight: bold;
    padding: 5px;
    text-align: center;
    caption-side: top;
  }
  &__thead {
    position: sticky;
    top:0;
  }
  &__th {
    font-weight: bold;
    padding: 5px;
    background: $c_base_bg_color_selected;
    border: $c_base_border_width solid $c_base_text;
    color: $c_base_text_selected
  }
  &__tr {
    &-repayment td {
      background: $c_base_bg_color_selected;
      color: $c_base_text_selected;
    }
  }

  &__td {
    padding: 5px 10px;
    border: $c_base_border_width solid $c_base_text;
    text-align: left;
    &-repayment {
      text-align: center;
    }
  }

  &__table tbody .credit__tr:nth-child(odd){
    background: #fff;
  }
  &__table tbody .credit__tr:nth-child(even){
    background: $c_base_bg_color;
  }
  &__table tbody .credit__tr:last-child {
    background: $c_base_bg_color_selected;
    color: $c_base_text_selected;
  }

  &__table tr td:first-child, &__table tr th:first-child {
    border-left: none;
  }
  &__table tr td:last-child, &__table tr th:last-child {
    border-right: none;
  }

  &__dp-custom-input {
    padding-top: 18px;
    padding-bottom: 18px;
  }
}


.calc {
  &__wrapper {
    display: flex;
    &-group-data {
      display: flex;
      width: 100%;
      align-items: center;

      @media all and (max-width: 600px) {
        flex-direction: column;
        align-items: start;
        gap: 5px;
      }
    }
  }

  &__input {
    &-wrapper {
      @include style-element-main-wrapper;

      &-data {
        display: flex;
        align-items: center;
        position: relative;
        gap: 2px;
      }

    }

    &-item {
      font-size: 16px;
      line-height: 20px;
      padding: 20px 35px;
      max-width: 304px;
      background: $c_base_bg_color;
      color: $c_base_text;
      border: $c_base_border-width solid $c_base_border_color;
      text-align: center;
      border-radius: $c_base_border_radius;
      @media all and (max-width: 480px) {
        padding: 10px 15px;
      }
      &:focus,
      &:hover {
        outline: none;
        border-color: $c_base_border_color_hover;
        background: $c_base_bg_color_hover;
        color: $c_base_text_hover;
      }
      &.number {
        max-width: 150px;
        padding: 20px 15px;
        @media all and (max-width: 480px) {
          padding: 10px 15px;
        }
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
        color: $c_base_text;
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
  }

  &__radio {
    &-wrapper {
      @include style-element-main-wrapper;
      &-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
    }
    &-label-button {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      padding: 20px 30px;
      background-color: $c_base_bg_color;
      border-radius: $c_base_border_radius;
      border: $c_base_border_width solid $c_base_border_color;
      cursor: pointer;
      @include transition;
      gap: 8px;
      text-align: start;

      @media all and (max-width: 480px) {
        padding: 11px 15px;
      }
      @media all and (max-width: 360px) {
        flex: 1 1 100%;
      }


      &:hover {
        background-color: $c_base_bg_color_hover;
        border-color: $c_base_border_color_hover;
        .calc__radio-name{
          color: $c_base_text_hover;
        }
      }
      &.checked {
        background-color: $c_base_border_color_selected;
        border-color: $c_base_border_color_selected;
        .calc__radio-name {
          color: $c_base_text_selected;
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
      color: $c_base_text;
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
          border-color: $c_base_text;
          transform: rotate(-135deg);
          -webkit-transform: rotate(-135deg);
        }
        .calc__select-change-item {
          border-color: $c_base_border_color;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        .calc__select-option-wrapper {
          border-color: $c_base_border_color;
        }
      }
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
      &-right-side {
        display: flex;
      }
    }
    &-change {
      &-wrapper {
        cursor: pointer;
        position: relative;
        min-width: 220px;
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
        color: $c_base_text;
        border-radius: $c_base_border_radius;
        border: $c_base_border_width solid $c_base_border_color;
        background-color: $c_base_bg_color;
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
          border-color: $c_base_border_color_hover;
          background-color: $c_base_bg_color_hover;
          color: $c_base_text_hover;
          .calc__select-arrow {
            border-color: $c_base_text_hover;
          }
        }
        .calc__select-arrow {
          width: 10px;
          height: 10px;
          border: solid $c_base_text;
          border-width: 0 $c_base_border_width $c_base_border_width 0;
          display: inline-block;
          margin-left: auto;
          flex: 0 0 auto;
          transform: rotate(45deg);
          -webkit-transform: rotate(45deg);
          position: absolute;
          right: 30px;
        }
      }
    }
    &-option {
      &-wrapper {
        display: flex;
        flex-direction: column;
        position: absolute;
        border-bottom-left-radius: $c_base_border-radius;
        border-bottom-right-radius: $c_base_border-radius;
        background: $c_base_bg_color;
        z-index: 99;
        left: 50%;
        overflow: hidden;
        transform: translateX(-50%);
        border-left: $c_base_border_width solid
        $c_base_border_color_selected;
        border-right: $c_base_border_width solid
        $c_base_border_color_selected;
        border-bottom: $c_base_border_width solid
        $c_base_border_color_selected;
      }
      &-list {
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow: auto;
        max-height: 300px;
      }
      &-item {
        background-color: $c_base_bg_color;
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
          color: $c_base_text;
        }
        &:hover {
          background-color: $c_base_bg_color_hover;
          .calc__select-option-item-text {
            color: $c_base_text_hover;
          }
        }
      }
    }
  }
}

.calc__form-for-result {
  textarea {
    &#teleport {
      //display: none;
    }
  }
}

.calc__form-for-result-style {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .title {
    color: $c_base_text;
    font-size: 16px;
    line-height: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .field-title {
      color: $c_base_text;
      font-size: 16px;
      line-height: 20px;
    }

    label {
      color: $c_base_text;
    }
    li {
      list-style: none;
    }
    input[type="text"],
    input[type="email"],
    input[type="tel"] {
      border-radius: $c_base_border_radius;
      outline: none;
      border-width: 2px;
      border-style: solid;
      font-size: 16px;
      line-height: 20px;
      color: $c_base_text;
      min-height: 60px;
      padding: 20px 35px;
      width: 100%;
    }
    textarea {
      border-radius: $c_base_border_radius;
      font-size: 16px;
      line-height: 20px;
      padding: 20px 35px;
      outline: none;
      border-width: 2px;
      border-style: solid;
      width: 100%;
    }
    button {
      border-radius: $c_base_border_radius;
      background-color: $c_base_bg_color;
      border: $c_base_border_color solid $c_base_border_width;
      color: $c_base_text;
      font-weight: 900;
      font-size: 17px;
      line-height: 23px;
      display: flex;
      align-items: center;
      text-align: center;
      padding: 21px 25px;
      &:hover:enabled {
        cursor: pointer;
        background-color: $c_base_bg_color_hover;
        color: $c_base_text_hover;
      }
    }
  }
}

</style>
