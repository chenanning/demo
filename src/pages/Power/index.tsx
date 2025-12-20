import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Radio,
  message,
  Popconfirm,
  Card,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Power } from '@/types/menu';
import { getAllPowers, deletePower, createPower, updatePower, getPowerById } from '@/api/power';
import { getAllMenus } from '@/api/menu';

const PowerManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Power[]>([]);
  const [menuOptions, setMenuOptions] = useState<any[]>([]);

  // 控制弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPower, setEditingPower] = useState<Power | null>(null);
  const [form] = Form.useForm();

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAllPowers();
      setDataSource(res.data);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载菜单选项
  const loadMenuOptions = async () => {
    try {
      const res = await getAllMenus();
      const options = res.data
        .filter((m) => m.menuType === 0) // 只显示叶子节点菜单
        .map((m) => ({
          label: m.title,
          value: m.id,
        }));
      setMenuOptions(options);
    } catch (error) {
      message.error('加载菜单列表失败');
    }
  };

  useEffect(() => {
    loadData();
    loadMenuOptions();
  }, []);

  // 新增
  const handleAdd = () => {
    setEditingPower(null);
    form.resetFields();
    form.setFieldsValue({
      type: undefined, // 类型改为可选，不设置默认值
      sort: 0,
      status: 'A',
      platformType: 1,
      accountTypeLimit: 1, // 默认所有账户可用
    });
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = async (record: Power) => {
    try {
      const res = await getPowerById(record.id);
      setEditingPower(res.data);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      message.error('加载权限详情失败');
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deletePower(id);
      message.success('删除成功');
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || '删除失败');
    }
  };

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingPower) {
        await updatePower({ ...values, id: editingPower.id });
        message.success('编辑成功');
      } else {
        await createPower(values);
        message.success('新增成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error?.response?.data?.message || '操作失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<Power> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '英文名称',
      dataIndex: 'englishTitle',
      width: 150,
    },
    {
      title: '按钮代码',
      dataIndex: 'code',
      width: 120,
      ellipsis: true,
    },
    {
      title: '所属菜单',
      dataIndex: 'menuId',
      width: 150,
      render: (menuId: number) => {
        const menu = menuOptions.find((m) => m.value === menuId);
        return menu ? menu.label : `菜单ID: ${menuId}`;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'A' ? 'success' : 'error'}>
          {status === 'A' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
            description="删除后，使用该权限的角色将无法使用此功能"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      {/* 操作栏 */}
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增按钮
        </Button>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1600 }}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingPower ? '编辑按钮' : '新增按钮'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="权限名称"
            name="name"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="如：用户新增" />
          </Form.Item>

          <Form.Item label="英文名称" name="englishTitle">
            <Input placeholder="如：User Add" />
          </Form.Item>

          <Form.Item
            label="按钮代码"
            name="code"
            tooltip="用于前端识别按钮，如：export、import、resetPassword等（可选）"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="如：export、import等（可选）" />
          </Form.Item>

          <Form.Item
            label="所属菜单"
            name="menuId"
            rules={[{ required: true, message: '请选择所属菜单' }]}
          >
            <Select placeholder="请选择菜单" options={menuOptions} />
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Radio.Group>
              <Radio value="A">正常</Radio>
              <Radio value="D">禁用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PowerManagement;


