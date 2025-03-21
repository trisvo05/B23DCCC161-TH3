import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Rate, Select, Card, Typography, message, Spin } from 'antd';
import { StarOutlined, CommentOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface ReviewFormProps {
  appointmentId?: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ appointmentId, onSuccess }) => {
  const [form] = Form.useForm();
  const { createReview } = useModel('review');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Nếu có appointmentId, tự động chọn lịch hẹn
    if (appointmentId) {
      form.setFieldsValue({ appointmentId });
      handleAppointmentChange(appointmentId);
    }
  }, [appointmentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Lấy dữ liệu từ localStorage (hoặc API trong thực tế)
      const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      
      // Lọc các lịch hẹn đã hoàn thành và chưa được đánh giá
      const completedAppointments = storedAppointments.filter((app: any) => {
        // Trạng thái đã hoàn thành
        const isCompleted = app.status === 'completed';
        
        // Kiểm tra xem đã đánh giá chưa
        const reviews = JSON.parse(localStorage.getItem('app_service_reviews') || '[]');
        const hasReview = reviews.some((review: any) => review.appointmentId === app.id);
        
        return isCompleted && !hasReview;
      });
      
      setAppointments(completedAppointments);
      setServices(storedServices);
      setEmployees(storedEmployees);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      
      const service = services.find(s => s.id === appointment.serviceId);
      const employee = employees.find(e => e.id === appointment.employeeId);
      
      form.setFieldsValue({
        serviceId: appointment.serviceId,
        employeeId: appointment.employeeId,
        serviceName: service?.name,
        employeeName: employee?.name
      });
    }
  };

  const handleSubmit = async (values: any) => {
    if (!values.rating) {
      message.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    setLoading(true);
    try {
      // Tạo ID khách hàng ngẫu nhiên nếu không có thông tin đăng nhập
      const customerId = 'guest_' + Math.random().toString(36).substring(2, 9);
      
      const reviewData = {
        appointmentId: values.appointmentId,
        serviceId: values.serviceId,
        employeeId: values.employeeId,
        customerId: customerId,
        rating: values.rating,
        comment: values.comment || '',
      };
      
      const success = await createReview(reviewData);
      
      if (success) {
        message.success('Cảm ơn bạn đã gửi đánh giá!');
        form.resetFields();
        setSelectedAppointment(null);
        
        if (onSuccess) {
          onSuccess();
        } else {
          // Chuyển hướng đến trang danh sách đánh giá
          history.push('/DichVu/DanhGia');
        }
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      message.error('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const noAppointmentsToReview = appointments.length === 0;

  return (
    <Card 
      title={<Title level={4}>Đánh giá dịch vụ</Title>}
      className="review-form-card"
    >
      <Spin spinning={loading}>
        {noAppointmentsToReview ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text>Không có dịch vụ nào cần đánh giá vào lúc này.</Text>
            <br />
            <Button 
              type="primary" 
              onClick={() => history.push('/DichVu/DatLich')}
              style={{ marginTop: 16 }}
            >
              Đặt lịch mới
            </Button>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ rating: 5 }}
          >
            <Form.Item
              name="appointmentId"
              label="Chọn lịch hẹn"
              rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
            >
              <Select 
                placeholder="Chọn lịch hẹn cần đánh giá"
                onChange={handleAppointmentChange}
                disabled={!!appointmentId}
              >
                {appointments.map(app => {
                  const service = services.find(s => s.id === app.serviceId);
                  const date = new Date(app.appointmentDate).toLocaleDateString('vi-VN');
                  
                  return (
                    <Option key={app.id} value={app.id}>
                      {service?.name} - {date}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            {selectedAppointment && (
              <>
                <Form.Item 
                  name="serviceName" 
                  label="Dịch vụ"
                >
                  <Input disabled />
                </Form.Item>
                
                <Form.Item 
                  name="employeeName" 
                  label="Nhân viên phục vụ"
                >
                  <Input disabled />
                </Form.Item>
                
                <Form.Item name="serviceId" hidden>
                  <Input />
                </Form.Item>
                
                <Form.Item name="employeeId" hidden>
                  <Input />
                </Form.Item>

                <Form.Item
                  name="rating"
                  label="Đánh giá"
                  rules={[{ required: true, message: 'Vui lòng đánh giá chất lượng dịch vụ' }]}
                >
                  <Rate 
                    allowHalf 
                    character={<StarOutlined />} 
                  />
                </Form.Item>

                <Form.Item
                  name="comment"
                  label="Nhận xét"
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<CommentOutlined />}
                    block
                  >
                    Gửi đánh giá
                  </Button>
                </Form.Item>
              </>
            )}
          </Form>
        )}
      </Spin>
    </Card>
  );
};

export default ReviewForm;