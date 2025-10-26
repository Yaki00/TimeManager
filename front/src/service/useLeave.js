import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { leaveApi } from '../api/leave';


export const useGetLeavesByUserId = (userId) => {
	return useQuery({
		queryKey: ['leaves', userId],
		queryFn: () => leaveApi.getLeavesByUserId(userId),
		enabled: !!userId, 
	});
};


export const useGetAllLeavesForTeam = (teamId) => {
	return useQuery({
		queryKey: ['leaves', 'team', teamId],
		queryFn: () => leaveApi.getAllLeavesForTeam(teamId),
		enabled: !!teamId, 
	});
};


export const useCreateLeave = () => {
	const queryClient = useQueryClient();

	const createLeaveMutation = useMutation({
		mutationFn: (data) => leaveApi.PostLeave(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['leaves'] });
		},
		
	});

	return {
		createLeaveAsync: createLeaveMutation.mutateAsync,
		isLoading: createLeaveMutation.isLoading,
		isSuccess: createLeaveMutation.isSuccess,
		isError: createLeaveMutation.isError,
		error: createLeaveMutation.error,
	};
}