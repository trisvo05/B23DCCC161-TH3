import { useState, useCallback } from 'react';
import { 
  getReviews, 
  saveReviews, 
  createReview as createReviewUtil, 
  addReplyToReview, 
  updateReview as updateReviewUtil,
  deleteReview as deleteReviewUtil,
  filterReviews as filterReviewsUtil,
  calculateReviewStats,
  Review,
  Reply,
  ReviewFilters
} from '@/utils/reviewUtils';
import { message } from 'antd';

export default () => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [activeFilters, setActiveFilters] = useState<ReviewFilters>({});
  const [stats, setStats] = useState({
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totalReviews: 0,
    pendingReplies: 0
  });

  // Tải danh sách đánh giá
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reviewsData = getReviews();
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
      setStats(calculateReviewStats(reviewsData));
      return true;
    } catch (error) {
      console.error('Error loading reviews:', error);
      message.error('Không thể tải dữ liệu đánh giá');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo đánh giá mới
  const createReview = useCallback(async (reviewData: Omit<Review, 'id' | 'createdAt' | 'replies'>) => {
    setLoading(true);
    try {
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newReview = createReviewUtil(reviewData);
      
      setReviews(prev => {
        const updated = [...prev, newReview];
        setFilteredReviews(filterReviewsUtil(updated, activeFilters));
        setStats(calculateReviewStats(updated));
        return updated;
      });
      
      return true;
    } catch (error) {
      console.error('Error creating review:', error);
      message.error('Không thể tạo đánh giá mới');
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  // Thêm phản hồi cho đánh giá
  const addReply = useCallback(async (reviewId: string, content: string) => {
    setLoading(true);
    try {
      // Tạo người dùng ngẫu nhiên cho trường hợp không đăng nhập
      const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const replyData = {
        userId: guestId,
        userRole: 'guest', // Có thể thay đổi thành 'admin' hoặc 'employee' nếu muốn
        content
      };
      
      const newReply = addReplyToReview(reviewId, replyData);
      
      if (newReply) {
        setReviews(prev => {
          const updated = prev.map(review => 
            review.id === reviewId 
              ? { 
                  ...review, 
                  replies: [...(review.replies || []), newReply] 
                }
              : review
          );
          
          setFilteredReviews(filterReviewsUtil(updated, activeFilters));
          setStats(calculateReviewStats(updated));
          return updated;
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding reply:', error);
      message.error('Không thể thêm phản hồi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  // Cập nhật đánh giá
  const updateReview = useCallback(async (reviewId: string, updatedData: Partial<Review>) => {
    setLoading(true);
    try {
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedReview = updateReviewUtil(reviewId, updatedData);
      
      if (updatedReview) {
        setReviews(prev => {
          const updated = prev.map(review => 
            review.id === reviewId ? updatedReview : review
          );
          
          setFilteredReviews(filterReviewsUtil(updated, activeFilters));
          setStats(calculateReviewStats(updated));
          return updated;
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating review:', error);
      message.error('Không thể cập nhật đánh giá');
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  // Xóa đánh giá
  const deleteReview = useCallback(async (reviewId: string) => {
    setLoading(true);
    try {
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = deleteReviewUtil(reviewId);
      
      if (success) {
        setReviews(prev => {
          const updated = prev.filter(review => review.id !== reviewId);
          setFilteredReviews(filterReviewsUtil(updated, activeFilters));
          setStats(calculateReviewStats(updated));
          return updated;
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting review:', error);
      message.error('Không thể xóa đánh giá');
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  // Lọc đánh giá
  const filterReviews = useCallback((filters: ReviewFilters) => {
    setActiveFilters(filters);
    setFilteredReviews(filterReviewsUtil(reviews, filters));
  }, [reviews]);

  // Reset bộ lọc
  const resetFilters = useCallback(() => {
    setActiveFilters({});
    setFilteredReviews(reviews);
  }, [reviews]);

  // Lấy chi tiết đánh giá theo ID
  const getReviewById = useCallback((reviewId: string) => {
    return reviews.find(review => review.id === reviewId);
  }, [reviews]);

  return {
    loading,
    reviews,
    filteredReviews,
    stats,
    activeFilters,
    loadReviews,
    createReview,
    addReply,
    updateReview,
    deleteReview,
    filterReviews,
    resetFilters,
    getReviewById
  };
};

export type { Review, Reply, ReviewFilters } from '@/utils/reviewUtils';