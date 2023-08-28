
<script setup>
import {
  onMounted,
  ref,
  computed,
} from "vue";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  radioData: {
    type: Array,
    default: () => [],
  },
  /**
   * заголовок
   */
  label: {
    type: String,
    default: "",
  },
});

const selectedValueInRadio = ref(0);

onMounted(() => {
  setTimeout(() => {
    changeValue("mounted");
  }, 100);
});

const currentSelectedValue = computed(() => {
  return props.radioData[selectedValueInRadio.value]?.radioValue
})

const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
});

const isExistData = computed(() => {
  return Boolean(props.radioData?.length)
})

function selectedCurrentRadio(index) {
    selectedValueInRadio.value = index;
    changeValue();
}

function changeValue(eventType = "click") {
  emits("changedValue", currentSelectedValue.value);
}

</script>

<template>
  <div class="calc__wrapper-group-data">
      <div class="credit__label-text" v-if="isExistLabel">
        {{ label }}
      </div>
      <div class="calc__radio-wrapper-buttons" v-if="isExistData">
        <template v-for="(radio, index) in radioData" :key="index">
          <div
            class="calc__radio-label-button"
            :class="{
              checked: selectedValueInRadio === index,
            }"
            @click="selectedCurrentRadio(index)"
          >
            <div class="calc__radio-text-wrapper">
              <div class="calc__radio-text">
                <div class="calc__radio-name">
                  {{ radio.radioLabel }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
  </div>

</template>
