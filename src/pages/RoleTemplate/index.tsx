import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Form,
  Input,
  message,
  Popconfirm,
  Card,
  Tag,
  Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RoleTemplate } from '@/types/roleTemplate';
import { getRoleTemplateList, deleteRoleTemplate } from '@/api/roleTemplate';
import RoleTemplateFormModal from './components/RoleTemplateFormModal';

const RoleTemplateManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<RoleTemplate[]>([]);
  const [searchForm] = Form.useForm();

  // 控制弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RoleTemplate | null>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getRoleTemplateList();
      setDataSource(res.data);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 搜索
  const handleSearch = () => {
    loadData();
  };

  // 重置
  const handleReset = () => {
    searchForm.resetFields();
    loadData();
  };

  // 新增
  const handleAdd = () => {
    setEditingTemplate(null);
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: RoleTemplate) => {
    setEditingTemplate(record);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteRoleTemplate(id);
      message.success('删除成功');
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || '删除失败');
    }
  };

  // 弹窗关闭
  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false);
    setEditingTemplate(null);
    if (refresh) {
      loadData();
    }
  };

  // 获取客户类型标签
  const getCustomerTypeTag = (type?: number) => {
    if (type === 1) return <Tag color="blue">运营管理</Tag>;
    if (type === 2) return <Tag color="green">开发者管理</Tag>;
    if (type === 3) return <Tag color="red">无敌管理员</Tag>;
    return <Tag>未设置</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<RoleTemplate> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '模板名称',
      dataIndex: 'templateName',
      width: 200,
    },
    {
      title: '模板编码',
      dataIndex: 'templateCode',
      width: 200,
    },
    {
      title: '客户类型',
      dataIndex: 'customerType',
      width: 120,
      render: (val: number) => getCustomerTypeTag(val),
    },
    {
      title: '角色类型',
      dataIndex: 'roleType',
      width: 150,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
            title="确定要删除这个模板吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      {/* 搜索栏 */}
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="templateName" label="模板名称">
          <Input placeholder="请输入模板名称" allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 操作栏 */}
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增模板
        </Button>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
      />

      {/* 新增/编辑弹窗 */}
      {modalVisible && (
        <RoleTemplateFormModal
          visible={modalVisible}
          editingTemplate={editingTemplate}
          onClose={handleModalClose}
        />
      )}
    </Card>
  );
};

export default RoleTemplateManagement;

