import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Spin, Checkbox, Button, Space, Select, Tabs } from 'antd';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import type { RoleTemplate, RoleTemplateFormData } from '@/types/roleTemplate';
import type { MenuTreeNode, Power } from '@/types/menu';
import { saveRoleTemplate, getRoleTemplateDetail } from '@/api/roleTemplate';
import { getMenuTree } from '@/api/menu';

const { TabPane } = Tabs;

interface RoleTemplateFormModalProps {
  visible: boolean;
  editingTemplate: RoleTemplate | null;
  onClose: (refresh?: boolean) => void;
}

const RoleTemplateFormModal: React.FC<RoleTemplateFormModalProps> = ({
  visible,
  editingTemplate,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // 菜单树数据
  const [menuTreeData, setMenuTreeData] = useState<MenuTreeNode[]>([]);
  
  // 最大权限选中的ID
  const [maxSelectedMenuIds, setMaxSelectedMenuIds] = useState<number[]>([]);
  const [maxSelectedPowerIds, setMaxSelectedPowerIds] = useState<number[]>([]);
  
  // 默认权限选中的ID
  const [defaultSelectedMenuIds, setDefaultSelectedMenuIds] = useState<number[]>([]);
  const [defaultSelectedPowerIds, setDefaultSelectedPowerIds] = useState<number[]>([]);
  
  // 展开的菜单ID
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);
  
  // 当前激活的Tab（最大权限/默认权限）
  const [activeTab, setActiveTab] = useState<string>('max');

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

  // 加载模板详情
  const loadTemplateDetail = async () => {
    if (!editingTemplate) return;
    
    setDataLoading(true);
    try {
      const res = await getRoleTemplateDetail(editingTemplate.id);
      const detail = res.data;
      
      form.setFieldsValue({
        templateName: detail.templateName,
        templateCode: detail.templateCode,
        customerType: detail.customerType,
        accountType: detail.accountType,
        roleType: detail.roleType,
        remark: detail.remark,
      });
      
      setMaxSelectedMenuIds(detail.maxMenuIds || []);
      setMaxSelectedPowerIds(detail.maxPowerIds || []);
      setDefaultSelectedMenuIds(detail.defaultMenuIds || []);
      setDefaultSelectedPowerIds(detail.defaultPowerIds || []);
    } catch (error) {
      message.error('加载模板详情失败');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadMenuTree();
      if (editingTemplate) {
        loadTemplateDetail();
      } else {
        form.resetFields();
        setMaxSelectedMenuIds([]);
        setMaxSelectedPowerIds([]);
        setDefaultSelectedMenuIds([]);
        setDefaultSelectedPowerIds([]);
      }
    }
  }, [visible, editingTemplate]);

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

  // 获取所有子菜单ID
  const getAllChildMenuIds = (menuId: number, menus: MenuTreeNode[]): number[] => {
    const result: number[] = [];
    const findMenu = (id: number, list: MenuTreeNode[]): MenuTreeNode | null => {
      for (const menu of list) {
        if (menu.id === id) return menu;
        if (menu.children) {
          const found = findMenu(id, menu.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const menu = findMenu(menuId, menus);
    if (menu && menu.children) {
      menu.children.forEach((child) => {
        result.push(child.id);
        const grandChildren = getAllChildMenuIds(child.id, menus);
        result.push(...grandChildren);
      });
    }
    return result;
  };

  // 切换展开/收起
  const toggleExpand = (menuId: number) => {
    if (expandedKeys.includes(menuId)) {
      setExpandedKeys(expandedKeys.filter((id) => id !== menuId));
    } else {
      setExpandedKeys([...expandedKeys, menuId]);
    }
  };

  // 处理菜单选中（最大权限）
  const handleMaxMenuCheck = (menuId: number, checked: boolean) => {
    let newSelected = [...maxSelectedMenuIds];
    
    if (checked) {
      newSelected.push(menuId);
      // 自动选中所有子菜单
      const childIds = getAllChildMenuIds(menuId, menuTreeData);
      newSelected = [...new Set([...newSelected, ...childIds])];
    } else {
      newSelected = newSelected.filter((id) => id !== menuId);
      // 自动取消选中所有子菜单
      const childIds = getAllChildMenuIds(menuId, menuTreeData);
      newSelected = newSelected.filter((id) => !childIds.includes(id));
    }
    
    setMaxSelectedMenuIds(newSelected);
  };

  // 处理按钮权限选中（最大权限）
  const handleMaxPowerCheck = (powerId: number, menuId: number, checked: boolean) => {
    let newSelected = [...maxSelectedPowerIds];
    let newMenuSelected = [...maxSelectedMenuIds];
    
    if (checked) {
      newSelected.push(powerId);
      // 自动选中所属菜单
      if (!newMenuSelected.includes(menuId)) {
        newMenuSelected.push(menuId);
      }
    } else {
      newSelected = newSelected.filter((id) => id !== powerId);
    }
    
    setMaxSelectedPowerIds(newSelected);
    setMaxSelectedMenuIds(newMenuSelected);
  };

  // 处理菜单选中（默认权限）
  const handleDefaultMenuCheck = (menuId: number, checked: boolean) => {
    // 检查是否在最大权限范围内
    if (checked && !maxSelectedMenuIds.includes(menuId)) {
      message.warning('默认权限不能超出最大权限范围');
      return;
    }
    
    let newSelected = [...defaultSelectedMenuIds];
    
    if (checked) {
      newSelected.push(menuId);
      // 自动选中所有子菜单（但要在最大权限范围内）
      const childIds = getAllChildMenuIds(menuId, menuTreeData);
      const validChildIds = childIds.filter((id) => maxSelectedMenuIds.includes(id));
      newSelected = [...new Set([...newSelected, ...validChildIds])];
    } else {
      newSelected = newSelected.filter((id) => id !== menuId);
      // 自动取消选中所有子菜单
      const childIds = getAllChildMenuIds(menuId, menuTreeData);
      newSelected = newSelected.filter((id) => !childIds.includes(id));
    }
    
    setDefaultSelectedMenuIds(newSelected);
  };

  // 处理按钮权限选中（默认权限）
  const handleDefaultPowerCheck = (powerId: number, menuId: number, checked: boolean) => {
    // 检查是否在最大权限范围内
    if (checked && !maxSelectedPowerIds.includes(powerId)) {
      message.warning('默认权限不能超出最大权限范围');
      return;
    }
    
    let newSelected = [...defaultSelectedPowerIds];
    let newMenuSelected = [...defaultSelectedMenuIds];
    
    if (checked) {
      newSelected.push(powerId);
      // 自动选中所属菜单（但要在最大权限范围内）
      if (maxSelectedMenuIds.includes(menuId) && !newMenuSelected.includes(menuId)) {
        newMenuSelected.push(menuId);
      }
    } else {
      newSelected = newSelected.filter((id) => id !== powerId);
    }
    
    setDefaultSelectedPowerIds(newSelected);
    setDefaultSelectedMenuIds(newMenuSelected);
  };

  // 渲染菜单节点（最大权限）
  const renderMaxMenu = (menu: MenuTreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedKeys.includes(menu.id);
    const isSelected = maxSelectedMenuIds.includes(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;
    const hasPowers = menu.powers && menu.powers.length > 0;

    return (
      <div key={menu.id} style={{ marginBottom: 8 }}>
        <div
          style={{
            paddingLeft: level * 24,
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
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

          <Checkbox
            checked={isSelected}
            onChange={(e) => handleMaxMenuCheck(menu.id, e.target.checked)}
          >
            <span style={{ fontWeight: level === 0 ? 600 : 400 }}>{menu.title}</span>
          </Checkbox>
        </div>

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
                  checked={maxSelectedPowerIds.includes(power.id)}
                  onChange={(e) => handleMaxPowerCheck(power.id, menu.id, e.target.checked)}
                >
                  {power.name}
                </Checkbox>
              ))}
            </Space>
          </div>
        )}

        {isExpanded && hasChildren && (
          <div>{menu.children!.map((child) => renderMaxMenu(child, level + 1))}</div>
        )}
      </div>
    );
  };

  // 渲染菜单节点（默认权限）
  const renderDefaultMenu = (menu: MenuTreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedKeys.includes(menu.id);
    const isMaxSelected = maxSelectedMenuIds.includes(menu.id);
    const isSelected = defaultSelectedMenuIds.includes(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;
    const hasPowers = menu.powers && menu.powers.length > 0;

    // 如果不在最大权限范围内，不显示
    if (!isMaxSelected) {
      return null;
    }

    return (
      <div key={menu.id} style={{ marginBottom: 8 }}>
        <div
          style={{
            paddingLeft: level * 24,
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
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

          <Checkbox
            checked={isSelected}
            onChange={(e) => handleDefaultMenuCheck(menu.id, e.target.checked)}
            disabled={!isMaxSelected}
          >
            <span style={{ fontWeight: level === 0 ? 600 : 400 }}>{menu.title}</span>
          </Checkbox>
        </div>

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
              {menu.powers!.map((power) => {
                const isMaxPowerSelected = maxSelectedPowerIds.includes(power.id);
                const isPowerSelected = defaultSelectedPowerIds.includes(power.id);
                return (
                  <Checkbox
                    key={power.id}
                    checked={isPowerSelected}
                    onChange={(e) => handleDefaultPowerCheck(power.id, menu.id, e.target.checked)}
                    disabled={!isMaxPowerSelected}
                  >
                    {power.name}
                  </Checkbox>
                );
              })}
            </Space>
          </div>
        )}

        {isExpanded && hasChildren && (
          <div>{menu.children!.map((child) => renderDefaultMenu(child, level + 1))}</div>
        )}
      </div>
    );
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: RoleTemplateFormData = {
        ...values,
        maxMenuIds: maxSelectedMenuIds,
        maxPowerIds: maxSelectedPowerIds,
        defaultMenuIds: defaultSelectedMenuIds,
        defaultPowerIds: defaultSelectedPowerIds,
      };
      
      if (editingTemplate) {
        formData.id = editingTemplate.id;
      }

      setLoading(true);
      await saveRoleTemplate(formData);
      message.success(editingTemplate ? '更新成功' : '创建成功');
      onClose(true);
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error?.response?.data?.message || (editingTemplate ? '更新失败' : '创建失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingTemplate ? '编辑角色模板' : '新增角色模板'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={1000}
      destroyOnClose
    >
      <Spin spinning={dataLoading}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="模板名称"
            name="templateName"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称，如：运营账户管理员" />
          </Form.Item>

          <Form.Item
            label="模板编码"
            name="templateCode"
            rules={[{ required: true, message: '请输入模板编码' }]}
          >
            <Input placeholder="请输入模板编码，如：OPER_ACCOUNT_ADMIN" disabled={!!editingTemplate} />
          </Form.Item>

          <Form.Item
            label="客户类型"
            name="customerType"
            rules={[{ required: true, message: '请选择客户类型' }]}
          >
            <Select placeholder="请选择客户类型">
              <Select.Option value={1}>运营管理</Select.Option>
              <Select.Option value={2}>开发者管理</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="账户类型"
            name="accountType"
          >
            <Select placeholder="请选择账户类型">
              <Select.Option value={0}>超管账户</Select.Option>
              <Select.Option value={1}>普通账户</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="角色类型"
            name="roleType"
          >
            <Input placeholder="请输入角色类型，如：ACCOUNT_ADMIN" />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={2} placeholder="请输入备注（可选）" />
          </Form.Item>

          <Form.Item label="权限配置" required>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="最大权限" key="max">
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: 6,
                    padding: 16,
                    maxHeight: 400,
                    overflow: 'auto',
                    background: '#fff',
                  }}
                >
                  {menuTreeData.length > 0 ? (
                    menuTreeData.map((menu) => renderMaxMenu(menu, 0))
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      加载中...
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  提示：设置该角色类型可以拥有的最大权限范围
                </div>
              </TabPane>
              <TabPane tab="默认权限" key="default">
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: 6,
                    padding: 16,
                    maxHeight: 400,
                    overflow: 'auto',
                    background: '#fff',
                  }}
                >
                  {menuTreeData.length > 0 ? (
                    menuTreeData.map((menu) => renderDefaultMenu(menu, 0))
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      请先设置最大权限
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  提示：设置新增用户时默认获得的权限，不能超出最大权限范围
                </div>
              </TabPane>
            </Tabs>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RoleTemplateFormModal;

