<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { Ref } from "vue";

import Preview from "../../component/preview/index.vue";
import {
  compressImage,
  getBase64Size,
  formatFileSize,
} from "../../utils/imageCompression";
import CopyButton from "../../component/button/index.vue";

import "./style.scss";

interface FileInfo {
  base64: string;
  filename: string;
  size: number;
}

const fileInfo: Ref<FileInfo | null> = ref(null);
const dropZone = ref<HTMLDivElement | null>(null);
const compressedBase64 = ref("");
const error = ref<string | null>(null);
const isCompressing = ref(false);

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files?.length) {
    await processFile(files[0]);
  }
};

const handleFileSelect = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files?.length) {
    await processFile(files[0]);
  }
};

const processFile = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    alert("请上传图片文件");
    return;
  }

  compressedBase64.value = "";
  error.value = null;
  isCompressing.value = false;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target?.result as string;
    fileInfo.value = {
      base64,
      filename: file.name,
      size: file.size,
    };
  };
  reader.readAsDataURL(file);
};

const preventDefault = (e: DragEvent) => {
  e.preventDefault();
};

const compressionRatio = computed(() => {
  if (!fileInfo.value?.base64 || !compressedBase64.value) return 0;
  const originalSize = getBase64Size(fileInfo.value.base64);
  const compressedSize = getBase64Size(compressedBase64.value);
  return Math.round((1 - compressedSize / originalSize) * 100);
});

const handleCompress = async () => {
  if (!fileInfo.value?.base64) return;

  try {
    isCompressing.value = true;
    error.value = null;
    compressedBase64.value = await compressImage(
      fileInfo.value.base64,
      fileInfo.value.filename
    );
  } catch (err) {
    console.error("压缩失败:", err);
    error.value = err instanceof Error ? err.message : "图片压缩失败，请重试";
  } finally {
    isCompressing.value = false;
  }
};

onMounted(() => {
  const zone = dropZone.value;
  if (zone) {
    zone.addEventListener("dragover", preventDefault);
    zone.addEventListener("drop", handleDrop);
  }
});
</script>

<template>
  <div class="main-container">
    <h1>图片转 Base64</h1>

    <div ref="dropZone" class="drop-zone" :class="{ 'has-file': fileInfo }">
      <input
        type="file"
        accept="image/*"
        class="file-input"
        @change="handleFileSelect"
      />
      <div class="upload-hint">
        <span v-if="!fileInfo">拖拽图片到此处或点击上传</span>
        <Preview
          v-else
          :base64="fileInfo.base64"
          :filename="fileInfo.filename"
          :size="fileInfo.size"
        />
      </div>
    </div>

    <div v-if="fileInfo" class="operation-section">
      <div class="section-card">
        <div class="section-header">
          <h3>原始图片</h3>
          <CopyButton :text="fileInfo.base64" />
        </div>
        <div class="base64-content">
          <pre>{{ fileInfo.base64 }}</pre>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h3>图片压缩</h3>
          <div class="action-group">
            <button
              class="action-btn primary"
              :class="{ 
                completed: compressedBase64 && !isCompressing,
              }"
              :disabled="!fileInfo || isCompressing"
              @click="handleCompress"
            >
              <span class="btn-icon">{{ isCompressing ? "⏳" : compressedBase64 ? "✓" : "🔄" }}</span>
              <span class="btn-text">{{
                isCompressing ? "压缩中..." : compressedBase64 ? "压缩完成" : "压缩图片"
              }}</span>
            </button>
            <CopyButton
              v-if="compressedBase64"
              :text="compressedBase64"
            />
          </div>
        </div>

        <div v-if="error" class="error">
          {{ error }}
        </div>

        <div v-if="compressedBase64" class="compression-content">
          <div class="preview-section">
            <img :src="compressedBase64" class="preview-img" alt="压缩后预览" />
            <div class="info-card">
              <div class="info-item">
                <span class="label">压缩后大小:</span>
                <span class="value">{{
                  formatFileSize(getBase64Size(compressedBase64))
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">压缩率:</span>
                <span class="value">{{ compressionRatio }}%</span>
              </div>
            </div>
          </div>
          <div class="base64-content">
            <pre>{{ compressedBase64 }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
