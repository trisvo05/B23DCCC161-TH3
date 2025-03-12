import React, { useState } from "react";
import { Table, Form, Input, DatePicker, Button, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";

interface StudySession { // định nghĩa interface cjo buổi học 
  id: number;
  subject: string;
  dateTime: string;
  duration: number;
  content: string;
  notes: string;
}

const StudyTracker: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]); // Mảng chứa danh sách học
  const [modalVisible, setModalVisible] = useState(false); // Cập nhật danh sách học
  const [editingSession, setEditingSession] = useState<StudySession | null>(null); // Chỉnh sửa modal
  const [form] = Form.useForm();  // Quản lý form

  const showAddModal = () => { // Quản lý modal
    setEditingSession(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (session: StudySession) => { // Cập nhật modal, truyền dữ liệu vào form và chuyển thời gian 
    setEditingSession(session);
    form.setFieldsValue({
      ...session,
      dateTime: moment(session.dateTime),
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => { // xóa buổi học id tương ứng
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = () => { // Kiểm tra và lấy dữ liệu từ form, cập nhật danh sách buổi học
    form.validateFields().then((values) => {
      const newSession: StudySession = {
        id: editingSession ? editingSession.id : Date.now(),
        ...values,
        dateTime: values.dateTime.format("YYYY-MM-DD HH:mm"),
      };
      setSessions((prev) =>
        editingSession ? prev.map((s) => (s.id === editingSession.id ? newSession : s)) : [...prev, newSession]
      );
      setModalVisible(false);
    });
  };

  const columns: ColumnsType<StudySession> = [ // Hiển thị tên môn học, ngày giờ, thời lượng, nội dung, ghi chú.
    { title: "Môn học", dataIndex: "subject", key: "subject" },
    { title: "Ngày giờ", dataIndex: "dateTime", key: "dateTime" },
    { title: "Thời lượng (phút)", dataIndex: "duration", key: "duration" },
    { title: "Nội dung", dataIndex: "content", key: "content" },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Xóa</Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>Thêm lịch học</Button>
      <Table dataSource={sessions} columns={columns} rowKey="id" pagination={false} />

      <Modal visible={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} title="Lịch học">
        <Form form={form} layout="vertical">
          <Form.Item name="subject" label="Môn học" rules={[{ required: true, message: "Nhập tên môn học!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dateTime" label="Ngày giờ" rules={[{ required: true, message: "Chọn ngày học!" }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true, message: "Nhập thời lượng!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudyTracker;