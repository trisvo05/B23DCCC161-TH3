import { Form, Input, Button, Checkbox } from 'antd';
import type { TodoItem } from '@/services/todo';
import { FC } from 'react';

interface TodoFormProps {
	initialValues?: TodoItem | null;
	onSubmit: (values: Partial<TodoItem>) => void;
}

const TodoForm: FC<TodoFormProps> = ({ initialValues, onSubmit }) => {
	const [form] = Form.useForm();

	return (
		<Form form={form} initialValues={initialValues} onFinish={onSubmit} layout='vertical'>
			<Form.Item name='title' label='Title' rules={[{ required: true, message: 'Please input todo title!' }]}>
				<Input />
			</Form.Item>

			<Form.Item
				name='description'
				label='Description'
				rules={[{ required: true, message: 'Please input todo description!' }]}
			>
				<Input.TextArea />
			</Form.Item>

			<Form.Item name='completed' valuePropName='checked'>
				<Checkbox>Completed</Checkbox>
			</Form.Item>

			<Form.Item>
				<Button type='primary' htmlType='submit'>
					{initialValues ? 'Update' : 'Add'} Todo
				</Button>
			</Form.Item>
		</Form>
	);
};

export default TodoForm;
