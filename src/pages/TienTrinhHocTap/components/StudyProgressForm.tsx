import { StudyProgressItem } from '@/services/studyprogress';
import { Button, Checkbox, Form, Input, Space } from 'antd';
import { FC } from 'react';

interface StudyProgressFormProps {
	initialValues?: Partial<StudyProgressItem> | null;
	onSubmit: (values: Omit<StudyProgressItem, 'id' | 'createdAt'>) => void;
}

const StudyProgressForm: FC<StudyProgressFormProps> = ({ initialValues, onSubmit }) => {
	const [form] = Form.useForm();

	return (
		<Form form={form} initialValues={initialValues || {}} onFinish={onSubmit} layout='vertical'>
			<Form.Item name='subject' label='Môn học' rules={[{ required: true, message: 'Hãy nhập tên môn học!' }]}>
				<Input placeholder='Nhập tên môn học' allowClear />
			</Form.Item>

			<Form.Item name='task' label='Nhiệm vụ' rules={[{ required: true, message: 'Hãy nhập nhiệm vụ của môn học!' }]}>
				<Input.TextArea placeholder='Nhập nhiệm vụ môn học' rows={4} allowClear />
			</Form.Item>

			<Form.Item name='completed' valuePropName='checked'>
				<Checkbox>Hoàn thành</Checkbox>
			</Form.Item>

			<Form.Item>
				<Space>
					<Button type='primary' htmlType='submit'>
						{initialValues ? 'Cập nhật' : 'Thêm mới'}
					</Button>
					<Button onClick={() => form.resetFields()}>Làm mới</Button>
				</Space>
			</Form.Item>
		</Form>
	);
};

export default StudyProgressForm;
