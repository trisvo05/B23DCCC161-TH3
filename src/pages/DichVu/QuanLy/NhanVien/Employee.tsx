import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, TimePicker, message, Select, Tag } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ColumnsType } from 'antd/lib/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

dayjs.extend(customParseFormat);

const { Option } = Select;

// Types
interface WorkingHours {
  start: string;
  end: string;
}

interface Employee {
  id: number;
  name: string;
  workingHours: WorkingHours;
  dailyLimit: number;
  services: number[];
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

const EmployeeManager: React.FC = () => {
    const [employeeList, setEmployeeList] = useState<Employee[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [employeeForm] = Form.useForm();
    const [services, setServices] = useState<Service[]>([]);

    // Storage utilities
    const storeData = useCallback((key: string, data: any): void => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Failed to store data for key: ${key}`, error);
        }
    }, []);

    const fetchData = useCallback((key: string): any => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Failed to fetch data for key: ${key}`, error);
            return null;
        }
    }, []);

    // Load data on component mount
    useEffect(() => {
        const savedEmployees: Employee[] = fetchData('employees') || [];
        const savedServices: Service[] = fetchData('services') || [];
        
        // Ensure each employee has required fields
        const updatedEmployees = savedEmployees.map(emp => ({
            ...emp,
            services: emp.services || []
        }));
        
        setEmployeeList(updatedEmployees);
        setServices(savedServices);
        
        // Save if normalized data is different
        if (JSON.stringify(updatedEmployees) !== JSON.stringify(savedEmployees)) {
            storeData('employees', updatedEmployees);
        }
    }, [fetchData, storeData]);

    // Parse time safely
    const parseTime = useCallback((timeStr: string) => {
        if (!timeStr) return null;
        const parsedTime = dayjs(timeStr, 'HH:mm', true);
        return parsedTime.isValid() ? parsedTime : null;
    }, []);

    // Format time safely
    const formatTime = useCallback((timeObj: any): string => {
        if (!timeObj || !timeObj.isValid || !timeObj.isValid()) return '';
        try {
            return timeObj.format('HH:mm');
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    }, []);

    // Table column definitions
    const tableColumns = useMemo<ColumnsType<Employee>>(() => [
        {
            title: 'Họ và Tên',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: 'Giờ làm việc',
            dataIndex: 'workingHours',
            key: 'workingHours',
            align: 'center',
            render: (hours: WorkingHours) => {
                if (!hours || !hours.start || !hours.end) {
                    return 'Chưa thiết lập';
                }
                
                const startTime = parseTime(hours.start);
                const endTime = parseTime(hours.end);
                
                if (!startTime || !endTime) {
                    return 'Định dạng không hợp lệ';
                }
                
                return `${formatTime(startTime)} - ${formatTime(endTime)}`;
            },
        },
        {
            title: 'Giới hạn khách trong ngày',
            dataIndex: 'dailyLimit',
            key: 'dailyLimit',
            align: 'center',
        },
        {
            title: 'Dịch vụ làm',
            dataIndex: 'services',
            key: 'services',
            align: 'center',
            render: (serviceIds: number[]) => (
                <>
                    {serviceIds && serviceIds.length > 0 ? (
                        serviceIds.map(id => {
                            const service = services.find(s => s.id === id);
                            return service ? (
                                <Tag color="blue" key={id} style={{ margin: '2px' }}>
                                    {service.name}
                                </Tag>
                            ) : null;
                        })
                    ) : (
                        <span>Không có</span>
                    )}
                </>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            render: (_: any, record: Employee) => (
                <>
                    <Button type="link" onClick={() => openEditModal(record)} icon={<EditOutlined />}>
                        Sửa
                    </Button>
                    <Button type="link" danger onClick={() => deleteEmployee(record.id)} icon={<DeleteOutlined />}>
                        Xóa
                    </Button>
                </>
            ),
        },
    ], [services, parseTime, formatTime]);

    // Modal handlers
    const openAddModal = useCallback(() => {
        employeeForm.resetFields();
        setModalOpen(true);
    }, [employeeForm]);
    
    const openEditModal = useCallback((employee: Employee): void => {
        try {
            const startTime = parseTime(employee.workingHours?.start);
            const endTime = parseTime(employee.workingHours?.end);
            
            employeeForm.setFieldsValue({
                id: employee.id,
                name: employee.name,
                dailyLimit: employee.dailyLimit,
                services: employee.services || [],
                workingHours: {
                    start: startTime,
                    end: endTime,
                }
            });
            
            setModalOpen(true);
        } catch (error) {
            console.error('Error setting form values:', error);
            message.error('Không thể mở thông tin nhân viên');
        }
    }, [employeeForm, parseTime]);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        employeeForm.resetFields();
    }, [employeeForm]);

    // CRUD operations
    const deleteEmployee = useCallback((id: number): void => {
        const newList = employeeList.filter(emp => emp.id !== id);
        setEmployeeList(newList);
        storeData('employees', newList);
        message.success('Nhân viên đã xóa thành công');
    }, [employeeList, storeData]);

    const handleEmployeeSubmit = useCallback((formValues: any): void => {
        const employeeData: Employee = {
            ...formValues,
            id: formValues.id || Date.now(),
            workingHours: {
                start: formatTime(formValues.workingHours?.start),
                end: formatTime(formValues.workingHours?.end),
            },
            services: formValues.services || []
        };
    
        const isEdit = employeeList.some(emp => emp.id === formValues.id);
        const updatedList = isEdit
            ? employeeList.map(emp => (emp.id === formValues.id ? employeeData : emp))
            : [...employeeList, employeeData];
    
        setEmployeeList(updatedList);
        storeData('employees', updatedList);
        closeModal();
        message.success(`Nhân viên đã ${isEdit ? 'cập nhật' : 'thêm'} thành công`);
    }, [employeeList, storeData, closeModal, formatTime]);

    return (
        <>
            <Button 
                type="primary" 
                onClick={openAddModal} 
                style={{ marginBottom: 16 }}
            >
                + Thêm nhân viên
            </Button>
  
            <Table 
                columns={tableColumns}
                dataSource={employeeList} 
                rowKey="id" 
            />
    
            <Modal
                title="Chi tiết nhân viên"
                visible={modalOpen}
                onOk={() => employeeForm.submit()}
                onCancel={closeModal}
            >
                <Form form={employeeForm} onFinish={handleEmployeeSubmit} layout="vertical">
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name={['workingHours', 'start']}
                        label="Thời gian bắt đầu làm"
                        rules={[{ required: true, message: 'Vui lòng nhập thời gian bắt đầu làm!' }]}
                    >
                        <TimePicker format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                        name={['workingHours', 'end']}
                        label="Thời gian kết thúc làm"
                        rules={[{ required: true, message: 'Vui lòng nhập thời gian kết thúc làm!' }]}
                    >
                        <TimePicker format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                        name="dailyLimit"
                        label="Giới hạn khách trong ngày"
                        rules={[{ required: true, message: 'Vui lòng nhập giới hạn khách!' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="services"
                        label="Dịch vụ làm"
                    >
                        <Select 
                            mode="multiple"
                            placeholder="Chọn dịch vụ"
                            style={{ width: '100%' }}
                            allowClear
                        >
                            {services.map(service => (
                                <Option key={service.id} value={service.id}>
                                    {service.name} ({service.duration} phút)
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default EmployeeManager;