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

export interface StudyProgressParams {
	subject?: string;
	task?: string;
	completed?: boolean;
	pageSize?: number;
	current?: number;
}

export interface StudyProgressService {
	getStudyProgresses: () => Promise<StudyProgressResponse>;
	addStudyProgress: (studyProgress: Omit<StudyProgressItem, 'id' | 'createdAt'>) => Promise<StudyProgressItem>;
	updateStudyProgress: (id: string, studyProgress: Partial<StudyProgressItem>) => Promise<StudyProgressItem>;
	deleteStudyProgress: (id: string) => Promise<boolean>;
}

const studyProgressService: StudyProgressService = {
	getStudyProgresses: async () => {
		const studyProgresses = localStorage.getItem('studyProgresses');
		const data = studyProgresses ? JSON.parse(studyProgresses) : [];
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
		const studyProgresses = localStorage.getItem('studyProgresses');
		const existingStudyProgresses = studyProgresses ? JSON.parse(studyProgresses) : [];
		localStorage.setItem('studyProgresses', JSON.stringify([newStudyProgress, ...existingStudyProgresses]));
		return newStudyProgress;
	},

	updateStudyProgress: async (id, updates) => {
		const studyProgresses = localStorage.getItem('studyProgresses');
		const existingStudyProgresses: StudyProgressItem[] = studyProgresses ? JSON.parse(studyProgresses) : [];
		const studyProgressIndex = existingStudyProgresses.findIndex((studyProgress) => studyProgress.id === id);

		if (studyProgressIndex === -1) {
			throw new Error('Study progress not found');
		}

		const updatedStudyProgress = {
			...existingStudyProgresses[studyProgressIndex],
			...updates,
		};
		existingStudyProgresses[studyProgressIndex] = updatedStudyProgress;
		localStorage.setItem('studyProgresses', JSON.stringify(existingStudyProgresses));
		return updatedStudyProgress;
	},

	deleteStudyProgress: async (id) => {
		const studyProgresses = localStorage.getItem('studyProgresses');
		const existingStudyProgresses: StudyProgressItem[] = studyProgresses ? JSON.parse(studyProgresses) : [];
		const filteredStudyProgresses = existingStudyProgresses.filter((studyProgress) => studyProgress.id !== id);
		localStorage.setItem('studyProgresses', JSON.stringify(filteredStudyProgresses));
		return true;
	},
};

export default studyProgressService;
