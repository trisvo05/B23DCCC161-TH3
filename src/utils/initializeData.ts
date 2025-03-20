// src/utils/initializeData.ts
import subjectsData from '../../public/data/subjects.json';
import questionsData from '../../public/data/questions.json';
import knowledgeBlocksData from '../../public/data/knowledgeBlocks.json';
import { saveToLocalStorage, getFromLocalStorage } from './subject';

export const initializeLocalStorage = () => {
  // Kiểm tra xem dữ liệu đã tồn tại chưa trước khi ghi đè
  if (!getFromLocalStorage('subjects')) {
    saveToLocalStorage('subjects', subjectsData);
    console.log('Initialized subjects data in localStorage');
  }
  
  if (!getFromLocalStorage('questions')) {
    saveToLocalStorage('questions', questionsData);
    console.log('Initialized questions data in localStorage');
  }
  
  if (!getFromLocalStorage('knowledgeBlocks')) {
    saveToLocalStorage('knowledgeBlocks', knowledgeBlocksData);
    console.log('Initialized knowledge blocks data in localStorage');
  }
};