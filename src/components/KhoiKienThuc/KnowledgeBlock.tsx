import React from 'react';
import { Card, Button } from 'antd';
import { getFromLocalStorage } from '../../utils/subject';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

interface KnowledgeBlockProps {
  id: string;
  name: string;
  subjects: string[]; // Mã môn học
  onEdit: () => void;
  onDelete: () => void;
  onDeleteSubject: (blockId: string, subjectCode: string) => void;
}

const KnowledgeBlock: React.FC<KnowledgeBlockProps> = ({
  id,
  name,
  subjects,
  onEdit,
  onDelete,
  onDeleteSubject
}) => {
  // Lấy danh sách môn học từ localStorage
  const getSubjectInfo = (code: string) => {
    const subjects = getFromLocalStorage('subjects') || [];
    return subjects.find((s: any) => s.code === code);
  };

  return (
    <Card
      className='knowledge-block'
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ textAlign: 'left', fontWeight: 'bold', flex: 1, fontSize: '16px' }}>
            {name}
          </div>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={onEdit}
            style={{ padding: '0 8px', fontSize: '14px' }}
          >
            Sửa
          </Button>
        </div>
      }
      style={{ marginBottom: '16px' }}
      bodyStyle={{ padding: '12px' }}
    >
      {/* Danh sách môn học */}
      {subjects.length > 0 ? (
        <ul style={{ 
          listStyleType: 'none', 
          padding: 0, 
          margin: 0,
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {subjects.map((subjectCode) => {
            const subject = getSubjectInfo(subjectCode);
            return (
              <li 
                key={subjectCode} 
                style={{ 
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '14px'
                }}
              >
                {/* Hiển thị tên môn học với "X tín chỉ" và nút xóa kế tiếp */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ textAlign: 'left' }}>
                    {subject ? `${subject.name} (${subject.credits} tín chỉ)` : 'Không tồn tại'}
                  </span>
                  <Button
                    type="link"
                    danger
                    onClick={() => onDeleteSubject(id, subjectCode)}
                    style={{ 
                      padding: '0 8px', 
                      fontSize: '14px', 
                      marginLeft: '8px',
                    }}
                    icon={<DeleteOutlined />}
                  >
                    Xóa
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div style={{ textAlign: 'left', padding: '4px 0', fontSize: '14px' }}>
          Chưa có môn học nào
        </div>
      )}
      
      {/* Nút xóa khối kiến thức */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <Button 
          type="link" 
          danger 
          onClick={onDelete}
          style={{ fontSize: '14px' }}
          icon={<DeleteOutlined />}
        >
          Xóa khối kiến thức
        </Button>
      </div>
    </Card>
  );
};

export default KnowledgeBlock;