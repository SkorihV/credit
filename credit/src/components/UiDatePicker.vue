<script setup>

import VueDatePicker from "@vuepic/vue-datepicker";
import {computed, onMounted, ref, watch} from "vue";

const emits = defineEmits(['changeTimestamp'])

const props = defineProps({
  dateTime: {},
  label: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'ru'
  },
  classes: {
    type: String,
    default: ''
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
    changeTimestamp(localDateTime.value.getTime())
  } else {
    changeTimestamp(newTime.getTime())
  }
})
function changeTimestamp(value) {
  return emits('changeTimestamp', value)
}

onMounted(() => {
  localDateTime.value = new Date(props.dateTime)
})

</script>

<template>
  <div class="calc__wrapper-group-data" :class="classes">
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
  </div>
</template>
