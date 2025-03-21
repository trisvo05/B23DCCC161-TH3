// Hàm lấy dữ liệu từ localStorage
export const getLocalData = (key: string, defaultValue: any[] = []) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Lỗi khi lấy dữ liệu ${key} từ localStorage:`, error);
      return defaultValue;
    }
  };