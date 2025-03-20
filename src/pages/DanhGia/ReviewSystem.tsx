import React, { useState } from "react";
import { Card, Rate, Input, Button, List, Modal } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const { TextArea } = Input;

// Mock dữ liệu nhân viên và đánh giá
const initialEmployees = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    rating: 4.5,
    reviews: [
      { id: 1, user: "Khách 1", rating: 5, comment: "Rất hài lòng!", reply: "Cảm ơn bạn!" },
      { id: 2, user: "Khách 2", rating: 4, comment: "Dịch vụ tốt", reply: "Cảm ơn phản hồi!" },
    ],
  },
  {
    id: 2,
    name: "Trần Thị B",
    rating: 4.0,
    reviews: [],
  },
];

const ReviewSystem = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reply, setReply] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleReview = () => {
    if (!selectedEmployee || rating === 0 || comment.trim() === "") return;
    const updatedEmployees = employees.map((emp) => {
      if (emp.id === selectedEmployee.id) {
        const newReviews = [...emp.reviews, { id: Date.now(), user: "Khách", rating, comment, reply: "" }];
        const avgRating = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
        return { ...emp, reviews: newReviews, rating: avgRating };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    setRating(0);
    setComment("");
    setIsReviewModalOpen(false);
  };

  const handleReply = () => {
    if (!selectedEmployee || !selectedReview || reply.trim() === "") return;
    const updatedEmployees = employees.map((emp) => {
      if (emp.id === selectedEmployee.id) {
        const updatedReviews = emp.reviews.map((r) => (r.id === selectedReview.id ? { ...r, reply } : r));
        return { ...emp, reviews: updatedReviews };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    setReply("");
    setIsReplyModalOpen(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Đánh giá dịch vụ & nhân viên</h2>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={employees}
        renderItem={(employee) => (
          <List.Item>
            <Card title={employee.name} extra={<Rate disabled allowHalf value={employee.rating} />}>
              <Button onClick={() => { setSelectedEmployee(employee); setIsReviewModalOpen(true); }}>Đánh giá</Button>
              <List
                itemLayout="vertical"
                dataSource={employee.reviews}
                renderItem={(review) => (
                  <List.Item>
                    <Rate disabled value={review.rating} />
                    <p><strong>{review.user}:</strong> {review.comment}</p>
                    {review.reply ? <p><MessageOutlined /> <em>{review.reply}</em></p> : (
                      <Button type="link" onClick={() => { setSelectedEmployee(employee); setSelectedReview(review); setIsReplyModalOpen(true); }}>Trả lời</Button>
                    )}
                  </List.Item>
                )}
              />
            </Card>
          </List.Item>
        )}
      />
      {/* Modal đánh giá */}
      <Modal
        title="Đánh giá nhân viên"
        open={isReviewModalOpen}
        onOk={handleReview}
        onCancel={() => setIsReviewModalOpen(false)}
      >
        <Rate allowHalf value={rating} onChange={setRating} />
        <TextArea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhận xét..." />
      </Modal>
      {/* Modal trả lời */}
      <Modal
        title="Trả lời đánh giá"
        open={isReplyModalOpen}
        onOk={handleReply}
        onCancel={() => setIsReplyModalOpen(false)}
      >
        <TextArea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Phản hồi..." />
      </Modal>
    </div>
  );
};

export default ReviewSystem;
