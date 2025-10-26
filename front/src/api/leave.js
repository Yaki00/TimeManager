import { getToken } from "../utils/getToken";



const BASE_URL = "http://localhost:3000";


export const leaveApi = {

	async PostLeave(data){
		const response = await fetch(`${BASE_URL}/leaves`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${getToken()}`,
			},
			body: JSON.stringify(data),
		});
		
		return await response.json();
	},
	async getLeavesByUserId(userId) {
		const response = await fetch(`${BASE_URL}/leaves/users/${userId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${getToken()}`,
			},
		});
		return await response.json();
	},

	async getAllLeavesForTeam(teamId) {
		const response = await fetch(`${BASE_URL}/leaves/teams/${teamId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${getToken()}`,
			},
		});
		return await response.json();
	}
}