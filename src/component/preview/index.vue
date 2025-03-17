<template>
  <div class="preview">
    <div class="preview-wrapper">
      <img :src="props.base64" :alt="props.filename" @load="handleImageLoad" />
      <div class="file-info">
        <div class="info-item">
          <span class="label">文件名:</span>
          <span class="value">{{ props.filename }}</span>
        </div>
        <div class="info-item">
          <span class="label">大小:</span>
          <span class="value">{{ formatFileSize(props.size) }}</span>
        </div>
        <div class="info-item" v-if="imageWidth && imageHeight">
          <span class="label">尺寸:</span>
          <span class="value">{{ imageWidth }} × {{ imageHeight }} 像素</span>
        </div>
        <div class="info-item" v-if="props.type">
          <span class="label">类型:</span>
          <span class="value">{{ props.type }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { PreviewProps } from "./types";

const props = defineProps<PreviewProps>();
const imageWidth = ref<number>();
const imageHeight = ref<number>();

const handleImageLoad = (e: Event) => {
  const img = e.target as HTMLImageElement;
  imageWidth.value = img.naturalWidth;
  imageHeight.value = img.naturalHeight;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};
</script>

<style scoped lang="scss">
.preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .preview-wrapper {
    width: 100%;
    max-width: 400px;
    background: #fff;
    border-radius: 8px;
    padding: 20px;
  }

  img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 4px;
    margin-bottom: 20px;
    background: #fafafa;
  }

  .file-info {
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;

      &:not(:last-child) {
        margin-bottom: 8px;
      }

      .label {
        color: #999;
        font-size: 14px;
      }

      .value {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}
</style>
