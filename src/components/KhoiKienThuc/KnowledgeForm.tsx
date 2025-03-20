import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { getFromLocalStorage } from '../../utils/subject';
import { DeleteOutlined } from '@ant-design/icons';

interface KnowledgeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}

// Hàm tạo ID đơn giản dựa trên số thứ tự
const generateUniqueId = () => {
  // Định nghĩa kiểu dữ liệu cho khối kiến thức
  interface KnowledgeBlock {
    id: string;
    name: string;
    subjects: string[];
  }

  // Lấy danh sách khối kiến thức hiện có
  const knowledgeBlocks = getFromLocalStorage('knowledgeBlocks') || [];
  
  // Nếu không có khối kiến thức nào, bắt đầu từ 1
  if (knowledgeBlocks.length === 0) {
    return "1";
  }
  
  // Tìm ID lớn nhất hiện tại
  const maxId = Math.max(
    ...knowledgeBlocks.map((block: KnowledgeBlock) => {
      // Chuyển ID sang số nếu có thể
      const numericId = parseInt(block.id);
      return isNaN(numericId) ? 0 : numericId;
    })
  );
  
  // Trả về ID mới là số lớn nhất + 1, dạng chuỗi
  return String(maxId + 1);
};

const KnowledgeForm: React.FC<KnowledgeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [form] = Form.useForm();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  // Reset form và load dữ liệu mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      // Load danh sách môn học có sẵn
      const subjects = getFromLocalStorage('subjects') || [];
      setAvailableSubjects(subjects);
      
      if (initialData) {
        // Nếu là chỉnh sửa, điền dữ liệu vào form
        form.setFieldsValue({
          name: initialData.name
        });
        setSelectedSubjects(initialData.subjects || []);
      } else {
        // Nếu là thêm mới, reset form
        form.resetFields();
        setSelectedSubjects([]);
      }
    }
  }, [isOpen, initialData, form]);

  // Xử lý khi submit form
  const handleFinish = (values: any) => {
    const data = {
      // Nếu đang chỉnh sửa thì giữ ID cũ, nếu thêm mới thì tạo ID mới
      id: initialData ? initialData.id : generateUniqueId(),
      name: values.name,
      subjects: selectedSubjects
    };
    
    onSave(data);
    
    // Reset form sau khi lưu
    form.resetFields();
    setSelectedSubjects([]);
  };

  // Xử lý khi chọn môn học mới
  const handleSubjectChange = (value: string) => {
    if (value && !selectedSubjects.includes(value)) {
      // Thêm môn học vào danh sách đã chọn
      setSelectedSubjects([...selectedSubjects, value]);
      
      // Reset trường select để sẵn sàng chọn môn học tiếp theo
      form.setFieldsValue({ subject: undefined });
    }
  };

  // Xử lý khi xóa một môn học khỏi danh sách đã chọn
  const handleRemoveSubject = (subjectCode: string) => {
    setSelectedSubjects(selectedSubjects.filter(code => code !== subjectCode));
  };

  return (
    <Modal
      title={initialData ? "Chỉnh sửa khối kiến thức" : "Thêm khối kiến thức mới"}
      visible={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Tên khối kiến thức"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên khối kiến thức' }]}
        >
          <Input placeholder="Nhập tên khối kiến thức" />
        </Form.Item>

        <Form.Item
          label="Thêm môn học"
          name="subject"
        >
          <Select
            placeholder="Chọn môn học"
            onChange={handleSubjectChange}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {availableSubjects.map(subject => (
              <Select.Option 
                key={subject.code} 
                value={subject.code}
                disabled={selectedSubjects.includes(subject.code)}
              >
                {subject.name} ({subject.credits} tín chỉ)
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Danh sách môn học đã chọn */}
        {selectedSubjects.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4>Môn học đã chọn:</h4>
            <ul style={{ paddingLeft: 20 }}>
              {selectedSubjects.map(code => {
                const subject = availableSubjects.find(s => s.code === code);
                return (
                  <li key={code} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>
                      {subject ? `${subject.name} (${subject.credits} tín chỉ)` : code}
                    </span>
                    <Button
                      type="link"
                      danger
                      onClick={() => handleRemoveSubject(code)}
                      style={{ padding: '0 4px' }}
                      icon = { <DeleteOutlined/> }
                    >
                      Xóa
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            {initialData ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default KnowledgeForm;