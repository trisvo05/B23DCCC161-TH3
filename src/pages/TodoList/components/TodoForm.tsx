import { Form, Input, Button, Checkbox, Space } from 'antd';
import type { TodoItem } from '@/services/todo';
import { FC } from 'react';

interface TodoFormProps {
	initialValues?: Partial<TodoItem> | null;
	onSubmit: (values: Omit<TodoItem, 'id' | 'createdAt'>) => void;
}

const TodoForm: FC<TodoFormProps> = ({ initialValues, onSubmit }) => {
	const [form] = Form.useForm();

	return (
		<Form form={form} initialValues={initialValues || {}} onFinish={onSubmit} layout='vertical'>
			<Form.Item name='title' label='Title' rules={[{ required: true, message: 'Please input todo title!' }]}>
				<Input placeholder='Enter todo title' />
			</Form.Item>

			<Form.Item
				name='description'
				label='Description'
				rules={[{ required: true, message: 'Please input todo description!' }]}
			>
				<Input.TextArea placeholder='Enter todo description' rows={4} />
			</Form.Item>

			<Form.Item name='completed' valuePropName='checked'>
				<Checkbox>Mark as completed</Checkbox>
			</Form.Item>

			<Form.Item>
				<Space>
					<Button type='primary' htmlType='submit'>
						{initialValues ? 'Update' : 'Add'} Todo
					</Button>
					<Button onClick={() => form.resetFields()}>Reset</Button>
				</Space>
			</Form.Item>
		</Form>
	);
};

export default TodoForm;
