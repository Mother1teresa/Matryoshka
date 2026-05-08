import axios from "axios";
import { api } from "/src/api/api.js";

export const uploadToMediaService = async (file, type = "video", metadata = {}, onProgress = null) => {
  if (!file) return null;
  try {
     const { data: presignedData } = await api.post("/media/presigned", {
      fileName: file.name,
      contentType: file.type
    });
    const { url, s3Key } = presignedData;
    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (onProgress) onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    });
   const payload = [{
      filename: file.name,
      s3Key: s3Key, 
      url: url,
      mimeType: file.type,
      type: type,
      title: metadata.title || file.name,
      description: metadata.description || '',
    }];
    console.log("Отправляем Payload в /media/create:", payload);

    const { data: createData } = await api.post("/media/create", payload);
    const uploadedMedia = Array.isArray(createData) ? createData[0] : createData;
    const finalUrl = (uploadedMedia?.cdnUrl && !uploadedMedia.cdnUrl.startsWith('undefined')) 
      ? uploadedMedia.cdnUrl 
      : uploadedMedia?.url;

    return finalUrl;
  } catch (error) {
    console.error("Media Error Detail:", error.response?.data || error.message);
    throw error;
  }
};
