/**
 * @description: 角色分组参数校验逻辑
 * @author: AI Assistant
 */

import type { CreateRoleGroupParams, UpdateRoleGroupParams } from '@/types/api/system-setting/role-group';

/**
 * 校验角色分组名称
 * @param name 分组名称
 * @returns 校验结果
 */
export const validateRoleGroupName = (name: string): { valid: boolean; message?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, message: '角色分组名称不能为空' };
  }

  if (name.length > 50) {
    return { valid: false, message: '角色分组名称不能超过50个字符' };
  }

  // 检查特殊字符
  const specialCharsRegex = /[<>'"&]/;
  if (specialCharsRegex.test(name)) {
    return { valid: false, message: '角色分组名称不能包含特殊字符 < > \' " &' };
  }

  return { valid: true };
};

/**
 * 校验角色分组编码
 * @param code 分组编码
 * @returns 校验结果
 */
export const validateRoleGroupCode = (code: string | number): { valid: boolean; message?: string } => {
  const codeStr = String(code);

  if (!codeStr || codeStr.trim() === '') {
    return { valid: false, message: '角色分组编码不能为空' };
  }

  if (codeStr.length > 20) {
    return { valid: false, message: '角色分组编码不能超过20个字符' };
  }

  // 编码只能包含字母、数字、下划线和连字符
  const codeRegex = /^[a-zA-Z0-9_-]+$/;
  if (!codeRegex.test(codeStr)) {
    return { valid: false, message: '角色分组编码只能包含字母、数字、下划线和连字符' };
  }

  return { valid: true };
};

/**
 * 校验角色分组描述
 * @param description 分组描述
 * @returns 校验结果
 */
export const validateRoleGroupDescription = (description?: string): { valid: boolean; message?: string } => {
  if (!description) {
    return { valid: true }; // 描述是可选的
  }

  if (description.length > 200) {
    return { valid: false, message: '角色分组描述不能超过200个字符' };
  }

  return { valid: true };
};

/**
 * 校验排序值
 * @param sort 排序值
 * @returns 校验结果
 */
export const validateRoleGroupSort = (sort?: string): { valid: boolean; message?: string } => {
  if (!sort) {
    return { valid: true }; // 排序是可选的
  }

  const sortNum = Number(sort);
  if (Number.isNaN(sortNum)) {
    return { valid: false, message: '排序值必须是数字' };
  }

  if (sortNum < 0 || sortNum > 9999) {
    return { valid: false, message: '排序值必须在0-9999之间' };
  }

  return { valid: true };
};

/**
 * 校验创建角色分组参数
 * @param params 创建参数
 * @returns 校验结果
 */
export const validateCreateRoleGroupParams = (params: CreateRoleGroupParams): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 校验名称
  const nameValidation = validateRoleGroupName(params.name);
  if (!nameValidation.valid) {
    errors.push(nameValidation.message!);
  }

  // 校验编码
  const codeValidation = validateRoleGroupCode(params.code);
  if (!codeValidation.valid) {
    errors.push(codeValidation.message!);
  }

  // 校验描述
  const descValidation = validateRoleGroupDescription(params.description);
  if (!descValidation.valid) {
    errors.push(descValidation.message!);
  }

  // 校验排序
  const sortValidation = validateRoleGroupSort(params.sort);
  if (!sortValidation.valid) {
    errors.push(sortValidation.message!);
  }

  // 校验状态
  if (typeof params.status !== 'boolean') {
    errors.push('状态值必须是布尔类型');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 校验更新角色分组参数
 * @param params 更新参数
 * @returns 校验结果
 */
export const validateUpdateRoleGroupParams = (
  params: Omit<UpdateRoleGroupParams, 'id'>,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 校验名称
  const nameValidation = validateRoleGroupName(params.name);
  if (!nameValidation.valid) {
    errors.push(nameValidation.message!);
  }

  // 校验编码
  const codeValidation = validateRoleGroupCode(params.code);
  if (!codeValidation.valid) {
    errors.push(codeValidation.message!);
  }

  // 校验描述
  const descValidation = validateRoleGroupDescription(params.description);
  if (!descValidation.valid) {
    errors.push(descValidation.message!);
  }

  // 校验排序
  const sortValidation = validateRoleGroupSort(params.sort);
  if (!sortValidation.valid) {
    errors.push(sortValidation.message!);
  }

  // 校验状态
  if (typeof params.status !== 'boolean') {
    errors.push('状态值必须是布尔类型');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 校验角色分组ID
 * @param id 分组ID
 * @returns 校验结果
 */
export const validateRoleGroupId = (id: number | string): { valid: boolean; message?: string } => {
  if (!id) {
    return { valid: false, message: '角色分组ID不能为空' };
  }

  const idNum = Number(id);
  if (Number.isNaN(idNum) || idNum <= 0) {
    return { valid: false, message: '角色分组ID必须是正整数' };
  }

  return { valid: true };
};
