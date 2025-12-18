import request from '@/utils/request';
import type { Power } from '@/types/menu';

/**
 * 按钮权限管理 API
 */

// 获取所有权限
export const getAllPowers = () => {
  return request.get<any, { code: number; data: Power[] }>('/sys/power/list');
};

// 根据ID查询权限
export const getPowerById = (id: number) => {
  return request.get<any, { code: number; data: Power }>(`/sys/power/${id}`);
};

// 根据菜单ID获取权限
export const getPowersByMenuId = (menuId: number) => {
  return request.get<any, { code: number; data: Power[] }>(`/sys/power/menu/${menuId}`);
};

// 新增权限
export const createPower = (data: Partial<Power>) => {
  return request.post<any, { code: number; message: string }>('/sys/power', data);
};

// 编辑权限
export const updatePower = (data: Partial<Power>) => {
  return request.put<any, { code: number; message: string }>('/sys/power', data);
};

// 删除权限
export const deletePower = (id: number) => {
  return request.delete<any, { code: number; message: string }>(`/sys/power/${id}`);
};


