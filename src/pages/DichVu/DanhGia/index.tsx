import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Button, message, Spin } from 'antd';
import { CommentOutlined, StarOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

const { Title } = Typography;
const { TabPane } = Tabs;

const DanhGiaPage: React.FC = () => {
  const { loadReviews, loading } = useModel('review');
  const [activeTab, setActiveTab] = useState('list');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Tải dữ liệu đánh giá
    loadReviews().then(() => {
      setInitialized(true);
    }).catch(error => {
      console.error('Lỗi khi tải dữ liệu đánh giá:', error);
      message.error('Không thể tải dữ liệu đánh giá. Vui lòng thử lại sau.');
      setInitialized(true);
    });
    
    // Kiểm tra nếu có query parameter để chuyển tab
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'form') {
      setActiveTab('form');
    }
    
    // Kiểm tra nếu được chuyển từ trang lịch hẹn để đánh giá
    const appointmentId = urlParams.get('appointmentId');
    if (appointmentId) {
      setActiveTab('form');
    }
  }, [loadReviews]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Cập nhật URL mà không làm mới trang
    const newUrl = key === 'form' 
      ? `${window.location.pathname}?tab=form` 
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };

  const handleReviewSuccess = () => {
    message.success('Đánh giá của bạn đã được gửi thành công!');
    setActiveTab('list');
    loadReviews();
  };

  if (!initialized) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  // Lấy appointmentId từ URL query nếu có
  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get('appointmentId');

  return (
    <div className="review-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Card>
        <Title level={2}>
          <StarOutlined /> Đánh giá dịch vụ
        </Title>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          tabBarExtraContent={
            activeTab === 'list' ? (
              <Button 
                type="primary" 
                icon={<CommentOutlined />}
                onClick={() => handleTabChange('form')}
              >
                Gửi đánh giá mới
              </Button>
            ) : null
          }
        >
          <TabPane 
            tab={
              <span>
                <CommentOutlined /> Danh sách đánh giá
              </span>
            } 
            key="list"
          >
            <ReviewList 
              showActions={true}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <StarOutlined /> Gửi đánh giá
              </span>
            } 
            key="form"
          >
            <ReviewForm 
              appointmentId={appointmentId || undefined}
              onSuccess={handleReviewSuccess}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DanhGiaPage;