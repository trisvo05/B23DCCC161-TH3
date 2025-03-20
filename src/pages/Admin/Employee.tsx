import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, TimePicker, InputNumber, message } from 'antd';
import dayjs from 'dayjs';

interface WorkHours {
  start: string;
  end: string;
}

interface Staff {
  id: number;
  name: string;
  workSchedule: WorkHours;
  dailyQuota: number;
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

const EmployeeManager: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const storedEmployees = loadFromStorage('staff') || [];
    setStaffList(storedEmployees);
  }, []);

  const resetModal = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const openEditDialog = (staff: Staff) => {
    form.setFieldsValue({
      ...staff,
      workSchedule: {
        start: dayjs(staff.workSchedule.start, 'HH:mm'),
        end: dayjs(staff.workSchedule.end, 'HH:mm'),
      },
    });
    setIsModalOpen(true);
  };

  const removeStaff = useCallback((id: number) => {
    setStaffList(prevList => {
      const updatedList = prevList.filter(emp => emp.id !== id);
      saveToStorage('staff', updatedList);
      message.success('Successfully removed staff.');
      return updatedList;
    });
  }, []);

  const handleSubmit = (values: any) => {
    const newStaff: Staff = {
      ...values,
      id: values.id || Date.now(),
      workSchedule: {
        start: values.workSchedule.start.format('HH:mm'),
        end: values.workSchedule.end.format('HH:mm'),
      },
    };

    setStaffList(prevList => {
      const exists = prevList.some(emp => emp.id === values.id);
      const updatedList = exists
        ? prevList.map(emp => (emp.id === values.id ? { ...emp, ...newStaff } : emp))
        : [...prevList, newStaff];

      saveToStorage('staff', updatedList);
      message.success('Staff details saved.');
      return updatedList;
    });

    resetModal();
  };

  const getColumns = () => [
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'workSchedule',
      key: 'workSchedule',
      render: (schedule: WorkHours) =>
        `${dayjs(schedule.start, 'HH:mm').format('HH:mm')} - ${dayjs(schedule.end, 'HH:mm').format('HH:mm')}`,
    },
    {
      title: 'Giới hạn mỗi ngày',
      dataIndex: 'dailyQuota',
      key: 'dailyQuota',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Staff) => (
        <>
          <Button type="link" onClick={() => openEditDialog(record)}>Chỉnh sửa</Button>
          <Button type="link" danger onClick={() => removeStaff(record.id)}>Xóa</Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
        Thêm nhân viên
      </Button>

      <Table columns={getColumns()} dataSource={staffList} rowKey="id" />

      <Modal
        title="Thông tin nhân viên"
        visible={isModalOpen}
        onOk={() => form.submit()}
        onCancel={resetModal}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name={['workSchedule', 'start']}
            label="Bắt đầu ca làm"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian bắt đầu!' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            name={['workSchedule', 'end']}
            label="Kết thúc ca làm"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian kết thúc!' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="dailyQuota"
            label="Số lượng khách tối đa"
            rules={[{ required: true, message: 'Vui lòng nhập giới hạn khách!' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EmployeeManager;