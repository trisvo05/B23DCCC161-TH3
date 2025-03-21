import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Rate, Typography, Tag, message, Tooltip, Input, Row, Col, Select } from 'antd';
import { StarFilled, CommentOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import type { Review } from '@/models/review';
import dayjs from 'dayjs';
import ReplyForm from './ReplyForm';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const QuanLyDanhGia: React.FC = () => {
  const { reviews, loadReviews, loading } = useModel('review');
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyFormVisible, setReplyFormVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, searchText]); // Loại bỏ filterRating khỏi dependencies

  const loadData = async () => {
    try {
      // Tải dữ liệu đánh giá
      await loadReviews();
      
      // Tải dữ liệu dịch vụ và nhân viên
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      
      setServices(storedServices);
      setEmployees(storedEmployees);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];
    
    // Lọc theo nội dung tìm kiếm
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(review => 
        (review.comment && review.comment.toLowerCase().includes(lowerSearchText)) ||
        getServiceName(review.serviceId).toLowerCase().includes(lowerSearchText) ||
        getEmployeeName(review.employeeId).toLowerCase().includes(lowerSearchText)
      );
    }
  
    // Sắp xếp theo thời gian mới nhất
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredReviews(filtered);
  };

  const resetFilters = () => {
    setSearchText('');
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Dịch vụ không xác định';
  };
  
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Nhân viên không xác định';
  };

  const handleReply = (review: Review) => {
    setSelectedReview(review);
    setReplyFormVisible(true);
  };

  const handleReplySuccess = () => {
    loadReviews();
  };

  interface TableColumn {
    title: string;
    dataIndex?: string;
    key: string;
    render?: (text: any, record: Review) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sorter?: (a: Review, b: Review) => number;
    filters?: { text: string; value: any }[];
    onFilter?: (value: any, record: Review) => boolean;
  }

  const columns: TableColumn[] = [
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceId',
      key: 'service',
      render: (serviceId: string) => getServiceName(serviceId),
      width: '20%',
      align: 'center',
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeId',
      key: 'employee',
      render: (employeeId: string) => getEmployeeName(employeeId),
      width: '15%',
      align: 'center',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      align: 'center',
      render: (rating: number) => (
        <Rate 
          disabled 
          defaultValue={rating} 
          character={<StarFilled />} 
          style={{ fontSize: '14px' }}
        />
      ),
      width: '15%',
      sorter: (a: Review, b: Review) => a.rating - b.rating,
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      align: 'center',
      render: (comment: string) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {comment || <Text type="secondary">(Không có nhận xét)</Text>}
        </Paragraph>
      ),
      width: '25%',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY HH:mm'),
      width: '15%',
      sorter: (a: Review, b: Review) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (text: string, record: Review) => {
        const hasReplies = record.replies && record.replies.length > 0;
        return hasReplies ? (
          <Tag color="success">
            Đã phản hồi
          </Tag>
        ) : (
          <Tag color="warning">
            Chưa phản hồi
          </Tag>
        );
      },
      width: '15%',
      filters: [
        { text: 'Đã phản hồi', value: true },
        { text: 'Chưa phản hồi', value: false },
      ],
      onFilter: (value: boolean, record: Review) => {
        const hasReplies = record.replies && record.replies.length > 0;
        return value === hasReplies;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (text: string, record: Review) => (
        <Space size="small">
          <Tooltip title="Phản hồi">
            <Button 
              type="primary" 
              icon={<CommentOutlined />} 
              size="small"
              onClick={() => handleReply(record)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleReply(record)}
            />
          </Tooltip>
        </Space>
      ),
      width: '10%',
    },
  ];

  return (
    <div className="review-management-container">
      <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3}>Quản lý đánh giá</Title>
        </div>
      }>
        {/* Bộ lọc */}
        <div className="review-filters" style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]} align="middle" justify="start">
            {/* Giảm kích thước col để thu nhỏ box tìm kiếm */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="Tìm kiếm đánh giá"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: '100%' }} // Đảm bảo search box chiếm toàn bộ width của col
              />
            </Col>
            <Col xs={24} sm={6} md={4} lg={3}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={resetFilters}
                style={{ width: '100%' }}
              >
                Đặt lại
              </Button>
            </Col>
          </Row>
        </div>

        {/* Bảng dữ liệu */}
        <Table
          columns={columns}
          dataSource={filteredReviews}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} đánh giá`,
          }}
        />

        {/* Form phản hồi */}
        {selectedReview && (
          <ReplyForm
            review={selectedReview}
            visible={replyFormVisible}
            onClose={() => setReplyFormVisible(false)}
            onSuccess={handleReplySuccess}
          />
        )}
      </Card>
    </div>
  );
};

export default QuanLyDanhGia;