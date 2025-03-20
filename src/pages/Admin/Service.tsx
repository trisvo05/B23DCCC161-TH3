import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

const saveToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage Save Error:', error);
  }
};

const loadFromStorage = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Storage Load Error:', error);
    return null;
  }
};

const ServiceManager: React.FC = () => {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<Service>();

  useEffect(() => {
    const storedServices = loadFromStorage('services') || [];
    setServiceList(storedServices);
  }, []);

  const resetModal = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const openEditDialog = (service: Service) => {
    form.setFieldsValue(service);
    setIsModalOpen(true);
  };

  const removeService = useCallback((id: number) => {
    setServiceList(prevList => {
      const updatedList = prevList.filter(service => service.id !== id);
      saveToStorage('services', updatedList);
      message.success('Dịch vụ đã được xóa thành công.');
      return updatedList;
    });
  }, []);

  const handleSubmit = (values: Service) => {
    setServiceList(prevList => {
      const exists = prevList.some(service => service.id === values.id);
      const updatedList = exists
        ? prevList.map(service => (service.id === values.id ? { ...service, ...values } : service))
        : [...prevList, { ...values, id: Date.now() }];

      saveToStorage('services', updatedList);
      message.success('Dịch vụ đã được lưu thành công.');
      return updatedList;
    });

    resetModal();
  };

  const getColumns = () => [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá tiền',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} $`,
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Service) => (
        <>
          <Button type="link" onClick={() => openEditDialog(record)}>Chỉnh sửa</Button>
          <Button type="link" danger onClick={() => removeService(record.id)}>Xóa</Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
        Thêm dịch vụ
      </Button>

      <Table columns={getColumns()} dataSource={serviceList} rowKey="id" />

      <Modal
        title="Thông tin dịch vụ"
        visible={isModalOpen}
        onOk={() => form.submit()}
        onCancel={resetModal}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="price" label="Giá tiền" rules={[{ required: true, message: 'Vui lòng nhập giá tiền!' }]}>
            <InputNumber min={0} step={1000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true, message: 'Vui lòng nhập thời lượng dịch vụ!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ServiceManager;