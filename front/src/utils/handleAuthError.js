import { useUserStore } from '../zustand/store';

/**
 * Gère les erreurs d'authentification en déconnectant l'utilisateur
 * et en le redirigeant vers la page de connexion
 */
export const handleAuthError = () => {
	const logout = useUserStore.getState().logout;
	logout();
	// Redirection vers la page de connexion
	window.location.href = '/login';
};

/**
 * Vérifie si une réponse HTTP indique une erreur d'authentification
 * et déclenche la déconnexion si nécessaire
 */
export const checkAuthError = (response) => {
	if (response.status === 401) {
		handleAuthError();
		return true;
	}
	return false;
};

