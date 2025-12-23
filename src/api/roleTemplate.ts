import request from '@/utils/request';
import type { RoleTemplate, RoleTemplateDetail, RoleTemplateFormData } from '@/types/roleTemplate';

/**
 * 角色模板管理 API
 */

// 查询所有模板列表
export const getRoleTemplateList = () => {
  return request.get<any, { code: number; data: RoleTemplate[] }>('/api/system/role-template/list');
};

// 查询模板详情
export const getRoleTemplateDetail = (id: number) => {
  return request.get<any, { code: number; data: RoleTemplateDetail }>(`/api/system/role-template/${id}`);
};

// 根据客户类型和角色类型查询模板
export const getRoleTemplateByType = (customerType: number, roleType: string) => {
  return request.get<any, { code: number; data: RoleTemplateDetail }>('/api/system/role-template/query', {
    params: { customerType, roleType },
  });
};

// 创建或更新模板
export const saveRoleTemplate = (data: RoleTemplateFormData) => {
  return request.post<any, { code: number; message: string }>('/api/system/role-template/save', data);
};

// 删除模板
export const deleteRoleTemplate = (id: number) => {
  return request.delete<any, { code: number; message: string }>(`/api/system/role-template/${id}`);
};

