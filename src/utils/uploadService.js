import axios from "axios";
import { api } from "/src/api/api.js";

export const uploadToMediaService = async (file, type = "video", metadata = {}, onProgress = null) => {
  if (!file) return null;
  try {
    const fallbackContentType = type === "video" ? "video/mp4" : "image/jpeg";
    const finalContentType = file.type || fallbackContentType;
    const { data: presignedData } = await api.post("/media/presigned", {
      fileName: file.name,
      contentType: finalContentType
    }, { withCredentials: true });
    const { url, s3Key } = presignedData;
    await axios.put(url, file, { 
      headers: {
        'Content-Type': finalContentType 
      },
      onUploadProgress: (progressEvent) => {
        if (typeof onProgress === 'function') {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent); 
        }
      }
    });
    const cleanUrl = url.split('?')[0];
    const payload = [{
      filename: file.name,
      s3Key: s3Key, 
      url: cleanUrl,
      mimeType: finalContentType,
      type: type,
      title: metadata.title || file.name,
      description: metadata.description || '',
    }];
    
    console.log("Отправляем Payload в /media/create:", payload);
    const { data: createData } = await api.post("/media/create", payload, { withCredentials: true }); 
    const uploadedMedia = Array.isArray(createData) ? createData[0] : createData;
    const finalUrl = (uploadedMedia?.cdnUrl && !uploadedMedia.cdnUrl.startsWith('undefined')) 
      ? uploadedMedia.cdnUrl 
      : (uploadedMedia?.url || cleanUrl);

    return finalUrl;
  } catch (error) {
    console.error("Media Error Detail:", error.response?.data || error.message);
    throw error;
  }
};
