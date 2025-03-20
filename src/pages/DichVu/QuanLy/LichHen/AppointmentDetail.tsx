import React from 'react';
import { Modal, Descriptions, Button, Tag, Space, Divider, Typography } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import { 
  getServiceName, 
  getEmployeeName, 
  formatDateTime, 
  getStatusText 
} from '@/utils/appointmentUtils';

const { Text } = Typography;

interface AppointmentDetailProps {
  visible: boolean;
  appointment: any;
  onClose: () => void;
  onMarkAsCompleted: (id: number) => void;
  onCancel: (id: number) => void;
  onAssignEmployee: (appointment: any) => void;
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  visible,
  appointment,
  onClose,
  onMarkAsCompleted,
  onCancel,
  onAssignEmployee
}) => {
  if (!appointment) {
    return null;
  }

  const statusInfo = getStatusText(appointment.status);
  const isPending = appointment.status === 'pending';
  const isConfirmed = appointment.status === 'confirmed';
  const isCompleted = appointment.status === 'completed';
  const isCanceled = appointment.status === 'canceled';

  // Kiểm tra xem lịch hẹn đã qua hay chưa
  const appointmentTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
  const now = new Date();
  const isPastAppointment = appointmentTime < now;

  // Xác định các action có thể thực hiện
  const canAssign = isPending && !isPastAppointment;
  const canComplete = isConfirmed && !isPastAppointment;
  const canCancel = (isPending || isConfirmed) && !isPastAppointment;

  return (
    <Modal
      title="Chi tiết lịch hẹn"
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Thông tin khách hàng">
          <Space direction="vertical">
            <div><UserOutlined /> {appointment.customerName}</div>
            <div><PhoneOutlined /> {appointment.phoneNumber}</div>
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Dịch vụ">
          {getServiceName(appointment.serviceId)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Thời gian">
          <ClockCircleOutlined /> {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Nhân viên phụ trách">
          {appointment.employeeId ? getEmployeeName(appointment.employeeId) : (
            <Text type="warning">Chưa phân công</Text>
          )}
        </Descriptions.Item>
        
        {appointment.notes && (
          <Descriptions.Item label="Ghi chú">
            {appointment.notes}
          </Descriptions.Item>
        )}
        
        <Descriptions.Item label="Thời gian tạo">
          {new Date(appointment.createdAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
      
      <Divider />
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          {canAssign && (
            <Button 
              type="primary" 
              onClick={() => onAssignEmployee(appointment)}
            >
              Phân công nhân viên
            </Button>
          )}
          
          {canComplete && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={() => onMarkAsCompleted(appointment.id)}
            >
              Đánh dấu hoàn thành
            </Button>
          )}
        </Space>
        
        {canCancel && (
          <Button 
            danger 
            icon={<CloseCircleOutlined />} 
            onClick={() => onCancel(appointment.id)}
          >
            Hủy lịch hẹn
          </Button>
        )}
      </div>
      
      {isPastAppointment && !isCompleted && !isCanceled && (
        <div style={{ marginTop: 16 }}>
          <Tag color="orange">Lịch hẹn này đã qua thời gian thực hiện</Tag>
        </div>
      )}
    </Modal>
  );
};

export default AppointmentDetail;