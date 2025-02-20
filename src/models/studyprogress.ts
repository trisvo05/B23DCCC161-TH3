import { useState, useCallback } from 'react';
import type { StudyProgressItem } from '@/services/studyprogress';

export default function useStudyProgressModel() {
	const [studyProgresses, setStudyProgresses] = useState<StudyProgressItem[]>(() => {
		const saved = localStorage.getItem('studyProgresses');
		return saved ? JSON.parse(saved) : [];
	});

	const saveStudyProgresses = useCallback((newStudyProgresses: StudyProgressItem[]) => {
		localStorage.setItem('studyProgresses', JSON.stringify(newStudyProgresses));
		setStudyProgresses(newStudyProgresses);
	}, []);

	const addStudyProgress = useCallback(
		(studyProgress: Omit<StudyProgressItem, 'id' | 'createdAt'>) => {
			const newStudyProgress: StudyProgressItem = {
				...studyProgress,
				id: Date.now().toString(),
				createdAt: new Date().toISOString(),
			};
			saveStudyProgresses([newStudyProgress, ...studyProgresses]);
		},
		[studyProgresses, saveStudyProgresses],
	);

	const updateStudyProgress = useCallback(
		(id: string, updates: Partial<StudyProgressItem>) => {
			const newStudyProgresses = studyProgresses.map((studyProgress) =>
				studyProgress.id === id ? { ...studyProgress, ...updates } : studyProgress,
			);
			saveStudyProgresses(newStudyProgresses);
		},
		[studyProgresses, saveStudyProgresses],
	);

	const deleteStudyProgress = useCallback(
		(id: string) => {
			saveStudyProgresses(studyProgresses.filter((studyProgress) => studyProgress.id !== id));
		},
		[studyProgresses, saveStudyProgresses],
	);

	return {
		studyProgresses,
		addStudyProgress,
		updateStudyProgress,
		deleteStudyProgress,
	};
}
