import React, { useState, useEffect, useMemo } from 'react';
import { Button, message, Typography, Empty } from 'antd';
import KnowledgeForm from '../../components/KhoiKienThuc/KnowledgeForm';
import KnowledgeBlock from '../../components/KhoiKienThuc/KnowledgeBlock';
import { saveToLocalStorage, getFromLocalStorage } from '../../utils/subject';
import './KhoiKienThuc.css';

const { Title } = Typography;

interface KnowledgeBlockType {
  id: string;
  name: string;
  subjects: string[]; // Mã code của các môn học thuộc khối kiến thức
}

/**
 * KnowledgePage - Trang quản lý khối kiến thức
 */
const KnowledgePage: React.FC = () => {
  // State hooks
  const [knowledgeBlocks, setKnowledgeBlocks] = useState<KnowledgeBlockType[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingBlock, setEditingBlock] = useState<KnowledgeBlockType | null>(null);

  // Load dữ liệu khi component được mount
  useEffect(() => {
    loadKnowledgeBlocks();
  }, []);

  // Các hàm trợ giúp
  const loadKnowledgeBlocks = () => {
    const storedBlocks = getFromLocalStorage('knowledgeBlocks') || [];
    setKnowledgeBlocks(storedBlocks);
  };

  const saveKnowledgeBlocks = (blocks: KnowledgeBlockType[]) => {
    setKnowledgeBlocks(blocks);
    saveToLocalStorage('knowledgeBlocks', blocks);
  };

  const openFormModal = (block: KnowledgeBlockType | null = null) => {
    setEditingBlock(block);
    setModalOpen(true);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setEditingBlock(null);
  };

  // Xử lý các sự kiện
  const handleSave = (data: KnowledgeBlockType) => {
    let updatedBlocks: KnowledgeBlockType[];

    if (editingBlock) {
      // Cập nhật khối kiến thức hiện có
      updatedBlocks = knowledgeBlocks.map((block) => 
        block.id === data.id ? data : block
      );
      message.success('Cập nhật khối kiến thức thành công');
    } else {
      // Thêm khối kiến thức mới
      updatedBlocks = [...knowledgeBlocks, data];
      message.success('Thêm khối kiến thức thành công');
    }

    saveKnowledgeBlocks(updatedBlocks);
    closeFormModal();
  };

  const handleDelete = (id: string) => {
    const updatedBlocks = knowledgeBlocks.filter((block) => block.id !== id);
    saveKnowledgeBlocks(updatedBlocks);
    message.success('Đã xóa khối kiến thức');
  };

  const handleDeleteSubject = (blockId: string, subjectCode: string) => {
    const updatedBlocks = knowledgeBlocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          subjects: block.subjects.filter(code => code !== subjectCode)
        };
      }
      return block;
    });
    
    saveKnowledgeBlocks(updatedBlocks);
    message.success('Đã xóa môn học khỏi khối kiến thức');
  };

  // Render UI
  return (
    <div className="container">
      {/* Tiêu đề trang */}
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
        Quản lý Khối Kiến Thức
      </Title>

      {/* Nút thêm khối kiến thức - căn trái */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
        <Button
          type="primary"
          onClick={() => openFormModal()}
        >
          + Thêm Khối Kiến Thức
        </Button>
      </div>
  
      {/* Hiển thị danh sách khối kiến thức - layout 3 cột */}
      <div className="knowledge-blocks" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)',  // Tăng từ 2 lên 3 cột
      gap: '12px'  // Giảm khoảng cách giữa các khối
    }}>
      {knowledgeBlocks.length > 0 ? (
        knowledgeBlocks.map((block) => (
          <KnowledgeBlock
            key={block.id}
            id={block.id}
            name={block.name}
            subjects={block.subjects}
            onEdit={() => openFormModal(block)}
            onDelete={() => handleDelete(block.id)}
            onDeleteSubject={handleDeleteSubject}
          />
        ))
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
          <Empty description="Chưa có khối kiến thức nào" />
        </div>
      )}
    </div>

      {/* Modal thêm/sửa khối kiến thức */}
      <KnowledgeForm
        isOpen={modalOpen}
        onClose={closeFormModal}
        onSave={handleSave}
        initialData={editingBlock}
      />
    </div>
  );
};

export default KnowledgePage;