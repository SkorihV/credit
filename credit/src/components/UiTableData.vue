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
    earlyRepayment: {
      type: Boolean,
      default: false
    }
  })

  const showTable = ref(false)

  const isExistDataTable = computed(() => {
    return Boolean(props.tableData.length)
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
  <button class="credit__button" @click="toggleOpened">Произвести расчет</button>

  <table class="credit__table" v-if="showTable">
    <caption class="credit__caption">Платеж, руб</caption>
    <thead class="credit__thead">
    <tr class="credit__tr">
      <th class="credit__th">№ платежа	</th>
      <th class="credit__th">Дата</th>
      <th class="credit__th">Платеж</th>
      <th class="credit__th">Проценты</th>
      <th class="credit__th">Основной долг</th>
      <th class="credit__th">Остаток долга</th>
      <th class="credit__th" v-if="earlyRepayment">Досрочные погашения</th>
    </tr>
    </thead>
    <tbody>
    <tr class="credit__tr" v-for="ceil in tableData">
      <td class="credit__td">{{ceil.id}}</td>
      <td class="credit__td">{{ceil.date}}</td>
      <td class="credit__td">{{ceil.pay.toLocaleString()}}</td>
      <td class="credit__td">{{ceil.percent.toLocaleString()}}</td>
      <td class="credit__td">{{ceil.mainDebt.toLocaleString()}}</td>
      <td class="credit__td">{{ceil.balance.toLocaleString()}}</td>
      <td class="credit__td" v-if="earlyRepayment"></td>
    </tr>
    <tr class="credit__tr">
      <td class="credit__td">∑</td>
      <td class="credit__td">-</td>
      <td class="credit__td">{{totalData.pay.toLocaleString()}}</td>
      <td class="credit__td">{{totalData.percent.toLocaleString()}}</td>
      <td class="credit__td">{{totalData.mainDebt.toLocaleString()}}</td>
      <td class="credit__td">{{totalData.balance.toLocaleString()}}</td>
      <td class="credit__td" v-if="earlyRepayment"></td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>
