import * as ImagePickerModule from 'expo-image-picker';
import { useState } from 'react';

export interface ImagePickerResult {
  uri: string;
  type: string; // selalu MIME type lengkap, misal 'image/jpeg'
  name: string;
  size?: number;
}

/**
 * Ekstrak ekstensi file yang aman dari URI atau mimeType.
 * Untuk URI berbentuk content:// (Android), tidak ada ekstensi — pakai mimeType sebagai fallback.
 */
function getExtension(uri: string, mimeType: string): string {
  // Coba dari URI path
  const uriPath = uri.split('?')[0];
  const dotIndex = uriPath.lastIndexOf('.');
  if (dotIndex !== -1 && uriPath.length - dotIndex <= 5) {
    const ext = uriPath.substring(dotIndex + 1).toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }
  }
  // Fallback dari mimeType
  const mimePart = mimeType.split('/')[1] || 'jpg';
  return mimePart === 'jpeg' ? 'jpg' : mimePart;
}

export const useImagePicker = () => {
  const [selectedImages, setSelectedImages] = useState<ImagePickerResult[]>([]);

  const pickImage = async () => {
    try {
      const permission = await ImagePickerModule.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        console.log('Permission to access media library was denied');
        return null;
      }

      const result = await ImagePickerModule.launchImageLibraryAsync({
        mediaTypes: ImagePickerModule.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // ✅ Prioritas: asset.mimeType (expo ≥14) → fallback ke deteksi manual
        // asset.type hanya bernilai 'image' (bukan MIME type), jangan pakai langsung.
        const rawMime = (asset as any).mimeType as string | undefined;
        const mimeType: string = rawMime && rawMime.includes('/')
          ? rawMime
          : `image/${getExtension(asset.uri, 'image/jpeg')}`;

        // ✅ asset.fileName bisa undefined di Android — generate selalu agar aman
        const ext = getExtension(asset.uri, mimeType);
        const fileName: string = asset.fileName && asset.fileName.trim() !== ''
          ? asset.fileName
          : `photo_${Date.now()}.${ext}`;

        const image: ImagePickerResult = {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
          size: asset.fileSize,
        };

        console.log('[useImagePicker] Image picked:', { uri: asset.uri.substring(0, 60), mimeType, fileName });
        return image;
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setSelectedImages([]);
  };

  const addImage = async () => {
    const image = await pickImage();
    if (image) {
      setSelectedImages((prev) => [...prev, image]);
    }
  };

  return {
    selectedImages,
    addImage,
    removeImage,
    clearImages,
    setSelectedImages,
  };
};
