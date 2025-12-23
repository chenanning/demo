import request from '@/utils/request';
import type { Customer, CustomerPageParams, CustomerFormData } from '@/types/customer';
import type { PageResult } from '@/types/member';

/**
 * 账户管理 API
 */

// 资质信息类型
export interface Qualification {
  id?: number;
  accountId?: number;
  type: number; // 1=营业执照，2=ICP备案，3=其他资质
  name: string;
  imageUrl: string;
  submitTime: string;
}

// 账户信息类型（包含资质列表）
export interface AccountInfo {
  id: number;
  aliasId: string;
  accountName: string;
  category?: number;
  contact?: string;
  mobile?: string;
  email?: string;
  qualifications?: Qualification[];
}

// 获取当前用户账户信息（包含资质列表）
export const getCurrentAccount = () => {
  return request.get<any, { code: number; data: AccountInfo }>('/sys/account/current');
};

// 根据ID查询账户信息
export const getAccountById = (id: number) => {
  return request.get<any, { code: number; data: AccountInfo }>(`/sys/account/${id}`);
};

// 更新账户信息
export const updateAccount = (data: Partial<AccountInfo>) => {
  return request.put<any, { code: number; message: string }>('/sys/account', data);
};

// 添加资质
export interface AddQualificationRequest {
  accountId: number;
  type: number;
  name: string;
  imageUrl: string;
}

export const addQualification = (data: AddQualificationRequest) => {
  return request.post<any, { code: number; message: string }>('/sys/account-qualification', data);
};

// 删除资质
export const deleteQualification = (qualificationId: number) => {
  return request.delete<any, { code: number; message: string }>(`/sys/account-qualification/${qualificationId}`);
};

// 客户管理相关接口
// 分页查询账户列表
export const getCustomerPage = (params: CustomerPageParams) => {
  const { page, limit, accountName, customerType } = params;
  return request.get<any, { code: number; data: PageResult<Customer> }>('/sys/account/page', {
    params: {
      current: page,
      size: limit,
      accountName: accountName,
      customerType: customerType,
    },
  });
};

// 创建账户
export const createCustomer = (data: CustomerFormData) => {
  return request.post<any, { code: number; message: string }>('/sys/account', data);
};

// 删除账户
export const deleteCustomer = (id: number) => {
  return request.delete<any, { code: number; message: string }>(`/sys/account/${id}`);
};

