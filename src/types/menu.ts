/**
 * 菜单类型定义
 */
export interface Menu {
  id: number;
  title: string;
  englishTitle?: string;
  component?: string;
  parentId?: number;
  path?: string;
  sort?: number;
  menuType?: number; // 0=无子菜单 1=有子菜单
  meta?: string;
  platformType?: number;
  accountTypeLimit?: number; // 菜单可见的最低账户类型：0=仅超管可见，1=所有账户可见
  status?: string;
  visible?: string;
  isCache?: number;
  isFrame?: number;
  icon?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  children?: Menu[];
}

/**
 * 菜单树节点（包含权限）
 */
export interface MenuTreeNode extends Menu {
  children?: MenuTreeNode[];
  powers?: Power[];
}

/**
 * 权限/按钮类型定义
 */
export interface Power {
  id: number;
  name: string;
  englishTitle?: string;
  menuId: number;
  type?: number; // 0=查看, 1=新增, 2=编辑, 3=审核, 4=删除
  sort?: number;
  rootNode?: number;
  remark?: string;
  permissLabel?: string;
  platformType?: number;
  status?: string;
  createTime?: string;
  updateTime?: string;
}

