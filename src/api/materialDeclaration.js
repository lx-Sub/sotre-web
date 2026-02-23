import axios from 'axios';
import request from '@/utils/request';

const API_BASE_URL = '/dev/material-declaration';
const url = '/material-declaration';

// 获取材料申报列表
export const getList = (params) => {
  return axios.get(API_BASE_URL, { params })
    .then(response => response.data)
    .catch(error => {
      console.error('获取材料申报列表失败', error);
      throw error;
    });
};

// 新增材料申报
export const add = (materialDeclaration) => {
  return axios.post(API_BASE_URL, materialDeclaration)
    .then(response => response.data)
    .catch(error => {
      console.error('新增材料申报失败', error);
      throw error;
    });
};

// 编辑材料申报
export const edit = (materialDeclaration) => {
  return axios.put(API_BASE_URL, materialDeclaration)
    .then(response => response.data)
    .catch(error => {
      console.error('编辑材料申报失败', error);
      throw error;
    });
};

// 删除单个材料申报
export const deleteOne = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('删除材料申报失败', error);
      throw error;
    });
};

// 批量删除材料申报
export const deleteBatch = (ids) => {
  return request({
    url: url + '/batch/' + ids,
    method: 'delete'
  });
};

// 导出材料申报数据
export const exportData = (params) => {
  return axios.get(`${API_BASE_URL}/export/${params.month}`, {
    responseType: 'blob'
  }).then(response => response.data)
    .catch(error => {
      console.error('导出材料申报失败', error);
      throw error;
    });
};

// 导入材料申报数据
export const imp = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${API_BASE_URL}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => response.data)
    .catch(error => {
      console.error('导入材料申报失败', error);
      throw error;
    });
};

// 根据员工ID获取材料申报记录
export const findByEmployeeId = (id) => {
  return axios.get(`${API_BASE_URL}/employee/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('根据员工ID查询材料申报失败', error);
      throw error;
    });
};

// 根据员工ID和日期查询材料申报记录
export const findByEmployeeIdAndDate = (id, date) => {
  return axios.get(`${API_BASE_URL}/employee/${id}/${date}`)
    .then(response => response.data)
    .catch(error => {
      console.error('根据员工ID和日期查询材料申报失败', error);
      throw error;
    });
};

// 获取所有材料申报
export const findAll = () => {
  return axios.get(`${API_BASE_URL}/all`)
    .then(response => response.data)
    .catch(error => {
      console.error('获取所有材料申报失败', error);
      throw error;
    });
};

// 导出接口
export const getExportApi = () => {
  return 'http://localhost:' + process.env.VUE_APP_PORT + url + '/export';
};

// 文件上传
export const getUploadApi = () => {
  return 'http://localhost:' + process.env.VUE_APP_PORT  + '/docs/upload'
}
