import { useState, useEffect } from 'react';
import { Input, Select, Button, Table, Space, message, Typography, Modal, Form, Spin, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
    getSubjects,
    getQuestions, 
    addQuestion, 
    editQuestion, 
    deleteQuestion,
    getKnowledgeBlocks,
    getKnowledgeBlocksBySubjectCode
} from '@/services/Question';
import { Subject, Question, KnowledgeBlock, DifficultyLevel } from '@/services/Question/typing';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const difficultyLevels: DifficultyLevel[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

export default function QuestionBank() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [knowledgeBlocks, setKnowledgeBlocks] = useState<KnowledgeBlock[]>([]);
    const [availableKnowledgeBlocks, setAvailableKnowledgeBlocks] = useState<KnowledgeBlock[]>([]);
    
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();

    // State để quản lý modal xem chi tiết
    const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

    // Load dữ liệu khi component được mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const subjectsData = getSubjects();
                setSubjects(subjectsData);
                
                const knowledgeBlocksData = getKnowledgeBlocks();
                setKnowledgeBlocks(knowledgeBlocksData);
                
                const questionsData = getQuestions();
                setQuestions(questionsData);
            } catch (error) {
                message.error('Đã xảy ra lỗi khi tải dữ liệu');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Xử lý khi chọn môn học trong form
    const handleSubjectChange = (subjectCode: string) => {
        form.setFieldsValue({ knowledgeBlockId: undefined });
        const blocks = getKnowledgeBlocksBySubjectCode(subjectCode);
        setAvailableKnowledgeBlocks(blocks);
    };

    // Hàm hiển thị modal xem chi tiết
    const showDetailsModal = (question: Question) => {
        setCurrentQuestion(question);
        setDetailsModalVisible(true);
    };

    // Mở modal thêm/sửa câu hỏi
    const showModal = (question?: Question) => {
        setEditingQuestion(question || null);
        
        if (question) {
            form.setFieldsValue({
                subjectCode: question.subjectCode,
                content: question.content,
                difficulty: question.difficulty,
                knowledgeBlockId: question.knowledgeBlockId
            });
            
            // Cập nhật danh sách khối kiến thức theo môn học đã chọn
            const blocks = getKnowledgeBlocksBySubjectCode(question.subjectCode);
            setAvailableKnowledgeBlocks(blocks);
        } else {
            form.resetFields();
            setAvailableKnowledgeBlocks([]);
        }
        
        setIsModalVisible(true);
    };

    // Xử lý khi submit form
    const handleFormSubmit = () => {
        form.validateFields()
            .then(values => {
                if (editingQuestion) {
                    // Cập nhật câu hỏi
                    const updatedQuestions = editQuestion(editingQuestion.id, {
                        subjectCode: values.subjectCode,
                        content: values.content,
                        difficulty: values.difficulty,
                        knowledgeBlockId: values.knowledgeBlockId
                    });
                    setQuestions(updatedQuestions);
                    message.success('Cập nhật câu hỏi thành công!');
                } else {
                    // Thêm câu hỏi mới
                    const newQuestion = {
                        subjectCode: values.subjectCode,
                        content: values.content,
                        difficulty: values.difficulty,
                        knowledgeBlockId: values.knowledgeBlockId
                    };
                    const updatedQuestions = addQuestion(newQuestion);
                    setQuestions(updatedQuestions);
                    message.success('Thêm câu hỏi thành công!');
                }
                
                setIsModalVisible(false);
                form.resetFields();
                setEditingQuestion(null);
            })
            .catch(info => {
                console.error('Validate Failed:', info);
            });
    };

    // Xóa câu hỏi
    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa câu hỏi này không?',
            okText: 'Có',
            cancelText: 'Không',
            onOk: () => {
                const updatedQuestions = deleteQuestion(id);
                setQuestions(updatedQuestions);
                message.success('Xóa câu hỏi thành công!');
            }
        });
    };

    // Tìm thông tin môn học từ mã
    const getSubjectName = (subjectCode: string) => {
        const subject = subjects.find(s => s.code === subjectCode);
        return subject ? subject.name : 'Không xác định';
    };

    // Tìm thông tin khối kiến thức từ id
    const getKnowledgeBlockName = (knowledgeBlockId: string) => {
        const block = knowledgeBlocks.find(kb => kb.id === knowledgeBlockId);
        return block ? block.name : 'Không xác định';
    };

    // Định nghĩa các cột cho bảng
    const columns = [
        {
            title: 'Môn học',
            key: 'subject',
            width: '25%',
            align: 'center' as const,
            render: (_: unknown, record: Question) => getSubjectName(record.subjectCode)
        },
        {
            title: 'Nội dung',
            key: 'content',
            width: '20%',
            align: 'center' as const,
            render: (_: unknown, record: Question) => (
                <Button 
                    type="link" 
                    onClick={() => showDetailsModal(record)}
                >
                    Xem chi tiết
                </Button>
            )
        },
        {
            title: 'Mức độ',
            dataIndex: 'difficulty',
            key: 'difficulty',
            width: '15%',
            align: 'center' as const
        },
        {
            title: 'Khối kiến thức',
            key: 'knowledgeBlock',
            width: '20%',
            align: 'center' as const,
            render: (_: unknown, record: Question) => getKnowledgeBlockName(record.knowledgeBlockId)
        },
        {
            title: 'Hành động',
            key: 'action',
            width: '20%',
            align: 'center' as const,
            render: (_: unknown, record: Question) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />} 
                        onClick={() => showModal(record)}
                    >
                        Sửa
                    </Button>
                    <Button 
                        type="link" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    if (loading) {
        return <Spin size="large" tip="Đang tải..." />;
    }

    return (
        <div className="container">
            <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
                Quản lý Câu hỏi
            </Title>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                style={{ marginBottom: 16 }}
            >
                Thêm câu hỏi
            </Button>

            {/* Bảng dữ liệu */}
            <Table
                columns={columns}
                dataSource={questions}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            {/* Modal thêm/sửa câu hỏi */}
            <Modal
                title={editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleFormSubmit}
                okText={editingQuestion ? "Cập nhật" : "Thêm mới"}
                cancelText="Hủy"
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="subjectCode"
                        label="Môn học"
                        rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
                    >
                        <Select
                            placeholder="Chọn môn học"
                            onChange={handleSubjectChange}
                            disabled={!!editingQuestion}
                        >
                            {subjects.map(subject => (
                                <Option key={subject.code} value={subject.code}>
                                    {subject.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi!' }]}
                    >
                        <TextArea rows={4} placeholder="Nhập nội dung câu hỏi" />
                    </Form.Item>

                    <Form.Item
                        name="difficulty"
                        label="Mức độ khó"
                        rules={[{ required: true, message: 'Vui lòng chọn mức độ khó!' }]}
                    >
                        <Select placeholder="Chọn mức độ khó">
                            {difficultyLevels.map(level => (
                                <Option key={level} value={level}>
                                    {level}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="knowledgeBlockId"
                        label="Khối kiến thức"
                        rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức!' }]}
                    >
                        <Select 
                            placeholder="Chọn khối kiến thức"
                            disabled={!form.getFieldValue('subjectCode')}
                        >
                            {availableKnowledgeBlocks.map(block => (
                                <Option key={block.id} value={block.id}>
                                    {block.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            
            {/* Modal xem chi tiết câu hỏi */}
            <Modal
                title="Chi tiết câu hỏi"
                visible={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailsModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
            >
                {currentQuestion && (
                    <div>
                        <p><strong>Môn học:</strong> {getSubjectName(currentQuestion.subjectCode)}</p>
                        <p><strong>Khối kiến thức:</strong> {getKnowledgeBlockName(currentQuestion.knowledgeBlockId)}</p>
                        <p><strong>Mức độ:</strong> {currentQuestion.difficulty}</p>
                        <Divider />
                        <div>
                            <strong>Nội dung câu hỏi:</strong>
                            <p style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>{currentQuestion.content}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}