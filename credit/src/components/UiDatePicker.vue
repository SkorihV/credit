<script setup>

import VueDatePicker from "@vuepic/vue-datepicker";
import {computed, onMounted, ref, watch} from "vue";

const emits = defineEmits(['changeTimestemp'])

const props = defineProps({
  dateTime: {},
  label: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'ru'
  }

})
const localDateTime = ref(new Date())

const isExistLabel = computed(()=> {
  return Boolean(props.label.length)
})

function format(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

watch(localDateTime, (newTime) => {
  if (newTime === null) {
    localDateTime.value = new Date(Date.now())
    changeTimestemp(localDateTime.value.getTime())
  } else {
    changeTimestemp(newTime.getTime())
  }
})

function changeTimestemp(value) {
  return emits('changeTimestemp', value)
}

onMounted(() => {
  localDateTime.value = new Date(props.dateTime)
})

</script>

<template>
  <div class="credit__label-text" v-if="isExistLabel">{{label}}</div>
  <VueDatePicker
    v-model="localDateTime"
    :locale="language"
    select-text="Выбрать"
    cancel-text="Отмена"
    now-button-label="Сегодня"
    placeholder="Выберите дату"
    auto-apply
    :min-date="new Date()"
    :format="format"
    :enable-seconds="false"
    :enable-time-picker="false"
    input-class-name="credit__dp-custom-input"
  />
</template>

<style scoped>

</style>
