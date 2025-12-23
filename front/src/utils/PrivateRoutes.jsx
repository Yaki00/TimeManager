import { Outlet } from "react-router"
import { useUserStore } from "../zustand/store";
import { Navigate } from "react-router";
import { getToken } from "./getToken";

export const PrivateRoutes = () => {
	const token = useUserStore((state) => {
		return state.user.token
	});
	
	// Vérifier que le token existe et peut être décrypté
	const decryptedToken = token ? getToken() : null;
	
	return(
		<>
		{decryptedToken ? <Outlet /> : <Navigate to="/login" />}
		</>
	)
}; 