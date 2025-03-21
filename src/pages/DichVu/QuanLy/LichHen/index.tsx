import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Select, Form, Card, message, Modal, Typography, Input } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import AppointmentDetail from './AppointmentDetail';
import { getServiceName, getEmployeeName, getStatusText, formatDateTime } from '@/utils/appointmentUtils';

const { Option } = Select;
const { Title } = Typography;

interface AppointmentData {
  id: number;
  customerName: string;
  phoneNumber: string;
  serviceId: number;
  employeeId?: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  createdAt: string;
  notes?: string;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State để lưu trữ giá trị
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Lấy từ local storage theo key
      const item = window.localStorage.getItem(key);
      // Parse stored json hoặc trả về initialValue nếu không có
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Nếu có lỗi thì trả về giá trị ban đầu
      console.log(error);
      return initialValue;
    }
  });

  // Hàm setter để cập nhật state và localStorage
  const setValue = (value: T) => {
    try {
      // Cho phép value là một function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Lưu state
      setStoredValue(valueToStore);
      // Lưu vào localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const AppointmentManager: React.FC = () => {
  const [appointments, setAppointments] = useLocalStorage<AppointmentData[]>('appointments', []);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentData[]>([]);
  const [filterForm] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [assignEmployeeModalVisible, setAssignEmployeeModalVisible] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy danh sách dịch vụ từ localStorage
    const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
    setServices(storedServices);
    
    // Lấy danh sách nhân viên từ localStorage
    const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    setEmployees(storedEmployees);
    
    // Cập nhật danh sách lịch hẹn đã lọc
    setFilteredAppointments(appointments);
  }, [appointments]);

  const handleViewDetail = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setDetailVisible(true);
  };

  const handleAssignEmployee = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setSelectedEmployeeId(appointment.employeeId || null);
    setAssignEmployeeModalVisible(true);
  };

  const confirmAssignEmployee = () => {
    if (!selectedAppointment || !selectedEmployeeId) {
      message.error('Vui lòng chọn nhân viên');
      return;
    }

    setLoading(true);
    
    try {
      // Cập nhật trạng thái lịch hẹn
      const updatedAppointments = appointments.map(app => 
        app.id === selectedAppointment.id ? 
        { 
          ...app, 
          status: 'confirmed',
          employeeId: selectedEmployeeId
        } : app
      );
      
      setAppointments(updatedAppointments);
      message.success('Đã phân công nhân viên thành công!');
      setAssignEmployeeModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra khi phân công nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = (appointmentId: number) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc chắn muốn đánh dấu lịch hẹn này là đã hoàn thành?',
      onOk: () => {
        const updatedAppointments = appointments.map(app => 
          app.id === appointmentId ? { ...app, status: 'completed' } : app
        );
        setAppointments(updatedAppointments);
        message.success('Đã cập nhật trạng thái lịch hẹn!');
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          setSelectedAppointment({ ...selectedAppointment, status: 'completed' });
        }
      }
    });
  };

  const handleCancelAppointment = (appointmentId: number) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc chắn muốn hủy lịch hẹn này?',
      onOk: () => {
        const updatedAppointments = appointments.map(app => 
          app.id === appointmentId ? { ...app, status: 'canceled' } : app
        );
        setAppointments(updatedAppointments);
        message.success('Đã hủy lịch hẹn!');
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          setSelectedAppointment({ ...selectedAppointment, status: 'canceled' });
        }
      }
    });
  };

  const handleSearch = (values: any) => {
    let filtered = [...appointments];
    
    if (values.status) {
      filtered = filtered.filter(app => app.status === values.status);
    }
    
    if (values.serviceId) {
      filtered = filtered.filter(app => app.serviceId === values.serviceId);
    }
    
    if (values.employeeId) {
      filtered = filtered.filter(app => app.employeeId === values.employeeId);
    }
    
    setFilteredAppointments(filtered);
  };

  // Tìm các nhân viên có thể thực hiện dịch vụ được chọn
  const getQualifiedEmployees = (serviceId: number) => {
    return employees.filter(employee => 
      employee.services && employee.services.includes(serviceId)
    );
  };

  const columns = [
    {
      title: 'Họ tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      align: 'center',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      align: 'center',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceId',
      key: 'serviceId',
      render: (serviceId: number) => getServiceName(serviceId),
      align: 'center',
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (record: AppointmentData) => formatDateTime(record.appointmentDate, record.appointmentTime),
      align: 'center',
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeId',
      key: 'employeeId',
      align: 'center',
      render: (employeeId?: number) => employeeId ? getEmployeeName(employeeId) : <Tag color="orange">Chưa phân công</Tag>,
      
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => {
        const statusInfo = getStatusText(status);
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record: AppointmentData) => {
        // Kiểm tra xem lịch hẹn đã qua hay chưa
        const appointmentTime = new Date(`${record.appointmentDate} ${record.appointmentTime}`);
        const isPastAppointment = appointmentTime < new Date();
        
        const isPending = record.status === 'pending';
        const isConfirmed = record.status === 'confirmed';
        
        return (
          <Space size="small">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              type="link"
            />
            
            {isPending && !isPastAppointment && (
              <Button 
                type="primary"
                size="small"
                onClick={() => handleAssignEmployee(record)}
              >
                Phân công
              </Button>
            )}
            
            {isConfirmed && !isPastAppointment && (
              <Button 
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleMarkAsCompleted(record.id)}
              >
                Hoàn thành
              </Button>
            )}
            
            {(isPending || isConfirmed) && !isPastAppointment && (
              <Button 
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => handleCancelAppointment(record.id)}
              >
                Hủy
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>Quản lý lịch hẹn</Title>
        
        <Form 
          form={filterForm}
          layout="inline"
          style={{ marginBottom: 20 }}
          onFinish={handleSearch}
        >
          <Form.Item name="status" label="Trạng thái">
            <Select style={{ width: 150 }} allowClear placeholder="Tất cả">
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="canceled">Đã hủy</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="serviceId" label="Dịch vụ">
            <Select style={{ width: 200 }} allowClear placeholder="Tất cả">
              {services.map(service => (
                <Option key={service.id} value={service.id}>{service.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="employeeId" label="Nhân viên">
            <Select style={{ width: 200 }} allowClear placeholder="Tất cả">
              {employees.map(employee => (
                <Option key={employee.id} value={employee.id}>{employee.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Tìm kiếm
            </Button>
          </Form.Item>
        </Form>
        
        <Table 
          columns={columns} 
          dataSource={filteredAppointments} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* Modal chi tiết lịch hẹn */}
      {selectedAppointment && (
        <AppointmentDetail
          visible={detailVisible}
          appointment={selectedAppointment}
          onClose={() => setDetailVisible(false)}
          onMarkAsCompleted={handleMarkAsCompleted}
          onCancel={handleCancelAppointment}
          onAssignEmployee={handleAssignEmployee}
        />
      )}
      
      {/* Modal phân công nhân viên */}
      <Modal
        title="Phân công nhân viên"
        visible={assignEmployeeModalVisible}
        onCancel={() => setAssignEmployeeModalVisible(false)}
        onOk={confirmAssignEmployee}
        confirmLoading={loading}
      >
        {selectedAppointment && (
          <Form layout="vertical">
            <Form.Item label="Dịch vụ">
              <Input 
                value={getServiceName(selectedAppointment.serviceId)} 
                disabled 
              />
            </Form.Item>
            
            <Form.Item 
              label="Chọn nhân viên" 
              required
              help="Chỉ hiển thị nhân viên có thể thực hiện dịch vụ này"
            >
              <Select
                placeholder="Chọn nhân viên"
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
                style={{ width: '100%' }}
              >
                {getQualifiedEmployees(selectedAppointment.serviceId).map(employee => (
                  <Option key={employee.id} value={employee.id}>{employee.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManager;