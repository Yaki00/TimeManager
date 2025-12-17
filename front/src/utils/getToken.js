import { useUserStore } from "../zustand/store"
import CryptoJS from 'crypto-js';

/**
 * Récupère et déchiffre le token de l'utilisateur
 * @returns {string|null} Le token déchiffré ou null
 */
export const getToken = () => {
	const token = useUserStore.getState().user?.token;
	if (!token) {
		return null;
	}
	
	try {
		const decryptToken = CryptoJS.AES.decrypt(token, 'your-secret-key').toString(CryptoJS.enc.Utf8);
		
		// Si le décryptage échoue ou retourne une chaîne vide, le token est invalide
		if (!decryptToken || decryptToken.trim() === '') {
			return null;
		}
		
		console.log("Current user token:", decryptToken);
		return decryptToken;
	} catch (error) {
		// Erreur de décryptage, token invalide
		console.error("Erreur de décryptage du token:", error);
		return null;
	}
}