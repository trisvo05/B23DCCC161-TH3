import { Subject, Question, KnowledgeBlock, DifficultyLevel } from "./typing";
import { getFromLocalStorage } from '../../utils/subject';

// --- Quản lý môn học ---
export const getSubjects = (): Subject[] => {
    return getFromLocalStorage('subjects') || [];
};

// --- Quản lý khối kiến thức ---
export const getKnowledgeBlocks = (): KnowledgeBlock[] => {
    return getFromLocalStorage('knowledgeBlocks') || [];
};

// Lấy danh sách khối kiến thức có chứa một môn học cụ thể
export const getKnowledgeBlocksBySubjectCode = (subjectCode: string): KnowledgeBlock[] => {
    const allBlocks = getKnowledgeBlocks();
    return allBlocks.filter(block => block.subjects.includes(subjectCode));
};

// Lấy thông tin môn học từ mã môn
export const getSubjectByCode = (code: string): Subject | undefined => {
    const subjects = getSubjects();
    return subjects.find(subject => subject.code === code);
};

// --- Quản lý câu hỏi ---
export const getQuestions = (): Question[] => {
    const data = localStorage.getItem("questions");
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
};

export const saveQuestions = (questions: Question[]) => {
    localStorage.setItem("questions", JSON.stringify(questions));
};

export const addQuestion = (question: Omit<Question, 'id' | 'createdAt'>): Question[] => {
    const questions = getQuestions();
    const newQuestion: Question = {
        ...question,
        id: Date.now().toString(),
        createdAt: Date.now()
    };
    
    const updatedQuestions = [...questions, newQuestion];
    saveQuestions(updatedQuestions);
    return updatedQuestions;
};

export const editQuestion = (id: string, updatedQuestion: Partial<Question>): Question[] => {
    const questions = getQuestions();
    const index = questions.findIndex(question => question.id === id);

    if (index !== -1) {
        questions[index] = { ...questions[index], ...updatedQuestion };
        saveQuestions(questions);
    }
    return questions;
};

export const deleteQuestion = (id: string): Question[] => {
    const questions = getQuestions();
    const updatedQuestions = questions.filter(question => question.id !== id);

    saveQuestions(updatedQuestions);
    return updatedQuestions;
};

export const searchQuestions = (
    subjectCode?: string, 
    difficulty?: DifficultyLevel, 
    knowledgeBlockId?: string
): Question[] => {
    let filteredQuestions = getQuestions();
    
    if (subjectCode) {
        filteredQuestions = filteredQuestions.filter(q => q.subjectCode === subjectCode);
    }
    
    if (difficulty) {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }
    
    if (knowledgeBlockId) {
        filteredQuestions = filteredQuestions.filter(q => q.knowledgeBlockId === knowledgeBlockId);
    }
    
    return filteredQuestions;
};