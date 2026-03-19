import { BuildTrackerType } from '@/types/api/design-construction/build-tracker.d';
// 构建器类型字典
export const LDBuildTrackerType = [
  {
    value: BuildTrackerType.UNDER_CONSTRUCTION,
    label: 'Under Construction',
  },
  {
    value: BuildTrackerType.FUTURE_STARTS,
    label: 'Future Starts',
  },
  {
    value: BuildTrackerType.CLOSED,
    label: 'Closed',
  },
];
