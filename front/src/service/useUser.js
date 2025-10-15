import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user';




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

	return { users: usersQuery.data, loadingUsers: usersQuery.isLoading, refetchUsers: usersQuery.refetch };
}