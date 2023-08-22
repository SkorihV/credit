<script setup>

import {computed} from "vue";
import {aroundCeil} from "@/servises/UtilityServices";

const props = defineProps({
  computedStartCreditSum: {
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
  typeCredit: {
    type: String,
    default: 'A'
  },
})

/**
 * ПЕРЕПЛАТА = ОБЩАЯ_СУММА_КРЕДИТА - СУММА_КРЕДИТА
 * сумма переплаты (начисленные проценты)
 * @type {ComputedRef<*>}
 */
const overpaymentAmount = computed(() => {
  return aroundCeil(props.totalData?.pay - props.totalData?.mainDebt, 100);
})


</script>

<template>
  <div class="credit__info-block-wrapper">
    <div class="credit__info-block-item">
      <div class="credit__info-block-title">
        Сумма кредита:
      </div>
      <div class="credit__info-block-value">
        {{computedStartCreditSum}}
      </div>
    </div>
    <div class="credit__info-block-item" v-if="typeCredit === 'A'">
      <div class="credit__info-block-title">
        Ежемесячный платеж (аннуитет):
      </div>
      <div class="credit__info-block-value">
        {{ monthlyPaymentAnnuity }}
      </div>
    </div>
    <div class="credit__info-block-item" v-if="typeCredit === 'D'">
      <div class="credit__info-block-title">
        Ежемесячный платеж (начальный):
      </div>
      <div class="credit__info-block-value">
        {{ monthlyPaymentDifferentiated }}
      </div>
    </div>
    <div class="credit__info-block-item">
      <div class="credit__info-block-title">
        Общая сумма платежей:
      </div>
      <div class="credit__info-block-value">
        {{totalData.pay}}
      </div>
    </div>
    <div class="credit__info-block-item">
      <div class="credit__info-block-title">
        Переплата по кредиту:
      </div>
      <div class="credit__info-block-value">
        {{overpaymentAmount}}
      </div>
    </div>
    <div class="credit__info-block-item" v-if="enabledFirstPayment">
      <div class="credit__info-block-title">
        Сумма первоначального взноса:
      </div>
      <div class="credit__info-block-value">
        {{firstPaymentCurrency}}
      </div>
    </div>
    <div class="credit__info-block-item" v-if="enabledFirstPayment">
      <div class="credit__info-block-title">
        % первоначального взноса:
      </div>
      <div class="credit__info-block-value">
        {{firstPaymentPercent}} %
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
