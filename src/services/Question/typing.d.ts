export interface Subject {
    code: string;          // Mã môn học
    name: string;          // Tên môn học
    credits: number;       // Số tín chỉ
}

export interface KnowledgeBlock {
    id: string;           // ID khối kiến thức
    name: string;         // Tên khối kiến thức
    subjects: string[];   // Mảng chứa mã môn học (code) thuộc khối kiến thức này
}

export type DifficultyLevel = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

export interface Question {
    id: string;           // ID câu hỏi (không hiển thị trên UI)
    subjectCode: string;  // Mã môn học
    content: string;      // Nội dung câu hỏi
    difficulty: DifficultyLevel; // Độ khó
    knowledgeBlockId: string; // ID khối kiến thức
    createdAt: number;    // Thời gian tạo
}