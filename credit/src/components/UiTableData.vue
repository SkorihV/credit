<script setup>

import {ref, computed, watch, watchEffect} from "vue";
import {useEventListener} from "@/composables/useEventsListener";

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
const isAlternativeTable = ref(false)
const alternativeTables = ref(new Map())
const isMobile = ref(false)

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

const alternativeTablesOpened = computed(() => {
 return Array.from(alternativeTables.value).every(([_, value]) => value)
})

const isOpenedAccordion = computed(() => (id) => alternativeTables.value.get(id))

watch(isExistDataTable, (newValue) => {
  if (!newValue) {
    showTable.value = false
  }
})

watchEffect(() => {
  alternativeTables.value.clear()
  props.tableData.map((item) => alternativeTables.value.set(item.id, false) )
})

function toggleOpened() {
  if (isExistDataTable.value) {
    showTable.value = !showTable.value
  } else {
    showTable.value = false
  }
}

function toggleTable() {
  isAlternativeTable.value = !isAlternativeTable.value
}
function toggleTableAll() {
  let sing =  !alternativeTablesOpened.value
  Array.from(alternativeTables.value).map(([key]) => {
    alternativeTables.value.set(key,sing)
  })
}

function getIsEarlyRepayment(id) {
  return props.tableData.find(item => item.id === id )?.earlyRepayment > 0 && props.isEarlyRepayment
}

function toggleAlternativeTableOpened(id) {
  if (alternativeTables.value.has(id)) {
    alternativeTables.value.set(id, !getAlternativeTableState(id))
  }
}

function getAlternativeTableState(id) {
   return alternativeTables.value.get(id)
}

useEventListener(window, 'resize', defineIsMobile)
useEventListener(window, 'DOMContentLoaded', defineIsMobile)

function defineIsMobile() {
  isMobile.value = document.body.offsetWidth <= 770
}

watch(isMobile, (newValue) => {
  if (!newValue) {
    isAlternativeTable.value = false
  }
})

</script>

<template>
  <div class="credit__button-wrapper">
    <div class="credit__button" @click="toggleOpened">{{otherLabels?.btnToggleTable}}</div>
    <div class="credit__button" @click="toggleTable" v-if="showTable && isMobile"><div class="credit__arrow">⇄</div></div>
    <div class="credit__button" @click="toggleTableAll" v-if="showTable && isMobile && isAlternativeTable"><div class="credit__arrow">{{alternativeTablesOpened ? '⇈' : '⇊' }}</div></div>
  </div>
  <div class="credit__data-wrapper" v-if="showTable && !isAlternativeTable">
    <table class="credit__table credit__table_adaptive">
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
      <tbody class="credit__tbody">
      <tr class="credit__tr" :class="{'credit__tr-repayment':getIsEarlyRepayment(ceil.id)}" v-for="(ceil) in tableData" :key="ceil.id">
        <template v-if="getIsEarlyRepayment(ceil.id)">
          <td class="credit__td">{{ceil.id}}</td>
          <td class="credit__td" v-if="isDate">{{ceil.date}}</td>
          <td class="credit__td" v-if="isPay">-</td>
          <td class="credit__td" v-if="isPercent">-</td>
          <td class="credit__td" v-if="isMainDebt">-</td>
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
      <tr class="credit__tr credit__tr_last">
        <td class="credit__td">∑</td>
        <td class="credit__td">-</td>
        <td class="credit__td" v-if="isPay">{{totalData.pay.toLocaleString()}}</td>
        <td class="credit__td" v-if="isPercent">{{totalData.percent.toLocaleString()}}</td>
        <td class="credit__td" v-if="isMainDebt">{{totalData.mainDebt.toLocaleString()}}</td>
        <td class="credit__td" v-if="isBalance">-</td>
        <td class="credit__td" v-if="isEarlyRepayment">{{totalData.earlyRepayment ? totalData.earlyRepayment.toLocaleString() : '-'}}</td>
      </tr>
      </tbody>
    </table>
  </div>

  <div class="credit__data-wrapper" v-if="showTable && isMobile && isAlternativeTable" >
    <table class="credit__table credit__table_alternative" v-for="(ceil) in tableData" :key="ceil.id">
      <caption class="credit__caption" v-if="isDate">
        <div class="credit__caption-wrapper">
          <div>№ {{ceil.id}} : {{ otherLabels?.date }} : {{ceil.date}}</div>
          <div class="credit__caption-early-repayment" v-if="getIsEarlyRepayment(ceil.id)">{{otherLabels?.repayment}}</div>
          <div :class="['credit__button-toggle-accordion', isOpenedAccordion(ceil.id) ? 'isOpen' : 'isClose']" @click="toggleAlternativeTableOpened(ceil.id)">
            <div class="credit__arrow">{{isOpenedAccordion(ceil.id) ? '⇑' : '⇓' }}</div>
          </div>
        </div>
      </caption>
      <tbody class="credit__tbody" v-if="isOpenedAccordion(ceil.id)">
        <tr class="credit__tr" v-if="isPay && !getIsEarlyRepayment(ceil.id)">
          <td class="credit__td">{{ otherLabels?.pay }}</td>
          <td class="credit__td">{{ceil.pay?.toLocaleString()}}</td>
        </tr>

        <tr class="credit__tr" v-if="isPercent && !getIsEarlyRepayment(ceil.id)">
          <td class="credit__td">{{ otherLabels?.percent }}</td>
          <td class="credit__td">{{ceil.percent?.toLocaleString()}}</td>
        </tr>

        <tr class="credit__tr" v-if="isMainDebt && !getIsEarlyRepayment(ceil.id)">
          <td class="credit__td">{{ otherLabels?.mainDebt }}</td>
          <td class="credit__td">{{ceil.mainDebt?.toLocaleString()}}</td>
        </tr>

        <tr class="credit__tr" v-if="isEarlyRepayment && getIsEarlyRepayment(ceil.id)">
          <td class="credit__td">{{ otherLabels?.repayment }}</td>
          <td class="credit__td">{{ceil.earlyRepayment?.toLocaleString()}}</td>
        </tr>

        <tr class="credit__tr" v-if="isBalance">
          <td class="credit__td">{{ otherLabels?.balance }}</td>
          <td class="credit__td">{{ceil.balance?.toLocaleString()}}</td>
        </tr>


      </tbody>
    </table>
    <table class="credit__table credit__table_alternative">
      <caption class="credit__caption">∑</caption>
      <tbody class="credit__tbody">

      <tr class="credit__tr" v-if="isPay">
        <td class="credit__td">{{ otherLabels?.pay }}</td>
        <td class="credit__td">{{totalData.pay.toLocaleString()}}</td>
      </tr>

      <tr class="credit__tr" v-if="isPercent">
        <td class="credit__td">{{ otherLabels?.percent }}</td>
        <td class="credit__td">{{totalData.percent.toLocaleString()}}</td>
      </tr>

      <tr class="credit__tr" v-if="isEarlyRepayment && totalData.earlyRepayment">
        <td class="credit__td">{{ otherLabels?.repayment }}</td>
        <td class="credit__td">{{totalData?.earlyRepayment}}</td>
      </tr>

      <tr class="credit__tr" v-if="isMainDebt">
        <td class="credit__td">{{ otherLabels?.mainDebt }}</td>
        <td class="credit__td">{{totalData.mainDebt.toLocaleString()}}</td>
      </tr>
      </tbody>
    </table>

  </div>
</template>
