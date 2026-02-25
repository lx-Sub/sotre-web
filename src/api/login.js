import request from '../utils/request'

// 登录
export const login = (data) => {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}
// 手机号登录
export const Authlogin = (data) => {
  return request({
    url: '/api/user/auth/login',
    method: 'post',
    data
  })
}

//注册
export const register = (data) => {
  return request({
    url: '/api/user/auth/register',
    method: 'post',
    data
  })
}
