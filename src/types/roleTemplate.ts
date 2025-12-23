/**
 * 角色模板类型定义
 */

export interface RoleTemplate {
  id: number;
  templateName: string;
  templateCode: string;
  customerType?: number; // 1=运营管理，2=开发者管理
  accountType?: number; // 0=超管账户，1=普通账户
  roleType?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 角色模板详情
 */
export interface RoleTemplateDetail {
  id: number;
  templateName: string;
  templateCode: string;
  customerType?: number;
  accountType?: number;
  roleType?: string;
  maxMenuIds: number[];
  maxPowerIds: number[];
  defaultMenuIds: number[];
  defaultPowerIds: number[];
  remark?: string;
}

/**
 * 角色模板表单数据
 */
export interface RoleTemplateFormData {
  id?: number;
  templateName: string;
  templateCode: string;
  customerType?: number;
  accountType?: number;
  roleType?: string;
  maxMenuIds: number[];
  maxPowerIds: number[];
  defaultMenuIds: number[];
  defaultPowerIds: number[];
  remark?: string;
}

