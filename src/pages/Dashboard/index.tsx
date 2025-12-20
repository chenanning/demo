import React, { useState } from 'react';
import { Layout, Menu as AntMenu, Typography } from 'antd';
import { UserOutlined, MenuOutlined, KeyOutlined, LockOutlined, LogoutOutlined, BankOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import RoleManagement from '../Role';
import MenuManagement from '../Menu';
import PowerManagement from '../Power';
import AccountInfo from '../AccountInfo';
import FinancialSettlement from '../FinancialSettlement';

const { Header, Content } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('account');
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'account',
      icon: <BankOutlined />,
      label: '账户中心',
    },
    {
      key: 'role',
      icon: <KeyOutlined />,
      label: '角色管理',
    },
    {
      key: 'menu',
      icon: <MenuOutlined />,
      label: '菜单管理',
    },
    {
      key: 'power',
      icon: <LockOutlined />,
      label: '按钮管理',
    },
    {
      key: 'financial',
      icon: <DollarOutlined />,
      label: '财务结算',
    },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'account':
        return <AccountInfo />;
      case 'role':
        return <RoleManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'power':
        return <PowerManagement />;
      case 'financial':
        return <FinancialSettlement />;
      default:
        return <AccountInfo />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('accountId');
    localStorage.removeItem('aliasId');
    navigate('/login');
  };

  const username = localStorage.getItem('username') || '用户';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ fontSize: 24, color: '#fff' }} />
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              FunLink Manager
            </Title>
          </div>
          <AntMenu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key)}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#fff' }}>
          <span>{username}</span>
          <LogoutOutlined
            onClick={handleLogout}
            style={{ fontSize: 18, cursor: 'pointer' }}
            title="退出登录"
          />
        </div>
      </Header>
      <Content style={{ padding: 24, background: '#f0f2f5' }}>
        {renderPage()}
      </Content>
    </Layout>
  );
};

export default Dashboard;

