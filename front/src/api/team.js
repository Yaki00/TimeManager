import { formatTeamDataForTableGetAllTeam,formatTeamDataForTableGetTeamById } from "@/utils/formatedData";
import { getToken } from "@/utils/getToken";
import { checkAuthError } from "@/utils/handleAuthError";

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

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }
		
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

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }
		
    if (response.ok) {
      return  formatTeamDataForTableGetTeamById(await response.json());
    } else {
      return await response.json();
    }
  },

  async createTeam(data) {
    const response = await fetch(`${BASE_URL}/teams`, {
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
		
    return await response.json();
  },

  async updateTeam(data) {
    const response = await fetch(`${BASE_URL}/teams/${data.id}`, {
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update team");
    }
    return await response.json();
  },

  async deleteTeam(id) {
    const response = await fetch(`${BASE_URL}/teams/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }
		
    return await response.json();
  },
}