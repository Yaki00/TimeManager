
export const authApi = {
  async login(data){
    try {
      const response = await fetch ("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        const error = new Error(result.message || "Erreur lors de la connexion");
        error.statusCode = response.status;
        error.code = result.code;
        throw error;
      }
      
      return result;
    } catch (error) {
      // Si c'est déjà une erreur qu'on a créée, on la relance
      if (error.statusCode) {
        throw error;
      }
      // Sinon, c'est une erreur réseau ou autre
      const networkError = new Error("Impossible de se connecter au serveur. Veuillez vérifier votre connexion.");
      networkError.statusCode = 0;
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    }
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
