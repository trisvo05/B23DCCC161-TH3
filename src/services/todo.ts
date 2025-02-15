export interface TodoItem {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	createdAt: string;
}

export interface TodoResponse {
	data: TodoItem[];
	total: number;
	success: boolean;
}

export interface TodoParams {
	title?: string;
	description?: string;
	completed?: boolean;
	pageSize?: number;
	current?: number;
}

export interface TodoService {
	getTodos: () => Promise<TodoResponse>;
	addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => Promise<TodoItem>;
	updateTodo: (id: string, todo: Partial<TodoItem>) => Promise<TodoItem>;
	deleteTodo: (id: string) => Promise<boolean>;
}

// Mock service implementation using localStorage
const todoService: TodoService = {
	getTodos: async () => {
		const todos = localStorage.getItem('todos');
		const data = todos ? JSON.parse(todos) : [];
		return {
			data,
			total: data.length,
			success: true,
		};
	},

	addTodo: async (todo) => {
		const newTodo: TodoItem = {
			...todo,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
		};
		const todos = localStorage.getItem('todos');
		const existingTodos = todos ? JSON.parse(todos) : [];
		localStorage.setItem('todos', JSON.stringify([newTodo, ...existingTodos]));
		return newTodo;
	},

	updateTodo: async (id, updates) => {
		const todos = localStorage.getItem('todos');
		const existingTodos: TodoItem[] = todos ? JSON.parse(todos) : [];
		const todoIndex = existingTodos.findIndex((todo) => todo.id === id);

		if (todoIndex === -1) {
			throw new Error('Todo not found');
		}

		const updatedTodo = {
			...existingTodos[todoIndex],
			...updates,
		};
		existingTodos[todoIndex] = updatedTodo;
		localStorage.setItem('todos', JSON.stringify(existingTodos));
		return updatedTodo;
	},

	deleteTodo: async (id) => {
		const todos = localStorage.getItem('todos');
		const existingTodos: TodoItem[] = todos ? JSON.parse(todos) : [];
		const filteredTodos = existingTodos.filter((todo) => todo.id !== id);
		localStorage.setItem('todos', JSON.stringify(filteredTodos));
		return true;
	},
};

export default todoService;
