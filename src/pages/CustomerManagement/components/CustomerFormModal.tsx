import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import type { Customer, CustomerFormData } from '@/types/customer';
import { createCustomer, updateAccount } from '@/api/account';

interface CustomerFormModalProps {
  visible: boolean;
  editingCustomer: Customer | null;
  category: number; // 1=运营，2=开发者
  onClose: (refresh?: boolean) => void;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  visible,
  editingCustomer,
  category,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (visible) {
      if (editingCustomer) {
        form.setFieldsValue({
          accountName: editingCustomer.accountName,
          contact: editingCustomer.contact,
          mobile: editingCustomer.mobile,
          email: editingCustomer.email,
        });
      } else {
        form.resetFields();
      }
    } else {
      form.resetFields();
    }
  }, [visible, editingCustomer, form]);

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData: CustomerFormData = {
        ...values,
        id: editingCustomer?.id,
        customerType: category, // 使用传入的category（实际是customerType）
      };

      setLoading(true);

      if (editingCustomer) {
        // 编辑账户
        await updateAccount(formData);
        message.success('编辑成功');
      } else {
        // 创建账户
        await createCustomer(formData);
        message.success('创建成功');
      }

      onClose(true);
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(editingCustomer ? '编辑失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingCustomer ? '编辑客户' : '新增客户'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="账户名"
          name="accountName"
          rules={[{ required: true, message: '请输入账户名' }]}
        >
          <Input placeholder="请输入账户名" />
        </Form.Item>

        <Form.Item
          label="联系人"
          name="contact"
          rules={[{ required: true, message: '请输入联系人' }]}
        >
          <Input placeholder="请输入联系人" />
        </Form.Item>

        <Form.Item
          label="联系人电话"
          name="mobile"
          rules={[
            { required: true, message: '请输入联系人电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
          ]}
        >
          <Input placeholder="请输入联系人电话" />
        </Form.Item>

        <Form.Item
          label="联系人邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入联系人邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input placeholder="请输入联系人邮箱" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerFormModal;

