/**
 * 角色类型定义
 */
export interface Role {
  id: number;
  name: string;
  nameEn?: string;
  remark?: string;
  isSystem?: string;
  isAdmin?: string;
  adminUserId?: number;
  createUser?: number;
  sts?: string;
  createTime?: string;
  updateTime?: string;
  /**
   * 成员数（仅在分页列表接口返回）
   */
  memberCount?: number;
}

/**
 * 角色详情（包含权限）
 */
export interface RoleDetail {
  name: string;
  remark?: string;
  menuIds: number[];
  powerIds: number[];
}

/**
 * 角色表单数据
 */
export interface RoleFormData {
  id?: number;
  name: string;
  nameEn?: string;
  remark?: string;
  menuIds: number[];
  powerIds: number[];
}

/**
 * 分页查询参数（继承 Query 基类）
 */
export interface RolePageParams {
  page: number;
  limit: number;
  name?: string;
  order?: string;
  asc?: boolean;
}

/**
 * 分页响应数据
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
}

