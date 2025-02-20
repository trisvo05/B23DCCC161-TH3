import { useState, useCallback } from 'react';
import type { StudyProgressItem } from '@/services/studyprogress';

export default function useStudyProgressModel() {
	const [StudyProgress, setStudyProgress] = useState<StudyProgressItem[]>(() => {
		const saved = localStorage.getItem('StudyProgress');
		return saved ? JSON.parse(saved) : [];
	});

	const saveStudyProgress = useCallback((newStudyProgress: StudyProgressItem[]) => {
		localStorage.setItem('StudyProgress', JSON.stringify(newStudyProgress));
		setStudyProgress(newStudyProgress);
	}, []);

	const addStudyProgress = useCallback(
		(studyProgress: Omit<StudyProgressItem, 'id' | 'createdAt'>) => {
			const newStudyProgress: StudyProgressItem = {
				...studyProgress,
				id: Date.now().toString(),
				createdAt: new Date().toISOString(),
			};
			saveStudyProgress([newStudyProgress, ...StudyProgress]);
		},
		[StudyProgress, saveStudyProgress],
	);

	const updateStudyProgress = useCallback(
		(id: string, updates: Partial<StudyProgressItem>) => {
			const newStudyProgress = StudyProgress.map((item) => (item.id === id ? { ...item, ...updates } : item));
			saveStudyProgress(newStudyProgress);
		},
		[StudyProgress, saveStudyProgress],
	);

	const deleteStudyProgress = useCallback(
		(id: string) => {
			saveStudyProgress(StudyProgress.filter((item) => item.id !== id));
		},
		[StudyProgress, saveStudyProgress],
	);

	return {
		StudyProgress,
		addStudyProgress,
		updateStudyProgress,
		deleteStudyProgress,
	};
}
