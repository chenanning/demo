import React, { useState, useEffect } from 'react';
import { Card, Tree, message, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getNav } from '@/api/menu';
import type { NavDTO } from '@/types/menu';

/**
 * 导航菜单测试示例
 * 用于测试 /sys/menu/nav 接口
 */
const NavExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [navData, setNavData] = useState<NavDTO[]>([]);

  // 加载导航菜单
  const loadNav = async () => {
    setLoading(true);
    try {
      const res = await getNav();
      setNavData(res.data || []);
      message.success('加载导航菜单成功');
    } catch (error: any) {
      message.error(error?.message || '加载导航菜单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNav();
  }, []);

  // 将 NavDTO 转换为 Tree 组件所需格式
  const convertToTreeData = (navs: NavDTO[]): any[] => {
    return navs.map((nav) => ({
      title: `${nav.title}${nav.englishTitle ? ` (${nav.englishTitle})` : ''}`,
      key: nav.id,
      icon: nav.icon,
      path: nav.path,
      component: nav.component,
      children: nav.children && nav.children.length > 0 
        ? convertToTreeData(nav.children) 
        : undefined,
    }));
  };

  return (
    <Card
      title="导航菜单测试"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={loadNav}
          loading={loading}
        >
          刷新
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <strong>接口路径：</strong>GET /sys/menu/nav
        </div>
        <div>
          <strong>数据条数：</strong>{navData.length}
        </div>
        <div>
          <strong>树形结构预览：</strong>
        </div>
        <Tree
          treeData={convertToTreeData(navData)}
          defaultExpandAll
          showLine
        />
        <div>
          <strong>原始数据（JSON）：</strong>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {JSON.stringify(navData, null, 2)}
          </pre>
        </div>
      </Space>
    </Card>
  );
};

export default NavExample;


