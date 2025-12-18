import request from '@/utils/request';

/**
 * 认证相关 API
 */

// 验证码响应类型
export interface CaptchaResponse {
  uuid: string;
  img: string;
}

// 登录请求类型
export interface LoginRequest {
  username: string;      // 邮箱
  password: string;      // RSA加密后的密码
  code: string;          // 验证码
  uuid: string;          // 验证码UUID
}

// 登录响应类型（双Token）
export interface LoginResponse {
  accessToken: string;         // 访问令牌（15分钟）
  refreshToken: string;        // 刷新令牌（7天）
  tokenType: string;           // Bearer
  expiresIn: number;           // Access Token过期时间（秒）
  refreshExpiresIn: number;    // Refresh Token过期时间（秒）
  userId: number;
  username: string;
  accountId?: number;
  aliasId?: string;
  isFirstLogin?: boolean;
  userType?: number;
}

// 刷新Token响应类型
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn?: number;
}

// RSA公钥响应类型
export interface PublicKeyResponse {
  publicKey: string;
}

// 获取验证码
export const getCaptcha = () => {
  return request.get<any, { code: number; data: CaptchaResponse }>('/auth/captcha');
};

// 获取RSA公钥
export const getPublicKey = () => {
  return request.get<any, { code: number; data: PublicKeyResponse }>('/auth/public-key');
};

// 用户登录
export const login = (data: LoginRequest) => {
  return request.post<any, { code: number; message: string; data: LoginResponse }>('/auth/login', data);
};

// 刷新Token
export const refreshToken = () => {
  return request.post<any, { code: number; data: RefreshTokenResponse }>('/auth/refresh', {});
};

// 用户登出
export const logout = () => {
  return request.post<any, { code: number; message: string }>('/auth/logout');
};

// 用户注册
export interface RegisterRequest {
  username: string;
  password: string;           // RSA加密后的密码
  confirmPassword: string;    // RSA加密后的确认密码
  email: string;
  mobile: string;
  contact: string;
  companyName: string;
  companyAddress?: string;
  websiteUrl?: string;
}

export const register = (data: RegisterRequest) => {
  return request.post<any, { code: number; message: string }>('/auth/register', data);
};

// 修改密码请求类型
export interface ChangePasswordRequest {
  oldPassword: string;        // RSA加密后的旧密码
  newPassword: string;        // RSA加密后的新密码
  confirmPassword: string;    // RSA加密后的确认密码
}

// 修改密码
export const changePassword = (data: ChangePasswordRequest) => {
  return request.post<any, { code: number; message: string }>('/auth/change-password', data);
};
