import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Alert, List, Divider, message } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
// Xóa dòng import useLocalStorageState
// import { useLocalStorageState } from 'ahooks';
import AppointmentForm from './AppointmentForm';
import { getServiceName, formatDateTime, getStatusText } from '@/utils/appointmentUtils';

const { Title, Paragraph, Text } = Typography;

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

// Thêm hook useLocalStorage
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

  // Trả về hàm setter được bọc để lưu vào localStorage
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

const AppointmentPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  // Thay đổi từ useLocalStorageState sang useLocalStorage
  const [appointments, setAppointments] = useLocalStorage<AppointmentData[]>('appointments', []);
  const [userAppointments, setUserAppointments] = useState<AppointmentData[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; phoneNumber: string } | null>(null);

  // Phần còn lại của component giữ nguyên
  useEffect(() => {
    // Lấy danh sách dịch vụ từ localStorage
    const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
    setServices(storedServices);
    
    // Lấy thông tin người dùng hiện tại nếu có
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing currentUser', e);
      }
    }
  }, []);
  
  useEffect(() => {
    // Lọc các lịch hẹn của người dùng hiện tại
    if (currentUser?.phoneNumber) {
      const filteredAppointments = appointments.filter(
        app => app.phoneNumber === currentUser.phoneNumber
      );
      
      // Sắp xếp theo ngày, giờ
      filteredAppointments.sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      setUserAppointments(filteredAppointments);
    }
  }, [appointments, currentUser]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAppointmentCreated = () => {
    setIsModalVisible(false);
    message.success('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
  };

  const handleCancelAppointment = (id: number) => {
    const updatedAppointments = appointments.map(app => 
      app.id === id ? { ...app, status: 'canceled' } : app
    );
    setAppointments(updatedAppointments);
    message.success('Hủy lịch hẹn thành công');
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = getStatusText(status);
    return <Text style={{ color: statusInfo.color }}>{statusInfo.text}</Text>;
  };

  return (
    <div style={{ maxWidth: 1000, margin: 'auto' }}>
      <Card>
        <Title level={2}>Đặt lịch dịch vụ</Title>
        <Paragraph>
          Vui lòng đặt lịch sử dụng dịch vụ để được phục vụ tốt nhất. Chúng tôi sẽ sắp xếp thời gian và nhân viên phù hợp nhất cho bạn.
        </Paragraph>
        
        <Button 
          type="primary" 
          icon={<CalendarOutlined />} 
          onClick={showModal}
          size="large"
          style={{ marginBottom: 20 }}
        >
          Đặt lịch ngay
        </Button>

        {userAppointments.length > 0 && (
          <>
            <Divider />
            <Title level={4}>Lịch hẹn của bạn</Title>
            
            <List
              itemLayout="vertical"
              dataSource={userAppointments}
              renderItem={item => {
                // Kiểm tra xem lịch hẹn đã qua hay chưa
                const appointmentTime = new Date(`${item.appointmentDate} ${item.appointmentTime}`);
                const now = new Date();
                const isPastAppointment = appointmentTime < now;
                
                // Chỉ hiển thị nút hủy nếu lịch hẹn chưa qua và chưa bị hủy
                const showCancelButton = !isPastAppointment && item.status !== 'canceled' && item.status !== 'completed';
                
                return (
                  <List.Item
                    actions={[
                      showCancelButton && (
                        <Button 
                          danger 
                          onClick={() => handleCancelAppointment(item.id)}
                        >
                          Hủy lịch hẹn
                        </Button>
                      )
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={getServiceName(item.serviceId)}
                      description={
                        <div>
                          <div>
                            <ClockCircleOutlined /> {formatDateTime(item.appointmentDate, item.appointmentTime)}
                          </div>
                          <div>
                            <UserOutlined /> {item.customerName}
                          </div>
                          <div>
                            <PhoneOutlined /> {item.phoneNumber}
                          </div>
                          <div style={{ marginTop: 8 }}>
                            Trạng thái: {getStatusBadge(item.status)}
                          </div>
                        </div>
                      }
                    />
                    {item.notes && (
                      <div>
                        <Text strong>Ghi chú:</Text> {item.notes}
                      </div>
                    )}
                  </List.Item>
                );
              }}
            />
          </>
        )}
        
        {currentUser && userAppointments.length === 0 && (
          <Alert
            message="Bạn chưa có lịch hẹn"
            description="Hiện tại bạn chưa đặt lịch hẹn nào. Vui lòng bấm nút 'Đặt Lịch Ngay' để đặt lịch."
            type="info"
            showIcon
          />
        )}
      </Card>

      <AppointmentForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSuccess={handleAppointmentCreated}
      />
    </div>
  );
};

export default AppointmentPage;