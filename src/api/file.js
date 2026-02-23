import axios from 'axios';
import request from '@/utils/request'; 
// src/api/file.js

// import axios from 'axios';

// 获取材料审批列表
export function getList(params) {
  return axios.get('/api/material-approval/list', { params })
    .then(response => response.data)
    .catch(error => {
      console.error('获取列表失败:', error);
      throw error;
    });
}

// 新增材料审批
export function add(data) {
  return axios.post('/api/material-approval/add', data)
    .then(response => response.data)
    .catch(error => {
      console.error('新增失败:', error);
      throw error;
    });
}

// 编辑材料审批
export function edit(data) {
  return axios.put('/api/material-approval/edit', data)
    .then(response => response.data)
    .catch(error => {
      console.error('编辑失败:', error);
      throw error;
    });
}

// 批量删除材料审批
export function deleteBatch(ids) {
  return axios.post('/api/material-approval/deleteBatch', { ids })
    .then(response => response.data)
    .catch(error => {
      console.error('批量删除失败:', error);
      throw error;
    });
}

// 删除单个材料审批
export function deleteOne(id) {
  return axios.delete(`/api/material-approval/delete/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('删除失败:', error);
      throw error;
    });
}
