import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCaptcha, login, getPublicKey, type LoginRequest } from '@/api/auth';
import JSEncrypt from 'jsencrypt';
import './index.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captcha, setCaptcha] = useState<{ uuid: string; img: string } | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');

  // 获取验证码
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await getCaptcha();
      if (res.code === 200 && res.data) {
        setCaptcha({
          uuid: res.data.uuid,
          img: res.data.img,
        });
        // 更新表单中的 uuid
        form.setFieldsValue({ uuid: res.data.uuid });
      }
    } catch (error) {
      message.error('获取验证码失败');
    } finally {
      setCaptchaLoading(false);
    }
  };

  // 获取RSA公钥
  const fetchPublicKey = async () => {
    try {
      const res = await getPublicKey();
      if (res.code === 200 && res.data) {
        setPublicKey(res.data.publicKey);
      }
    } catch (error) {
      console.error('获取公钥失败', error);
      message.error('获取公钥失败');
    }
  };

  // 初始化时获取验证码和公钥
  useEffect(() => {
    fetchPublicKey();
    fetchCaptcha();
  }, []);

  // RSA加密密码
  const encryptPassword = (password: string): string => {
    if (!publicKey) {
      throw new Error('RSA公钥未加载');
    }
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encrypted = encrypt.encrypt(password);
    if (!encrypted) {
      throw new Error('密码加密失败');
    }
    return encrypted as string;
  };

  // 处理登录
  const handleLogin = async (values: any) => {
    if (!publicKey) {
      message.error('系统初始化中，请稍后重试');
      return;
    }

    setLoading(true);
    try {
      // RSA加密密码
      const encryptedPassword = encryptPassword(values.password);
      
      // 构建登录请求
      const loginData: LoginRequest = {
        username: values.username,
        password: encryptedPassword,
        code: values.code,
        uuid: values.uuid,
      };

      const res = await login(loginData);
      
      if (res.code === 200 && res.data) {
        // 存储 Token 和用户信息
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('userId', String(res.data.userId));
        localStorage.setItem('username', res.data.username);
        
        if (res.data.accountId) {
          localStorage.setItem('accountId', String(res.data.accountId));
        }
        if (res.data.aliasId) {
          localStorage.setItem('aliasId', res.data.aliasId);
        }

        // 检查是否首次登录
        if (res.data.isFirstLogin) {
          message.info('首次登录需要修改密码');
          navigate('/change-password');
        } else {
          message.success('登录成功');
          navigate('/');
        }
      }
    } catch (error: any) {
      message.error(error.message || '登录失败');
      // 登录失败后刷新验证码
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 左侧背景区域 */}
      <div className="login-left">
        <div className="login-background" />
      </div>

      {/* 右侧登录表单区域 */}
      <div className="login-right">
        <div className="login-modal">
          <div className="login-content">
            {/* 标题 */}
            <h1 className="login-title">欢迎使用Funlink平台</h1>

            {/* 登录表单 */}
            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              layout="vertical"
              className="login-form"
            >
              {/* 邮箱输入 */}
              <Form.Item
                label="邮箱"
                name="username"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  placeholder="请输入邮箱"
                  size="large"
                  className="login-input"
                />
              </Form.Item>

              {/* 密码输入 */}
              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  placeholder="请输入密码"
                  size="large"
                  className="login-input"
                />
              </Form.Item>

              {/* 验证码输入 */}
              <Form.Item
                label="验证码"
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <div className="captcha-wrapper">
                  <Form.Item
                    name="code"
                    noStyle
                    rules={[{ required: true, message: '请输入验证码' }]}
                  >
                    <Input
                      placeholder="请输入验证码"
                      size="large"
                      className="captcha-input"
                    />
                  </Form.Item>
                  <div
                    className="captcha-button"
                    onClick={fetchCaptcha}
                    style={{ cursor: captchaLoading ? 'not-allowed' : 'pointer' }}
                  >
                    {captchaLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        加载中...
                      </div>
                    ) : captcha?.img ? (
                      <img
                        src={`data:image/png;base64,${captcha.img}`}
                        alt="验证码"
                        className="captcha-image"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchCaptcha();
                        }}
                      />
                    ) : (
                      <span>获取验证码</span>
                    )}
                  </div>
                </div>
              </Form.Item>

              {/* 隐藏的 uuid 字段 */}
              <Form.Item name="uuid" hidden>
                <Input />
              </Form.Item>

              {/* 忘记密码链接 */}
              <div className="forgot-password">
                <a href="#" onClick={(e) => { e.preventDefault(); message.info('忘记密码功能开发中'); }}>
                  忘记密码?
                </a>
              </div>

              {/* 登录按钮 */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  className="login-button"
                  disabled={!publicKey}
                >
                  {publicKey ? '登录' : '初始化中...'}
                </Button>
              </Form.Item>

              {/* 注册链接 */}
              <div className="register-link">
                <span>还没有账号 ? </span>
                <a href="#" onClick={(e) => { e.preventDefault(); message.info('注册功能开发中'); }}>
                  去注册
                </a>
              </div>
            </Form>
          </div>
        </div>

        {/* 业务系统选择器 */}
        <div className="business-selector">
          <div className="business-selector-content">
            <span className="business-text">国内业务</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="business-arrow"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="#3562F6"
                strokeWidth="1.33"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
