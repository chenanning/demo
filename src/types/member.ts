/**
 * 成员类型定义（列表用）
 */
export interface Member {
  id: number;
  username: string;
  email?: string;
  roleName?: string;
  roleId?: number;
  createTime?: string;
}

/**
 * 成员详情类型定义
 */
export interface MemberDetail {
  id: number;
  username: string;
  email: string;
  company?: string;
  byAccount?: number;
  roleId?: number;
  roleName?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 成员表单数据
 */
export interface MemberFormData {
  id?: number;
  username: string;
  email: string;
  byAccount?: number; // 管理应用（账户ID）
  roleId?: number; // 选择角色
  remark?: string;
}

/**
 * 分页查询参数
 */
export interface MemberPageParams {
  page: number;
  limit: number;
  username?: string;
  email?: string;
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


