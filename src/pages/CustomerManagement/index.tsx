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
  Tabs,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Customer, CustomerPageParams } from '@/types/customer';
import { getCustomerPage, deleteCustomer } from '@/api/account';
import CustomerFormModal from './components/CustomerFormModal';

const { TabPane } = Tabs;

const CustomerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('1'); // 1=运营，2=开发者
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();

  // 控制弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // 获取当前Tab对应的category
  const getCurrentCategory = () => {
    return activeTab === '1' ? 1 : 2; // 1=运营，2=开发者
  };

  // 加载数据
  const loadData = async (params?: Partial<CustomerPageParams>) => {
    setLoading(true);
    try {
      const searchValues = searchForm.getFieldsValue();
      const category = getCurrentCategory();
      
      const res = await getCustomerPage({
        page: params?.page || current,
        limit: params?.limit || pageSize,
        accountName: searchValues.accountName || undefined,
        customerType: category,
      });
      
      setDataSource(res.data.records || []);
      setTotal(res.data.total || 0);
      setCurrent(res.data.current || 1);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]); // 当Tab切换时重新加载数据

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
    setEditingCustomer(null);
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: Customer) => {
    setEditingCustomer(record);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 弹窗关闭
  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false);
    setEditingCustomer(null);
    if (refresh) {
      loadData();
    }
  };

  // Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrent(1);
    searchForm.resetFields();
  };

  // 状态显示
  const renderStatus = (sts: string | undefined) => {
    if (sts === 'A') {
      return <span style={{ color: '#52c41a' }}>正常</span>;
    } else if (sts === 'D') {
      return <span style={{ color: '#ff4d4f' }}>已删除</span>;
    }
    return <span>-</span>;
  };

  // 表格列定义
  const columns: ColumnsType<Customer> = [
    {
      title: '账户名称',
      dataIndex: 'accountName',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'sts',
      width: 100,
      render: (sts: string) => renderStatus(sts),
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '联系人电话',
      dataIndex: 'mobile',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '联系人邮箱',
      dataIndex: 'email',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: '创建时间',
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
            title="确定要删除这个客户吗？删除后将级联删除关联的用户账号。"
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
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="运营管理" key="1">
            <div>
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
                  新增客户
                </Button>
                
                <Form form={searchForm} layout="inline" style={{ marginBottom: 0 }}>
                  <Form.Item name="accountName" style={{ marginBottom: 0 }}>
                    <Input
                      placeholder="请输入账户名称"
                      prefix={<SearchOutlined />}
                      allowClear
                      style={{
                        width: 200,
                        height: 34,
                        borderRadius: '8px',
                      }}
                      onPressEnter={handleSearch}
                    />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                      <Button onClick={handleSearch}>搜索</Button>
                      <Button onClick={handleReset}>重置</Button>
                    </Space>
                  </Form.Item>
                </Form>
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
            </div>
          </TabPane>
          <TabPane tab="开发者管理" key="2">
            <div>
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
                  新增客户
                </Button>
                
                <Form form={searchForm} layout="inline" style={{ marginBottom: 0 }}>
                  <Form.Item name="accountName" style={{ marginBottom: 0 }}>
                    <Input
                      placeholder="请输入账户名称"
                      prefix={<SearchOutlined />}
                      allowClear
                      style={{
                        width: 200,
                        height: 34,
                        borderRadius: '8px',
                      }}
                      onPressEnter={handleSearch}
                    />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                      <Button onClick={handleSearch}>搜索</Button>
                      <Button onClick={handleReset}>重置</Button>
                    </Space>
                  </Form.Item>
                </Form>
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
            </div>
          </TabPane>
        </Tabs>

        {/* 新增/编辑弹窗 */}
        {modalVisible && (
          <CustomerFormModal
            visible={modalVisible}
            editingCustomer={editingCustomer}
            category={getCurrentCategory()}
            onClose={handleModalClose}
          />
        )}
      </Card>
    </div>
  );
};

export default CustomerManagement;

