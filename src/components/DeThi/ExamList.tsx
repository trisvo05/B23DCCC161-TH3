import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils/subject';
import ExamDetail from './ExamDetail';

const ExamList: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Load danh sách đề thi từ localStorage
  useEffect(() => {
    const storedExams = getFromLocalStorage('exams') || [];
    setExams(storedExams);
  }, []);

  // Xem chi tiết đề thi
  const showExamDetail = (exam: any) => {
    setSelectedExam(exam);
    setDetailModalVisible(true);
  };

  // Xóa đề thi
  const handleDelete = (examId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đề thi này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        const updatedExams = exams.filter(exam => exam.id !== examId);
        saveToLocalStorage('exams', updatedExams);
        setExams(updatedExams);
        message.success('Đã xóa đề thi thành công');
      }
    });
  };

  const columns = [
    {
      title: 'Tên đề thi',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (code: string) => {
        const subjects = getFromLocalStorage('subjects') || [];
        const subject = subjects.find((s: any) => s.code === code);
        return subject ? subject.name : code;
      }
    },
    {
      title: 'Số câu hỏi',
      key: 'questionCount',
      render: (text: string, record: any) => record.questions.length
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showExamDetail(record)}
            style={{ border: 'none' }} // Loại bỏ viền
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            style={{ border: 'none' }} // Loại bỏ viền
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table 
        dataSource={exams} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      
      {selectedExam && (
        <ExamDetail
          visible={detailModalVisible}
          exam={selectedExam}
          onClose={() => setDetailModalVisible(false)}
        />
      )}
    </div>
  );
};

export default ExamList;