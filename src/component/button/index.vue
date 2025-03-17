<script setup lang="ts">
import { ref } from "vue";
import "./style.scss";

interface Props {
  text: string;
}

const props = defineProps<Props>();
const isCopied = ref(false);

const copyToClipboard = async (e: MouseEvent) => {
  try {
    await navigator.clipboard.writeText(props.text);
    isCopied.value = true;

    setTimeout(() => {
      isCopied.value = false;
    }, 1500);
  } catch (err) {
    console.error("复制失败:", err);
  }
};
</script>

<template>
  <button
    class="copy-btn"
    :class="{ copied: isCopied }"
    @click="copyToClipboard"
  >
    <span class="btn-icon">{{ isCopied ? "✓" : "📋" }}</span>
    <span class="btn-text">{{ isCopied ? "已复制" : "复制 Base64" }}</span>
  </button>
</template>
