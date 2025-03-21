import React, { useState } from 'react';
import { Modal, Typography, Rate, Divider, List, Avatar, Comment, Form, Input, Button, Space, message, Tooltip } from 'antd';
import { UserOutlined, StarFilled, CalendarOutlined, SendOutlined, CommentOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import type { Review } from '@/models/review';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ReviewDetailProps {
  review: Review;
  visible: boolean;
  onClose: () => void;
  serviceName?: string;
  employeeName?: string;
}

const ReviewDetail: React.FC<ReviewDetailProps> = ({
  review,
  visible,
  onClose,
  serviceName = 'Dịch vụ không xác định',
  employeeName = 'Nhân viên không xác định',
}) => {
  const { addReply } = useModel('review');
  const [replyForm] = Form.useForm();
  const [replying, setReplying] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Tất cả mọi người đều có thể phản hồi
  const canReply = true;

  const handleReplySubmit = async (values: { reply: string }) => {
    if (!values.reply.trim()) {
      message.warning('Nội dung phản hồi không được để trống!');
      return;
    }

    setLoading(true);
    try {
      // Tạo ID người dùng giả nếu không đăng nhập
      const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      
      const success = await addReply(review.id, values.reply);
      
      if (success) {
        message.success('Phản hồi đã được gửi thành công!');
        replyForm.resetFields();
        setReplying(false);
      }
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      message.error('Không thể gửi phản hồi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderReplies = () => {
    if (!review.replies || review.replies.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary">Chưa có phản hồi nào</Text>
        </div>
      );
    }

    return (
      <List
        dataSource={review.replies}
        renderItem={(reply) => (
          <Comment
            author={<Text strong>{reply.userRole === 'admin' ? 'Quản trị viên' : (reply.userRole === 'employee' ? 'Nhân viên' : 'Khách')}</Text>}
            avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
            content={<Paragraph>{reply.content}</Paragraph>}
            datetime={
              <Tooltip title={dayjs(reply.createdAt).format('DD/MM/YYYY HH:mm:ss')}>
                <Text type="secondary">{dayjs(reply.createdAt).fromNow()}</Text>
              </Tooltip>
            }
          />
        )}
      />
    );
  };

  return (
    <Modal
      title="Chi tiết đánh giá"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="review-detail">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Thông tin đánh giá */}
          <div className="review-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4}>{serviceName}</Title>
              <Rate 
                disabled 
                defaultValue={review.rating} 
                character={<StarFilled />} 
              />
            </div>
            <Space direction="vertical" size={0}>
              <Text>
                <CalendarOutlined /> {dayjs(review.createdAt).format('DD/MM/YYYY HH:mm')}
              </Text>
              <Text>
                <strong>Nhân viên:</strong> {employeeName}
              </Text>
            </Space>
          </div>

          {/* Nội dung đánh giá */}
          <div className="review-content">
            <Title level={5}>Nhận xét của khách hàng</Title>
            <Paragraph>
              {review.comment || <Text type="secondary">Khách hàng không để lại nhận xét</Text>}
            </Paragraph>
          </div>

          <Divider />

          {/* Phần phản hồi */}
          <div className="review-replies">
            <Title level={5}>Phản hồi</Title>
            {renderReplies()}
          </div>

          {/* Form phản hồi */}
          {canReply && (
            <div className="reply-form">
              {!replying ? (
                <Button 
                  type="primary" 
                  icon={<CommentOutlined />} 
                  onClick={() => setReplying(true)}
                >
                  Thêm phản hồi
                </Button>
              ) : (
                <Form
                  form={replyForm}
                  onFinish={handleReplySubmit}
                  layout="vertical"
                >
                  <Form.Item
                    name="reply"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi' }]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Nhập phản hồi của bạn..." 
                      showCount 
                      maxLength={500}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        icon={<SendOutlined />} 
                        loading={loading}
                      >
                        Gửi phản hồi
                      </Button>
                      <Button onClick={() => setReplying(false)}>
                        Hủy
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              )}
            </div>
          )}
        </Space>
      </div>
    </Modal>
  );
};

export default ReviewDetail;