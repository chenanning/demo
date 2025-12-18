import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Popconfirm,
  Card,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Menu } from '@/types/menu';
import { getAllMenus, deleteMenu } from '@/api/menu';
import MenuFormModal from './components/MenuFormModal';

const MenuManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Menu[]>([]);

  // 控制弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAllMenus();
      // 构建树形数据
      const treeData = buildTree(res.data);
      setDataSource(treeData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 构建树形结构
  const buildTree = (menus: Menu[]): Menu[] => {
    const map = new Map<number, Menu>();
    const roots: Menu[] = [];

    // 创建映射
    menus.forEach((menu) => {
      map.set(menu.id, { ...menu, children: [] });
    });

    // 构建树
    menus.forEach((menu) => {
      const node = map.get(menu.id)!;
      if (menu.parentId === null || menu.parentId === 0 || menu.parentId === undefined) {
        roots.push(node);
      } else {
        const parent = map.get(menu.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      }
    });

    return roots;
  };

  useEffect(() => {
    loadData();
  }, []);

  // 新增
  const handleAdd = () => {
    setEditingMenu(null);
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: Menu) => {
    setEditingMenu(record);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteMenu(id);
      message.success('删除成功');
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || '删除失败');
    }
  };

  // 弹窗关闭
  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false);
    setEditingMenu(null);
    if (refresh) {
      loadData();
    }
  };

  // 表格列定义
  const columns: ColumnsType<Menu> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '菜单标题',
      dataIndex: 'title',
      width: 200,
    },
    {
      title: '英文标题',
      dataIndex: 'englishTitle',
      width: 180,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      render: (icon: string) => icon || '-',
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      width: 200,
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      width: 200,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      sorter: (a, b) => (a.sort || 0) - (b.sort || 0),
    },
    {
      title: '菜单类型',
      dataIndex: 'menuType',
      width: 100,
      render: (type: number) => (
        <Tag color={type === 1 ? 'blue' : 'green'}>
          {type === 1 ? '有子菜单' : '无子菜单'}
        </Tag>
      ),
    },
    {
      title: '可见范围',
      dataIndex: 'accountTypeLimit',
      width: 120,
      render: (limit: number) => {
        if (limit === 0) {
          return <Tag color="red">仅超管</Tag>;
        }
        return <Tag color="blue">所有账户</Tag>;
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
      title: '可见',
      dataIndex: 'visible',
      width: 80,
      render: (visible: string) => (visible === '0' ? '显示' : '隐藏'),
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
            title="确定要删除这个菜单吗？"
            description="删除后无法恢复，且子菜单也将无法访问"
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
          新增菜单
        </Button>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: 1500 }}
      />

      {/* 新增/编辑弹窗 */}
      {modalVisible && (
        <MenuFormModal
          visible={modalVisible}
          editingMenu={editingMenu}
          onClose={handleModalClose}
        />
      )}
    </Card>
  );
};

export default MenuManagement;


