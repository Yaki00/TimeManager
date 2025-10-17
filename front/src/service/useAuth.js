import {useMutation} from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useUserStore } from '../zustand/store';
import { AES } from 'crypto-js';

export const useAuth = () => {

	const secretKey = 'your-secret-key'; //placer en variable d'environnement
 

	const setUser = useUserStore((state) => state.setUser);


	const loginMutation = useMutation({
		mutationFn: authApi.login,
		onSuccess: (data) => {
			console.log("Login successful:", data);
			data = {
				id: data.user.id,
				firstName: data.user.firstName,
				lastName: data.user.lastName,
				email: data.user.email,
				phoneNumber: data.user.phoneNumber,
				role: data.user.role,
				token: AES.encrypt(data.user.tokens.access, secretKey).toString(),
				preferences: {
					filterTeams: "card",
				}
			}
			setUser(data);

		},
		onError: (error) => {
			console.error("Login failed:", error);
		},
	});

	const registerMutation = useMutation({
		mutationFn: authApi.register,
		onSuccess: (data) => {
			console.log("Registration successful:", data);
			
		},
		onError: (error) => {
			console.error("Registration failed:", error);
		},
	});

	return { loadingLogin: loginMutation.isLoading, mutateAsync: loginMutation.mutateAsync , registerAsync: registerMutation.mutateAsync, loadingRegister: registerMutation.isLoading};
};