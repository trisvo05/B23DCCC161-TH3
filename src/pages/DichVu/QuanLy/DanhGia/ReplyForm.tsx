import React, { useState } from 'react';
import { Form, Input, Button, Modal, Space, Typography, message } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import type { Review } from '@/models/review';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface ReplyFormProps {
  review: Review;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  review,
  visible,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const { addReply } = useModel('review');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { content: string }) => {
    if (!values.content.trim()) {
      message.warning('Nội dung phản hồi không được để trống');
      return;
    }

    setLoading(true);
    try {
      // Thêm phản hồi với vai trò admin
      const success = await addReply(review.id, values.content);
      
      if (success) {
        message.success('Phản hồi đã được gửi thành công');
        form.resetFields();
        onClose();
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      message.error('Không thể gửi phản hồi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderReviewInfo = () => (
    <div className="review-summary">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Text strong>Đánh giá của khách hàng</Text>
        <Text type="secondary">{dayjs(review.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
      </div>
      <div style={{ margin: '10px 0', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <Text>{review.comment || '(Không có nội dung đánh giá)'}</Text>
      </div>
    </div>
  );

  const renderExistingReplies = () => {
    if (!review.replies || review.replies.length === 0) {
      return null;
    }

    return (
      <div className="existing-replies">
        <Text strong>Các phản hồi trước đó:</Text>
        {review.replies.map((reply, index) => (
          <div key={reply.id} style={{ margin: '10px 0', padding: '10px', background: '#f0f7ff', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>
                {reply.userRole === 'admin' ? 'Quản trị viên' : 
                 reply.userRole === 'employee' ? 'Nhân viên' : 'Khách'}
              </Text>
              <Text type="secondary">{dayjs(reply.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
            <div style={{ marginTop: '5px' }}>
              <Text>{reply.content}</Text>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      title="Phản hồi đánh giá"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {renderReviewInfo()}
        
        {renderExistingReplies()}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="content"
            label="Nội dung phản hồi"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập nội dung phản hồi..." 
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<CloseOutlined />} 
                onClick={onClose}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SendOutlined />}
              >
                Gửi phản hồi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};

export default ReplyForm;