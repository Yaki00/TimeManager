import { create } from 'zustand';


const user = {
	id: null,
	firstName: '',
	lastName: '',
	email: '',
	phoneNumber: '',
	role: '',
	token: '',
}

export const useUserStore = create(set => ({
	user: user,
	setUser: (userData) => set(state => ({ user: { ...state.user, ...userData } })),
	logout: () => set({ user: user }),
}));