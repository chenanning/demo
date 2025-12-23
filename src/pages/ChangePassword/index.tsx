import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { changePassword } from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import './index.css';

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success('密码修改成功，请重新登录');
      // 清除token，跳转到登录页
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('accountId');
      localStorage.removeItem('aliasId');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <Card className="change-password-card">
        <div className="change-password-header">
          <LockOutlined className="change-password-icon" />
          <h2>修改密码</h2>
          <p className="change-password-tip">首次登录需要修改密码，请设置新密码</p>
        </div>
        <Form
          form={form}
          name="changePassword"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
          className="change-password-form"
        >
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password
              placeholder="请输入原密码"
              size="large"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的新密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              size="large"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className="change-password-button"
            >
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;


