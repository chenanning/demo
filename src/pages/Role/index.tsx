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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Role, RolePageParams } from '@/types/role';
import { getRolePage, deleteRole } from '@/api/role';
import RoleFormModal from './components/RoleFormModal';

const RoleManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();

  // 控制弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // 加载数据
  const loadData = async (params?: Partial<RolePageParams>) => {
    setLoading(true);
    try {
      const searchValues = searchForm.getFieldsValue();
      const res = await getRolePage({
        page: params?.page || current,
        limit: params?.limit || pageSize,
        name: searchValues.name,
      });
      setDataSource(res.data.records);
      setTotal(res.data.total);
      // 后端返回的 current 对应前端的 current
      setCurrent(res.data.current);
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
    setCurrent(1);
    loadData({ page: 1 });
  };

  // 重置
  const handleReset = () => {
    searchForm.resetFields();
    setCurrent(1);
    loadData({ page: 1 });
  };

  // 新增
  const handleAdd = () => {
    setEditingRole(null);
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: Role) => {
    setEditingRole(record);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 弹窗关闭
  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false);
    setEditingRole(null);
    if (refresh) {
      loadData();
    }
  };

  // 表格列定义
  const columns: ColumnsType<Role> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      width: 100,
      render: (val: number) => val ?? 0,
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
            title="确定要删除这个角色吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.isSystem === '1'}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isSystem === '1'}
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
        <Form.Item name="name" label="角色名称">
          <Input placeholder="请输入角色名称" allowClear />
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
          新增角色
        </Button>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{
          current,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size);
            loadData({ page, limit: size });
          },
        }}
      />

      {/* 新增/编辑弹窗 */}
      {modalVisible && (
        <RoleFormModal
          visible={modalVisible}
          editingRole={editingRole}
          onClose={handleModalClose}
        />
      )}
    </Card>
  );
};

export default RoleManagement;

