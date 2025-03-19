import request from 'umi-request';
import type { Moment } from 'moment';

export async function getAppointmentStatistics(date: Moment) {
  const response = await request.get('/api/appointments/statistics'   , {
    params: { date: date.format('YYYY-MM') }  ,
  });
  return response.data;
}

export async function getRevenueStatistics(date: Moment) {
  const response = await request.get('/api/revenue/statistics', {
    params: { date: date.format('YYYY-MM') },
  });
  return response.data;
}