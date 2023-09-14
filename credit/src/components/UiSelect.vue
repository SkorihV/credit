<script setup>
import {
  onMounted,
  ref,
  watch,
  nextTick,
  computed,
} from "vue";

import { useEventListener } from "@/composables/useEventsListener";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  selectData: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String
  },
  classes: {
    type: String,
    default: ""
  }
});

const isOpen = ref(true);
const currentIndexOption = ref(null);
const maxWidthSelectList = ref(null);
const optionList = ref(null);
const changeElement = ref(null);
const parentRef = ref(null);

const isExistLabel = computed(() => {
  return Boolean(props.label?.toString().length);
});

const isShowArrow = computed(() => {
  return Boolean(props.selectData?.length > 1);
});

const maxWidthForChangeElement = computed(() => {
  return maxWidthSelectList.value
    ? "max-width:" + maxWidthSelectList.value + "px; width: 100%;"
    : null;
});

const maxWidthForOptionList = computed(() => {
  return maxWidthSelectList.value
    ? "max-width:" + maxWidthSelectList.value + "px; width: 100%;"
    : null;
});

const currentOption = computed(() => {
  return props.selectData[currentIndexOption.value]
})

watch(isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      updatedWidthSelect();
    });
  }
});

function initSelectData(eventType = "mounted") {
    currentIndexOption.value = 0

    changeSelect(
      props.selectData[currentIndexOption.value],
      currentIndexOption.value,
      eventType
    );
}

function close() {
  isOpen.value = false;
}

function changeSelect(item, inx, eventType = "click") {
  currentIndexOption.value = inx;
  setTimeout(() => {
    changeValue(eventType);
  }, 100);
  close();
}

function changeValue() {
  if (currentOption.value) {
    emits("changedValue",  currentOption.value?.selectValue);
  }
}

function updatedWidthSelect() {
  if (
    optionList.value?.offsetWidth === 0 ||
    changeElement.value?.offsetWidth === 0 ||
    maxWidthSelectList.value !== null
  ) {
    return false;
  }
  setTimeout(() => {
    if (optionList.value?.offsetWidth > changeElement.value?.offsetWidth) {
      maxWidthSelectList.value = optionList.value?.offsetWidth;
    } else {
      maxWidthSelectList.value = changeElement.value?.offsetWidth;
    }
  }, 100);
}

function clickClose(e) {
  if (!parentRef?.value?.contains(e.target)) {
    close();
  }
}

function initSelect(eventType) {
    initSelectData(eventType);
}

function toggleOpenClose() {
    isOpen.value = !isOpen.value;
}

useEventListener(window, "click", clickClose);

onMounted(() => {
  initSelect("mounted");
  setTimeout(() => {
    updatedWidthSelect();
  }, 200);
});

</script>

<template>
  <div
    class="calc__wrapper-group-data calc__select-wrapper"
    :class="[classes, {open: isOpen }]"
    ref="parentRef"
  >
    <div class="credit__label-text" v-if="isExistLabel">
      {{ label }}
    </div>
    <div class="calc__select-wrapper-right-side">
      <div
        class="calc__select-change-wrapper"
        ref="changeElement"
        :style="[maxWidthForChangeElement]"
      >
        <div
          v-if="currentOption"
          class="calc__select-change-item"
          @click="toggleOpenClose"
        >
          {{ currentOption.selectLabel }}
          <div class="calc__select-arrow" v-if="isShowArrow"></div>
        </div>
        <div
          class="calc__select-option-wrapper"
          :style="[maxWidthForOptionList]"
          ref="optionList"
          v-show="isOpen"
        >
          <div class="calc__select-option-list">
            <template
              v-for="(option, idx) in selectData"
              :key="idx"
            >
              <div
                class="calc__select-option-item"
                @click="changeSelect(option, idx)"
              >
                  <div class="calc__select-option-item-text">
                    {{ option.selectLabel }}
                  </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
