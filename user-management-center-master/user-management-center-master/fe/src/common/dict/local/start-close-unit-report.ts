import { CityProjectStatisticsType } from '@/types/api/design-construction/start-close-unit-report.d';
// 项目统计类型字典
export const LDCityProjectStatisticsType = [
  {
    value: CityProjectStatisticsType.P_Starts,
    label: 'P-Starts',
  },
  {
    value: CityProjectStatisticsType.A_Starts,
    label: 'A-Starts',
  },
  {
    value: CityProjectStatisticsType.P_Closings,
    label: 'P-Closings',
  },
  {
    value: CityProjectStatisticsType.A_Closings,
    label: 'P-Closings',
  },
];

// 项目统计年份字典
// 获取当前年份，从2024年开始，自动补齐 组成字典
const currentYear = new Date().getFullYear();
export const LDCityProjectStatisticsYear = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => ({
  value: 2024 + i,
  label: 2024 + i,
}));
