import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, Button, Alert, List, Typography, Space, Spin, message } from 'antd';
import moment from 'moment';
import { 
  findAvailableEmployees, 
  suggestAvailableTimeSlots, 
  getServiceName, 
  timeToMinutes
} from '@/utils/appointmentUtils';

const { Option } = Select;
const { Text } = Typography;

// Định nghĩa types inline
interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface Employee {
  id: number;
  name: string;
  services: number[];
}

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

interface SuggestedTime {
  time: string;
  employeeId: number;
  employeeName: string;
}

interface AvailabilityResult {
  available: boolean;
  message?: string;
  employees?: Employee[];
  suggestedTimes?: SuggestedTime[];
}

interface AppointmentFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// Định nghĩa hook useLocalStorage inline
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State để lưu trữ giá trị
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Lấy từ local storage theo key
      const item = window.localStorage.getItem(key);
      // Parse stored json hoặc trả về initialValue nếu không có
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Hàm để cập nhật cả state và localStorage
  const setValue = (value: T) => {
    try {
      // Cho phép value là một function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Lưu state
      setStoredValue(valueToStore);
      // Lưu vào localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<AvailabilityResult | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useLocalStorage<AppointmentData[]>('appointments', []);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    try {
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      
      setServices(storedServices);
      setEmployees(storedEmployees);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      message.error('Không thể tải dữ liệu dịch vụ và nhân viên');
    }
  }, []);

  // Reset form khi modal đóng
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setAvailabilityResult(null);
    }
  }, [visible, form]);

  const handleServiceChange = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId) || null;
    setSelectedService(service);
    setAvailabilityResult(null);
  };

  const handleCheckAvailability = async () => {
    try {
      // Validate trước khi kiểm tra
      const values = await form.validateFields(['serviceId', 'appointmentDate', 'appointmentTime']);
      setCheckingAvailability(true);
      
      const date = values.appointmentDate.format('YYYY-MM-DD');
      const time = values.appointmentTime.format('HH:mm');
      
      // Tìm nhân viên phù hợp
      const availableEmployees = findAvailableEmployees(
        values.serviceId,
        date,
        time,
        employees,
        appointments
      );
      
      if (availableEmployees.length > 0) {
        setAvailabilityResult({
          available: true,
          employees: availableEmployees
        });
        message.success('Có nhân viên khả dụng vào thời gian này!');
      } else {
        // Nếu không có nhân viên rảnh, tìm khung giờ gần nhất có thể
        const suggestedTimes = suggestAvailableTimeSlots(
          values.serviceId,
          date,
          time,
          employees,
          appointments
        );
        
        setAvailabilityResult({
          available: false,
          message: 'Không có nhân viên rảnh vào thời điểm này',
          suggestedTimes
        });
        
        if (suggestedTimes.length === 0) {
          message.warning('Không tìm thấy thời gian thay thế. Vui lòng thử ngày khác.');
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Vui lòng điền đầy đủ thông tin dịch vụ, ngày và giờ!');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async () => {
    if (!availabilityResult?.available) {
      message.warning('Vui lòng kiểm tra thời gian trước khi đặt lịch');
      return;
    }
    
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Format date và time
      const date = values.appointmentDate.format('YYYY-MM-DD');
      const time = values.appointmentTime.format('HH:mm');
      
      // Tạo lịch hẹn mới
      const newAppointment: AppointmentData = {
        id: Date.now(),
        customerName: values.customerName,
        phoneNumber: values.phoneNumber,
        serviceId: values.serviceId,
        appointmentDate: date,
        appointmentTime: time,
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: values.notes
      };
      
      // Lưu vào localStorage
      setAppointments([...appointments, newAppointment]);
      
      // Lưu thông tin người dùng hiện tại để sau này có thể xem lịch sử
      const currentUser = {
        name: values.customerName,
        phoneNumber: values.phoneNumber
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      message.success('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      onSuccess();
      form.resetFields();
      setAvailabilityResult(null);
    } catch (error) {
      console.error('Submit failed:', error);
      message.error('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestedTime = (suggestedTime: SuggestedTime) => {
    form.setFieldsValue({
      appointmentTime: moment(suggestedTime.time, 'HH:mm')
    });
    
    // Kiểm tra lại tính khả dụng
    handleCheckAvailability();
  };

  // Tối ưu các hàm helpers bằng useMemo
  const disabledDate = useMemo(() => {
    return (current: moment.Moment) => {
      // Không cho phép chọn ngày trong quá khứ
      return current && current < moment().startOf('day');
    };
  }, []);

  const disabledTime = useMemo(() => {
    return () => {
      const hours: number[] = [];
      // Giả sử giờ làm việc là từ 8:00 - 18:00
      for (let i = 0; i < 8; i++) hours.push(i);
      for (let i = 18; i < 24; i++) hours.push(i);
      
      return {
        disabledHours: () => hours
      };
    };
  }, []);

  // Kiểm tra nếu không có dịch vụ và nhân viên
  const noServicesOrEmployees = services.length === 0 || employees.length === 0;

  return (
    <Modal
      title="Đặt lịch dịch vụ"
      visible={visible}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setAvailabilityResult(null);
      }}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="check" 
          type="default" 
          onClick={handleCheckAvailability} 
          loading={checkingAvailability}
          disabled={loading || noServicesOrEmployees}
        >
          Kiểm tra thời gian
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit} 
          loading={loading}
          disabled={!availabilityResult?.available || noServicesOrEmployees}
        >
          Đặt lịch
        </Button>
      ]}
      width={700}
    >
      {noServicesOrEmployees && (
        <Alert
          message="Không tìm thấy dữ liệu"
          description="Không có dịch vụ hoặc nhân viên trong hệ thống. Vui lòng liên hệ quản trị viên."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form form={form} layout="vertical">
        <Form.Item
          name="customerName"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>
        
        <Form.Item
          name="phoneNumber"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        
        <Form.Item
          name="serviceId"
          label="Dịch vụ"
          rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}
        >
          <Select placeholder="Chọn dịch vụ" onChange={handleServiceChange}>
            {services.map(service => (
              <Option key={service.id} value={service.id}>
                {service.name} - {service.price.toLocaleString()} VNĐ ({service.duration} phút)
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedService && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Thời gian dự kiến cho dịch vụ này: {selectedService.duration} phút
            </Text>
          </div>
        )}
        
        <Form.Item
          name="appointmentDate"
          label="Ngày đặt lịch"
          rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
          />
        </Form.Item>
        
        <Form.Item
          name="appointmentTime"
          label="Thời gian"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
        >
          <TimePicker 
            style={{ width: '100%' }} 
            format="HH:mm"
            minuteStep={30}
            disabledTime={disabledTime}
          />
        </Form.Item>
        
        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <Input.TextArea rows={4} placeholder="Nhập ghi chú nếu có" />
        </Form.Item>
      </Form>

      {checkingAvailability && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spin tip="Đang kiểm tra..." />
        </div>
      )}

      {availabilityResult && !checkingAvailability && (
        <>
          {availabilityResult.available ? (
            <Alert
              message="Thời gian khả dụng"
              description={`Có ${availabilityResult.employees?.length} nhân viên có thể phục vụ bạn vào thời gian này.`}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          ) : (
            <div>
              <Alert
                message={availabilityResult.message}
                type="error"
                showIcon
                style={{ marginTop: 16, marginBottom: 16 }}
              />
              
              {availabilityResult.suggestedTimes && availabilityResult.suggestedTimes.length > 0 && (
                <>
                  <Text strong>Thời gian gợi ý:</Text>
                  <List
                    size="small"
                    bordered
                    dataSource={availabilityResult.suggestedTimes}
                    renderItem={(item: SuggestedTime) => (
                      <List.Item
                        actions={[
                          <Button type="link" onClick={() => selectSuggestedTime(item)}>
                            Chọn
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={`${item.time} với ${item.employeeName}`}
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default AppointmentForm;