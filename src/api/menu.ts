import request from '@/utils/request';
import type { Menu, MenuTreeNode, NavDTO, Power } from '@/types/menu';

/**
 * 菜单管理 API
 */

// 获取导航菜单（精简版，仅包含导航所需字段）
export const getNav = () => {
  return request.get<any, { code: number; data: NavDTO[] }>('/sys/menu/nav');
};

// 获取菜单树（包含权限）
export const getMenuTree = () => {
  return request.get<any, { code: number; data: MenuTreeNode[] }>('/sys/menu/tree');
};

// 获取所有菜单列表
export const getAllMenus = () => {
  return request.get<any, { code: number; data: Menu[] }>('/sys/menu/list');
};

// 根据ID查询菜单
export const getMenuById = (id: number) => {
  return request.get<any, { code: number; data: Menu }>(`/sys/menu/${id}`);
};

// 新增菜单
export const createMenu = (data: Partial<Menu>) => {
  return request.post<any, { code: number; message: string }>('/sys/menu', data);
};

// 编辑菜单
export const updateMenu = (data: Partial<Menu>) => {
  return request.put<any, { code: number; message: string }>('/sys/menu', data);
};

// 删除菜单
export const deleteMenu = (id: number) => {
  return request.delete<any, { code: number; message: string }>(`/sys/menu/${id}`);
};

// 获取所有权限/按钮
export const getAllPowers = () => {
  return request.get<any, { code: number; data: Power[] }>('/sys/power/list');
};

// 根据菜单ID获取权限
export const getPowersByMenuId = (menuId: number) => {
  return request.get<any, { code: number; data: Power[] }>(`/sys/power/menu/${menuId}`);
};

