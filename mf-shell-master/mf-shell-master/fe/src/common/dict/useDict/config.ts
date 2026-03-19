// 建造商列表 & Build Tracker 类型字典
import { getBuilderTrackerBuilders, getBuilderTrackerTypeList } from '@/api/design-construction/build-tracker';
import {
  getBuilderTrackerGroupNames,
  getProjectManagerList,
} from '@/api/design-construction/build-tracker/project-group';
import {
  getAllTaskNameDict,
  getAreaNameDict,
  getAreaNameDictByType,
  getAreaTypeDict,
  getCityListDict,
  getTasNameDict,
  getUserListDictByNickName,
  getUserListDictByUserName,
} from '@/api/dict';
import { getRoleGroupAllList } from '@/api/system-setting/role-group';
import type { TrackerTypeDictResult } from '@/types/api/design-construction';
import {
  BuilderTrackerGroupDictResult,
  DictAreaNameResult,
  DictAreaTypeResult,
  DictArrayResult,
  DictCityListResult,
  DictProjectManageUserResult,
  DictTaskNameAllResult,
  QueryUserListResult,
  TrackerBuildersResult,
} from '@/types/api/dict';
import { RoleGroupAllListResult } from '@/types/api/system-setting/role-group.d';

/* ************* static 字典 ************* */

// 类型声明
export type DictType =
  | 'areaType'
  | 'allTaskName'
  | 'taskName'
  | 'areaName'
  | 'cityList'
  | 'roleGroupNameAllDict'
  | 'roleGroupCodeAllDict'
  | 'trackerBuildersDict'
  | 'builderTrackerGroupDict'
  | 'projectManageUserDict'
  | 'buildTrackerTypeDict';
// 字典 数据 类型
export type DictDataInterface = {
  areaType: DictAreaTypeResult;
  allTaskName: DictTaskNameAllResult;
  taskName: DictArrayResult;
  areaName: DictAreaNameResult;
  cityList: DictCityListResult;
  roleGroupNameAllDict: RoleGroupAllListResult;
  roleGroupCodeAllDict: RoleGroupAllListResult;
  trackerBuildersDict: TrackerBuildersResult;
  builderTrackerGroupDict: BuilderTrackerGroupDictResult;
  projectManageUserDict: DictProjectManageUserResult;
  buildTrackerTypeDict: TrackerTypeDictResult;
};
// 字典 接口
export const getDictByAPI = {
  areaType: getAreaTypeDict,
  allTaskName: getAllTaskNameDict,
  taskName: getTasNameDict,
  areaName: getAreaNameDict,
  cityList: getCityListDict,
  roleGroupNameAllDict: getRoleGroupAllList,
  roleGroupCodeAllDict: getRoleGroupAllList,
  trackerBuildersDict: getBuilderTrackerBuilders,
  builderTrackerGroupDict: getBuilderTrackerGroupNames,
  projectManageUserDict: getProjectManagerList,
  buildTrackerTypeDict: getBuilderTrackerTypeList,
};

export const dictMapJson = {
  areaType: { label: 'desc', value: 'areaType' },
  allTaskName: { label: 'taskName', value: 'taskName' },
  taskName: { label: '', value: '' }, // 任务名称 字典 接口 没有 任务名称 字段，需要 手动 映射
  areaName: { label: 'areaName', value: 'areaId' },
  cityList: { label: 'city', value: 'cityAbbreviation' },
  roleGroupNameAllDict: { label: 'name', value: 'name', key: 'id' },
  roleGroupCodeAllDict: { label: 'code', value: 'code', key: 'id' },
  trackerBuildersDict: { label: 'name', value: 'id', key: 'id' },
  builderTrackerGroupDict: { label: 'name', value: 'id', key: 'id' },
  projectManageUserDict: { label: 'realName', value: 'id', key: 'id' },
  buildTrackerTypeDict: { label: 'name', value: 'code', key: 'id' },
};

/* ************* dynamics 动态 字典 ************* */

// 类型声明
export type DynamicsDictType = 'areaName' | 'userByUserName' | 'userByNickName';
// 字典 数据 类型
export type DynamicsDictDataInterface = {
  areaName: DictAreaNameResult;
  userByUserName: QueryUserListResult;
  userByNickName: QueryUserListResult;
};
// 字典 接口
export const getDynamicsDictByAPI = {
  areaName: getAreaNameDictByType,
  userByUserName: getUserListDictByUserName,
  userByNickName: getUserListDictByNickName,
};

export const dictDynamicsMapJson = {
  areaName: { label: 'areaName', value: 'areaId', key: 'areaId' },
  userByUserName: { label: 'username', value: 'username', key: 'tenantId' },
  userByNickName: { label: 'nickName', value: 'nickName', key: 'tenantId' },
};

/* ************* 前端 本地 静态 字典************* */
// 前端 本地 静态 字典
import {
  LDPerformanceStatisticsStatus,
  LDPerformanceStatisticsType,
} from '@/hooks/common/dict/local/ai-performance-report';
import { LDBuildTrackerType } from '@/hooks/common/dict/local/build-tracker';
import { LDInspectionType } from '@/hooks/common/dict/local/design-construction';
import { LDRoleStatusStatisticsType } from '@/hooks/common/dict/local/role';
// 类型声明
export type LocalDictType =
  | 'inspectionType'
  | 'performanceStatisticsType'
  | 'performanceStatisticsStatus'
  | 'roleStatusStatisticsType'
  | 'buildTrackerType';

// 字典 数据
export const getLocalDict = {
  inspectionType: LDInspectionType,
  performanceStatisticsType: LDPerformanceStatisticsType,
  performanceStatisticsStatus: LDPerformanceStatisticsStatus,
  roleStatusStatisticsType: LDRoleStatusStatisticsType,
  buildTrackerType: LDBuildTrackerType,
};

export type LocalDictDataInterface = {
  inspectionType: typeof LDInspectionType;
  performanceStatisticsType: typeof LDPerformanceStatisticsType;
  performanceStatisticsStatus: typeof LDPerformanceStatisticsStatus;
  roleStatusStatisticsType: typeof LDRoleStatusStatisticsType;
  buildTrackerType: typeof LDBuildTrackerType;
};
// 字典 映射 关系
// 如果 有 映射 关系，则 按照 映射 关系 转换 数据
// 如果 结构为 ： { label: 'XX', value: 'XXX' }，则不需要此处声明 映射关系
export const dictLocalMapJson = {
  // inspectionType: { label: 'label', value: 'value' },
};
