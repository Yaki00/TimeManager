import { Outlet } from "react-router"
import { useUserStore } from "../zustand/store";
import { Navigate } from "react-router";

export const PrivateRoutes = () => {
	const token = useUserStore((state) => {

		console.log("state user in private route", state.user);
		return state.user.token
	});
console.log("Private Route Token:", token);
	return(
		<>
		{token ? <Outlet /> : <Navigate to="/login" />}
		</>
	)
}; 