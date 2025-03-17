<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Ref } from "vue";

import "./style.scss";
import Preview from "../../component/preview/index.vue";
import Tiny from "../../component/tiny/index.vue";

interface FileInfo {
  base64: string;
  filename: string;
  size: number;
}

const fileInfo: Ref<FileInfo | null> = ref(null);
const dropZone = ref<HTMLDivElement | null>(null);
const isCopied = ref(false);

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

const copyToClipboard = async () => {
  if (!fileInfo.value?.base64) return;

  try {
    await navigator.clipboard.writeText(fileInfo.value.base64);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("复制失败:", err);
  }
};

const preventDefault = (e: DragEvent) => {
  e.preventDefault();
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
  <div class="container">
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

    <div v-if="fileInfo" class="result">
      <div class="base64-container">
        <pre>{{ fileInfo.base64 }}</pre>
      </div>
      <button class="copy-btn" @click="copyToClipboard">
        {{ isCopied ? "已复制 ✅" : "复制 Base64" }}
      </button>
    </div>

    <Tiny :base64="fileInfo?.base64" :filename="fileInfo?.filename" />
  </div>
</template>
