import { getToken } from "../utils/getToken";

export const userApi = {

	async getAllUsers() {
		const response = await fetch ("http://localhost:3000/users", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
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
		const result = await response.json();
		console.log("response", result);
		return result;
	},
}