import { useState, useCallback } from 'react';
import type { TodoItem } from '@/services/todo';

export default function useTodoModel() {
	const [todos, setTodos] = useState<TodoItem[]>(() => {
		const saved = localStorage.getItem('todos');
		return saved ? JSON.parse(saved) : [];
	});

	const saveTodos = useCallback((newTodos: TodoItem[]) => {
		localStorage.setItem('todos', JSON.stringify(newTodos));
		setTodos(newTodos);
	}, []);

	const addTodo = useCallback(
		(todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
			const newTodo: TodoItem = {
				...todo,
				id: Date.now().toString(),
				createdAt: new Date().toISOString(),
			};
			saveTodos([newTodo, ...todos]);
		},
		[todos, saveTodos],
	);

	const updateTodo = useCallback(
		(id: string, updates: Partial<TodoItem>) => {
			const newTodos = todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo));
			saveTodos(newTodos);
		},
		[todos, saveTodos],
	);

	const deleteTodo = useCallback(
		(id: string) => {
			saveTodos(todos.filter((todo) => todo.id !== id));
		},
		[todos, saveTodos],
	);

	return {
		todos,
		addTodo,
		updateTodo,
		deleteTodo,
	};
}
