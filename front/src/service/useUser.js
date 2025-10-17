import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { useUserStore } from '../zustand/store';


export const useUsers = () => {
	const usersQuery = useQuery({
		queryKey: ['users'],
		queryFn: userApi.getAllUsers,
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
		refetchUsers: usersQuery.refetch 
	};
};

export const useUpdateUser = (onSuccessCallback, onErrorCallback) => {
	const queryClient = useQueryClient();
	const setUser = useUserStore((state) => state.setUser);
	const currentUser = useUserStore((state) => state.user);

	const updateUserMutation = useMutation({
		mutationFn: (data) => userApi.updateUser(data),
		onSuccess: (updatedUser) => {
			console.log("User updated:", updatedUser);
			
			setUser({
				...currentUser,
				...updatedUser,
			});
			
			queryClient.invalidateQueries({ queryKey: ['users'] });
			
			if (onSuccessCallback) {
				onSuccessCallback(updatedUser);
			}
		},
		onError: (error) => {
			console.error("Failed to update user:", error);
			if (onErrorCallback) {
				onErrorCallback(error);
			}
		},
	});

	return {
		updateUser: updateUserMutation.mutate,
		loadingUpdateUser: updateUserMutation.isLoading,
		isSuccess: updateUserMutation.isSuccess,
		isError: updateUserMutation.isError,
	};
};
