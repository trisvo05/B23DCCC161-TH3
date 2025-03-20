import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';

interface Service {
	id: number;
	name: string;
	price: number;
	duration: number;
}

// Utility functions for localStorage operations
export const saveToStorage = (key: string, data: any) => {
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error('Error saving to localStorage:', error);
	}
};

export const getFromStorage = (key: string): any => {
	try {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error('Error reading from localStorage:', error);
		return null;
	}
};

const ServiceManagement: React.FC = () => {
	const [services, setServices] = useState<Service[]>([]);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [form] = Form.useForm<Service>();

	useEffect(() => {
		const savedServices: Service[] = getFromStorage('services') || [];
		setServices(savedServices);
	}, []);

	const openEditModal = (service: Service): void => {
		form.setFieldsValue(service);
		setModalOpen(true);
	};

	const deleteService = (id: number): void => {
		const updatedList = services.filter((service) => service.id !== id);
		setServices(updatedList);
		saveToStorage('services', updatedList);
		message.success('Dịch vụ đã được xóa thành công.');
	};

	const handleSubmit = (values: Service): void => {
		const updatedList = services.some((svc) => svc.id === values.id)
			? services.map((svc) => (svc.id === values.id ? { ...svc, ...values } : svc))
			: [...services, { ...values, id: Date.now() }];

		setServices(updatedList);
		saveToStorage('services', updatedList);
		setModalOpen(false);
		form.resetFields();
		message.success('Dịch vụ đã được lưu thành công.');
	};

	const columns: ColumnsType<Service> = [
		{
		  title: 'Tên dịch vụ',
		  dataIndex: 'name',
		  key: 'name',
		  align: 'center',
		},
		{
		  title: 'Giá tiền',
		  dataIndex: 'price',
		  key: 'price',
		  align: 'center',
		  render: (price: number) => `${price.toLocaleString()} VNĐ`,
		},
		{
		  title: 'Thời lượng (phút)',
		  dataIndex: 'duration',
		  key: 'duration',
		  align: 'center',
		},
		{
		  title: 'Hành động',
		  key: 'actions',
		  align: 'center',
		  render: (_: any, record: Service) => (
			<>
			  <Button type="link" onClick={() => openEditModal(record)} icon={<EditOutlined />}>
				Sửa
			  </Button>
			  <Button type="link" danger onClick={() => deleteService(record.id)} icon={<DeleteOutlined />}>
				Xóa
			  </Button>
			</>
		  ),
		},
	];

	return (
		<>
			<Button type="primary" onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
				+ Thêm dịch vụ
			</Button>

			<Table columns={columns} dataSource={services} rowKey="id" />

			<Modal
				title="Chi tiết dịch vụ"
				visible={modalOpen}
				onOk={() => form.submit()}
				onCancel={() => {
					setModalOpen(false);
					form.resetFields();
				}}
			>
				<Form form={form} onFinish={handleSubmit} layout="vertical">
					<Form.Item name="id" hidden>
						<Input />
					</Form.Item>

					<Form.Item
						name="name"
						label="Tên dịch vụ"
						rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name="price"
						label="Giá tiền"
						rules={[{ required: true, message: 'Vui lòng nhập giá tiền!' }]}
					>
						<InputNumber min={0} step={1000} style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item
						name="duration"
						label="Thời lượng (phút)"
						rules={[{ required: true, message: 'Vui lòng nhập thời lượng dịch vụ!' }]}
					>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default ServiceManagement;