import * as ImagePickerModule from 'expo-image-picker';
import { useState } from 'react';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size?: number;
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
        const image: ImagePickerResult = {
          uri: asset.uri,
          type: asset.type || 'image',
          name: asset.fileName || `photo-${Date.now()}.jpg`,
          size: asset.fileSize,
        };
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
