import React from 'react';
import { Modal } from 'antd';
import SubjectForm from './SubjectForm';

interface Subject {
  code: string;
  name: string;
  credits: number;
}

interface SubjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  initialValues: Subject | null;
}

const SubjectModal: React.FC<SubjectModalProps> = ({ 
  visible, 
  onClose, 
  onSave, 
  initialValues 
}) => {
  const modalTitle = (
    <div style={{ textAlign: 'center', width: '100%' }}>
      {initialValues ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      visible={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <SubjectForm
        onSubmit={onSave}
        onCancel={onClose}
        initialValues={initialValues}
      />
    </Modal>
  );
};

export default SubjectModal;