import { Button, Card, Col, message, Modal, Row } from 'antd';
import { useModel } from 'umi';
import { FC, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { StudyProgressItem } from '@/services/studyprogress';
import StudyProgressForm from './components/StudyProgressForm';

const StudyProgressList: FC = () => {
    const { studyProgresses, addStudyProgress, updateStudyProgress, deleteStudyProgress } = useModel('studyprogress');
    const [visible, setVisible] = useState(false);
    const [editingStudyProgress, setEditingStudyProgress] = useState<StudyProgressItem | null>(null);

    const StudyProgressGrid = () => (
        <Row gutter={[16, 16]}>
            {studyProgresses?.map((studyProgress: StudyProgressItem) => (
                <Col xs={24} sm={12} md={8} lg={6} key={studyProgress.id}>
                    <Card
                        hoverable
                        title={studyProgress.subject}
                        extra={
                            studyProgress.completed ? (
                                <span style={{ color: '#52c41a' }}>Đã xong</span>
                            ) : (
                                <span style={{ color: '#faad14' }}>Đang làm</span>
                            )
                        }
                        actions={[
                            <EditOutlined
                                key='edit'
                                onClick={() => {
                                    setEditingStudyProgress(studyProgress);
                                    setVisible(true);
                                }}
                            />,
                            <DeleteOutlined
                                key='delete'
                                onClick={() => {
                                    deleteStudyProgress(studyProgress.id);
                                    message.success('Xóa thành công');
                                }}
                            />,
                        ]}
                    >
                        <p>{studyProgress.task}</p>
                        <p style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            Created: {new Date(studyProgress.createdAt).toLocaleDateString()}
                        </p>
                    </Card>
                </Col>
            ))}
        </Row>
    );

    return (
        <div style={{ padding: 24 }}>
            <Card
                title='Mục tiêu học tập'
                extra={
                    <Button
                        type='primary'
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingStudyProgress(null);
                            setVisible(true);
                        }}
                    >
                        Thêm mục tiêu học tập
                    </Button>
                }
            >
                <StudyProgressGrid />
            </Card>

            <Modal
                title={editingStudyProgress ? 'Chỉnh sửa' : 'Thêm'}
                visible={visible}
                onCancel={() => {
                    setVisible(false);
                    setEditingStudyProgress(null);
                }}
                footer={null}
                destroyOnClose
            >
                <StudyProgressForm
                    initialValues={editingStudyProgress}
                    onSubmit={(values) => {
                        if (editingStudyProgress) {
                            updateStudyProgress(editingStudyProgress.id, values);
                            message.success('Đã cập nhật thành công!');
                        } else {
                            addStudyProgress({
                                subject: values.subject,
                                task: values.task,
                                completed: values.completed || false,
                            });
                            message.success('Đã thêm thành công!');
                        }
                        setVisible(false);
                        setEditingStudyProgress(null);
                    }}
                />
            </Modal>
        </div>
    );
};

export default StudyProgressList;