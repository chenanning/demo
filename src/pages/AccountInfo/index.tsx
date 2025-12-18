import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Select, Modal, Upload, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  getCurrentAccount,
  updateAccount,
  addQualification,
  deleteQualification,
  type AccountInfo,
  type Qualification,
} from '@/api/account';
import MemberManagement from '../Member';
import RoleManagement from '../Role';
import './index.css';

const { Option } = Select;

const AccountInfo: React.FC = () => {
  const [form] = Form.useForm();
  const [qualificationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [qualificationModalVisible, setQualificationModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'member' | 'role'>('account');

  // 加载账户信息
  const loadAccount = async () => {
    setLoading(true);
    try {
      const res = await getCurrentAccount();
      if (res.code === 200 && res.data) {
        setAccount(res.data);
        form.setFieldsValue({
          accountName: res.data.accountName,
          category: res.data.category,
          contact: res.data.contact,
          mobile: res.data.mobile,
          email: res.data.email,
        });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '加载账户信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  // 更新账户信息
  const handleUpdate = async (values: any) => {
    if (!account) return;

    setLoading(true);
    try {
      const res = await updateAccount({
        id: account.id,
        ...values,
      });
      if (res.code === 200) {
        message.success('更新成功');
        loadAccount();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开添加资质弹窗
  const handleAddQualification = () => {
    qualificationForm.resetFields();
    setQualificationModalVisible(true);
  };

  // 添加资质
  const handleSubmitQualification = async (values: any) => {
    if (!account) return;

    if (!values.imageUrl) {
      message.error('请上传资质图片');
      return;
    }

    setUploading(true);
    try {
      const res = await addQualification({
        accountId: account.id,
        type: values.type,
        name: values.name,
        imageUrl: values.imageUrl,
      });
      if (res.code === 200) {
        message.success('添加成功');
        setQualificationModalVisible(false);
        loadAccount();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '添加失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除资质
  const handleDeleteQualification = async (qualificationId: number) => {
    if (!account) return;

    try {
      const res = await deleteQualification(qualificationId);
      if (res.code === 200) {
        message.success('删除成功');
        loadAccount();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };


  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <Card className="account-info-card" loading={loading}>
        {/* 账号基础信息 */}
        <div className="account-section">
          <h3 className="section-title">账号基础信息</h3>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
            className="account-form"
          >
            <div className="form-row">
              <Form.Item
                label="公司名称"
                name="accountName"
                rules={[{ required: true, message: '请输入公司名称' }]}
                className="form-item"
              >
                <Input placeholder="请输入公司名称" />
              </Form.Item>
              <Form.Item
                label="账户行业"
                name="category"
                className="form-item"
              >
                <Select placeholder="请选择账户行业" allowClear>
                  <Option value={1}>互联网</Option>
                  <Option value={2}>金融</Option>
                  <Option value={3}>教育</Option>
                  <Option value={4}>医疗</Option>
                  <Option value={5}>其他</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item
                label="联系人"
                name="contact"
                className="form-item"
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
              <Form.Item
                label="联系人电话"
                name="mobile"
                className="form-item"
              >
                <Input placeholder="请输入联系人电话" />
              </Form.Item>
              <Form.Item
                label="联系人邮箱"
                name="email"
                className="form-item"
                rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
              >
                <Input placeholder="请输入联系人邮箱" />
              </Form.Item>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* 账号资质信息 */}
        <div className="account-section">
          <div className="section-header">
            <h3 className="section-title">账号资质信息</h3>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddQualification}
            >
              添加资质
            </Button>
          </div>

          <div className="qualification-table-wrapper">
            <div className="qualification-table-header">
              <div className="table-header-cell" style={{ width: 80 }}>序号</div>
              <div className="table-header-cell" style={{ width: 120 }}>资质类型</div>
              <div className="table-header-cell" style={{ width: 150 }}>资质名称</div>
              <div className="table-header-cell" style={{ width: 120 }}>资质图片</div>
              <div className="table-header-cell" style={{ width: 180 }}>提交时间</div>
              <div className="table-header-cell" style={{ width: 100 }}>操作</div>
            </div>
            {!account?.qualifications || account.qualifications.length === 0 ? (
              <div className="qualification-table-empty">暂无资质信息</div>
            ) : (
              account.qualifications.map((qual, index) => (
                <div key={qual.id || index} className="qualification-table-row">
                  <div className="table-cell" style={{ width: 80 }}>{index + 1}</div>
                  <div className="table-cell" style={{ width: 120 }}>
                    {qual.type === 1 ? '营业执照' : qual.type === 2 ? 'ICP备案' : '其他资质'}
                  </div>
                  <div className="table-cell" style={{ width: 150 }}>{qual.name}</div>
                  <div className="table-cell" style={{ width: 120 }}>
                    <img
                      src={qual.imageUrl}
                      alt="资质"
                      className="qualification-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODQiIGhlaWdodD0iNDYiIHZpZXdCb3g9IjAgMCA4NCA0NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijg0IiBoZWlnaHQ9IjQ2IiBmaWxsPSIjRUVFRUVFIiByeD0iOCIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div className="table-cell" style={{ width: 180 }}>
                    {qual.submitTime
                      ? new Date(qual.submitTime).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : '-'}
                  </div>
                  <div className="table-cell" style={{ width: 100 }}>
                    <Popconfirm
                      title="确定要删除该资质吗？"
                      onConfirm={() => qual.id && handleDeleteQualification(qual.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="link"
                        style={{ padding: 0, color: '#3562F6', height: 'auto' }}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 添加资质弹窗 */}
        <Modal
          title="添加资质"
          open={qualificationModalVisible}
          onCancel={() => setQualificationModalVisible(false)}
          onOk={() => qualificationForm.submit()}
          confirmLoading={uploading}
          width={600}
        >
          <Form
            form={qualificationForm}
            layout="vertical"
            onFinish={handleSubmitQualification}
          >
            <Form.Item
              label="资质类型"
              name="type"
              rules={[{ required: true, message: '请选择资质类型' }]}
            >
              <Select placeholder="请选择资质类型">
                <Option value={1}>营业执照</Option>
                <Option value={2}>ICP备案</Option>
                <Option value={3}>其他资质</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="资质名称"
              name="name"
              rules={[{ required: true, message: '请输入资质名称' }]}
            >
              <Input placeholder="请输入资质名称" />
            </Form.Item>

            <Form.Item
              label="资质图片"
              name="imageUrl"
              rules={[{ required: true, message: '请上传资质图片' }]}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                action="/api/sys/upload/image"
                headers={{
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                }}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('只能上传图片文件');
                    return false;
                  }
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('图片大小不能超过 5MB');
                    return false;
                  }
                  return true;
                }}
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    if (info.file.response?.code === 200) {
                      qualificationForm.setFieldsValue({
                        imageUrl: info.file.response.data,
                      });
                      message.success('上传成功');
                    } else {
                      message.error(info.file.response?.message || '上传失败');
                    }
                  } else if (info.file.status === 'error') {
                    message.error('上传失败');
                  }
                }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
        );
      case 'member':
        return <MemberManagement />;
      case 'role':
        return <RoleManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="account-info-container">
      {/* 标签页 */}
      <div className="account-tabs">
        <div
          className={`tab-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          账户信息
        </div>
        <div
          className={`tab-item ${activeTab === 'member' ? 'active' : ''}`}
          onClick={() => setActiveTab('member')}
        >
          成员管理
        </div>
        <div
          className={`tab-item ${activeTab === 'role' ? 'active' : ''}`}
          onClick={() => setActiveTab('role')}
        >
          角色管理
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default AccountInfo;

