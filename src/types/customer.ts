/**
 * 客户（账户）类型定义
 */
export interface Customer {
  id: number;
  aliasId?: string;
  accountName: string;
  contact?: string;
  mobile?: string;
  email?: string;
  category?: number; // 行业类别
  customerType?: number; // 1=运营管理，2=开发者管理
  sts?: string; // A=正常，D=删除
  createTime?: string;
  updateTime?: string;
}

/**
 * 客户表单数据
 */
export interface CustomerFormData {
  id?: number;
  accountName: string;
  contact: string;
  mobile: string;
  email: string;
  customerType: number; // 1=运营管理，2=开发者管理
}

/**
 * 分页查询参数
 */
export interface CustomerPageParams {
  page: number;
  limit: number;
  accountName?: string;
  customerType?: number; // 1=运营管理，2=开发者管理
}

