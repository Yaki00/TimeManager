import { getToken } from "../utils/getToken";
import { checkAuthError } from "../utils/handleAuthError";

const BASE_URL = "http://localhost:3000";

export const leaveApi = {
  async PostLeave(data) {
    const response = await fetch(`${BASE_URL}/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    return await response.json();
  },
  async getLeavesByUserId(userId) {
    const token = getToken();
    if (!token) {
      checkAuthError({ status: 401 });
      throw new Error("Token manquant");
    }

    const response = await fetch(`${BASE_URL}/leaves/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // S'assurer de retourner un tableau même si l'API retourne autre chose
    return Array.isArray(data) ? data : [];
  },

  async getAllLeavesForTeam(teamId) {
    const response = await fetch(`${BASE_URL}/leaves/teams/${teamId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    return await response.json();
  },

  async deleteLeave(leaveId) {
    const token = getToken();
    if (!token) {
      checkAuthError({ status: 401 });
      throw new Error("Token manquant");
    }

    const response = await fetch(`${BASE_URL}/leaves/${leaveId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
    }

    return { success: true };
  },
};
