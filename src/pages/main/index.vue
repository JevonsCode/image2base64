<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
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
  type: string;
}

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
  maintainAspectRatio: boolean;
  preserveExif: boolean;
}

const fileInfo: Ref<FileInfo | null> = ref(null);
const dropZone = ref<HTMLDivElement | null>(null);
const compressedBase64 = ref("");
const error = ref<string | null>(null);
const isCompressing = ref(false);
const compressedImageSize = ref({ width: 0, height: 0 });

// 获取图片尺寸的函数
const getImageSize = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.src = base64;
  });
};

// 默认压缩参数
const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  quality: 0.8,
  maintainAspectRatio: true,
  preserveExif: false,
};

// 压缩参数
const compressionOptions = ref<CompressionOptions>({ ...defaultOptions });
const lastCompressedOptions = ref<CompressionOptions | null>(null);

// 检查参数是否已更改
const hasOptionsChanged = computed(() => {
  if (!lastCompressedOptions.value) return false;
  return JSON.stringify(compressionOptions.value) !== JSON.stringify(lastCompressedOptions.value);
});

// 重置压缩参数
const resetOptions = () => {
  compressionOptions.value = { ...defaultOptions };
};

// 监听压缩参数变化
const handleOptionsChange = () => {
  // 不再清空压缩结果，只重置错误信息
  error.value = null;
};

// 监听压缩参数变化
watch(compressionOptions, handleOptionsChange, { deep: true });

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
      type: file.type,
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
      fileInfo.value.filename,
      compressionOptions.value
    );
    // 获取压缩后图片的尺寸
    compressedImageSize.value = await getImageSize(compressedBase64.value);
    // 保存最后使用的压缩参数
    lastCompressedOptions.value = { ...compressionOptions.value };
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
          :type="fileInfo.type"
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
              :disabled="!fileInfo || isCompressing"
              @click="handleCompress"
            >
              <span class="btn-icon">{{ isCompressing ? "⏳" : "🔄" }}</span>
              <span class="btn-text">{{
                isCompressing ? "压缩中..." : "压缩图片"
              }}</span>
            </button>
            <CopyButton
              v-if="compressedBase64"
              :text="compressedBase64"
            />
          </div>
        </div>

        <div class="compression-options">
          <h4>压缩参数</h4>
          <div class="option-item">
            <label>
              最大文件大小 (MB):
              <input
                type="number"
                v-model="compressionOptions.maxSizeMB"
                min="0.1"
                step="0.1"
                class="number-input"
              />
            </label>
          </div>
          <div class="option-item">
            <label>
              最大宽度/高度 (像素):
              <input
                type="number"
                v-model="compressionOptions.maxWidthOrHeight"
                min="100"
                step="100"
                class="number-input"
              />
            </label>
          </div>
          <div class="option-item">
            <label>
              <input
                type="checkbox"
                v-model="compressionOptions.useWebWorker"
                class="checkbox-input"
              />
              使用 Web Worker
              <span class="option-tip">（后台压缩，不会卡住界面）</span>
            </label>
          </div>
          <div class="option-item">
            <label>
              图片质量:
              <input
                type="range"
                v-model="compressionOptions.quality"
                min="0.1"
                max="1"
                step="0.1"
                class="range-input"
              />
              <span class="range-value">{{ Math.round(compressionOptions.quality * 100) }}%</span>
            </label>
          </div>
          <div class="option-item">
            <label>
              <input
                type="checkbox"
                v-model="compressionOptions.maintainAspectRatio"
                class="checkbox-input"
              />
              保持原始宽高比
              <span class="option-tip">（避免图片变形）</span>
            </label>
          </div>
          <div class="option-item">
            <label>
              <input
                type="checkbox"
                v-model="compressionOptions.preserveExif"
                class="checkbox-input"
              />
              保留 EXIF 信息
              <span class="option-tip">（保留拍摄时间、相机型号等信息）</span>
            </label>
          </div>
        </div>

        <div v-if="error" class="error">
          {{ error }}
        </div>

        <div v-if="compressedBase64" class="compression-content">
          <div class="preview-section">
            <div class="preview-wrapper">
              <img :src="compressedBase64" class="preview-img" alt="压缩后预览" />
              <div v-if="isCompressing" class="preview-loading">
                <div class="loading-spinner"></div>
                <span>压缩中...</span>
              </div>
            </div>
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
              <div class="info-item">
                <span class="label">图片尺寸:</span>
                <span class="value">{{ compressedImageSize.width }} × {{ compressedImageSize.height }}</span>
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
