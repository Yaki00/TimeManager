import CryptoJS from 'crypto-js';
import { useUserStore } from '@/zustand/store';

export const getRefreshToken = () => {
  const refreshToken = useUserStore.getState().user?.refreshToken;
  if (!refreshToken) return null;
  const decryptedToken = CryptoJS.AES.decrypt(refreshToken, 'your-secret-key').toString(CryptoJS.enc.Utf8);
  return decryptedToken;
};
