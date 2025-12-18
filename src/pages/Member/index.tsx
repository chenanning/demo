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
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Member, MemberPageParams } from '@/types/member';
import { getMemberPage, deleteMember } from '@/api/member';
import MemberFormModal from './components/MemberFormModal';

const MemberManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();

  // 控制弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // 加载数据
  const loadData = async (params?: Partial<MemberPageParams>) => {
    setLoading(true);
    try {
      const searchValues = searchForm.getFieldsValue();
      // 搜索参数：直接传递搜索关键词，后端会同时搜索用户名和邮箱
      const searchValue = searchValues.search || '';
      
      const res = await getMemberPage({
        page: params?.page || current,
        limit: params?.limit || pageSize,
        search: searchValue || undefined,
      });
      
      // 后端返回的是 Page<SysUserVo>，包含 roleId 和 roleName
      const records = res.data.records || [];
      const totalCount = res.data.total || 0;
      const currentPage = res.data.current || 1;
      
      setDataSource(records);
      setTotal(totalCount);
      setCurrent(currentPage);
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
    setEditingMember(null);
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: Member) => {
    setEditingMember(record);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteMember(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 弹窗关闭
  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false);
    setEditingMember(null);
    if (refresh) {
      loadData();
    }
  };

  // 表格列定义
  const columns: ColumnsType<Member> = [
    {
      title: '用户名称',
      dataIndex: 'username',
      width: 150,
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      width: 180,
      render: (text) => {
        if (!text) return '-';
        return new Date(text).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      },
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
            style={{ padding: 0 }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个成员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#F6F6F7', minHeight: 'calc(100vh - 64px)', padding: '16px' }}>
      <Card
        style={{
          background: '#FDFDFD',
          borderRadius: '14px',
          boxShadow: '0px 0px 20px 0px rgba(21, 34, 56, 0.06)',
        }}
      >
        {/* 搜索栏和新建按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{
              background: '#3562F6',
              borderRadius: '8px',
              height: '34px',
            }}
          >
            新建成员
          </Button>
          
          <Form form={searchForm} layout="inline" style={{ marginBottom: 0 }}>
            <Form.Item name="search" style={{ marginBottom: 0 }}>
              <Input
                placeholder="请输入用户名或邮箱"
                prefix={<SearchOutlined />}
                allowClear
                style={{
                  width: 184,
                  height: 34,
                  borderRadius: '8px',
                }}
                onPressEnter={handleSearch}
              />
            </Form.Item>
          </Form>
        </div>

        {/* 表格 */}
        <div style={{ borderTop: '1px solid #E6E6E6' }}>
          <div style={{ background: '#F8F8F8', padding: '12px 0', borderBottom: '1px solid #E6E6E6' }}>
            <div style={{ display: 'flex', padding: '0 16px' }}>
              <div style={{ width: 150, fontWeight: 500, fontSize: 14, color: '#646368' }}>用户名称</div>
              <div style={{ width: 150, fontWeight: 500, fontSize: 14, color: '#646368' }}>角色</div>
              <div style={{ width: 200, fontWeight: 500, fontSize: 14, color: '#646368' }}>邮箱</div>
              <div style={{ width: 180, fontWeight: 500, fontSize: 14, color: '#646368' }}>注册时间</div>
              <div style={{ flex: 1, fontWeight: 500, fontSize: 14, color: '#646368' }}>操作</div>
            </div>
          </div>
          
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
            style={{ marginTop: 0 }}
          />
        </div>

        {/* 新增/编辑弹窗 */}
        {modalVisible && (
          <MemberFormModal
            visible={modalVisible}
            editingMember={editingMember}
            onClose={handleModalClose}
          />
        )}
      </Card>
    </div>
  );
};

export default MemberManagement;

