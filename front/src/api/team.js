import { formatTeamDataForTableGetAllTeam,formatTeamDataForTableGetTeamById } from "../utils/formatedData";
import { getToken } from "../utils/getToken";

const BASE_URL = "http://localhost:3000";

export const teamApi = {
	async getTeams() {
		const response = await fetch(`${BASE_URL}/teams`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
		});
		
		if (response.ok) {
			return  formatTeamDataForTableGetAllTeam(await response.json());
		} else {
			return await response.json();
		}
	},

	async getTeamById(id) {
		const response = await fetch(`${BASE_URL}/teams/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
		});
		
		if (response.ok) {
			return  formatTeamDataForTableGetTeamById(await response.json());
		} else {
			return await response.json();
		}
	},

	async createTeam(data) {
		console.log("Creating team with data:", data);
		const response = await fetch(`${BASE_URL}/teams`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
			body: JSON.stringify(data),
		});
		
		return await response.json();
	},

	async updateTeam(data) {
		console.log("Updating team with data:", data);
		const response = await fetch(`${BASE_URL}/teams/${data.id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to update team");
		}
		return await response.json();
	},

	async deleteTeam(id) {
		console.log("Deleting team:", id);
		const response = await fetch(`${BASE_URL}/teams/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getToken()}`,
			},
		});
		console.log("Delete response status:", response);
		
		return await response.json();
	},
}