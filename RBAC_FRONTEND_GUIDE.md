# 前端RBAC权限适配指南

## 概述

后端已实现分层RBAC权限控制，前端**基本不需要修改**，因为：

1. **自动过滤**：后端API会根据当前用户的账户类型自动过滤菜单和权限
2. **透明处理**：前端调用的接口返回的数据已经是过滤后的，无需额外处理
3. **权限校验**：后端会自动校验权限分配的合法性

## 已完成的后端修改

### 1. 菜单树接口自动过滤
```typescript
// 前端调用 getMenuTree() 时
// 后端会自动根据当前登录用户的账户类型过滤菜单和权限
const res = await getMenuTree();
// res.data 已经是过滤后的菜单树，直接使用即可
```

### 2. 角色管理自动过滤
- 创建/编辑角色时，菜单树和权限树已经根据账户类型过滤
- 如果尝试分配超出权限范围的菜单/权限，后端会返回错误

## 前端可选的增强（非必需）

### 1. 显示账户类型标识（可选）

如果需要在前端显示用户的账户类型：

```typescript
// types/user.ts
export interface UserInfo {
  id: number;
  username: string;
  accountType?: number; // 0=超管账户，1=普通账户
  // ... 其他字段
}

// 在登录后显示
{userInfo.accountType === 0 && (
  <Tag color="gold">超级管理员</Tag>
)}
```

### 2. 菜单管理显示权限限制（可选）

在菜单管理页面显示 `accountTypeLimit` 字段：

```typescript
// pages/Menu/index.tsx 的列定义中添加
{
  title: '可见范围',
  dataIndex: 'accountTypeLimit',
  width: 120,
  render: (limit: number) => {
    if (limit === 0) {
      return <Tag color="red">仅超管</Tag>;
    }
    return <Tag color="blue">所有账户</Tag>;
  },
}
```

### 3. 添加账户类型选择器（如需要）

在菜单表单中添加账户类型限制选择：

```typescript
// components/MenuFormModal.tsx
<Form.Item
  label="可见范围"
  name="accountTypeLimit"
  initialValue={1}
>
  <Select>
    <Option value={0}>仅超管账户可见</Option>
    <Option value={1}>所有账户可见</Option>
  </Select>
</Form.Item>
```

## 前端类型定义更新（可选）

```typescript
// types/menu.ts
export interface Menu {
  id: number;
  title: string;
  // ... 其他字段
  accountTypeLimit?: number; // 菜单可见的最低账户类型
}

// types/power.ts
export interface Power {
  id: number;
  name: string;
  // ... 其他字段
  accountTypeLimit?: number; // 权限可用的最低账户类型
}
```

## 实际使用场景

### 场景1：角色管理（无需修改）
```typescript
// pages/Role/components/RoleFormModal.tsx
// 调用 getMenuTree() 获取菜单树
const res = await getMenuTree();
setMenuTreeData(res.data);

// ✅ 后端已自动过滤
// - 超管账户：看到所有菜单和权限
// - 普通账户：只看到 accountTypeLimit >= 1 的菜单和权限
```

### 场景2：创建角色时分配权限（无需修改）
```typescript
// 用户选择菜单和权限后提交
const res = await createRole({
  name: '测试角色',
  menuIds: [1, 2, 3],
  powerIds: [10, 20, 30],
});

// ✅ 后端会自动校验
// - 如果普通账户尝试分配超管专属菜单，会返回错误
// - 前端只需要显示错误信息即可
if (res.code !== 200) {
  message.error(res.message); // "您没有权限分配部分菜单"
}
```

### 场景3：菜单管理（可选显示标记）
```typescript
// pages/Menu/index.tsx
// 原有代码无需修改，可选添加显示标记
{
  title: '菜单标题',
  dataIndex: 'title',
  render: (text: string, record: Menu) => (
    <Space>
      {text}
      {record.accountTypeLimit === 0 && (
        <Tag color="red" size="small">超管</Tag>
      )}
    </Space>
  ),
}
```

## 错误处理

当用户越权操作时，后端会返回错误：

```typescript
try {
  await createRole(roleData);
  message.success('创建成功');
} catch (error: any) {
  // 显示后端返回的错误信息
  message.error(error.response?.data?.message || '操作失败');
  // 典型错误信息：
  // "您没有权限分配部分菜单，请检查账户类型限制"
  // "您没有权限分配部分按钮权限，请检查账户类型限制"
}
```

## 测试建议

### 1. 使用超管账户测试
- 登录超管账户
- 进入角色管理
- 查看菜单树：应该看到所有菜单和权限

### 2. 使用普通账户测试
- 登录普通账户
- 进入角色管理
- 查看菜单树：应该只看到非超管专属的菜单和权限

### 3. 测试权限校验
- 使用普通账户
- 尝试通过API直接分配超管专属菜单（绕过前端）
- 应该收到权限错误

## 总结

**关键点**：
1. ✅ **前端无需修改核心逻辑**，后端已自动过滤
2. ✅ **现有代码继续工作**，无breaking changes
3. ✅ **权限校验在后端**，前端只需显示错误
4. 📝 **可选增强**：显示账户类型标识和权限限制标记

**建议**：
- 保持前端代码简单，依赖后端的自动过滤
- 只在需要时添加UI增强（如标记、说明）
- 重点关注用户体验（清晰的错误提示）

## 完成！
前端基本无需修改即可支持分层RBAC权限控制。
如需UI增强，参考上述可选修改即可。

