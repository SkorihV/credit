<script setup>

import {computed, onMounted, ref} from "vue";
import {aroundCeil, splitNumberIntoHundreds} from "@/servises/UtilityServices";

const props = defineProps({
  startCreditSum: {
    type: Number,
    default: null
  },
  monthlyPaymentAnnuity: {
    type: Number,
    default: null
  },
  monthlyPaymentDifferentiated: {
    type: String,
    default: null
  },
  totalData: {
    type: Object,
    default: () => {}
  },
  enabledFirstPayment: {
    type: Boolean,
    default: false
  },
  firstPaymentCurrency: {
    type: Number,
    default: null
  },
  firstPaymentPercent: {
    type: Number,
    default: null
  },
  typeTime: {
    type: String,
    default: "year"
  },
  timeCreditMonth: {
    type: Number,
    default: 240
  },
  timeCreditYear: {
    type: Number,
    default: 5
  },
  typeCredit: {
    type: String,
    default: 'A'
  },
  nameTypeCredit: {
    type: String,
    default: 'Аннуитет'
  },
  labelTypeCredit: {
    type: String,
    default: 'A'
  },
  labelSum: {
    type: String,
    default: 'Сумма кредита'
  },
  labelCurrency: {
    type: String,
    default: 'Сумма первоначального взноса:'
  },
  labelPercent: {
    type: String,
    default: '% первоначального взноса:'
  },
  labelYear: {
    type: String,
    default: 'Срок кредита в годах:'
  },
  labelMonth: {
    type: String,
    default: 'Срок кредита в месяцах:'
  },
  labelInterestRate: {
    type: String,
    default: 'A'
  },
  interestRate: {
    type: Number,
    default: 1
  },
  otherLabels: {
    type: Object,
    default: () => {}
  },
  currency: {
    type: String,
    default: 'руб'
  }

})

const formElement = ref(null);
const teleportField = ref(null);

/**
 * ПЕРЕПЛАТА = ОБЩАЯ_СУММА_КРЕДИТА - СУММА_КРЕДИТА
 * сумма переплаты (начисленные проценты)
 * @type {ComputedRef<*>}
 */
const overpaymentAmount = computed(() => {
  return aroundCeil(props.totalData?.pay - props.totalData?.mainDebt, 100);
})

const isTeleportExist = computed(() => {
  return Boolean(teleportField.value)
})

function findForm() {
  const form = document.querySelector("#calc__form-for-result");
  formElement.value = form ? form : null;

}

function findTeleportField() {
  if (formElement.value) {
    const field = formElement.value.querySelector("#teleport");
    teleportField.value = field ? field : null;
  }
}

function setReadOnlyForTeleportField() {
  if (!teleportField.value) {
    findTeleportField();
  }
  if (teleportField.value) {
    teleportField.value.readOnly = true;
  }
}

const teleportResultText = computed(() => {
  let result = ''
  result += `${props.labelSum} ${splitNumberIntoHundreds(props.startCreditSum)} ${props.currency}\n`

  if (props.enabledFirstPayment) {
    result += `${props.labelCurrency} ${splitNumberIntoHundreds(props.firstPaymentCurrency)} ${props.currency}\n`
    result += `${props.labelPercent} ${props.firstPaymentPercent}\n`
  }

  if (props.typeTime === 'year') {
    result += `${props.labelYear} ${props.timeCreditYear} \n`
  } else {
    result += `${props.labelMonth} ${props.timeCreditMonth} \n`
  }
  result += `${props.labelInterestRate} ${props.interestRate} \n`
  result += `${props.labelTypeCredit} ${props.nameTypeCredit} \n`

  if (props.typeCredit === "A") {
    result += `${props.otherLabels?.pay} (${props.nameTypeCredit}):  ${splitNumberIntoHundreds(props.monthlyPaymentAnnuity)} ${props.currency}\n`
  } else {
    result += `${props.otherLabels?.pay} (${props.nameTypeCredit}): ${splitNumberIntoHundreds(props.monthlyPaymentDifferentiated)} ${props.currency}\n`
  }

  result += `${props.otherLabels?.totalPayment} ${splitNumberIntoHundreds(props.totalData?.pay)} ${props.currency}\n`
  result += `${props.otherLabels?.percent}  ${splitNumberIntoHundreds(overpaymentAmount.value)} ${props.currency}\n`

  return result
})

onMounted(() => {
  setTimeout(() => {
    findForm();
    findTeleportField();
    setReadOnlyForTeleportField()
  }, 200)
})

</script>

<template>

  <table class="credit__table credit__table_info">
    <tbody class="credit__tbody">
      <tr class="credit__tr">
        <td class="credit__td">{{ labelSum }}</td>
        <td class="credit__td">{{splitNumberIntoHundreds(startCreditSum)}} {{currency}}</td>
      </tr>
      <tr class="credit__tr" v-if="enabledFirstPayment">
        <td class="credit__td">{{ labelCurrency }}</td>
        <td class="credit__td">{{splitNumberIntoHundreds(firstPaymentCurrency)}} {{currency}}</td>
      </tr>
      <tr class="credit__tr" v-if="enabledFirstPayment">
        <td class="credit__td">{{ labelPercent }}</td>
        <td class="credit__td">{{firstPaymentPercent }}</td>
      </tr>
      <tr class="credit__tr" v-if="typeTime === 'year'">
        <td class="credit__td">{{ labelYear }}</td>
        <td class="credit__td">{{ timeCreditYear }}</td>
      </tr>
      <tr class="credit__tr" v-if="typeTime === 'month'">
        <td class="credit__td">{{ labelMonth }}</td>
        <td class="credit__td">{{ timeCreditMonth }}</td>
      </tr>
      <tr class="credit__tr">
        <td class="credit__td">{{ labelInterestRate }}</td>
        <td class="credit__td">{{ interestRate }}</td>
      </tr>
      <tr class="credit__tr" v-if="typeTime === 'month'">
        <td class="credit__td">{{ labelTypeCredit }}</td>
        <td class="credit__td">{{ nameTypeCredit }}</td>
      </tr>
      <tr class="credit__tr" v-if="typeCredit === 'A'">
        <td class="credit__td">{{otherLabels?.pay}} ({{nameTypeCredit}})</td>
        <td class="credit__td">{{splitNumberIntoHundreds(monthlyPaymentAnnuity)}} {{currency}}</td>
      </tr>
      <tr class="credit__tr" v-if="typeCredit === 'D'">
        <td class="credit__td">{{otherLabels?.pay}} ({{nameTypeCredit}})</td>
        <td class="credit__td">{{splitNumberIntoHundreds(monthlyPaymentDifferentiated)}} {{currency}}</td>
      </tr>
      <tr class="credit__tr">
        <td class="credit__td">{{otherLabels?.totalPayment}}</td>
        <td class="credit__td">{{splitNumberIntoHundreds(totalData.pay)}} {{currency}}</td>
      </tr>
      <tr class="credit__tr">
        <td class="credit__td">{{otherLabels?.percent}}</td>
        <td class="credit__td">{{splitNumberIntoHundreds(overpaymentAmount)}} {{currency}}</td>
      </tr>
    </tbody>
  </table>


<!--  <div class="credit__info-block-wrapper">-->
<!--    <div class="credit__info-block-item">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{ labelSum }}-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{splitNumberIntoHundreds(startCreditSum)}} {{currency}}-->
<!--      </div>-->
<!--    </div>-->

<!--    <template v-if="enabledFirstPayment">-->
<!--      <div class="credit__info-block-item" >-->
<!--        <div class="credit__info-block-title">-->
<!--          {{labelCurrency}}-->
<!--        </div>-->
<!--        <div class="credit__info-block-value">-->
<!--          {{splitNumberIntoHundreds(firstPaymentCurrency)}} {{currency}}-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="credit__info-block-item">-->
<!--        <div class="credit__info-block-title">-->
<!--          {{labelPercent}}-->
<!--        </div>-->
<!--        <div class="credit__info-block-value">-->
<!--          {{firstPaymentPercent}}-->
<!--        </div>-->
<!--      </div>-->
<!--    </template>-->

<!--    <div class="credit__info-block-item" v-if="typeTime === 'year'">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{labelYear}}-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{timeCreditYear}}-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="credit__info-block-item" v-if="typeTime === 'month'">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{labelMonth}}-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{timeCreditMonth}}-->
<!--      </div>-->
<!--    </div>-->

<!--    <div class="credit__info-block-item">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{labelInterestRate}}-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{interestRate}}-->
<!--      </div>-->
<!--    </div>-->

<!--    <div class="credit__info-block-item" v-if="typeTime === 'month'">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{labelTypeCredit}}-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{nameTypeCredit}}-->
<!--      </div>-->
<!--    </div>-->

<!--    <div class="credit__info-block-item" v-if="typeCredit === 'A'">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{otherLabels?.pay}} ({{nameTypeCredit}})-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{splitNumberIntoHundreds(monthlyPaymentAnnuity)}} {{currency}}-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="credit__info-block-item" v-if="typeCredit === 'D'">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{otherLabels?.pay}} ({{nameTypeCredit}})-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{splitNumberIntoHundreds(monthlyPaymentDifferentiated)}} {{currency}}-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="credit__info-block-item">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{otherLabels?.totalPayment}}-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{splitNumberIntoHundreds(totalData.pay)}} {{currency}}-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="credit__info-block-item">-->
<!--      <div class="credit__info-block-title">-->
<!--        {{otherLabels?.percent}}-->
<!--      </div>-->
<!--      <div class="credit__info-block-value">-->
<!--        {{splitNumberIntoHundreds(overpaymentAmount)}} {{currency}}-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
  <teleport v-if="isTeleportExist" to="#teleport">
    {{ teleportResultText }}
  </teleport>
</template>
