import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'


const preferences = {
  filterTeams: "card",
}

const user = {
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  role: '',
  contractType: '',
  token: '',
  refreshToken: '',
  preferences: preferences,
}



export const useUserStore = create(
  persist(
    (set, get) => ({
      user: user,
      setUser: (newUser) => set({ user: newUser }),
      updateTokens: (accessToken, refreshToken) =>
        set({
          user: {
            ...get().user,
            token: accessToken,
            refreshToken: refreshToken,
          },
        }),
      setPreferences: (newPreferences) =>
        set({
          user: {
            ...get().user,
            preferences: {
              ...get().user.preferences,
              ...newPreferences,
            },
          },
        }),
      logout: () => {
        set({ user: user });
        localStorage.removeItem('user-storage');
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);