import React from 'react';
import { Modal, Typography, List, Tag, Divider } from 'antd';
import { getFromLocalStorage } from '../../utils/subject';

const { Title, Text } = Typography;

interface ExamDetailProps {
  visible: boolean;
  exam: any;
  onClose: () => void;
}

const ExamDetail: React.FC<ExamDetailProps> = ({ visible, exam, onClose }) => {
  if (!exam) return null;

  const getSubjectName = (code: string) => {
    const subjects = getFromLocalStorage('subjects') || [];
    const subject = subjects.find((s: any) => s.code === code);
    return subject ? subject.name : code;
  };

  // Hiển thị màu theo độ khó
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ': return 'success';
      case 'Trung bình': return 'processing';
      case 'Khó': return 'warning';
      case 'Siêu khó': return 'error';
      default: return 'default';
    }
  };

  return (
    <Modal
      title={`Chi tiết đề thi: ${exam.name}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong>Môn học:</Text> {getSubjectName(exam.subjectCode)}
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Text strong>Ngày tạo:</Text> {new Date(exam.createdAt).toLocaleDateString()}
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Text strong>Cấu trúc đề thi:</Text>
        <div style={{ marginLeft: 20, marginTop: 8 }}>
          {exam.structure.easy > 0 && <div>Dễ: {exam.structure.easy} câu</div>}
          {exam.structure.medium > 0 && <div>Trung bình: {exam.structure.medium} câu</div>}
          {exam.structure.hard > 0 && <div>Khó: {exam.structure.hard} câu</div>}
          {exam.structure.veryHard > 0 && <div>Siêu khó: {exam.structure.veryHard} câu</div>}
        </div>
      </div>
      
      <Divider>Danh sách câu hỏi</Divider>
      
      <List
        itemLayout="vertical"
        dataSource={exam.questions}
        renderItem={(question: any, index: number) => (
          <List.Item
            key={question.id}
            extra={<Tag color={getDifficultyColor(question.difficulty)}>{question.difficulty}</Tag>}
          >
            <div style={{ marginBottom: 8 }}>
              <Text strong>Câu {index + 1}:</Text>
            </div>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              {question.content}
            </div>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default ExamDetail;