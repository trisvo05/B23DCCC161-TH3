import React, { useState, useEffect } from 'react';
import { List, Avatar, Rate, Card, Typography, Space, Tag, Button, Empty, Divider, Comment, Tooltip, Spin } from 'antd';
import { UserOutlined, StarFilled, CommentOutlined, CalendarOutlined, MessageOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import type { Review, Reply } from '@/models/review';
import dayjs from 'dayjs';
import ReviewDetail from './ReviewDetail';

const { Text, Paragraph } = Typography;


interface ReviewListProps {
  customerId?: string; // Để lọc theo khách hàng cụ thể
  serviceId?: string; // Để lọc theo dịch vụ cụ thể
  employeeId?: string; // Để lọc theo nhân viên cụ thể
  limit?: number; // Giới hạn số lượng hiển thị
  showActions?: boolean; // Có hiển thị các nút hành động không
}

const ReviewList: React.FC<ReviewListProps> = ({
  customerId,
  serviceId,
  employeeId,
  limit,
  showActions = true,
}) => {
  const { reviews, loading, loadReviews } = useModel('review');
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    loadReviews();
    loadRelatedData();
  }, [loadReviews]);

  const loadRelatedData = () => {
    try {
      // Lấy dữ liệu từ localStorage
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      
      setServices(storedServices);
      setEmployees(storedEmployees);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu liên quan:', error);
    }
  };

  // Lọc reviews theo props
  const getFilteredReviews = () => {
    let displayReviews = [...reviews];
    
    if (customerId) {
      displayReviews = displayReviews.filter(r => r.customerId === customerId);
    }
    
    if (serviceId) {
      displayReviews = displayReviews.filter(r => r.serviceId === serviceId);
    }
    
    if (employeeId) {
      displayReviews = displayReviews.filter(r => r.employeeId === employeeId);
    }
    
    // Sắp xếp theo thời gian mới nhất
    displayReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Giới hạn số lượng hiển thị
    if (limit && limit > 0) {
      displayReviews = displayReviews.slice(0, limit);
    }
    
    return displayReviews;
  };

  const displayReviews = getFilteredReviews();
  
  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Dịch vụ không xác định';
  };
  
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Nhân viên không xác định';
  };

  const handleViewDetail = (review: Review) => {
    setSelectedReview(review);
    setDetailVisible(true);
  };
  
  const handleDetailClose = () => {
    setDetailVisible(false);
    setSelectedReview(null);
  };

  const renderReplyList = (replies?: Reply[]) => {
    if (!replies || replies.length === 0) return null;
    
    return (
      <List
        className="reply-list"
        itemLayout="horizontal"
        dataSource={replies}
        renderItem={(reply) => (
          <Comment
            author={<Text strong>{reply.userRole === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</Text>}
            avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
            content={<Paragraph>{reply.content}</Paragraph>}
            datetime={
              <Tooltip title={dayjs(reply.createdAt).format('DD/MM/YYYY HH:mm:ss')}>
                <Text type="secondary">{dayjs(reply.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </Tooltip>
            }
          />
        )}
      />
    );
  };

  if (loading) {
    return <Spin size="large" tip="Đang tải đánh giá..." />;
  }

  if (displayReviews.length === 0) {
    return (
      <Card>
        <Empty 
          description="Chưa có đánh giá nào" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </Card>
    );
  }

  return (
    <>
      <List
        itemLayout="vertical"
        dataSource={displayReviews}
        renderItem={(review) => (
          <List.Item
            key={review.id}
            actions={showActions ? [
              <Button 
                type="link" 
                icon={<CommentOutlined />} 
                onClick={() => handleViewDetail(review)}
              >
                Chi tiết
              </Button>
            ] : []}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  size={48} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#f56a00' }} 
                />
              }
              title={
                <Space size="middle">
                  <Text strong>Đánh giá dịch vụ: {getServiceName(review.serviceId)}</Text>
                  <Rate 
                    disabled 
                    defaultValue={review.rating} 
                    character={<StarFilled style={{ fontSize: '16px' }} />} 
                  />
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    <CalendarOutlined /> {dayjs(review.createdAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                  <Text>
                    Nhân viên: {getEmployeeName(review.employeeId)}
                  </Text>
                </Space>
              }
            />
            <Paragraph 
              ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
              style={{ marginTop: 16 }}
            >
              {review.comment || <Text type="secondary">Không có nhận xét</Text>}
            </Paragraph>
            
            {review.replies && review.replies.length > 0 && (
              <>
                <Divider orientation="left" plain>
                  <Text type="secondary">
                    <MessageOutlined /> Phản hồi ({review.replies.length})
                  </Text>
                </Divider>
                {renderReplyList(review.replies)}
              </>
            )}
          </List.Item>
        )}
      />
      
      {selectedReview && (
        <ReviewDetail
          review={selectedReview}
          visible={detailVisible}
          onClose={handleDetailClose}
          serviceName={getServiceName(selectedReview.serviceId)}
          employeeName={getEmployeeName(selectedReview.employeeId)}
        />
      )}
    </>
  );
};

export default ReviewList;