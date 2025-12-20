# 按钮权限管理功能说明

## 📋 功能概述

按钮权限管理用于管理系统中的按钮权限，每个按钮权限都关联到一个菜单，用于控制前端按钮的显示和后端接口的访问权限。

---

## 🎯 按钮权限的作用

### 1. **前端按钮控制**

通过 `v-auth` 指令控制按钮是否显示：

```vue
<template>
  <!-- 只有拥有 user:add 权限的用户才能看到这个按钮 -->
  <el-button v-auth="'user:add'" @click="handleAdd">
    新增用户
  </el-button>
</template>
```

### 2. **后端接口保护**

通过 `@PreAuthorize` 注解保护接口：

```java
@PreAuthorize("hasAuthority('user:add')")
@PostMapping("/user")
public Result<Void> addUser(@RequestBody UserDTO dto) {
    // 只有拥有 user:add 权限的用户才能调用
}
```

---

## ✨ 功能特性

### 1. 按钮列表

- 显示所有按钮权限
- 展示按钮的详细信息：
  - 权限名称（中文）
  - 英文名称
  - 所属菜单
  - 权限类型（查看/新增/编辑/审核/删除）
  - 权限标识（后端使用）
  - 前端标识（前端使用）
  - 排序
  - 状态

### 2. 新增按钮

**基本信息**：
- 权限名称（必填）：如"用户新增"
- 英文名称（可选）：如"User Add"
- 所属菜单（必选）：选择该按钮属于哪个菜单

**权限配置**：
- 权限类型（必选）：
  - `0` = 查看
  - `1` = 新增
  - `2` = 编辑
  - `3` = 审核
  - `4` = 删除

**标识配置**：
- 权限标识（必填）：用于后端 `@PreAuthorize` 注解
  - 格式：`模块:功能:操作`
  - 示例：`user:add`、`user:edit`、`role:delete`
- 前端标识（可选）：用于前端 `v-auth` 指令
  - 默认与权限标识相同
  - 示例：`user:add`

**其他配置**：
- 排序：数字，越小越靠前
- 平台类型：管理端 / 用户端
- 状态：正常 / 禁用

### 3. 编辑按钮

- 点击"编辑"按钮
- 自动回显按钮信息
- 修改后保存
- 权限标识不能重复

### 4. 删除按钮

**删除前检查**：
- 是否被角色使用（被使用则不能删除）

**删除方式**：
- 逻辑删除（修改状态为 'D'）

---

## 📊 权限类型说明

| 类型 | 值 | 说明 | 示例 |
|------|---|------|------|
| **查看** | 0 | 查看列表、详情 | 用户列表、角色详情 |
| **新增** | 1 | 创建新数据 | 新增用户、新增角色 |
| **编辑** | 2 | 修改数据 | 编辑用户、编辑角色 |
| **审核** | 3 | 审核数据 | 审核订单、审核申请 |
| **删除** | 4 | 删除数据 | 删除用户、删除角色 |

---

## 🔗 按钮与菜单的关系

### 关系说明

- **一个菜单可以有多个按钮**
- **一个按钮只属于一个菜单**
- **按钮通过 `menu_id` 关联到菜单**

### 示例

```
用户管理（菜单）
  ├─ 用户列表（菜单）
  │   ├─ 用户查看（按钮，type=0）
  │   ├─ 用户新增（按钮，type=1）
  │   ├─ 用户编辑（按钮，type=2）
  │   ├─ 用户删除（按钮，type=4）
  │   └─ 用户审核（按钮，type=3）
  └─ 用户导入（菜单）
      └─ 用户导入（按钮，type=1）
```

---

## 🎨 权限标识命名规范

### 推荐格式：`模块:功能:操作`

```plaintext
# 用户管理模块
user:add        # 新增用户
user:edit       # 编辑用户
user:delete     # 删除用户
user:view       # 查看用户
user:audit      # 审核用户
user:export     # 导出用户
user:import     # 导入用户

# 角色管理模块
role:add
role:edit
role:delete
role:view
role:permission:assign  # 分配权限

# 菜单管理模块
menu:add
menu:edit
menu:delete
menu:view

# 系统设置模块
system:param:view
system:param:edit
system:log:view
system:log:delete
```

### 命名规则

1. **使用小写字母**
2. **单词用冒号分隔**
3. **保持一致性**：同一模块使用相同前缀
4. **语义清晰**：一看就知道是什么权限

---

## 💡 使用场景

### 场景1：为"用户列表"菜单添加按钮

**步骤**：
1. 进入"按钮管理"页面
2. 点击"新增按钮"
3. 填写信息：
   - 权限名称：`用户新增`
   - 所属菜单：选择 `用户列表`
   - 权限类型：选择 `新增`
   - 权限标识：`user:add`
   - 前端标识：`user:add`
4. 保存

**结果**：
- 在角色管理中，可以为角色分配该按钮权限
- 前端可以使用 `v-auth="user:add"` 控制按钮显示
- 后端可以使用 `@PreAuthorize("hasAuthority('user:add')")` 保护接口

### 场景2：批量添加标准按钮

**标准按钮组合**（适用于大多数列表页）：
- 查看（type=0, permissLabel=模块:view）
- 新增（type=1, permissLabel=模块:add）
- 编辑（type=2, permissLabel=模块:edit）
- 删除（type=4, permissLabel=模块:delete）

**示例**：为"角色列表"添加标准按钮
1. 新增：`角色查看` - `role:view` - type=0
2. 新增：`角色新增` - `role:add` - type=1
3. 新增：`角色编辑` - `role:edit` - type=2
4. 新增：`角色删除` - `role:delete` - type=4

---

## ⚠️ 注意事项

### 1. 删除限制

- **被角色使用的按钮不能删除**
  - 解决方案：先在角色管理中取消该按钮的分配

### 2. 权限标识唯一性

- **权限标识不能重复**
- 系统会自动检查重复

### 3. 所属菜单选择

- **建议选择叶子节点菜单**（menu_type=0）
- 按钮通常属于具体的页面，而不是目录

### 4. 前端标识与权限标识

- **可以相同**：大多数情况下，前端标识 = 权限标识
- **可以不同**：如果需要区分前端和后端的权限控制

---

## 🔍 排查问题

### 问题1：按钮不显示

**可能原因**：
- 按钮状态为"禁用"
- 未分配给当前角色
- 前端 `v-auth` 指令配置错误

**解决方案**：
- 检查按钮状态
- 在角色管理中分配按钮给角色
- 检查前端代码

### 问题2：接口返回 403

**可能原因**：
- 用户没有该权限
- 后端 `@PreAuthorize` 注解配置错误
- 权限标识不匹配

**解决方案**：
- 检查用户角色是否拥有该权限
- 检查后端注解中的权限标识
- 确认权限标识与按钮配置一致

### 问题3：删除按钮失败

**可能原因**：
- 按钮被角色使用

**解决方案**：
- 先在角色管理中取消该按钮的分配
- 然后再删除按钮

---

## 🚀 最佳实践

### 1. 按钮命名

**权限名称**：
- 使用简洁的中文
- 格式：`功能 + 操作`
- 示例：`用户新增`、`角色删除`、`菜单编辑`

**权限标识**：
- 使用英文，小写
- 格式：`模块:操作`
- 示例：`user:add`、`role:delete`、`menu:edit`

### 2. 按钮分组

**按菜单分组**：
- 同一菜单下的按钮放在一起
- 便于管理和查找

**按类型分组**：
- 查看类按钮：type=0
- 操作类按钮：type=1,2,3,4

### 3. 权限标识设计

**统一前缀**：
- 同一模块使用相同前缀
- 如：`user:*`、`role:*`、`menu:*`

**语义清晰**：
- 一看就知道是什么权限
- 避免使用缩写

---

## 📱 前端集成示例

### Vue 3 + Ant Design

```vue
<template>
  <div>
    <!-- 查看按钮 -->
    <Button v-auth="'user:view'" @click="handleView">
      查看
    </Button>
    
    <!-- 新增按钮 -->
    <Button v-auth="'user:add'" type="primary" @click="handleAdd">
      新增
    </Button>
    
    <!-- 编辑按钮 -->
    <Button v-auth="'user:edit'" @click="handleEdit">
      编辑
    </Button>
    
    <!-- 删除按钮 -->
    <Button v-auth="'user:delete'" danger @click="handleDelete">
      删除
    </Button>
  </div>
</template>
```

### React + Ant Design

```tsx
import { useAuth } from '@/hooks/useAuth';

const UserList = () => {
  const { hasPermission } = useAuth();
  
  return (
    <Space>
      {hasPermission('user:view') && (
        <Button onClick={handleView}>查看</Button>
      )}
      {hasPermission('user:add') && (
        <Button type="primary" onClick={handleAdd}>新增</Button>
      )}
      {hasPermission('user:edit') && (
        <Button onClick={handleEdit}>编辑</Button>
      )}
      {hasPermission('user:delete') && (
        <Button danger onClick={handleDelete}>删除</Button>
      )}
    </Space>
  );
};
```

---

## 🎯 后续优化

- [ ] 支持批量导入按钮
- [ ] 支持按钮模板（快速创建标准按钮组合）
- [ ] 支持按钮预览
- [ ] 支持按钮复制
- [ ] 增加搜索筛选功能
- [ ] 支持按菜单分组显示

---

## 📚 相关文档

- **角色管理**：角色如何分配按钮权限
- **菜单管理**：按钮所属的菜单如何配置
- **权限控制**：前后端如何使用权限标识



