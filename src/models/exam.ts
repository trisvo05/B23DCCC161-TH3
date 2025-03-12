export interface ExamStructure {
    easy: number;
    medium: number;
    hard: number;
    veryHard: number;
  }
  
  export interface Exam {
    id: string;
    name: string;
    subjectCode: string;
    questions: any[]; // Sử dụng kiểu Question nếu đã có định nghĩa
    createdAt: string; // ISO date string
    structure: ExamStructure;
  }
  
  export interface ExamFormValues {
    examName: string;
    subjectCode: string;
    easyQuestions: number;
    mediumQuestions: number;
    hardQuestions: number;
    veryHardQuestions: number;
  }