import { Form, Input, Button, Checkbox, Space } from 'antd';
import type { StudyProgressItem } from '@/services/studyprogress';
import { FC } from 'react';

interface StudyProgressFormProps {
	initialValues?: Partial<StudyProgressItem> | null;
	onSubmit: (values: Omit<StudyProgressItem, 'id' | 'createdAt'>) => void;
}

const StudyProgressForm: FC<StudyProgressFormProps> = ({ initialValues, onSubmit }) => {
	const [form] = Form.useForm();

	return (
		<Form form={form} initialValues={initialValues || {}} onFinish={onSubmit} layout='vertical'>
			<Form.Item name='subject' label='Môn học' rules={[{ required: true, message: 'Vui lòng nhập môn học của bạn!' }]}>
				<Input placeholder='Nhập môn học' />
			</Form.Item>

			<Form.Item
				name='task'
				label='Mục tiêu'
				rules={[{ required: true, message: 'Hãy nhập mục tiêu cho môn này!' }]}
			>
				<Input.TextArea placeholder='Nhập mục tiêu cho môn này' rows={4} />
			</Form.Item>

			<Form.Item name='completed' valuePropName='checked'>
				<Checkbox>Đánh dấu là đã xong</Checkbox>
			</Form.Item>

			<Form.Item>
				<Space>
					<Button type='primary' htmlType='submit'>
						{initialValues ? 'Cập nhật' : 'Thêm'} mục tiêu học tập
					</Button>
					<Button onClick={() => form.resetFields()}>Làm mới</Button>
				</Space>
			</Form.Item>
		</Form>
	);
};

export default StudyProgressForm;
