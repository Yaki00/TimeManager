import { useUserStore } from "../zustand/store";


export const getRoles = () => {
	const role = useUserStore.getState().user?.role;
	return role;
};
