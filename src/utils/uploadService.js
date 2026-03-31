import axios from "axios";
import { api } from "/src/api/api.js";

/**
 * Универсальная функция загрузки файла в S3 через наш бэкенд
 * @param {File} file - Объект файла из input
 * @param {string} endpoint - Эндпоинт нашего бэка для получения ссылки (по умолчанию для профиля)
 */
export const uploadToS3 = async (file, endpoint = "/profile/upload-url") => {
  if (!file) return null;

  try {
    const extension = file.name.split('.').pop();
    const mimetype = file.type;

    // 1. Запрашиваем у бэкенда Presigned URL
    const { data } = await api.post(endpoint, {
      extension,
      mimetype
    });

    // 2. Грузим файл напрямую в S3
    // Используем чистый axios, чтобы не срабатывали интерцепторы нашего api.js
    await axios.put(data.url, file, {
      headers: { "Content-Type": mimetype }
    });

    console.log("Файл успешно загружен в S3:", file.name);
    
    // Возвращаем данные, если бэк прислал что-то полезное (например, новый путь к файлу)
    return data; 
  } catch (error) {
    console.error("Ошибка в uploadService:", error);
    throw error;
  }
};
