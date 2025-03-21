import React, { useEffect, useState } from 'react';
import { Table, DatePicker, Card, Row, Col, Statistic, Select, Tabs, Spin, Avatar, List, Tag } from 'antd';
import { 
  getAppointmentStatistics, 
  getRevenueStatistics,
  getServicePopularityStatistics,
  getCustomerReviewStatistics,
  getStaffPerformanceStatistics,
  getRecentAppointments,
  getRecentReviews,
  getTopServices,
  getTopStaffByAppointments,
  getAdminDashboardData
} from '@/utils/localStatisticsService';
import moment from 'moment';
import { Line, Pie, Column } from '@ant-design/charts';
import { 
  CalendarOutlined, 
  DollarOutlined, 
  LikeOutlined, 
  UserOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

// Interfaces (maintain the same interfaces)
interface AppointmentStat {
  date: string;
  count: number;
  completionRate: number;
}

interface RevenueStat {
  date: string;
  revenue: number;
}

interface ServiceStat {
  serviceName: string;
  count: number;
  revenue: number;
}

interface ReviewStat {
  date: string;
  averageRating: number;
  count: number;
}

interface StaffStat {
  staffName: string;
  appointmentCount: number;
  averageRating: number;
}

interface RecentAppointment {
  id: string | number;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  staffName: string;
}

interface RecentReview {
  id: string | number;
  customerName: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
}

interface DashboardData {
  appointmentsToday: number;
  pendingAppointments: number;
  totalRevenue: number;
  customerCount: number;
  reviewsCount: number;
  averageRating: number;
}

const BaoCao: React.FC = () => {
  // State declarations
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStat[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStat[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStat[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStat[]>([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  
  // States for additional data
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [topServices, setTopServices] = useState<ServiceStat[]>([]);
  const [topStaff, setTopStaff] = useState<StaffStat[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    appointmentsToday: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
    customerCount: 0,
    reviewsCount: 0,
    averageRating: 0
  });

  // Function to fetch statistics from localStorage
  const fetchStatistics = async (date: moment.Moment, range: string) => {
    setLoading(true);
    try {
      // Fetch all statistics data
      const appointmentData = getAppointmentStatistics(date, range);
      const revenueData = getRevenueStatistics(date);
      const serviceData = getServicePopularityStatistics(date);
      const reviewData = getCustomerReviewStatistics(date);
      const staffData = getStaffPerformanceStatistics(date);
      
      // Fetch additional data
      const recentAppts = getRecentAppointments(5);
      const recentRevs = getRecentReviews(5);
      const topServs = getTopServices(5);
      const topStf = getTopStaffByAppointments(5);
      const dashData = getAdminDashboardData();
      
      // Update state with fetched data
      setAppointmentStats(appointmentData?.data || []);
      setRevenueStats(revenueData?.data || []);
      setServiceStats(serviceData?.data || []);
      setReviewStats(reviewData?.data || []);
      setStaffStats(staffData?.data || []);
      
      // Update state for additional data
      setRecentAppointments(recentAppts?.data || []);
      setRecentReviews(recentRevs?.data || []);
      setTopServices(topServs?.data || []);
      setTopStaff(topStf?.data || []);
      setDashboardData(dashData || {
        appointmentsToday: 0,
        pendingAppointments: 0,
        totalRevenue: 0,
        customerCount: 0,
        reviewsCount: 0,
        averageRating: 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Reset states to empty arrays in case of error
      setAppointmentStats([]);
      setRevenueStats([]);
      setServiceStats([]);
      setReviewStats([]);
      setStaffStats([]);
      setRecentAppointments([]);
      setRecentReviews([]);
      setTopServices([]);
      setTopStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchStatistics(selectedDate, timeRange);
  }, [selectedDate, timeRange]);

  // Handle date change
  const handleDateChange = (date: moment.Moment | null, dateString: string) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Handle range change
  const handleRangeChange = (value: string) => {
    setTimeRange(value);
  };

  // Calculate summary metrics
  const totalAppointments = appointmentStats.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = revenueStats.reduce((sum, item) => sum + item.revenue, 0);
  const averageRating = reviewStats.length > 0 
    ? reviewStats.reduce((sum, item) => sum + item.averageRating, 0) / reviewStats.length 
    : 0;

  // Chart configurations
  const appointmentConfig = {
    data: appointmentStats,
    xField: 'date',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const revenueConfig = {
    data: revenueStats,
    xField: 'date',
    yField: 'revenue',
    label: {
      style: {
        fill: '#aaa',
      },
    },
    meta: {
      revenue: {
        alias: 'Doanh thu',
      },
    },
  };

  const serviceConfig = {
    data: serviceStats,
    angleField: 'count',
    colorField: 'serviceName',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
  };

  const reviewConfig = {
    data: reviewStats,
    xField: 'date',
    yField: 'averageRating',
    meta: {
      averageRating: {
        alias: 'Điểm đánh giá',
        min: 0,
        max: 5,
      },
    },
  };
  
  const staffConfig = {
    data: staffStats,
    xField: 'staffName',
    yField: 'appointmentCount',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
      },
    },
  };

  // Render status tag cho lịch hẹn
  const renderAppointmentStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag color="success">Hoàn thành</Tag>;
      case 'pending':
        return <Tag color="warning">Chờ xử lý</Tag>;
      case 'confirmed':
        return <Tag color="processing">Đã xác nhận</Tag>;
      case 'canceled':
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Render số sao đánh giá
  const renderStars = (rating: number) => {
    return (
      <span>
        {[...Array(5)].map((_, i) => (
          <StarOutlined 
            key={i} 
            style={{ 
              color: i < rating ? '#fadb14' : '#f0f0f0',
              marginRight: 2 
            }} 
          />
        ))}
      </span>
    );
  };

  return (
    <div>
      <Card title="Thống kê & Báo cáo" extra={
        <div style={{ display: 'flex', gap: 10 }}>
          <DatePicker 
            value={selectedDate} 
            onChange={handleDateChange} 
            picker={timeRange as any}
          />
          <Select defaultValue="month" style={{ width: 120 }} onChange={handleRangeChange}>
            <Option value="month">Tháng</Option>
            <Option value="quarter">Quý</Option>
            <Option value="year">Năm</Option>
          </Select>
        </div>
      }>
        <Spin spinning={loading}>
          {/* Dashboard Overview Section */}
          <Row gutter={16} style={{ marginBottom: 24 }} justify="space-between">
          <Col flex="1">
            <Card>
              <Statistic
                title="Lịch hẹn hôm nay"
                value={dashboardData.appointmentsToday}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col flex="1">
            <Card>
              <Statistic
                title="Đang chờ xử lý"
                value={dashboardData.pendingAppointments}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col flex="1">
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={dashboardData.totalRevenue}
                formatter={(value) => `${value.toLocaleString()}`}
                prefix={<DollarOutlined />}
                suffix="VND"
              />
            </Card>
          </Col>
          <Col flex="1">
            <Card>
              <Statistic
                title="Số khách hàng"
                value={dashboardData.customerCount}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col flex="1">
            <Card>
              <Statistic
                title="Số đánh giá"
                value={dashboardData.reviewsCount}
                prefix={<LikeOutlined />}
              />
            </Card>
          </Col>
        </Row>

          <Tabs defaultActiveKey="overview">
            <TabPane tab="Tổng quan" key="overview">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Lịch hẹn gần đây" style={{ marginBottom: 16 }}>
                    <List
                      dataSource={recentAppointments}
                      renderItem={item => (
                        <List.Item actions={[renderAppointmentStatus(item.status)]}>
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={<a href={`/DichVu/QuanLy/LichHen?id=${item.id}`}>{item.customerName}</a>}
                            description={`${item.serviceName} • ${item.date} ${item.time} • Nhân viên: ${item.staffName}`}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="Đánh giá gần đây" style={{ marginBottom: 16 }}>
                    <List
                      dataSource={recentReviews}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={<span>{item.customerName} - {renderStars(item.rating)}</span>}
                            description={
                              <>
                                <div>{item.comment}</div>
                                <div style={{ color: '#999', fontSize: '12px' }}>
                                  {item.serviceName} • {item.date}
                                </div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Dịch vụ phổ biến nhất">
                    <List
                      dataSource={topServices}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: index < 3 ? '#1890ff' : '#d9d9d9' }}>{index + 1}</Avatar>}
                            title={item.serviceName}
                            description={`Số lượt đặt: ${item.count} • Doanh thu: ${item.revenue.toLocaleString()} VND`}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="Nhân viên có lịch hẹn nhiều nhất">
                    <List
                      dataSource={topStaff}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: index < 3 ? '#52c41a' : '#d9d9d9' }}>{index + 1}</Avatar>}
                            title={item.staffName}
                            description={
                              <>
                                <div>Số lịch hẹn: {item.appointmentCount}</div>
                                <div>Đánh giá trung bình: {renderStars(item.averageRating)}</div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Lịch hẹn" key="appointments">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Biểu đồ lịch hẹn">
                    <Line {...appointmentConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Chi tiết lịch hẹn">
                    <Table 
                      dataSource={appointmentStats} 
                      columns={[
                        { title: 'Ngày', dataIndex: 'date', key: 'date' },
                        { title: 'Số lượng lịch hẹn', dataIndex: 'count', key: 'count' },
                        { title: 'Tỷ lệ hoàn thành', dataIndex: 'completionRate', key: 'completionRate', render: (text) => `${text}%` },
                      ]} 
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Doanh thu" key="revenue">
              <Row gutter={16}>
                <Col span={24}>
                  <Card title="Biểu đồ doanh thu">
                    <Line {...revenueConfig} />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Dịch vụ" key="services">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Phân bổ dịch vụ">
                    <Pie {...serviceConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Chi tiết dịch vụ">
                    <Table 
                      dataSource={serviceStats} 
                      columns={[
                        { title: 'Tên dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
                        { title: 'Số lượt sử dụng', dataIndex: 'count', key: 'count' },
                        { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (text) => `${text.toLocaleString()} VND` },
                      ]} 
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Đánh giá" key="reviews">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Biểu đồ đánh giá">
                    <Line {...reviewConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Chi tiết đánh giá">
                    <Table 
                      dataSource={reviewStats} 
                      columns={[
                        { title: 'Ngày', dataIndex: 'date', key: 'date' },
                        { title: 'Điểm trung bình', dataIndex: 'averageRating', key: 'averageRating', render: (value) => renderStars(value) },
                        { title: 'Số lượng đánh giá', dataIndex: 'count', key: 'count' },
                      ]} 
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Nhân viên" key="staff">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Hiệu suất nhân viên">
                    <Column {...staffConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Chi tiết nhân viên">
                    <Table 
                      dataSource={staffStats} 
                      columns={[
                        { title: 'Tên nhân viên', dataIndex: 'staffName', key: 'staffName' },
                        { title: 'Số lịch hẹn', dataIndex: 'appointmentCount', key: 'appointmentCount' },
                        { title: 'Đánh giá trung bình', dataIndex: 'averageRating', key: 'averageRating', render: (value) => renderStars(value) },
                      ]} 
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>
    </div>
  );
};

export default BaoCao;