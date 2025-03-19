import React, { useEffect, useState } from 'react';
import { Table, DatePicker } from 'antd';
import { getAppointmentStatistics, getRevenueStatistics } from '@/utils/reportService';
import moment from 'moment';
import { Line } from '@ant-design/charts';

const BaoCao: React.FC = () => {
  const [appointmentStats, setAppointmentStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());

  const fetchStatistics = async (date: moment.Moment) => {
    const appointmentData = await getAppointmentStatistics(date);
    const revenueData = await getRevenueStatistics(date);
    setAppointmentStats(appointmentData);
    setRevenueStats(revenueData);
  };

  useEffect(() => {
    fetchStatistics(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date: moment.Moment) => {
    setSelectedDate(date);
  };

  return (
    <div>
      <h1>Thống kê & Báo cáo</h1>
      <DatePicker value={selectedDate} onChange={handleDateChange} picker="month" />
      <h2>Thống kê số lượng lịch hẹn</h2>
      <Table dataSource={appointmentStats} columns={[
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        { title: 'Số lượng lịch hẹn', dataIndex: 'count', key: 'count' },
      ]} />
      <h2>Thống kê doanh thu</h2>
      <Line data={revenueStats} xField="date" yField="revenue" />
    </div>
  );
};

export default BaoCao;