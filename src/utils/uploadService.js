import axios from "axios";
import { api } from "/src/api/api.js";

export const uploadToMediaService = async (file, type = "video", metadata = {}, onProgress = null) => {
  if (!file) return null;
  try {
    const fallbackContentType = type === "video" ? "video/mp4" : "image/jpeg";
    const finalContentType = file.type || fallbackContentType;

    // 1. Получаем presigned URL
    const { data: presignedData } = await api.post("/media/presigned", {
      fileName: file.name,
      contentType: finalContentType
    });

    const { url, s3Key } = presignedData;

    // 2. Загружаем файл напрямую в S3
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && typeof onProgress === 'function') {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("S3 upload network error")));
      xhr.addEventListener("abort", () => reject(new Error("S3 upload aborted")));

      xhr.open("PUT", url);
      // ❌ НЕ вызываем xhr.setRequestHeader() — браузер сам выставит Content-Type из Blob/File
      xhr.send(file);
    });

    // 3. Сохраняем метаданные в вашем сервисе
    const payload = [{
      filename: file.name,
      s3Key: s3Key,
      url: url.split('?')[0],
      mimeType: finalContentType,
      type: type,
      title: metadata.title || file.name,
      description: metadata.description || '',
    }];

    console.log("Отправляем Payload в /media/create:", payload);
    const { data: createData } = await api.post("/media/create", payload);

    const uploadedMedia = Array.isArray(createData) ? createData[0] : createData;

    // 4. Возвращаем полный объект, а не только URL
    return {
      id: uploadedMedia?.id,
      s3Key: uploadedMedia?.s3Key || s3Key,
      fileName: uploadedMedia?.fileName || file.name,
      cdnUrl: uploadedMedia?.cdnUrl || uploadedMedia?.url || url.split('?')[0],
      url: uploadedMedia?.url || url.split('?')[0],
      thumbnailUrl: uploadedMedia?.thumbnailUrl,
      description: uploadedMedia?.description || metadata.description || '',
      type: uploadedMedia?.type || type,
      mimeType: uploadedMedia?.mimeType || finalContentType,
      userId: uploadedMedia?.userId,
      publishedAt: uploadedMedia?.publishedAt,
      createdAt: uploadedMedia?.createdAt,
    };

  } catch (error) {
    console.error("Media Error Detail:", error.response?.data || error.message);
    throw error;
  }
};