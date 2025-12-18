import { getToken } from "../utils/getToken";
import { checkAuthError } from "../utils/handleAuthError";

export const userApi = {

	async getAllUsers() {
		console.log("Fetching all users");
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
		console.log("response", result);
		return result;
	},

	async updateUser(data) {
		console.log("Updating user with data:", data);
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
		console.log("response", result);
		return result;
	},

	async deleteUser(userId) {
		console.log("Deleting user with ID:", userId);
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
		console.log("response", result);
		return result;
	},

	async updateUserRole(userId, role) {
		console.log("Updating user role:", userId, role);
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
		console.log("response", result);
		return result;
	},

	async updateUserTeams(userId, teams) {
		console.log("Updating user teams:", userId, teams);
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
		console.log("response", result);
		return result;
	},
}