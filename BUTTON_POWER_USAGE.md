# 按钮权限使用指南

## 📋 概述

导航菜单接口（`/sys/menu/nav`）现在返回每个菜单的按钮权限列表（`powers`），包含完整的按钮信息，便于前端进行权限控制。

## 📊 数据结构

### NavDTO 接口

```typescript
export interface NavDTO {
  id: number;
  title: string;
  // ... 其他字段
  powers?: ButtonPowerVo[]; // 按钮权限列表
}

export interface ButtonPowerVo {
  name: string;              // 按钮名称（显示用）
  permissLabel: string;      // 权限标识（用于权限控制，必填）
  hasPermission: boolean;   // 是否有权限
  code?: string;            // 按钮代码（可选，用于前端识别）
  type?: number;            // 按钮类型（可选分类）
  remark?: string;          // 备注（可选）
}
```

## 💻 使用示例

### 方式1：使用权限标识判断

```tsx
import { getNav } from '@/api/menu';
import type { NavDTO } from '@/types/menu';

const MyComponent = () => {
  const [navData, setNavData] = useState<NavDTO[]>([]);

  useEffect(() => {
    const loadNav = async () => {
      const res = await getNav();
      setNavData(res.data || []);
    };
    loadNav();
  }, []);

  // 查找用户管理菜单
  const userMenu = navData.find(menu => menu.path === '/user');
  
  // 检查是否有导出权限
  const hasExportPermission = userMenu?.powers?.some(
    p => p.permissLabel === 'user:export' && p.hasPermission
  );

  return (
    <div>
      {hasExportPermission && (
        <Button onClick={handleExport}>导出</Button>
      )}
    </div>
  );
};
```

### 方式2：使用按钮代码判断

```tsx
// 查找导出按钮
const exportButton = userMenu?.powers?.find(p => p.code === 'export');

if (exportButton?.hasPermission) {
  // 显示导出按钮
  return <Button onClick={handleExport}>导出</Button>;
}
```

### 方式3：使用按钮名称判断（向后兼容）

```tsx
// 查找新增按钮
const addButton = userMenu?.powers?.find(p => p.name === '新增');

if (addButton?.hasPermission) {
  return <Button onClick={handleAdd}>新增</Button>;
}
```

### 方式4：封装权限判断Hook

```tsx
// hooks/useButtonPermission.ts
import { useMemo } from 'react';
import type { NavDTO, ButtonPowerVo } from '@/types/menu';

export const useButtonPermission = (
  navData: NavDTO[],
  menuPath: string
) => {
  const menu = useMemo(
    () => navData.find(m => m.path === menuPath),
    [navData, menuPath]
  );

  const hasPermission = useMemo(
    (permissLabel: string) => {
      return menu?.powers?.some(
        p => p.permissLabel === permissLabel && p.hasPermission
      ) || false;
    },
    [menu]
  );

  const getButton = useMemo(
    (code: string): ButtonPowerVo | undefined => {
      return menu?.powers?.find(p => p.code === code);
    },
    [menu]
  );

  return {
    menu,
    hasPermission,
    getButton,
    allPowers: menu?.powers || [],
  };
};

// 使用示例
const UserList = () => {
  const { navData } = useNav(); // 假设有这个hook
  const { hasPermission, getButton } = useButtonPermission(navData, '/user');

  const canExport = hasPermission('user:export');
  const exportBtn = getButton('export');

  return (
    <div>
      {canExport && (
        <Button onClick={handleExport}>
          {exportBtn?.name || '导出'}
        </Button>
      )}
    </div>
  );
};
```

### 方式5：渲染所有有权限的按钮

```tsx
const MenuButtons = ({ menu }: { menu: NavDTO }) => {
  if (!menu.powers || menu.powers.length === 0) {
    return null;
  }

  return (
    <Space>
      {menu.powers
        .filter(p => p.hasPermission)
        .map(power => (
          <Button
            key={power.permissLabel}
            onClick={() => handleButtonClick(power)}
          >
            {power.name}
          </Button>
        ))}
    </Space>
  );
};
```

## 🎯 最佳实践

### 1. 优先使用 permissLabel

`permissLabel` 是唯一且稳定的权限标识，建议优先使用：

```tsx
const canAdd = hasPermission('user:add');
const canEdit = hasPermission('user:edit');
const canDelete = hasPermission('user:delete');
```

### 2. 使用 code 进行按钮识别

`code` 字段便于前端代码识别按钮类型：

```tsx
const exportBtn = getButton('export');
const importBtn = getButton('import');
const resetPasswordBtn = getButton('resetPassword');
```

### 3. 组合使用

可以同时使用多个字段：

```tsx
// 先通过code查找，再检查权限
const exportBtn = menu.powers?.find(p => p.code === 'export');
if (exportBtn?.hasPermission) {
  // 显示导出按钮，使用按钮名称
  return <Button>{exportBtn.name}</Button>;
}
```

## ⚠️ 注意事项

1. **permissLabel 是必填的**：所有按钮都有 `permissLabel` 字段
2. **code 是可选的**：不是所有按钮都有 `code` 字段
3. **hasPermission 是动态的**：根据当前用户的角色权限计算
4. **向后兼容**：可以使用按钮名称（`name`）进行判断，但不推荐

## 📝 权限标识规范

建议使用以下格式：

- 格式：`模块:操作`
- 示例：
  - `user:add` - 用户新增
  - `user:edit` - 用户编辑
  - `user:delete` - 用户删除
  - `user:export` - 用户导出
  - `user:import` - 用户导入
  - `user:resetPassword` - 重置密码
  - `role:assign` - 角色分配

## 🔄 迁移指南

如果之前使用其他方式判断按钮权限，可以按以下方式迁移：

### 之前：使用固定类型判断

```tsx
// ❌ 旧方式（不推荐）
if (power.type === 1) { // 新增
  // ...
}
```

### 现在：使用权限标识判断

```tsx
// ✅ 新方式（推荐）
if (hasPermission('user:add')) {
  // ...
}
```

