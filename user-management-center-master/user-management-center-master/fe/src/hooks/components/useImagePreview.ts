import { ref } from 'vue';

export interface UseImagePreviewReturn {
  imagePreviewVisible: Ref<boolean>;
  previewImages: Ref<string[]>;
  previewIndex: Ref<number>;
  handlePreviewImage: (photos: string[], index: number) => void;
  handleIndexChange: (index: number) => void;
  handleClosePreview: () => void;
}

export function useImagePreview(): UseImagePreviewReturn {
  const imagePreviewVisible = ref(false);
  const previewImages = ref<string[]>([]);
  const previewIndex = ref(0);

  const handlePreviewImage = (photos: string[], index: number) => {
    previewImages.value = photos;
    previewIndex.value = index;
    imagePreviewVisible.value = true;
  };

  const handleIndexChange = (index: number) => {
    previewIndex.value = index;
  };

  const handleClosePreview = () => {
    previewIndex.value = 0;
    imagePreviewVisible.value = false;
  };

  return {
    imagePreviewVisible,
    previewImages,
    previewIndex,
    handlePreviewImage,
    handleIndexChange,
    handleClosePreview,
  };
}
