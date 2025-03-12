import React, { useState, useEffect } from 'react';
import { Table, Button, message, Typography } from 'antd';
import SubjectModal from '../../components/MonHoc/SubjectModal';
import { saveToLocalStorage, getFromLocalStorage } from '../../utils/subject';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

interface Subject {
  code: string;
  name: string;
  credits: number;
}

const { Title } = Typography;

const MonHoc: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Load dữ liệu từ Local Storage
  useEffect(() => {
    const storedSubjects = getFromLocalStorage('subjects');
    if (storedSubjects) {
      setSubjects(storedSubjects);
    }
  }, []);

  // Thêm hoặc cập nhật môn học
  const handleSaveSubject = (subject: Subject) => {
    let updatedSubjects;
    
    if (editingSubject) {
      // Cập nhật môn học hiện có
      updatedSubjects = subjects.map(item => 
        item.code === subject.code ? subject : item
      );
      message.success('Cập nhật môn học thành công!');
    } else {
      // Kiểm tra mã môn học đã tồn tại chưa
      const exists = subjects.some(s => s.code === subject.code);
      if (exists) {
        message.error('Mã môn học đã tồn tại!');
        return;
      }
      // Thêm môn học mới
      updatedSubjects = [...subjects, subject];
      message.success('Thêm môn học thành công!');
    }
    
    setSubjects(updatedSubjects);
    saveToLocalStorage('subjects', updatedSubjects);
    setModalVisible(false);
    setEditingSubject(null);
  };

  // Xóa môn học
  const handleDeleteSubject = (code: string) => {
    // Kiểm tra xem môn học đang được sử dụng trong khối kiến thức không
    const knowledgeBlocks = getFromLocalStorage('knowledgeBlocks') || [];
    const isUsed = knowledgeBlocks.some((block: any) => 
      block.subjects && block.subjects.includes(code)
    );
    
    if (isUsed) {
      message.error('Không thể xóa môn học này vì đang được sử dụng trong khối kiến thức!');
      return;
    }
    
    const updatedSubjects = subjects.filter(s => s.code !== code);
    setSubjects(updatedSubjects);
    saveToLocalStorage('subjects', updatedSubjects);
    message.success('Xóa môn học thành công!');
  };

  // Cấu hình các cột của bảng với text căn giữa
  const columns = [
    {
      title: 'Tên môn',
      dataIndex: 'name',
      key: 'name',
      align: 'center' as 'center',
    },
    {
      title: 'Số tín chỉ',
      dataIndex: 'credits',
      key: 'credits',
      align: 'center' as 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center' as 'center',
      render: (_: any, record: Subject) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <Button 
            type="link" 
            onClick={() => {
              setEditingSubject(record);
              setModalVisible(true);
            }}
            icon = { <EditOutlined/> }
          >
            Sửa
          </Button>
          <Button 
            type="link" 
            danger 
            icon = { <DeleteOutlined/> }
            onClick={() => handleDeleteSubject(record.code)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
                Quản lý môn học
      </Title>
      <Button
        type="primary"
        onClick={() => {
          setEditingSubject(null);
          setModalVisible(true);
        }}
        style={{ marginBottom: '20px' }}
      >
        + Thêm môn học
      </Button>
      
      <Table 
        columns={columns}
        dataSource={subjects}
        rowKey="code"
        pagination={{ pageSize: 10 }}
      />
      
      <SubjectModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialValues={editingSubject}
      />
    </div>
  );
};

export default MonHoc;