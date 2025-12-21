import { getToken } from "../utils/getToken";
import { checkAuthError } from "../utils/handleAuthError";

export const userApi = {

	async getAllUsers() {
		const response = await fetch ("http://localhost:3000/users", {
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
		return result;
	},

	async updateUser(data) {
		const response = await fetch(`http://localhost:3000/users/${data.id}`, {
			method: "PUT",
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
		return result;
	},

	async deleteUser(userId) {
		const response = await fetch(`http://localhost:3000/users/${userId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
		});

		if (checkAuthError(response)) {
			throw new Error("Session expirée. Redirection vers la connexion...");
		}

		if (response.status === 204) {
			return { success: true };
		}

		const result = await response.json();
		return result;
	},

	async updateUserRole(userId, role) {
		const response = await fetch(`http://localhost:3000/users/${userId}/role`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
			body: JSON.stringify({ role }),
		});

		if (checkAuthError(response)) {
			throw new Error("Session expirée. Redirection vers la connexion...");
		}

		const result = await response.json();
		return result;
	},

	async updateUserTeams(userId, teams) {
		const response = await fetch(`http://localhost:3000/users/${userId}/teams`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
			body: JSON.stringify({ teams }),
		});

		if (checkAuthError(response)) {
			throw new Error("Session expirée. Redirection vers la connexion...");
		}

		const result = await response.json();
		return result;
	},

	async getCurrentUser() {
		const response = await fetch("http://localhost:3000/users/me/info", {
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
		return result;
	},
}