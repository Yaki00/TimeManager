import { useUserStore } from "../zustand/store";


export const getRoles = () => {
	const role = useUserStore.getState().user?.role;
	console.log("Current user role:", role);
	return role;
};