import {
  PerformanceStatisticsStatus,
  PerformanceStatisticsType,
} from '@/types/api/design-construction/ai-performance-report';
// 图片类型字典
// local dict - InspectionType InspectionType
export const LDPerformanceStatisticsType = [
  {
    value: PerformanceStatisticsType.USER,
    label: 'Person',
  },
  {
    value: PerformanceStatisticsType.PROJECT,
    label: 'Project',
  },
];

// 状态：1-待执行，2-执行中，3-执行失败 4-执行成功
export const LDPerformanceStatisticsStatus = [
  {
    value: PerformanceStatisticsStatus.PENDING,
    label: 'Pending',
    theme: 'warning',
  },
  {
    value: PerformanceStatisticsStatus.EXECUTING,
    label: 'In Progress',
    theme: 'primary',
  },
  {
    value: PerformanceStatisticsStatus.FAILED,
    label: 'Failed',
    theme: 'danger',
  },
  {
    value: PerformanceStatisticsStatus.SUCCESS,
    label: 'Finish',
    theme: 'success',
  },
];
