<script setup>
import { onMounted, onUnmounted } from "vue";
const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["mounted", "unmounted"]);

onMounted(() => {
  emit("mounted");
});

onUnmounted(() => {
  emit("unmounted");
});
</script>

<template>
  <teleport to="body">
    <div v-if="isOpen" class="modal-mask">
      <div class="modal-wrapper" :class="{ 'modal-enter-active': isModalOpen }">
        <div class="modal-container">
          <div class="modal-body">
            <slot name="content"> No content provided in slot </slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-wrapper {
  height: 100%;
}

.modal-container {
  width: 100%;
  height: 100%;
  opacity: 0; /* Start invisible */
  transition: transform 0.3s ease, opacity 0.3s ease; /* Transition for content */
}

.modal-body {
  height: 100%;
}

.modal-enter-active {
  background-color: rgba(0, 0, 0, 0.5); /* Fully visible background */
}

.modal-enter-active .modal-container {
  opacity: 1;
}
</style>
