<script setup>

import {ref, computed, watch} from "vue";

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  totalData: {
    type: Object,
    default: () => {}
  },
  isEarlyRepayment: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    default: 'руб'
  },
  otherLabels: {
    type: Object,
    default: () => {}
  }
})

const showTable = ref(false)

const isCaption = computed(() => {
  return Boolean(props.otherLabels?.caption?.length)
})
const isDate = computed(() => {
  return Boolean(props.otherLabels?.date?.length)
})

const isPay = computed(() => {
  return Boolean(props.otherLabels?.pay?.length)
})

const isPercent = computed(() => {
  return Boolean(props.otherLabels?.percent?.length)
})

const isMainDebt = computed(() => {
  return Boolean(props.otherLabels?.mainDebt?.length)
})

const isBalance = computed(() => {
  return Boolean(props.otherLabels?.balance?.length)
})

const isExistDataTable = computed(() => {
  return Boolean(props.tableData?.length)
})


watch(isExistDataTable, (newValue) => {
  if (!newValue) {
    showTable.value = false
  }
})

function toggleOpened() {
  if (isExistDataTable.value) {
    showTable.value = !showTable.value
  } else {
    showTable.value = false
  }
}

</script>

<template>
  <button class="credit__button" @click="toggleOpened">{{otherLabels?.btnToggleTable}}</button>
  <div class="credit__data-wrapper">
    <table class="credit__table" v-if="showTable">
      <caption class="credit__caption" v-if="isCaption">{{otherLabels?.caption}}</caption>
      <thead class="credit__thead">
        <tr class="credit__tr">
          <th class="credit__th">№</th>
          <th class="credit__th" v-if="isDate">{{ otherLabels?.date }}</th>
          <th class="credit__th" v-if="isPay">{{ otherLabels?.pay }}</th>
          <th class="credit__th" v-if="isPercent">{{otherLabels?.percent}}</th>
          <th class="credit__th" v-if="isMainDebt">{{otherLabels?.mainDebt}}</th>
          <th class="credit__th" v-if="isBalance">{{otherLabels?.balance}}</th>
          <th class="credit__th" v-if="isEarlyRepayment">{{otherLabels?.repayment}}</th>
        </tr>
      </thead>
      <tbody>
      <tr class="credit__tr" :class="{'credit__tr-repayment':ceil.earlyRepayment > 0}" v-for="(ceil, idx) in tableData" :key="idx">
        <template v-if="isEarlyRepayment && ceil.earlyRepayment > 0">
          <td class="credit__td">{{ceil.id}}</td>
          <td class="credit__td" v-if="isDate">{{ceil.date}}</td>
          <td class="credit__td credit__td-repayment" colspan="3" v-if="isEarlyRepayment">{{ceil.earlyRepayment.toLocaleString()}}</td>
          <td class="credit__td" v-if="isBalance">{{ceil.balance.toLocaleString()}}</td>
          <td class="credit__td" v-if="isEarlyRepayment">{{ceil.earlyRepayment.toLocaleString()}}</td>
        </template>
        <template v-else>
          <td class="credit__td">{{ceil.id}}</td>
          <td class="credit__td" v-if="isDate">{{ceil.date}}</td>
          <td class="credit__td" v-if="isPay">{{ceil.pay.toLocaleString()}}</td>
          <td class="credit__td" v-if="isPercent">{{ceil.percent.toLocaleString()}}</td>
          <td class="credit__td" v-if="isMainDebt">{{ceil.mainDebt.toLocaleString()}}</td>
          <td class="credit__td" v-if="isBalance">{{ceil.balance.toLocaleString()}}</td>
          <td class="credit__td" v-if="isEarlyRepayment">-</td>
        </template>

      </tr>
      <tr class="credit__tr">
        <td class="credit__td">∑</td>
        <td class="credit__td">-</td>
        <td class="credit__td" v-if="isPay">{{totalData.pay.toLocaleString()}}</td>
        <td class="credit__td" v-if="isPercent">{{totalData.percent.toLocaleString()}}</td>
        <td class="credit__td" v-if="isMainDebt">{{totalData.mainDebt.toLocaleString()}}</td>
        <td class="credit__td" v-if="isBalance"></td>
        <td class="credit__td" v-if="isEarlyRepayment">{{totalData.earlyRepayment ? totalData.earlyRepayment.toLocaleString() : '-'}}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>
