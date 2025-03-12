import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import ExamStructure from '../../components/DeThi/ExamStructure';
import ExamList from '../../components/DeThi/ExamList';

const { TabPane } = Tabs;
const { Title } = Typography;

const ExamManagement: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const handleExamCreated = () => {
    // Chuyển sang tab danh sách đề thi
    setActiveKey('2');
  };

  return (
    <div className="container">
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
        Quản lý Đề Thi
      </Title>

      <Tabs activeKey={activeKey} onChange={handleTabChange}>
        <TabPane tab="Cấu trúc đề thi" key="1">
          <ExamStructure onExamCreated={handleExamCreated} />
        </TabPane>
        <TabPane tab="Danh sách đề thi" key="2">
          <ExamList />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ExamManagement;