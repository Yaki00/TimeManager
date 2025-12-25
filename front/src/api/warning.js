import { getToken } from "@/utils/getToken";
import { checkAuthError } from "@/utils/handleAuthError";

const BASE_URL = "http://localhost:3000";

export const warningApi = {
  /**
	 * Créer un nouvel avertissement
	 */
  async createWarning(data) {
    const response = await fetch(`${BASE_URL}/warnings`, {
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de la création de l'avertissement");
    }

    return await response.json();
  },

  /**
	 * Récupérer les avertissements d'un utilisateur
	 */
  async getWarningsByUserId(userId) {
    const response = await fetch(`${BASE_URL}/warnings/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de la récupération des avertissements");
    }

    return await response.json();
  },

  /**
	 * Mettre à jour un avertissement
	 */
  async updateWarning(warningId, data) {
    const response = await fetch(`${BASE_URL}/warnings/${warningId}`, {
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
      throw new Error(error.message || "Erreur lors de la mise à jour de l'avertissement");
    }

    return await response.json();
  },

  /**
	 * Supprimer un avertissement
	 */
  async deleteWarning(warningId) {
    const response = await fetch(`${BASE_URL}/warnings/${warningId}`, {
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de la suppression de l'avertissement");
    }

    return await response.json();
  },
};

