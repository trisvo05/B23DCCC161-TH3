import moment from 'moment';

// Interfaces
export interface AppointmentData {
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

export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

export interface Employee {
  id: number;
  name: string;
  services: number[];
  workingHours?: {
    start: string;
    end: string;
  };
  dailyLimit: number;
}

export interface Review {
  id: string;
  appointmentId: number;
  serviceId: number;
  employeeId: number;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  reviewId: string;
  userId: string;
  userRole: string;
  content: string;
  createdAt: string;
}

// Helper function to get data from localStorage
const getLocalData = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return [];
  }
};

// Get appointment statistics
// Get appointment statistics
export const getAppointmentStatistics = (date: moment.Moment, range: string = 'month') => {
  const appointments = getLocalData<AppointmentData>('appointments');
  let startDate: moment.Moment;
  let endDate: moment.Moment;
  let groupByFormat: string;
  let displayFormat: string;
  
  // Xác định khoảng thời gian dựa trên range
  if (range === 'month') {
    // Lọc theo tháng, nhóm theo ngày
    startDate = moment(date).startOf('month');
    endDate = moment(date).endOf('month');
    groupByFormat = 'YYYY-MM-DD'; // Nhóm theo ngày
    displayFormat = 'DD/MM'; // Hiển thị ngày/tháng
  } else if (range === 'quarter') {
    // Lọc theo quý, nhóm theo tháng
    startDate = moment(date).startOf('quarter');
    endDate = moment(date).endOf('quarter');
    groupByFormat = 'YYYY-MM'; // Nhóm theo tháng
    displayFormat = 'MM/YYYY'; // Hiển thị tháng/năm
  } else if (range === 'year') {
    // Lọc theo năm, nhóm theo tháng
    startDate = moment(date).startOf('year');
    endDate = moment(date).endOf('year');
    groupByFormat = 'YYYY-MM'; // Nhóm theo tháng
    displayFormat = 'MM/YYYY'; // Hiển thị tháng/năm
  } else {
    // Mặc định là lọc theo tháng
    startDate = moment(date).startOf('month');
    endDate = moment(date).endOf('month');
    groupByFormat = 'YYYY-MM-DD';
    displayFormat = 'DD/MM';
  }

  // Kiểm tra xem có dữ liệu không và hiển thị log để debug
  console.log('Appointments from localStorage:', appointments.length);
  console.log('Date range:', startDate.format('YYYY-MM-DD'), 'to', endDate.format('YYYY-MM-DD'));
  
  // Lọc các lịch hẹn trong khoảng thời gian đã chọn
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = moment(appointment.appointmentDate);
    const isInRange = appointmentDate.isBetween(startDate, endDate, 'day', '[]');
    return isInRange;
  });
  
  // Kiểm tra số lượng lịch hẹn sau khi lọc
  console.log('Filtered appointments:', filteredAppointments.length);
  
  // Nhóm lịch hẹn theo khoảng thời gian
  const stats = filteredAppointments.reduce((acc, appointment) => {
    const groupKey = moment(appointment.appointmentDate).format(groupByFormat);
    
    if (!acc[groupKey]) {
      acc[groupKey] = {
        total: 0,
        completed: 0
      };
    }
    
    acc[groupKey].total += 1;
    if (appointment.status === 'completed') {
      acc[groupKey].completed += 1;
    }
    
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);
  
  // Tạo danh sách các khoảng thời gian để đảm bảo đầy đủ các ngày/tháng, kể cả không có dữ liệu
  const timePoints: string[] = [];
  let current = startDate.clone();
  
  if (range === 'month') {
    // Tạo danh sách các ngày trong tháng
    while (current.isSameOrBefore(endDate, 'day')) {
      timePoints.push(current.format(groupByFormat));
      current.add(1, 'day');
    }
  } else {
    // Tạo danh sách các tháng trong quý hoặc năm
    while (current.isSameOrBefore(endDate, 'month')) {
      timePoints.push(current.format(groupByFormat));
      current.add(1, 'month');
    }
  }
  
  // Chuyển đổi thành mảng dữ liệu cho biểu đồ, đảm bảo tất cả khoảng thời gian đều có
  const result = timePoints.map(timePoint => {
    const data = stats[timePoint] || { total: 0, completed: 0 };
    
    // Định dạng hiển thị ngày tháng
    let displayDate;
    try {
      displayDate = range === 'month'
        ? moment(timePoint).format(displayFormat)
        : moment(timePoint + '-01').format(displayFormat); // Thêm ngày 01 cho định dạng tháng
    } catch (error) {
      console.error('Error formatting date:', timePoint, error);
      displayDate = timePoint; // Fallback to original format
    }
    
    return {
      date: displayDate,
      rawDate: timePoint, // Lưu giá trị gốc để sắp xếp
      count: data.total,
      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    };
  });
  
  // Sắp xếp kết quả theo thời gian tăng dần
  const sortedResult = result.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  
  // Kiểm tra kết quả cuối cùng
  console.log('Final result:', sortedResult.length, 'data points');
  
  // Loại bỏ trường rawDate trong kết quả cuối cùng
  return { 
    data: sortedResult.map(({ rawDate, ...rest }) => rest) 
  };
};

// Get revenue statistics
export const getRevenueStatistics = (date: moment.Moment) => {
  const appointments = getLocalData<AppointmentData>('appointments');
  const services = getLocalData<Service>('services');
  const selectedMonth = date.format('YYYY-MM');
  
  // Only count completed appointments
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  
  // Group by date and calculate revenue
  const stats = completedAppointments.reduce((acc, appointment) => {
    const appointmentMonth = moment(appointment.appointmentDate).format('YYYY-MM');
    
    // Filter by selected month
    if (appointmentMonth !== selectedMonth) return acc;
    
    const appointmentDate = appointment.appointmentDate;
    const service = services.find(s => s.id === appointment.serviceId);
    const price = service ? service.price : 0;
    
    if (!acc[appointmentDate]) {
      acc[appointmentDate] = 0;
    }
    
    acc[appointmentDate] += price;
    
    return acc;
  }, {} as Record<string, number>);
  
  // Convert to array format for charts
  const result = Object.entries(stats).map(([date, revenue]) => ({
    date,
    revenue
  }));
  
  return { data: result };
};

// Get service popularity statistics
export const getServicePopularityStatistics = (date: moment.Moment) => {
  const appointments = getLocalData<AppointmentData>('appointments');
  const services = getLocalData<Service>('services');
  const selectedMonth = date.format('YYYY-MM');
  
  // Filter appointments by month
  const monthAppointments = appointments.filter(a => 
    moment(a.appointmentDate).format('YYYY-MM') === selectedMonth
  );
  
  // Group by service and count
  const stats = monthAppointments.reduce((acc, appointment) => {
    const serviceId = appointment.serviceId;
    const service = services.find(s => s.id === serviceId);
    
    if (!service) return acc;
    
    if (!acc[serviceId]) {
      acc[serviceId] = {
        serviceName: service.name,
        count: 0,
        revenue: 0
      };
    }
    
    acc[serviceId].count += 1;
    
    // Only add revenue for completed appointments
    if (appointment.status === 'completed') {
      acc[serviceId].revenue += service.price;
    }
    
    return acc;
  }, {} as Record<number, { serviceName: string; count: number; revenue: number }>);
  
  // Convert to array
  const result = Object.values(stats);
  
  return { data: result };
};

// Get customer review statistics
export const getCustomerReviewStatistics = (date: moment.Moment) => {
  const reviews = getLocalData<Review>('app_service_reviews');
  const selectedMonth = date.format('YYYY-MM');
  
  // Group reviews by date
  const stats = reviews.reduce((acc, review) => {
    const reviewMonth = moment(review.createdAt).format('YYYY-MM');
    
    // Filter by selected month
    if (reviewMonth !== selectedMonth) return acc;
    
    const reviewDate = moment(review.createdAt).format('YYYY-MM-DD');
    
    if (!acc[reviewDate]) {
      acc[reviewDate] = {
        totalRating: 0,
        count: 0
      };
    }
    
    acc[reviewDate].totalRating += review.rating;
    acc[reviewDate].count += 1;
    
    return acc;
  }, {} as Record<string, { totalRating: number; count: number }>);
  
  // Convert to array format for charts
  const result = Object.entries(stats).map(([date, data]) => ({
    date,
    averageRating: data.count > 0 ? +(data.totalRating / data.count).toFixed(1) : 0,
    count: data.count
  }));
  
  return { data: result };
};

// Get staff performance statistics
export const getStaffPerformanceStatistics = (date: moment.Moment) => {
  const appointments = getLocalData<AppointmentData>('appointments');
  const employees = getLocalData<Employee>('employees');
  const reviews = getLocalData<Review>('app_service_reviews');
  const selectedMonth = date.format('YYYY-MM');
  
  // Filter appointments by month
  const monthAppointments = appointments.filter(a => 
    moment(a.appointmentDate).format('YYYY-MM') === selectedMonth && a.employeeId
  );
  
  // Group by employee
  const stats = monthAppointments.reduce((acc, appointment) => {
    const employeeId = appointment.employeeId;
    if (!employeeId) return acc;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return acc;
    
    if (!acc[employeeId]) {
      acc[employeeId] = {
        staffName: employee.name,
        appointmentCount: 0,
        totalRating: 0,
        reviewCount: 0
      };
    }
    
    acc[employeeId].appointmentCount += 1;
    
    return acc;
  }, {} as Record<number, { staffName: string; appointmentCount: number; totalRating: number; reviewCount: number }>);
  
  // Add review data
  reviews.forEach(review => {
    const reviewMonth = moment(review.createdAt).format('YYYY-MM');
    if (reviewMonth !== selectedMonth) return;
    
    const employeeId = review.employeeId;
    if (stats[employeeId]) {
      stats[employeeId].totalRating += review.rating;
      stats[employeeId].reviewCount += 1;
    }
  });
  
  // Calculate average ratings and convert to array
  const result = Object.values(stats).map(stat => ({
    ...stat,
    averageRating: stat.reviewCount > 0 ? +(stat.totalRating / stat.reviewCount).toFixed(1) : 0
  }));
  
  return { data: result };
};

// Get recent appointments
export const getRecentAppointments = (limit: number = 5) => {
  const appointments = getLocalData<AppointmentData>('appointments');
  const services = getLocalData<Service>('services');
  const employees = getLocalData<Employee>('employees');
  
  // Sort by date (newest first) and take 'limit' number
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(appointment => {
      const service = services.find(s => s.id === appointment.serviceId);
      const employee = appointment.employeeId ? 
        employees.find(e => e.id === appointment.employeeId) : null;
      
      return {
        id: appointment.id,
        customerName: appointment.customerName,
        serviceName: service ? service.name : 'Dịch vụ không xác định',
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
        status: appointment.status,
        staffName: employee ? employee.name : 'Chưa phân công'
      };
    });
  
  return { data: recentAppointments };
};

// Get recent reviews
export const getRecentReviews = (limit: number = 5) => {
  const reviews = getLocalData<Review>('app_service_reviews');
  const services = getLocalData<Service>('services');
  
  // Sort by date (newest first) and take 'limit' number
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(review => {
      const service = services.find(s => s.id === review.serviceId);
      
      return {
        id: review.id,
        customerName: review.customerId.startsWith('guest_') ? 
          'Khách hàng' : review.customerId,
        serviceName: service ? service.name : 'Dịch vụ không xác định',
        rating: review.rating,
        comment: review.comment,
        date: moment(review.createdAt).format('DD/MM/YYYY')
      };
    });
  
  return { data: recentReviews };
};

// Get top services
export const getTopServices = (limit: number = 5) => {
  const appointments = getLocalData<AppointmentData>('appointments');
  const services = getLocalData<Service>('services');
  
  // Group appointments by service
  const serviceStats = services.map(service => {
    const serviceAppointments = appointments.filter(a => a.serviceId === service.id);
    const completedAppointments = serviceAppointments.filter(a => a.status === 'completed');
    
    return {
      serviceName: service.name,
      count: serviceAppointments.length,
      revenue: completedAppointments.reduce((sum, a) => sum + service.price, 0)
    };
  });
  
  // Sort by count (most popular first) and take 'limit' number
  const topServices = serviceStats
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  
  return { data: topServices };
};

// Get top staff by appointments
export const getTopStaffByAppointments = (limit: number = 5) => {
  const appointments = getLocalData<AppointmentData>('appointments');
  const employees = getLocalData<Employee>('employees');
  const reviews = getLocalData<Review>('app_service_reviews');
  
  // Calculate stats for each employee
  const staffStats = employees.map(employee => {
    const employeeAppointments = appointments.filter(a => a.employeeId === employee.id);
    const employeeReviews = reviews.filter(r => r.employeeId === employee.id);
    const totalRating = employeeReviews.reduce((sum, r) => sum + r.rating, 0);
    
    return {
      staffName: employee.name,
      appointmentCount: employeeAppointments.length,
      averageRating: employeeReviews.length > 0 ? 
        +(totalRating / employeeReviews.length).toFixed(1) : 0
    };
  });
  
  // Sort by appointment count (highest first) and take 'limit' number
  const topStaff = staffStats
    .sort((a, b) => b.appointmentCount - a.appointmentCount)
    .slice(0, limit);
  
  return { data: topStaff };
};

// Get admin dashboard data
export const getAdminDashboardData = () => {
  const appointments = getLocalData<AppointmentData>('appointments');
  const reviews = getLocalData<Review>('app_service_reviews');
  const services = getLocalData<Service>('services');
  
  // Current date for filtering today's appointments
  const today = moment().format('YYYY-MM-DD');
  
  // Count today's appointments
  const appointmentsToday = appointments.filter(a => a.appointmentDate === today).length;
  
  // Count pending appointments
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  
  // Calculate total revenue from completed appointments
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => {
      const service = services.find(s => s.id === a.serviceId);
      return sum + (service ? service.price : 0);
    }, 0);
  
  // Count unique customers
  const uniqueCustomers = new Set(appointments.map(a => a.phoneNumber)).size;
  
  // Count total reviews
  const reviewsCount = reviews.length;
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? +(totalRating / reviews.length).toFixed(1) : 0;
  
  return {
    appointmentsToday,
    pendingAppointments,
    totalRevenue,
    customerCount: uniqueCustomers,
    reviewsCount,
    averageRating
  };
};