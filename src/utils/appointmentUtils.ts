import moment from 'moment';

/**
 * Kiểm tra xem nhân viên có rảnh vào thời điểm cụ thể không
 * @param employeeId ID của nhân viên
 * @param appointmentDate Ngày hẹn dạng YYYY-MM-DD
 * @param appointmentTime Giờ hẹn dạng HH:mm
 * @param duration Thời lượng dịch vụ (phút)
 * @param existingAppointments Danh sách lịch hẹn hiện có
 */
export const isEmployeeAvailable = (
  employeeId: number,
  appointmentDate: string,
  appointmentTime: string,
  duration: number,
  existingAppointments: any[]
): boolean => {
  // Tìm các lịch hẹn của nhân viên vào ngày đó
  const employeeAppointments = existingAppointments.filter(app => 
    app.employeeId === employeeId && 
    app.appointmentDate === appointmentDate &&
    ['pending', 'confirmed'].includes(app.status)
  );

  if (!employeeAppointments.length) return true;

  // Chuyển đổi thời gian hẹn mới sang minute trong ngày để dễ so sánh
  const requestTimeMinutes = timeToMinutes(appointmentTime);
  const requestEndTimeMinutes = requestTimeMinutes + duration;

  // Kiểm tra xem có trùng với lịch hẹn nào không
  for (const appointment of employeeAppointments) {
    const appTimeMinutes = timeToMinutes(appointment.appointmentTime);
    
    // Tìm service tương ứng để lấy thời lượng
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const service = services.find((s: any) => s.id === appointment.serviceId);
    const appDuration = service ? service.duration : 60; // Mặc định 60 phút nếu không tìm thấy
    
    const appEndTimeMinutes = appTimeMinutes + appDuration;

    // Kiểm tra xem có giao nhau về thời gian không
    if (
      (requestTimeMinutes >= appTimeMinutes && requestTimeMinutes < appEndTimeMinutes) ||
      (requestEndTimeMinutes > appTimeMinutes && requestEndTimeMinutes <= appEndTimeMinutes) ||
      (requestTimeMinutes <= appTimeMinutes && requestEndTimeMinutes >= appEndTimeMinutes)
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Tìm kiếm nhân viên phù hợp cho dịch vụ và thời gian cụ thể
 * @param serviceId ID của dịch vụ
 * @param appointmentDate Ngày hẹn
 * @param appointmentTime Giờ hẹn
 * @param allEmployees Danh sách tất cả nhân viên
 * @param allAppointments Danh sách tất cả lịch hẹn
 */
export const findAvailableEmployees = (
  serviceId: number,
  appointmentDate: string,
  appointmentTime: string,
  allEmployees: any[],
  allAppointments: any[]
): any[] => {
  // Lấy thông tin dịch vụ
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  const service = services.find((s: any) => s.id === serviceId);
  
  if (!service) return [];
  
  // Lọc nhân viên có thể làm dịch vụ này
  const qualifiedEmployees = allEmployees.filter(employee => 
    employee.services && employee.services.includes(serviceId)
  );
  
  // Kiểm tra tính khả dụng của từng nhân viên
  return qualifiedEmployees.filter(employee => 
    isEmployeeAvailable(
      employee.id,
      appointmentDate,
      appointmentTime,
      service.duration,
      allAppointments
    )
  );
};

/**
 * Đề xuất khung giờ trống cho dịch vụ
 * @param serviceId ID của dịch vụ
 * @param date Ngày muốn đặt lịch
 * @param startingTime Giờ bắt đầu tìm kiếm
 * @param employees Danh sách nhân viên
 * @param appointments Danh sách lịch hẹn hiện có
 */
export const suggestAvailableTimeSlots = (
  serviceId: number,
  date: string,
  startingTime: string,
  employees: any[],
  appointments: any[]
): { time: string; employeeId: number; employeeName: string }[] => {
  // Lấy thông tin dịch vụ
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  const service = services.find((s: any) => s.id === serviceId);
  
  if (!service) return [];
  
  // Tạo các khung giờ từ 8:00 đến 18:00 với bước nhảy 30 phút
  const timeSlots = [];
  const startHour = 8;
  const endHour = 18;
  
  for (let hour = startHour; hour < endHour; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  // Lọc các khung giờ từ thời điểm bắt đầu
  const startingTimeIndex = timeSlots.indexOf(startingTime);
  const availableTimeSlots = startingTimeIndex > -1 
    ? timeSlots.slice(startingTimeIndex + 1) 
    : timeSlots;
  
  const results = [];
  
  // Tìm kiếm cho mỗi khung giờ
  for (const timeSlot of availableTimeSlots) {
    // Tìm nhân viên có thể làm việc trong khung giờ này
    const availableEmployees = findAvailableEmployees(
      serviceId,
      date,
      timeSlot,
      employees,
      appointments
    );
    
    if (availableEmployees.length > 0) {
      // Lấy nhân viên đầu tiên có thể làm việc
      const employee = availableEmployees[0];
      results.push({
        time: timeSlot,
        employeeId: employee.id,
        employeeName: employee.name
      });
      
      // Chỉ đề xuất tối đa 5 khung giờ
      if (results.length >= 5) {
        break;
      }
    }
  }
  
  return results;
};

/**
 * Chuyển đổi thời gian dạng "HH:mm" sang số phút trong ngày
 * @param time Thời gian dạng "HH:mm"
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Chuyển đổi từ số phút trong ngày sang thời gian dạng "HH:mm"
 * @param minutes Số phút trong ngày
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Định dạng thời gian hiển thị
 * @param date Ngày dạng "YYYY-MM-DD"
 * @param time Thời gian dạng "HH:mm"
 */
export const formatDateTime = (date: string, time: string): string => {
  return moment(`${date} ${time}`).format('HH:mm - DD/MM/YYYY');
};

/**
 * Lấy tên dịch vụ theo ID
 * @param serviceId ID của dịch vụ
 */
export const getServiceName = (serviceId: number): string => {
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  const service = services.find((s: any) => s.id === serviceId);
  return service ? service.name : 'Dịch vụ không xác định';
};

/**
 * Lấy tên nhân viên theo ID
 * @param employeeId ID của nhân viên
 */
export const getEmployeeName = (employeeId: number): string => {
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  const employee = employees.find((e: any) => e.id === employeeId);
  return employee ? employee.name : 'Chưa phân công';
};

/**
 * Lấy trạng thái dạng text của lịch hẹn
 * @param status Trạng thái lịch hẹn
 */
export const getStatusText = (status: string): { text: string; color: string } => {
  switch (status) {
    case 'pending':
      return { text: 'Đang chờ xác nhận', color: 'orange' };
    case 'confirmed':
      return { text: 'Đã xác nhận', color: 'blue' };
    case 'completed':
      return { text: 'Đã hoàn thành', color: 'green' };
    case 'canceled':
      return { text: 'Đã hủy', color: 'red' };
    default:
      return { text: 'Không xác định', color: 'gray' };
  }
};