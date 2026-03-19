import { getTaskLocation } from '@/api/design-construction';

export interface TaskImageResult {
  location: string;
  taskImages: string[];
}

/**
 * 处理任务图片数据
 * @param qualityIssuesImageIds 质量问题图片ID列表
 * @returns 处理后的位置信息和图片列表
 */
export async function processTaskImages(qualityIssuesImageIds: string[]): Promise<TaskImageResult> {
  if (!qualityIssuesImageIds?.length) {
    return { location: '', taskImages: [] };
  }

  try {
    const result = await getTaskLocation(qualityIssuesImageIds);
    const location = result
      .map((item) => item.areaName)
      .filter(Boolean)
      .join(',');

    const taskImages = result.reduce<string[]>((acc, item) => {
      if (item?.pjTrackerPictureSplitList?.length) {
        item.pjTrackerPictureSplitList.forEach((splitItem) => {
          if (splitItem.pictureUrl) {
            acc.push(splitItem.pictureUrl);
          }
        });
      } else if (item.picture) {
        acc.push(item.picture);
      }
      return acc;
    }, []);

    return { location, taskImages };
  } catch (error) {
    console.error('processTaskImages error:', error);
    return { location: '', taskImages: [] };
  }
}

/**
 * 提取图片URL列表
 * @param photos 图片数据
 * @returns 图片URL数组
 */
export function extractImageUrls(photos: any[]): string[] {
  if (!Array.isArray(photos)) return [];

  return photos
    .map((photo) => {
      if (typeof photo === 'string') return photo;
      if (photo?.url) return photo.url;
      if (photo?.pictureUrl) return photo.pictureUrl;
      return null;
    })
    .filter(Boolean) as string[];
}
