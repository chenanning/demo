import request from '@/utils/request';
import type { Member, MemberDetail, MemberFormData, MemberPageParams, PageResult } from '@/types/member';

/**
 * 成员管理 API
 */

// 分页查询成员
export const getMemberPage = (params: MemberPageParams) => {
  // 后端接口参数是 current 和 size，需要转换
  const { page, limit, search } = params;
  return request.get<any, { code: number; data: PageResult<Member> }>('/sys/user/page', {
    params: {
      current: page,
      size: limit,
      search: search, // 搜索关键词（用户名或邮箱）
    },
  });
};

// 根据ID查询成员详情
export const getMemberById = (id: number) => {
  return request.get<any, { code: number; data: MemberDetail }>(`/sys/user/${id}`);
};

// 新建成员
export const createMember = (data: MemberFormData) => {
  return request.post<any, { code: number; message: string }>('/sys/user', data);
};

// 编辑成员
export const updateMember = (data: MemberFormData) => {
  return request.put<any, { code: number; message: string }>('/sys/user', data);
};

// 删除成员
export const deleteMember = (id: number) => {
  return request.delete<any, { code: number; message: string }>(`/sys/user/${id}`);
};

// 为成员分配角色
export const assignRoles = (userId: number, roleIds: number[]) => {
  return request.post<any, { code: number; message: string }>(`/sys/user/${userId}/roles`, roleIds);
};

