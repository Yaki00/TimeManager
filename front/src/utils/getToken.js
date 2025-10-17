import { useUserStore } from "../zustand/store"
import CryptoJS from 'crypto-js';

export const getToken = () => {
	const token = useUserStore.getState().user?.token;
	if (!token) return null;
	const decryptToken = CryptoJS.AES.decrypt(token, 'your-secret-key').toString(CryptoJS.enc.Utf8);
	console.log("Current user token:", decryptToken);
	return decryptToken;
}