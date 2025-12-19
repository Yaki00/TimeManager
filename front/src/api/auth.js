
export const authApi = {
	async login(data){
		const response = await fetch ("http://localhost:3000/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		const result = await response.json();
		return result;
	},

	async register(data) {
		const response = await fetch("http://localhost:3000/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		const result = await response.json();
		return result;
	},

	async refreshToken(refreshToken) {
		const response = await fetch("http://localhost:3000/auth/refresh", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refreshToken }),
		});
		
		if (!response.ok) {
			throw new Error("Failed to refresh token");
		}
		
		const result = await response.json();
		return result;
	}
}
