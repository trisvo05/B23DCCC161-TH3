declare namespace Appointment {
    interface AppointmentData {
      id: number;
      customerName: string;
      phoneNumber: string;
      serviceId: number;
      employeeId?: number;
      appointmentDate: string;
      appointmentTime: string;
      status: 'pending' | 'confirmed' | 'completed' | 'canceled';
      createdAt: string;
      notes?: string;
    }
  }