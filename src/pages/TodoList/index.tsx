import { Button, Modal, message, Card, Row, Col } from 'antd';
import { useModel } from 'umi';
import TodoForm from './components/TodoForm';
import type { TodoItem } from '@/services/todo';
import { FC, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

const TodoList: FC = () => {
	const { todos, addTodo, updateTodo, deleteTodo } = useModel('todo');
	const [visible, setVisible] = useState(false);
	const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

	// Grid view of todos
	const TodoGrid = () => (
		<Row gutter={[16, 16]}>
			{todos.map((todo: TodoItem) => (
				<Col xs={24} sm={12} md={8} lg={6} key={todo.id}>
					<Card
						hoverable
						title={todo.title}
						extra={
							todo.completed ? (
								<span style={{ color: '#52c41a' }}>Completed</span>
							) : (
								<span style={{ color: '#faad14' }}>Pending</span>
							)
						}
						actions={[
							<EditOutlined
								key='edit'
								onClick={() => {
									setEditingTodo(todo);
									setVisible(true);
								}}
							/>,
							<DeleteOutlined
								key='delete'
								onClick={() => {
									deleteTodo(todo.id);
									message.success('Todo deleted successfully');
								}}
							/>,
						]}
					>
						<p>{todo.description}</p>
						<p style={{ color: '#8c8c8c', fontSize: '12px' }}>
							Created: {new Date(todo.createdAt).toLocaleDateString()}
						</p>
					</Card>
				</Col>
			))}
		</Row>
	);

	return (
		<div style={{ padding: 24 }}>
			<Card
				title='Todo List'
				extra={
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => {
							setEditingTodo(null);
							setVisible(true);
						}}
					>
						Add Todo
					</Button>
				}
			>
				<TodoGrid />
			</Card>

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
