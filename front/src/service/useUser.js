import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { useUserStore } from '../zustand/store';


export const useUsers = () => {
	const usersQuery = useQuery({
		queryKey: ['users'],
		queryFn: userApi.getAllUsers,
		staleTime: 5 * 60 * 1000,
		onSuccess: (data) => {
			console.log("Fetched users:", data);
		},
		onError: (error) => {
			console.error("Failed to fetch users:", error);
		},
	});

	return { 
		users: usersQuery.data, 
		loadingUsers: usersQuery.isLoading, 
		errorUsers: usersQuery.error,
		refetchUsers: usersQuery.refetch
	};
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	const setUser = useUserStore((state) => state.setUser);
	const currentUser = useUserStore((state) => state.user);

	const updateUserMutation = useMutation({
		mutationFn: (data) => userApi.updateUser(data),
		onSuccess: (updatedUser) => {
			setUser({
				...currentUser,
				...updatedUser,
			});
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
		onError: (error) => {
			console.error("Failed to update user:", error);
		},
	});

	return {
		updateUserAsync: updateUserMutation.mutateAsync,
		loadingUpdateUser: updateUserMutation.isLoading,
		isSuccess: updateUserMutation.isSuccess,
		isError: updateUserMutation.isError,
	};
};
