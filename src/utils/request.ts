import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// 是否正在刷新Token的标识
let isRefreshing = false;
// 等待刷新Token的请求队列
let requestQueue: Array<(token: string) => void> = [];

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 公开接口列表（不需要Token）
const publicUrls = [
  '/auth/login',
  '/auth/register',
  '/auth/captcha',
  '/auth/public-key',
  '/common/industryList'  // 行业列表（公开接口）
];

// 判断是否是公开接口
const isPublicUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return publicUrls.some(publicUrl => url.includes(publicUrl));
};

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 公开接口不需要添加Token
    if (isPublicUrl(config.url)) {
      return config;
    }

    // 如果是刷新Token接口，使用 refreshToken
    if (config.url === '/auth/refresh') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        config.headers.Authorization = `Bearer ${refreshToken}`;
      }
    } else {
      // 其他接口使用 accessToken
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    // 后端返回格式：{ code: 200, message: '', data: {} }
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }

    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    // 处理 401 错误（Token过期）
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果是公开接口返回401，直接抛出错误（不要尝试刷新Token）
      if (isPublicUrl(originalRequest.url)) {
        return Promise.reject(error);
      }

      // 如果是刷新Token接口失败，直接跳转登录
      if (originalRequest.url?.includes('/auth/refresh')) {
        clearTokensAndRedirectToLogin();
        return Promise.reject(error);
      }

      // 检查是否有 refreshToken
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearTokensAndRedirectToLogin();
        return Promise.reject(error);
      }

      // 防止重复刷新
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // 调用刷新Token接口
          const res = await axios.post('/api/auth/refresh', {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });
          
          if (res.data.code === 200 && res.data.data) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;
            
            // 更新 Token
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // 执行队列中的请求
            requestQueue.forEach((cb) => cb(accessToken));
            requestQueue = [];

            // 重新发起原请求
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return service(originalRequest);
          }
        } catch (refreshError) {
          // 刷新失败，清除Token并跳转登录
          requestQueue = [];
          clearTokensAndRedirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve) => {
          requestQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(service(originalRequest));
          });
        });
      }
    }

    // 其他错误
    if (error.response?.status === 403) {
      message.error('无权限访问');
    } else {
      message.error(error.response?.data?.message || error.message || '网络错误');
    }

    return Promise.reject(error);
  }
);

// 清除Token并跳转登录
function clearTokensAndRedirectToLogin() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('accountId');
  localStorage.removeItem('aliasId');
  message.error('登录已过期，请重新登录');
  window.location.href = '/login';
}

export default service;
