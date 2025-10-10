import {useMutation} from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useUserStore } from '../zustand/store';

export const useAuth = () => {



	const setUser = useUserStore((state) => state.setUser);


	const loginMutation = useMutation({
		mutationFn: authApi.login,
		onSuccess: (data) => {
			console.log("Login successful:", data);
			data = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john.doe@example.com',
				phoneNumber: '123-456-7890',
				role: 'user',
				token: 'abc123',
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