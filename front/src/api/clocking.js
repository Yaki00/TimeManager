import { getToken } from "../utils/getToken";
import { checkAuthError } from "../utils/handleAuthError";

const API_URL = "http://localhost:3000/clockings";

export const clockingApi = {
	/**
	 * Créer un nouveau pointage
	 */
	async createClocking(data) {
		console.log("Creating clocking with data:", data);
		const response = await fetch(API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
			body: JSON.stringify(data),
		});

		if (checkAuthError(response)) {
			throw new Error("Session expirée. Redirection vers la connexion...");
		}

		const result = await response.json();
		console.log("response", result);
		return result;
	},

	/**
	 * Récupérer les pointages d'un utilisateur pour une date
	 */
	async getClockingsByUserAndDate(userId, date) {
		console.log("Fetching clockings for user:", userId, "date:", date);
		const response = await fetch(`${API_URL}/user/${userId}/date/${date}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
		});

		if (checkAuthError(response)) {
			throw new Error("Session expirée. Redirection vers la connexion...");
		}

		const result = await response.json();
		console.log("response", result);
		return result;
	},

	/**
	 * Mettre à jour un pointage
	 */
	async updateClocking(clockingId, data) {
		console.log("Updating clocking:", clockingId, "with data:", data);
		const response = await fetch(`${API_URL}/${clockingId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
			body: JSON.stringify(data),
		});

		if (checkAuthError(response)) {
			throw new Error("Session expirée. Redirection vers la connexion...");
		}

		const result = await response.json();
		console.log("response", result);
		return result;
	},

	/**
	 * Récupérer les pointages d'un utilisateur
	 */
	async getUserClockings(userId, params = {}) {
		const queryParams = new URLSearchParams(params).toString();
		const url = `${API_URL}/user/${userId}${queryParams ? `?${queryParams}` : ''}`;
		
		console.log("Fetching user clockings:", url);
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
		});

		if (checkAuthError(response)) {
			throw new Error("Session expirée. Redirection vers la connexion...");
		}

		const result = await response.json();
		console.log("response", result);
		return result;
	},

	/**
	 * Récupérer les statistiques de pointage
	 */
	async getUserClockingStats(userId, startDate, endDate) {
		const params = new URLSearchParams();
		if (startDate) params.append('startDate', startDate);
		if (endDate) params.append('endDate', endDate);
		
		const url = `${API_URL}/user/${userId}/stats${params.toString() ? `?${params.toString()}` : ''}`;
		
		console.log("Fetching user clocking stats:", url);
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
		});

		if (checkAuthError(response)) {
			throw new Error("Session expirée. Redirection vers la connexion...");
		}

		const result = await response.json();
		console.log("response", result);
		return result;
	},
};

