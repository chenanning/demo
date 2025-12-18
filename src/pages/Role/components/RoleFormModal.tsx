import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Spin, Checkbox, Button, Space } from 'antd';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import type { Role, RoleFormData } from '@/types/role';
import type { MenuTreeNode, Power } from '@/types/menu';
import { createRole, updateRole, getRoleDetail } from '@/api/role';
import { getMenuTree } from '@/api/menu';

interface RoleFormModalProps {
  visible: boolean;
  editingRole: Role | null;
  onClose: (refresh?: boolean) => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  visible,
  editingRole,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // 菜单树数据
  const [menuTreeData, setMenuTreeData] = useState<MenuTreeNode[]>([]);
  
  // 选中的菜单ID和按钮ID
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const [selectedPowerIds, setSelectedPowerIds] = useState<number[]>([]);
  
  // 展开的菜单ID
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);

  // 加载菜单树
  const loadMenuTree = async () => {
    try {
      const res = await getMenuTree();
      setMenuTreeData(res.data);
      // 默认展开所有一级菜单
      const firstLevelIds = res.data.map((menu) => menu.id);
      setExpandedKeys(firstLevelIds);
    } catch (error) {
      message.error('加载菜单树失败');
    }
  };

  // 构建菜单的父子关系映射
  const buildMenuParentMap = (menus: MenuTreeNode[]): Map<number, number | null> => {
    const map = new Map<number, number | null>();
    const traverse = (menu: MenuTreeNode, parentId: number | null = null) => {
      map.set(menu.id, parentId);
      if (menu.children) {
        menu.children.forEach((child) => traverse(child, menu.id));
      }
    };
    menus.forEach((menu) => traverse(menu));
    return map;
  };

  // 收集某个菜单的所有父菜单ID
  const collectParentMenuIds = (menuId: number): number[] => {
    const parentMap = buildMenuParentMap(menuTreeData);
    const result: number[] = [];
    let currentId: number | null = menuId;
    while (currentId !== null) {
      result.push(currentId);
      currentId = parentMap.get(currentId) || null;
    }
    return result;
  };

  // 收集某个菜单下的所有按钮ID
  const collectMenuPowerIds = (menuId: number): number[] => {
    const findMenu = (menus: MenuTreeNode[], id: number): MenuTreeNode | null => {
      for (const menu of menus) {
        if (menu.id === id) return menu;
        if (menu.children) {
          const found = findMenu(menu.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const menu = findMenu(menuTreeData, menuId);
    return menu?.powers?.map((p) => p.id) || [];
  };

  // 菜单选中变化
  const handleMenuCheck = (menuId: number, checked: boolean) => {
    if (checked) {
      // 选中菜单：添加该菜单及所有父菜单
      const allParentIds = collectParentMenuIds(menuId);
      const newMenuIds = [...new Set([...selectedMenuIds, ...allParentIds])];
      setSelectedMenuIds(newMenuIds);
    } else {
      // 取消菜单：移除该菜单，并取消该菜单下的所有按钮
      const newMenuIds = selectedMenuIds.filter((id) => id !== menuId);
      setSelectedMenuIds(newMenuIds);
      
      // 移除该菜单下的所有按钮
      const powerIdsToRemove = collectMenuPowerIds(menuId);
      const newPowerIds = selectedPowerIds.filter((id) => !powerIdsToRemove.includes(id));
      setSelectedPowerIds(newPowerIds);
    }
  };

  // 按钮选中变化
  const handlePowerCheck = (powerId: number, menuId: number, checked: boolean) => {
    if (checked) {
      // 选中按钮：自动选中该按钮所属的菜单（及所有父菜单）
      const allParentIds = collectParentMenuIds(menuId);
      const newMenuIds = [...new Set([...selectedMenuIds, ...allParentIds])];
      setSelectedMenuIds(newMenuIds);
      setSelectedPowerIds([...selectedPowerIds, powerId]);
    } else {
      // 取消按钮
      setSelectedPowerIds(selectedPowerIds.filter((id) => id !== powerId));
    }
  };

  // 切换展开/收起
  const toggleExpand = (menuId: number) => {
    if (expandedKeys.includes(menuId)) {
      setExpandedKeys(expandedKeys.filter((id) => id !== menuId));
    } else {
      setExpandedKeys([...expandedKeys, menuId]);
    }
  };

  // 加载编辑数据
  const loadEditData = async (id: number) => {
    setDataLoading(true);
    try {
      const res = await getRoleDetail(id);
      const { name, remark, menuIds, powerIds } = res.data;

      // 设置表单
      form.setFieldsValue({
        name: name,
        remark: remark,
      });

      // 过滤掉无效的ID
      const validMenuIds = menuIds.filter((id: number) => id > 0 && !isNaN(id));
      const validPowerIds = powerIds.filter((id: number) => id > 0 && !isNaN(id));
      
      // 直接设置（不需要过滤，因为新的UI设计会自动处理）
      setSelectedMenuIds(validMenuIds);
      setSelectedPowerIds(validPowerIds);
    } catch (error) {
      message.error('加载角色详情失败');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadMenuTree();
      if (editingRole) {
        loadEditData(editingRole.id);
      }
    } else {
      // 重置状态
      form.resetFields();
      setSelectedMenuIds([]);
      setSelectedPowerIds([]);
      setExpandedKeys([]);
    }
  }, [visible, editingRole]);

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 直接使用选中的菜单ID和按钮ID
      // 注意：selectedMenuIds 已经包含了所有必需的父菜单（在选中时自动添加的）
      const formData: RoleFormData = {
        ...values,
        id: editingRole?.id,
        menuIds: selectedMenuIds,
        powerIds: selectedPowerIds,
      };

      setLoading(true);
      if (editingRole) {
        await updateRole(formData);
        message.success('编辑成功');
      } else {
        await createRole(formData);
        message.success('新增成功');
      }
      onClose(true);
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(editingRole ? '编辑失败' : '新增失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染菜单节点
  const renderMenu = (menu: MenuTreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedKeys.includes(menu.id);
    const isSelected = selectedMenuIds.includes(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;
    const hasPowers = menu.powers && menu.powers.length > 0;

    return (
      <div key={menu.id} style={{ marginBottom: 8 }}>
        {/* 菜单节点 */}
        <div
          style={{
            paddingLeft: level * 24,
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          {/* 展开/收起按钮 */}
          {hasChildren && (
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              onClick={() => toggleExpand(menu.id)}
              style={{ padding: '0 4px', marginRight: 4 }}
            />
          )}
          {!hasChildren && <span style={{ width: 24, display: 'inline-block' }} />}

          {/* 菜单复选框 */}
          <Checkbox
            checked={isSelected}
            onChange={(e) => handleMenuCheck(menu.id, e.target.checked)}
          >
            <span style={{ fontWeight: level === 0 ? 600 : 400 }}>{menu.title}</span>
          </Checkbox>
        </div>

        {/* 按钮列表（只在菜单被选中时显示） */}
        {isSelected && hasPowers && (
          <div
            style={{
              paddingLeft: (level + 1) * 24 + 28,
              marginBottom: 8,
              padding: '8px 12px',
              background: '#fafafa',
              borderRadius: 4,
              marginLeft: level * 24 + 28,
            }}
          >
            <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>按钮权限：</div>
            <Space wrap>
              {menu.powers!.map((power) => (
                <Checkbox
                  key={power.id}
                  checked={selectedPowerIds.includes(power.id)}
                  onChange={(e) => handlePowerCheck(power.id, menu.id, e.target.checked)}
                >
                  {power.name}
                </Checkbox>
              ))}
            </Space>
          </div>
        )}

        {/* 子菜单（递归渲染） */}
        {isExpanded && hasChildren && (
          <div>{menu.children!.map((child) => renderMenu(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={editingRole ? '编辑角色' : '新增角色'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Spin spinning={dataLoading}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item label="角色描述" name="remark">
            <Input.TextArea rows={3} placeholder="请输入角色描述（可选）" />
          </Form.Item>

          <Form.Item label="功能权限" required>
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                padding: 16,
                maxHeight: 450,
                overflow: 'auto',
                background: '#fff',
              }}
            >
              {menuTreeData.length > 0 ? (
                menuTreeData.map((menu) => renderMenu(menu, 0))
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  加载中...
                </div>
              )}
            </div>
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              提示：选中菜单后可以看到该菜单下的按钮权限。选中按钮会自动选中所属菜单。
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RoleFormModal;

