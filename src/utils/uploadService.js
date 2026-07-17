import axios from "axios";
import { api } from "/src/api/api.js";

/**
 * Вспомогательный метод для безопасного определения MIME-типа и расширения
 */
const getFileInfo = (file, type) => {
  const fallbackExt = type === "video" ? "mp4" : "jpg";
  const fallbackMime = type === "video" ? "video/mp4" : "image/jpeg";

  const extension = file.name?.includes('.') 
    ? file.name.split('.').pop().toLowerCase() 
    : fallbackExt;

  if (file.type) {
    return { mimeType: file.type, extension };
  }

  const mimes = {
    mp4: 'video/mp4', mov: 'video/quicktime', mkv: 'video/x-matroska',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'
  };

  return {
    mimeType: mimes[extension] || fallbackMime,
    extension
  };
};

export const uploadToMediaService = async (file, type = "video", metadata = {}, onProgress = null) => {
  if (!file) return null;

  try {
    const { mimeType, extension } = getFileInfo(file, type);

    const { data: presignedData } = await api.post("/media/presigned", {
      fileName: file.name,
      contentType: mimeType
    });
    const { url, s3Key } = presignedData;

    const cleanUrl = new URL(url).origin + new URL(url).pathname;

    // 2. Загружаем файл напрямую в S3
    await axios.put(url, file, {
      headers: { 'Content-Type': mimeType },
      onUploadProgress: (progressEvent) => {
        if (typeof onProgress === 'function' && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });

    // 3. Сохраняем метаданные в сервисе
    const payload = [{
      filename: file.name,
      s3Key: s3Key,
      url: cleanUrl,
      mimeType: mimeType,
      type: type,
      title: metadata.title || file.name,
      description: metadata.description || '',
      extension: extension
    }];

    console.log("Отправляем Payload в /media/create:", payload);
    const { data: createData } = await api.post("/media/create", payload);
    
    const uploadedMedia = Array.isArray(createData) ? createData[0] : createData;

    return {
      id: uploadedMedia?.id,
      fileName: uploadedMedia?.fileName || file.name,
      description: uploadedMedia?.description || metadata.description || '',
      extension: uploadedMedia?.extension || extension,
      s3Key: uploadedMedia?.s3Key || s3Key,
      cdnUrl: uploadedMedia?.cdnUrl || cleanUrl,
      thumbnailUrl: uploadedMedia?.thumbnailUrl || null,
      type: uploadedMedia?.type || type,
      mimeType: uploadedMedia?.mimeType || mimeType,
      userId: uploadedMedia?.userId || null
    };
  } catch (error) {
    console.error("Media Upload Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
