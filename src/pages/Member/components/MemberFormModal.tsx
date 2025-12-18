import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Select } from 'antd';
import type { Member, MemberDetail, MemberFormData } from '@/types/member';
import { createMember, updateMember, assignRoles, getMemberById, getMemberPage } from '@/api/member';
import { getRoleList } from '@/api/role';
import { getCurrentAccount } from '@/api/account';

const { Option } = Select;

interface MemberFormModalProps {
  visible: boolean;
  editingMember: Member | null;
  onClose: (refresh?: boolean) => void;
}

const MemberFormModal: React.FC<MemberFormModalProps> = ({
  visible,
  editingMember,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [roleList, setRoleList] = useState<Array<{ id: number; name: string }>>([]);
  const [currentAccountId, setCurrentAccountId] = useState<number | null>(null);

  // 加载角色列表
  const loadRoleList = async () => {
    try {
      const res = await getRoleList();
      if (res.code === 200 && res.data) {
        setRoleList(res.data);
      }
    } catch (error) {
      message.error('加载角色列表失败');
    }
  };

  // 加载当前账户ID
  const loadCurrentAccount = async () => {
    try {
      const res = await getCurrentAccount();
      if (res.code === 200 && res.data) {
        setCurrentAccountId(res.data.id);
      }
    } catch (error) {
      console.error('加载账户信息失败');
    }
  };

  // 加载编辑数据
  const loadEditData = async (id: number) => {
    setDataLoading(true);
    try {
      const res = await getMemberById(id);
      const member = res.data;
      
      // 设置表单
      form.setFieldsValue({
        username: member.username,
        email: member.email,
        byAccount: member.byAccount,
        roleId: member.roleId,
        remark: member.remark,
      });
    } catch (error) {
      message.error('加载成员详情失败');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadRoleList();
      loadCurrentAccount();
      if (editingMember) {
        loadEditData(editingMember.id);
      } else {
        form.resetFields();
        // 新建时设置默认账户
        if (currentAccountId) {
          form.setFieldsValue({ byAccount: currentAccountId });
        }
      }
    } else {
      form.resetFields();
    }
  }, [visible, editingMember]);

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const formData: MemberFormData = {
        ...values,
        id: editingMember?.id,
      };

      setLoading(true);
      
      if (editingMember) {
        // 编辑成员
        await updateMember(formData);
        
        // 如果选择了角色，分配角色
        if (values.roleId) {
          await assignRoles(editingMember.id, [values.roleId]);
        }
        
        message.success('编辑成功');
      } else {
        // 创建成员
        await createMember(formData);
        
        // 创建成功后，如果选择了角色，需要通过用户名查询获取用户ID
        if (values.roleId) {
          try {
            // 通过用户名查询获取刚创建的用户ID
            const searchRes = await getMemberPage({ page: 1, limit: 1, search: values.username });
            if (searchRes.data.records && searchRes.data.records.length > 0) {
              const newUserId = searchRes.data.records[0].id;
              await assignRoles(newUserId, [values.roleId]);
            }
          } catch (error) {
            console.error('分配角色失败:', error);
            message.warning('成员创建成功，但角色分配失败，请稍后手动分配角色');
          }
        }
        
        message.success('创建成功');
      }
      
      onClose(true);
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(editingMember ? '编辑失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingMember ? '编辑成员' : '新建成员'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="用户名称"
          name="username"
          rules={[{ required: true, message: '请输入用户名称' }]}
        >
          <Input placeholder="请输入用户名称" disabled={!!editingMember} />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        {/* <Form.Item
          label="管理应用"
          name="byAccount"
          rules={[{ required: true, message: '请选择应用' }]}
        >
          <Select placeholder="请选择应用" disabled>
            {currentAccountId && (
              <Option value={currentAccountId}>当前账户</Option>
            )}
          </Select>
        </Form.Item> */}

        <Form.Item
          label="选择角色"
          name="roleId"
          rules={[{ required: true, message: '请选择角色' }]}
        >
          <Select placeholder="请选择角色">
            {roleList.map((role) => (
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberFormModal;

