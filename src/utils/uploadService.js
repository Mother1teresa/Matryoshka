import axios from "axios";
import { api } from "/src/api/api.js";

export const uploadToMediaService = async (file, type = "video", metadata = {}, onProgress = null) => {
  if (!file) return null;
  try {
    const { data: presignedData } = await api.post("/media/presigned", {
      fileName: file.name,
      contentType: file.type
    });
    const { uploadUrl, key: s3Key } = presignedData;
    await axios.put(uploadUrl, file, { 
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (typeof onProgress === 'function') {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted); 
        }
      }
    });

    const payload = [{
      filename: file.name,
      s3Key: s3Key, 
      url: uploadUrl.split('?')[0],
      mimeType: file.type,
      type: type,
      title: metadata.title || file.name,
      description: metadata.description || '',
      productId: metadata.productId || null,
      allowComments: metadata.allowComments ?? true
    }];

    const { data: createData } = await api.post("/media/create", payload);
    const uploadedMedia = createData.media?.[0];
    const finalUrl = (uploadedMedia?.cdnUrl && !uploadedMedia.cdnUrl.startsWith('undefined')) 
      ? uploadedMedia.cdnUrl 
      : uploadedMedia?.url;

    console.log("🚀 Ссылка, которая возвращается из сервиса:", finalUrl);
    return finalUrl; 
  } catch (error) {
    console.error("Media Error:", error);
    throw error;
  }
};
