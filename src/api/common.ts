import request from '@/utils/request';

/**
 * 通用接口 API
 */

// 行业树型节点类型
export interface IndustryTreeNode {
  id: number;
  name: string;
  parentId?: number | null;
  level?: number;
  children?: IndustryTreeNode[];
}

// 获取行业列表（树型结构）
export const getIndustryList = () => {
  return request.post<any, { code: number; data: IndustryTreeNode[] }>('/common/industryList');
};

