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

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	const deleteUserMutation = useMutation({
		mutationFn: (userId) => userApi.deleteUser(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
		onError: (error) => {
			console.error("Failed to delete user:", error);
		},
	});

	return {
		deleteUserAsync: deleteUserMutation.mutateAsync,
		loadingDeleteUser: deleteUserMutation.isLoading,
		isSuccess: deleteUserMutation.isSuccess,
		isError: deleteUserMutation.isError,
	};
};

export const useUpdateUserRole = () => {
	const queryClient = useQueryClient();

	const updateUserRoleMutation = useMutation({
		mutationFn: ({ userId, role }) => userApi.updateUserRole(userId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
		onError: (error) => {
			console.error("Failed to update user role:", error);
		},
	});

	return {
		updateUserRoleAsync: updateUserRoleMutation.mutateAsync,
		loadingUpdateRole: updateUserRoleMutation.isLoading,
		isSuccess: updateUserRoleMutation.isSuccess,
		isError: updateUserRoleMutation.isError,
	};
};

export const useUpdateUserTeams = () => {
	const queryClient = useQueryClient();

	const updateUserTeamsMutation = useMutation({
		mutationFn: ({ userId, teams }) => userApi.updateUserTeams(userId, teams),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
		onError: (error) => {
			console.error("Failed to update user teams:", error);
		},
	});

	return {
		updateUserTeamsAsync: updateUserTeamsMutation.mutateAsync,
		loadingUpdateTeams: updateUserTeamsMutation.isLoading,
		isSuccess: updateUserTeamsMutation.isSuccess,
		isError: updateUserTeamsMutation.isError,
	};
};