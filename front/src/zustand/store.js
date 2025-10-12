import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const user = {
	id: null,
	firstName: '',
	lastName: '',
	email: '',
	phoneNumber: '',
	role: '',
	contractType: '',
	token: '',
}

export const useUserStore = create(
	persist(
		(set) => ({
			user: user,
			setUser:  (newUser) => set({ user: newUser }),
			logout: () => {
				set({ user: user })
				localStorage.removeItem('user-storage');
			},
		}),
		{
			name: 'user-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
);