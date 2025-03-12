import { useState, useEffect } from "react";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/subject";
import { Subject } from "@/services/Question/typing";

export default () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Load subjects khi component được mount
    useEffect(() => {
        try {
            const data = getFromLocalStorage('subjects') || [];
            setSubjects(data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu môn học:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Thêm môn học mới
    const addSubject = (subject: Subject) => {
        // Kiểm tra mã môn học đã tồn tại chưa
        if (subjects.some(s => s.code === subject.code)) {
            throw new Error('Mã môn học đã tồn tại!');
        }
        
        const updatedSubjects = [...subjects, subject];
        saveToLocalStorage('subjects', updatedSubjects);
        setSubjects(updatedSubjects);
        return updatedSubjects;
    };

    // Cập nhật môn học
    const updateSubject = (code: string, newSubject: Subject) => {
        const updatedSubjects = subjects.map(s => 
            s.code === code ? newSubject : s
        );
        
        saveToLocalStorage('subjects', updatedSubjects);
        setSubjects(updatedSubjects);
        return updatedSubjects;
    };

    // Xóa môn học
    const deleteSubject = (code: string) => {
        // Kiểm tra xem môn học có được dùng trong questions không
        const questions = JSON.parse(localStorage.getItem('questions') || '[]');
        const isUsedInQuestions = questions.some((q: any) => q.subjectCode === code);
        
        if (isUsedInQuestions) {
            throw new Error('Không thể xóa môn học này vì đang được sử dụng trong câu hỏi!');
        }
        
        // Kiểm tra xem môn học có được dùng trong khối kiến thức không
        const knowledgeBlocks = getFromLocalStorage('knowledgeBlocks') || [];
        const isUsedInKnowledgeBlocks = knowledgeBlocks.some((kb: any) => 
            kb.subjects && kb.subjects.includes(code)
        );
        
        if (isUsedInKnowledgeBlocks) {
            throw new Error('Không thể xóa môn học này vì đang được sử dụng trong khối kiến thức!');
        }
        
        const updatedSubjects = subjects.filter(s => s.code !== code);
        saveToLocalStorage('subjects', updatedSubjects);
        setSubjects(updatedSubjects);
        return updatedSubjects;
    };

    return {
        subjects,
        loading,
        addSubject,
        updateSubject,
        deleteSubject,
    };
};