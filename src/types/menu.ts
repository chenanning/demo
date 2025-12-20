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
 * 按钮权限类型定义
 */
export interface ButtonPowerVo {
  name: string; // 按钮名称（显示用）
  permissLabel: string; // 权限标识（用于权限控制，必填）
  hasPermission: boolean; // 是否有权限
  code?: string; // 按钮代码（可选，用于前端识别，如：export、import等）
  type?: number; // 按钮类型（可选分类）：0=查看, 1=新增, 2=编辑, 3=审核, 4=删除, 5+=自定义类型
  remark?: string; // 备注（可选）
}

/**
 * 导航菜单类型定义（精简版，仅包含导航所需字段）
 */
export interface NavDTO {
  id: number;
  title: string;
  englishTitle?: string;
  path?: string;
  component?: string;
  icon?: string;
  parentId?: number;
  sort?: number;
  meta?: string;
  children?: NavDTO[];
  powers?: ButtonPowerVo[]; // 按钮权限列表
}

/**
 * 权限/按钮类型定义
 */
export interface Power {
  id: number;
  name: string;
  englishTitle?: string;
  code?: string; // 按钮代码（可选，用于前端识别，如：export、import等）
  menuId: number;
  type?: number; // 按钮类型（可选分类）：0=查看, 1=新增, 2=编辑, 3=审核, 4=删除, 5+=自定义类型, NULL=无分类
  sort?: number;
  rootNode?: number;
  remark?: string;
  permissLabel: string; // 权限标识（必填，用于权限控制）
  platformType?: number;
  accountTypeLimit?: number; // 权限可用的最低账户类型：0=仅超管可用，1=所有账户可用
  status?: string;
  createTime?: string;
  updateTime?: string;
}

