import { message } from 'antd';
import { v4 as uuidv4 } from 'uuid';

export interface Review {
  id: string;
  appointmentId: string;
  serviceId: string;
  customerId: string;
  employeeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  reviewId: string;
  userId: string;
  userRole: 'admin' | 'employee';
  content: string;
  createdAt: string;
}

export interface ReviewFilters {
  rating?: number | null;
  serviceId?: string | null;
  employeeId?: string | null;
  hasReplies?: boolean | null;
  dateRange?: [string, string] | null;
}

// Lấy danh sách đánh giá từ localStorage
export const getReviews = (): Review[] => {
  try {
    const reviews = localStorage.getItem('app_service_reviews');
    return reviews ? JSON.parse(reviews) : [];
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu đánh giá:', error);
    return [];
  }
};

// Lưu danh sách đánh giá vào localStorage
export const saveReviews = (reviews: Review[]): boolean => {
  try {
    localStorage.setItem('app_service_reviews', JSON.stringify(reviews));
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu đánh giá:', error);
    message.error('Đã xảy ra lỗi khi lưu đánh giá');
    return false;
  }
};

// Tạo đánh giá mới
export const createReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'replies'>): Review => {
  const newReview: Review = {
    ...reviewData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    replies: []
  };
  
  const reviews = getReviews();
  reviews.push(newReview);
  saveReviews(reviews);
  
  return newReview;
};

// Thêm phản hồi cho đánh giá
export const addReplyToReview = (
  reviewId: string, 
  replyData: { userId: string; userRole: 'admin' | 'employee'; content: string }
): Reply | null => {
  const reviews = getReviews();
  const reviewIndex = reviews.findIndex(review => review.id === reviewId);
  
  if (reviewIndex === -1) {
    message.error('Không tìm thấy đánh giá');
    return null;
  }
  
  const newReply: Reply = {
    id: uuidv4(),
    reviewId,
    ...replyData,
    createdAt: new Date().toISOString()
  };
  
  if (!reviews[reviewIndex].replies) {
    reviews[reviewIndex].replies = [];
  }
  
  reviews[reviewIndex].replies!.push(newReply);
  saveReviews(reviews);
  
  return newReply;
};

// Cập nhật đánh giá
export const updateReview = (reviewId: string, updatedData: Partial<Review>): Review | null => {
  const reviews = getReviews();
  const reviewIndex = reviews.findIndex(review => review.id === reviewId);
  
  if (reviewIndex === -1) {
    message.error('Không tìm thấy đánh giá');
    return null;
  }
  
  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    ...updatedData
  };
  
  saveReviews(reviews);
  return reviews[reviewIndex];
};

// Xóa đánh giá
export const deleteReview = (reviewId: string): boolean => {
  const reviews = getReviews();
  const updatedReviews = reviews.filter(review => review.id !== reviewId);
  
  if (updatedReviews.length === reviews.length) {
    message.error('Không tìm thấy đánh giá');
    return false;
  }
  
  return saveReviews(updatedReviews);
};

// Lọc đánh giá theo các tiêu chí
export const filterReviews = (reviews: Review[], filters: ReviewFilters): Review[] => {
  let filteredReviews = [...reviews];
  
  if (filters.rating !== undefined && filters.rating !== null) {
    filteredReviews = filteredReviews.filter(review => review.rating === filters.rating);
  }
  
  if (filters.serviceId) {
    filteredReviews = filteredReviews.filter(review => review.serviceId === filters.serviceId);
  }
  
  if (filters.employeeId) {
    filteredReviews = filteredReviews.filter(review => review.employeeId === filters.employeeId);
  }
  
  if (filters.hasReplies !== undefined && filters.hasReplies !== null) {
    if (filters.hasReplies) {
      filteredReviews = filteredReviews.filter(review => 
        review.replies && review.replies.length > 0
      );
    } else {
      filteredReviews = filteredReviews.filter(review => 
        !review.replies || review.replies.length === 0
      );
    }
  }
  
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDate, endDate] = filters.dateRange;
    filteredReviews = filteredReviews.filter(review => {
      const reviewDate = new Date(review.createdAt);
      return reviewDate >= new Date(startDate) && reviewDate <= new Date(endDate);
    });
  }
  
  return filteredReviews;
};

// Tính toán thống kê đánh giá
export const calculateReviewStats = (reviews: Review[]) => {
  if (!reviews.length) {
    return {
      averageRating: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      totalReviews: 0,
      pendingReplies: 0
    };
  }
  
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;
  let pendingReplies = 0;
  
  reviews.forEach(review => {
    totalRating += review.rating;
    ratingCounts[review.rating as 1|2|3|4|5]++;
    
    if (!review.replies || review.replies.length === 0) {
      pendingReplies++;
    }
  });
  
  return {
    averageRating: parseFloat((totalRating / reviews.length).toFixed(1)),
    ratingCounts,
    totalReviews: reviews.length,
    pendingReplies
  };
};

// Kiểm tra xem người dùng đã đánh giá lịch hẹn này chưa
export const hasUserReviewedAppointment = (customerId: string, appointmentId: string): boolean => {
  const reviews = getReviews();
  return reviews.some(review => 
    review.customerId === customerId && review.appointmentId === appointmentId
  );
};

// Lấy thông tin đánh giá từ ID lịch hẹn
export const getReviewByAppointmentId = (appointmentId: string): Review | undefined => {
  const reviews = getReviews();
  return reviews.find(review => review.appointmentId === appointmentId);
};