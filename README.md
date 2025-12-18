# FunLink Manager Web

FunLink 管理平台前端 - 角色管理 + 菜单管理

## 技术栈

- React 18
- TypeScript
- Ant Design 5
- Vite 5
- Axios

## 功能特性

### 角色管理
- ✅ 角色列表（分页、搜索）
- ✅ 新增角色
- ✅ 编辑角色
- ✅ 删除角色
- ✅ 菜单权限分配（树形选择）
- ✅ 按钮权限分配（基于已选菜单动态展示）

### 菜单管理
- ✅ 菜单树形展示
- ✅ 新增菜单（支持选择父菜单）
- ✅ 编辑菜单
- ✅ 删除菜单（级联检查）
- ✅ 菜单类型配置（目录/叶子节点）
- ✅ 菜单状态、可见性、缓存等配置

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── api/              # API 接口
│   ├── role.ts       # 角色相关接口
│   └── menu.ts       # 菜单相关接口
├── pages/            # 页面组件
│   └── Role/         # 角色管理
│       ├── index.tsx                 # 角色列表页
│       └── components/
│           └── RoleFormModal.tsx     # 角色表单弹窗
├── types/            # TypeScript 类型定义
│   ├── role.ts       # 角色类型
│   └── menu.ts       # 菜单类型
├── utils/            # 工具函数
│   └── request.ts    # Axios 封装
├── App.tsx           # 根组件
└── main.tsx          # 入口文件
```

## 后端接口依赖

确保后端服务已启动（默认端口：8081）

### 必需的后端接口

- `GET /api/sys/role/page` - 分页查询角色
- `GET /api/sys/role/{id}/detail` - 查询角色详情
- `POST /api/sys/role` - 新增角色
- `PUT /api/sys/role` - 编辑角色
- `DELETE /api/sys/role/{id}` - 删除角色
- `GET /api/sys/menu/tree` - 获取菜单树
- `GET /api/sys/power/list` - 获取所有权限

## 注意事项

1. 系统角色（is_system=1）不可删除
2. 菜单权限和按钮权限需要关联，先选菜单才能看到对应的按钮
3. 默认后端代理地址为 `http://localhost:8081`，可在 `vite.config.ts` 中修改

## License

MIT

