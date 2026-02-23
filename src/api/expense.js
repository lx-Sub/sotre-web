import axios from 'axios';
import request from '@/utils/request'; 
const API_BASE_URL = '/dev/expenses';
const url = '/expenses'
export const getList = (params) => {
  return axios.get(API_BASE_URL, { params })
    .then(response => response.data)
    .catch(error => {
      console.error('获取报销单列表失败', error);
      throw error;
    });
};

export const add = (expense) => {
  return axios.post(API_BASE_URL, expense)
    .then(response => response.data)
    .catch(error => {
      console.error('新增报销单失败', error);
      throw error;
    });
};

export const edit = (expense) => {
  return axios.put(API_BASE_URL, expense)
    .then(response => response.data)
    .catch(error => {
      console.error('编辑报销单失败', error);
      throw error;
    });
};

export const deleteOne = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('删除报销单失败', error);
      throw error;
    });
};

export const deleteBatch = (ids) => {
    return request({
      url: url + '/batch/' + ids,
      method: 'delete'
    })
  }

export const exportData = (params) => {
  return axios.get(`${API_BASE_URL}/export/${params.month}`, {
    responseType: 'blob'
  }).then(response => response.data)
    .catch(error => {
      console.error('导出报销单失败', error);
      throw error;
    });
};

export const imp = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${API_BASE_URL}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => response.data)
    .catch(error => {
      console.error('导入报销单失败', error);
      throw error;
    });
};

export const findByEmployeeId = (id) => {
  return axios.get(`${API_BASE_URL}/employee/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('根据员工ID查询报销单失败', error);
      throw error;
    });
};

export const findByEmployeeIdAndDate = (id, date) => {
  return axios.get(`${API_BASE_URL}/employee/${id}/${date}`)
    .then(response => response.data)
    .catch(error => {
      console.error('根据员工ID和日期查询报销单失败', error);
      throw error;
    });
};

export const findAll = () => {
  return axios.get(`${API_BASE_URL}/all`)
    .then(response => response.data)
    .catch(error => {
      console.error('获取所有报销单失败', error);
      throw error;
    });
};
// api/expense.js


  
  // 提交报销申请
  // 数据导出
  export const getExportApi = () => {
    return 'http://localhost:' + process.env.VUE_APP_PORT + url + '/export'
  }
  