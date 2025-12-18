import request from '@/utils/request';
import type { Role, RoleDetail, RoleFormData, RolePageParams, PageResult } from '@/types/role';

/**
 * 角色管理 API
 */

// 分页查询角色
export const getRolePage = (params: RolePageParams) => {
  return request.get<any, { code: number; data: PageResult<Role> }>('/sys/role/page', { params });
};

// 查询角色详情
export const getRoleDetail = (id: number) => {
  return request.get<any, { code: number; data: RoleDetail }>(`/sys/role/${id}`);
};

// 新建角色
export const createRole = (data: RoleFormData) => {
  return request.post<any, { code: number; message: string }>('/sys/role', data);
};

// 编辑角色
export const updateRole = (data: RoleFormData) => {
  return request.put<any, { code: number; message: string }>('/sys/role', data);
};

// 删除角色
export const deleteRole = (id: number) => {
  return request.delete<any, { code: number; message: string }>(`/sys/role/${id}`);
};

// 获取所有角色列表（用于下拉选择）
export const getRoleList = () => {
  return request.get<any, { code: number; data: Array<{ id: number; name: string }> }>('/sys/role/list');
};

