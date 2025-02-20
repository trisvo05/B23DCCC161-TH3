import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, Modal, Row } from 'antd';
import { FC, useState } from 'react';
import { useModel } from 'umi';
import StudyProgressForm from './components/StudyProgressForm';
import type { StudyProgressItem } from '@/services/studyprogress';

const StudyProgressList: FC = () => {
	const { StudyProgress, addStudyProgress, updateStudyProgress, deleteStudyProgress } = useModel('StudyProgress');
	const [visible, setVisible] = useState(false);
	const [editingStudyProgress, setEditingStudyProgress] = useState<StudyProgressItem | null>(null);

	const StudyProgressGrid = () => (
		<Row gutter={[16, 16]}>
			{StudyProgress?.map((item: StudyProgressItem) => (
				<Col xs={24} sm={12} md={8} lg={6} key={item.id}>
					<Card
						hoverable
						title={item.subject}
						extra={
							item.completed ? (
								<span style={{ color: '#52c41a' }}>Hoàn thành</span>
							) : (
								<span style={{ color: '#faad14' }}>Đang học</span>
							)
						}
						actions={[
							<EditOutlined
								key='edit'
								onClick={() => {
									setEditingStudyProgress(item);
									setVisible(true);
								}}
							/>,
							<DeleteOutlined
								key='delete'
								onClick={() => {
									deleteStudyProgress(item.id);
									message.success('Xóa thành công');
								}}
							/>,
						]}
					>
						<p>{item.task}</p>
						<p style={{ color: '#8c8c8c', fontSize: '12px' }}>
							Ngày tạo: {new Date(item.createdAt).toLocaleDateString()}
						</p>
					</Card>
				</Col>
			))}
		</Row>
	);

	return (
		<div style={{ padding: 24 }}>
			<Card
				title='Tiến trình học tập'
				extra={
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => {
							setEditingStudyProgress(null);
							setVisible(true);
						}}
					>
						Thêm môn học
					</Button>
				}
			>
				<StudyProgressGrid />
			</Card>

			<Modal
				title={editingStudyProgress ? 'Sửa môn học' : 'Thêm môn học'}
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
							message.success('Cập nhật thành công');
						} else {
							addStudyProgress({
								subject: values.subject,
								task: values.task,
								completed: values.completed || false,
							});
							message.success('Thêm mới thành công');
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
