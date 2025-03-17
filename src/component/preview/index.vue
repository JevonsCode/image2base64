<template>
  <div class="preview">
    <img :src="props.base64" :alt="props.filename" />
    <div class="file-info">
      <p>{{ props.filename }}</p>
      <p>{{ (props.size / 1024).toFixed(2) }} KB</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PreviewProps } from "./types";

const props = defineProps<PreviewProps>();
</script>

<style scoped lang="scss">
.preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img {
    max-width: 80%;
    max-height: 200px;
    object-fit: contain;
  }

  .file-info {
    margin-top: 1rem;
    text-align: center;

    p {
      margin: 0.5rem 0;
      font-size: 14px;
      color: #666;
    }
  }
}
</style>
