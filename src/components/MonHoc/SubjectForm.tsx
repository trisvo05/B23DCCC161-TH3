import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button } from 'antd';

interface Subject {
  code: string;
  name: string;
  credits: number;
}

interface SubjectFormProps {
  onSubmit: (subject: Subject) => void;
  onCancel: () => void;
  initialValues: Subject | null;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialValues 
}) => {
  const [form] = Form.useForm();
  
  // Reset form khi initialValues thay đổi
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [form, initialValues]);

  // Xử lý khi submit form
  const handleSubmit = (values: Subject) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues || {}}
    >
      <Form.Item
        name="code"
        label="Mã môn"
        rules={[{ required: true, message: 'Vui lòng nhập mã môn!' }]}
      >
        <Input disabled={!!initialValues} placeholder="Nhập mã môn học" />
      </Form.Item>
      
      <Form.Item
        name="name"
        label="Tên môn"
        rules={[{ required: true, message: 'Vui lòng nhập tên môn!' }]}
      >
        <Input placeholder="Nhập tên môn học" />
      </Form.Item>
      
      <Form.Item
        name="credits"
        label="Số tín chỉ"
        rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}
      >
        <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="Nhập số tín chỉ" />
      </Form.Item>
      
      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button style={{ marginRight: 8 }} onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            {initialValues ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default SubjectForm;