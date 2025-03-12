import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Select, InputNumber, message, Space, Row, Col } from 'antd';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils/subject';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

interface ExamStructureProps {
  onExamCreated: () => void;
}

const ExamStructure: React.FC<ExamStructureProps> = ({ onExamCreated }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form] = Form.useForm();

  // Load danh sách môn học từ localStorage
  useEffect(() => {
    const storedSubjects = getFromLocalStorage('subjects') || [];
    setSubjects(storedSubjects);
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreateExam = () => {
    form.validateFields()
      .then(values => {
        const { subjectCode, easyQuestions, mediumQuestions, hardQuestions, veryHardQuestions, examName } = values;
        
        // Lấy danh sách câu hỏi từ QuestionBank
        const allQuestions = getFromLocalStorage('questions') || [];
        
        // Lọc câu hỏi theo môn học
        const subjectQuestions = allQuestions.filter((q: any) => q.subjectCode === subjectCode);
        
        // Phân loại câu hỏi theo độ khó
        const easyQs = subjectQuestions.filter((q: any) => q.difficulty === 'Dễ');
        const mediumQs = subjectQuestions.filter((q: any) => q.difficulty === 'Trung bình');
        const hardQs = subjectQuestions.filter((q: any) => q.difficulty === 'Khó');
        const veryHardQs = subjectQuestions.filter((q: any) => q.difficulty === 'Siêu khó');
        
        // Kiểm tra số lượng câu hỏi
        if (easyQs.length < easyQuestions) {
          message.error(`Không đủ câu hỏi mức Dễ. Hiện có: ${easyQs.length}, Cần: ${easyQuestions}`);
          return;
        }
        if (mediumQs.length < mediumQuestions) {
          message.error(`Không đủ câu hỏi mức Trung bình. Hiện có: ${mediumQs.length}, Cần: ${mediumQuestions}`);
          return;
        }
        if (hardQs.length < hardQuestions) {
          message.error(`Không đủ câu hỏi mức Khó. Hiện có: ${hardQs.length}, Cần: ${hardQuestions}`);
          return;
        }
        if (veryHardQs.length < veryHardQuestions) {
          message.error(`Không đủ câu hỏi mức Siêu khó. Hiện có: ${veryHardQs.length}, Cần: ${veryHardQuestions}`);
          return;
        }
        
        // Chọn ngẫu nhiên các câu hỏi
        const selectedEasyQs = shuffleAndSelect(easyQs, easyQuestions);
        const selectedMediumQs = shuffleAndSelect(mediumQs, mediumQuestions);
        const selectedHardQs = shuffleAndSelect(hardQs, hardQuestions);
        const selectedVeryHardQs = shuffleAndSelect(veryHardQs, veryHardQuestions);
        
        // Tạo đề thi mới
        const newExam = {
          id: `exam_${Date.now()}`,
          name: examName || `Đề thi ${subjectCode} - ${new Date().toLocaleDateString()}`,
          subjectCode,
          questions: [...selectedEasyQs, ...selectedMediumQs, ...selectedHardQs, ...selectedVeryHardQs],
          createdAt: new Date().toISOString(),
          structure: {
            easy: easyQuestions,
            medium: mediumQuestions,
            hard: hardQuestions,
            veryHard: veryHardQuestions
          }
        };
        
        // Lưu đề thi vào localStorage
        const exams = getFromLocalStorage('exams') || [];
        saveToLocalStorage('exams', [...exams, newExam]);
        
        message.success('Tạo đề thi thành công!');
        handleCancel();
        onExamCreated();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Hàm trộn và chọn ngẫu nhiên các câu hỏi
  const shuffleAndSelect = (array: any[], count: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return (
    <div>
      <Card title="Tạo đề thi mới" bordered={false}>
        <p>Nhấn nút bên dưới để tạo cấu trúc đề thi mới</p>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
        >
          Tạo đề thi
        </Button>
      </Card>

      <Modal
        title="Tạo đề thi mới"
        visible={isModalVisible}
        onOk={handleCreateExam}
        onCancel={handleCancel}
        okText="Tạo đề thi"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="examName"
            label="Tên đề thi"
            rules={[{ required: true, message: 'Vui lòng nhập tên đề thi!' }]}
          >
            <input className="ant-input" placeholder="Nhập tên đề thi" />
          </Form.Item>

          <Form.Item
            name="subjectCode"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
          >
            <Select placeholder="Chọn môn học">
              {subjects.map(subject => (
                <Option key={subject.code} value={subject.code}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <p>Số lượng câu hỏi theo độ khó:</p>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="easyQuestions"
                label="Dễ"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="mediumQuestions"
                label="Trung bình"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="hardQuestions"
                label="Khó"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="veryHardQuestions"
                label="Siêu khó"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamStructure;