import { Table, Button, Modal, message } from 'antd';
import { useModel } from 'umi';
import TodoForm from './components/TodoForm';
import type { TodoItem } from '@/services/todo';
import { FC, useState } from 'react';

const TodoList: FC = () => {
	const { todos, addTodo, updateTodo, deleteTodo } = useModel('todo');
	const [visible, setVisible] = useState(false);
	const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

	const columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			align: 'center',
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			align: 'center',
		},
		{
			title: 'Status',
			dataIndex: 'completed',
			key: 'completed',
			align: 'center',
			render: (completed: boolean) => (completed ? 'Completed' : 'Pending'),
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			align: 'center',
			render: (date: string) => new Date(date).toLocaleDateString(),
		},
		{
			title: 'Actions',
			key: 'actions',
			align: 'center',
			render: (_, record: TodoItem) => (
				<>
					<Button
						type='link'
						onClick={() => {
							setEditingTodo(record);
							setVisible(true);
						}}
					>
						Edit
					</Button>
					<Button
						type='link'
						danger
						onClick={() => {
							deleteTodo(record.id);
							message.success('Todo deleted successfully');
						}}
					>
						Delete
					</Button>
				</>
			),
		},
	];

	return (
		<div style={{ padding: 24 }}>
			<Button
				type='primary'
				onClick={() => {
					setEditingTodo(null);
					setVisible(true);
				}}
				style={{ marginBottom: 16 }}
			>
				Add Todo
			</Button>

			<Table dataSource={todos} columns={columns} rowKey='id' pagination={{ pageSize: 10 }} />

			<Modal
				title={editingTodo ? 'Edit Todo' : 'Add Todo'}
				visible={visible}
				onCancel={() => {
					setVisible(false);
					setEditingTodo(null);
				}}
				footer={null}
				destroyOnClose
			>
				<TodoForm
					initialValues={editingTodo}
					onSubmit={(values) => {
						if (editingTodo) {
							updateTodo(editingTodo.id, values);
							message.success('Todo updated successfully');
						} else {
							addTodo(values);
							message.success('Todo added successfully');
						}
						setVisible(false);
						setEditingTodo(null);
					}}
				/>
			</Modal>
		</div>
	);
};

export default TodoList;
