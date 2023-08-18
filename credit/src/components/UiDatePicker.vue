<script setup>

import VueDatePicker from "@vuepic/vue-datepicker";
import {computed, onMounted, ref, watch} from "vue";


const props = defineProps({
  dateTime: {},
  label: {
    type: String,
    default: ''
  }

})

const dayNames = ['1', '2', '3', '4', '5', '6', '7']

const localDateTime = ref('')

const isExistLabel = computed(()=> {
  return Boolean(props.label.length)
})

function format(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

watch(localDateTime, (newValue) => {
  console.log(newValue)
})


onMounted(() => {
  localDateTime.value = props.dateTime
})

</script>

<template>
  <div class="credit__input-label-text" v-if="isExistLabel">{{label}}</div>
  <VueDatePicker
    v-model="localDateTime"
    select-text="Выбрать"
    cancel-text="Отмена"
    now-button-label="Сегодня"
    placeholder="Выберите дату"
    auto-apply
    :min-date="new Date()"
    :format="format"
  />
  {{localDateTime}}
</template>

<style scoped>

</style>
