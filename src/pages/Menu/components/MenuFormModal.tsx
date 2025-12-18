import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  TreeSelect,
  Radio,
  message,
  Spin,
} from 'antd';
import type { Menu } from '@/types/menu';
import { createMenu, updateMenu, getMenuById, getAllMenus } from '@/api/menu';

interface MenuFormModalProps {
  visible: boolean;
  editingMenu: Menu | null;
  onClose: (refresh?: boolean) => void;
}

const MenuFormModal: React.FC<MenuFormModalProps> = ({
  visible,
  editingMenu,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [menuOptions, setMenuOptions] = useState<any[]>([]);

  // 加载菜单列表（作为父菜单选项）
  const loadMenuOptions = async () => {
    try {
      const res = await getAllMenus();
      // 构建树形选项，排除当前编辑的菜单（不能选自己作为父菜单）
      const options = buildMenuTreeOptions(
        res.data.filter((m) => m.id !== editingMenu?.id)
      );
      setMenuOptions([
        { value: 0, title: '顶级菜单', key: 0 },
        ...options,
      ]);
    } catch (error) {
      message.error('加载菜单列表失败');
    }
  };

  // 构建树形选项
  const buildMenuTreeOptions = (menus: Menu[]): any[] => {
    const map = new Map<number, any>();
    const roots: any[] = [];

    menus.forEach((menu) => {
      map.set(menu.id, {
        value: menu.id,
        title: menu.title,
        key: menu.id,
        children: [],
      });
    });

    menus.forEach((menu) => {
      const node = map.get(menu.id)!;
      if (
        menu.parentId === null ||
        menu.parentId === 0 ||
        menu.parentId === undefined
      ) {
        roots.push(node);
      } else {
        const parent = map.get(menu.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return roots;
  };

  // 加载编辑数据
  const loadEditData = async (id: number) => {
    setDataLoading(true);
    try {
      const res = await getMenuById(id);
      form.setFieldsValue({
        ...res.data,
        parentId: res.data.parentId || 0,
      });
    } catch (error) {
      message.error('加载菜单详情失败');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadMenuOptions();
      if (editingMenu) {
        loadEditData(editingMenu.id);
      } else {
        // 新增时设置默认值
        form.setFieldsValue({
          parentId: 0,
          sort: 0,
          menuType: 0,
          status: 'A',
          visible: '0',
          isCache: 1,
          isFrame: 1,
          platformType: 1,
          accountTypeLimit: 1, // 默认所有账户可见
        });
      }
    } else {
      form.resetFields();
    }
  }, [visible, editingMenu]);

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 处理 parentId
      if (values.parentId === 0) {
        values.parentId = null;
      }

      setLoading(true);
      if (editingMenu) {
        await updateMenu({ ...values, id: editingMenu.id });
        message.success('编辑成功');
      } else {
        await createMenu(values);
        message.success('新增成功');
      }
      onClose(true);
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error?.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingMenu ? '编辑菜单' : '新增菜单'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Spin spinning={dataLoading}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="菜单标题"
            name="title"
            rules={[{ required: true, message: '请输入菜单标题' }]}
          >
            <Input placeholder="请输入菜单标题" />
          </Form.Item>

          <Form.Item label="英文标题" name="englishTitle">
            <Input placeholder="请输入英文标题（可选）" />
          </Form.Item>

          <Form.Item
            label="父菜单"
            name="parentId"
            rules={[{ required: true, message: '请选择父菜单' }]}
          >
            <TreeSelect
              treeData={menuOptions}
              placeholder="请选择父菜单（选择顶级菜单则为一级菜单）"
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item
            label="路由路径"
            name="path"
            rules={[{ required: true, message: '请输入路由路径' }]}
          >
            <Input placeholder="如：/user/list" />
          </Form.Item>

          <Form.Item label="组件路径" name="component">
            <Input placeholder="如：user/index 或 Layout（目录）" />
          </Form.Item>

          <Form.Item label="图标" name="icon">
            <Input placeholder="图标名称，如：User" />
          </Form.Item>

          <Form.Item
            label="排序"
            name="sort"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="菜单类型"
            name="menuType"
            rules={[{ required: true, message: '请选择菜单类型' }]}
          >
            <Radio.Group>
              <Radio value={0}>无子菜单（叶子节点）</Radio>
              <Radio value={1}>有子菜单（目录）</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="平台类型"
            name="platformType"
            rules={[{ required: true, message: '请选择平台类型' }]}
          >
            <Select placeholder="请选择平台类型">
              <Select.Option value={1}>管理端</Select.Option>
              <Select.Option value={2}>用户端</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="可见范围"
            name="accountTypeLimit"
            rules={[{ required: true, message: '请选择可见范围' }]}
            tooltip="设置哪种类型的账户可以看到此菜单"
          >
            <Radio.Group>
              <Radio value={1}>所有账户可见</Radio>
              <Radio value={0}>仅超管账户可见</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Radio.Group>
              <Radio value="A">正常</Radio>
              <Radio value="D">禁用</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="是否可见" name="visible">
            <Radio.Group>
              <Radio value="0">显示</Radio>
              <Radio value="1">隐藏</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="是否缓存" name="isCache">
            <Radio.Group>
              <Radio value={1}>缓存</Radio>
              <Radio value={0}>不缓存</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="打开方式" name="isFrame">
            <Radio.Group>
              <Radio value={1}>内部打开</Radio>
              <Radio value={0}>外部打开（外链）</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default MenuFormModal;


