export interface StudyProgressItem {
	id: string;
	subject: string;
	task: string;
	completed: boolean;
	createdAt: string;
}

export interface StudyProgressResponse {
	data: StudyProgressItem[];
	total: number;
	success: boolean;
}

export interface StudyProgressService {
	getStudyProgress: () => Promise<StudyProgressResponse>;
	addStudyProgress: (studyProgress: Omit<StudyProgressItem, 'id' | 'createdAt'>) => Promise<StudyProgressItem>;
	updateStudyProgress: (id: string, studyProgress: Partial<StudyProgressItem>) => Promise<StudyProgressItem>;
	deleteStudyProgress: (id: string) => Promise<boolean>;
}

const studyProgressService: StudyProgressService = {
	getStudyProgress: async () => {
		const studyProgress = localStorage.getItem('StudyProgress');
		const data = studyProgress ? JSON.parse(studyProgress) : [];
		return {
			data,
			total: data.length,
			success: true,
		};
	},

	addStudyProgress: async (studyProgress) => {
		const newStudyProgress: StudyProgressItem = {
			...studyProgress,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
		};
		const existingData = localStorage.getItem('StudyProgress');
		const existingStudyProgress = existingData ? JSON.parse(existingData) : [];
		localStorage.setItem('StudyProgress', JSON.stringify([newStudyProgress, ...existingStudyProgress]));
		return newStudyProgress;
	},

	updateStudyProgress: async (id, updates) => {
		const existingData = localStorage.getItem('StudyProgress');
		const existingStudyProgress: StudyProgressItem[] = existingData ? JSON.parse(existingData) : [];
		const index = existingStudyProgress.findIndex((item) => item.id === id);

		if (index === -1) {
			throw new Error('Study progress not found');
		}

		const updatedItem = {
			...existingStudyProgress[index],
			...updates,
		};
		existingStudyProgress[index] = updatedItem;
		localStorage.setItem('StudyProgress', JSON.stringify(existingStudyProgress));
		return updatedItem;
	},

	deleteStudyProgress: async (id) => {
		const existingData = localStorage.getItem('StudyProgress');
		const existingStudyProgress: StudyProgressItem[] = existingData ? JSON.parse(existingData) : [];
		const filteredItems = existingStudyProgress.filter((item) => item.id !== id);
		localStorage.setItem('StudyProgress', JSON.stringify(filteredItems));
		return true;
	},
};

export default studyProgressService;
