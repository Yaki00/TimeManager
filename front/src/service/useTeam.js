import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { teamApi } from '../api/team';

export const useGetTeams = () => {
	return useQuery({
		queryKey: ['teams'],
		queryFn: teamApi.getTeams,
		staleTime: 5 * 60 * 1000,
	});
};

export const useGetTeamById = (id) => {
	return useQuery({
		queryKey: ['team', id],
		queryFn: () => teamApi.getTeamById(id),
		enabled: !!id, 
	});
};


export const useCreateTeam = () => {
	const queryClient = useQueryClient();

	const createTeamMutation = useMutation({
		mutationFn: (data) => teamApi.createTeam(data),
		onSuccess: (newTeam) => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			
		},
		onError: (error) => {
			console.error("Failed to create team:", error);
			
		},
	});

	return {
		createTeamAsync: createTeamMutation.mutateAsync,
		isLoading: createTeamMutation.isLoading,
		isSuccess: createTeamMutation.isSuccess,
		isError: createTeamMutation.isError,
		error: createTeamMutation.error,
	};
};

export const useUpdateTeam = () => {
	const queryClient = useQueryClient();

	const updateTeamMutation = useMutation({
		mutationFn: (data) => teamApi.updateTeam(data),
		onSuccess: (updatedTeam) => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			queryClient.invalidateQueries({ queryKey: ['team', updatedTeam.id] });
		},
		onError: (error) => {
			console.error("Failed to update team:", error);
		},
	});

	return {
		updateTeamAsync: updateTeamMutation.mutateAsync,
		isLoading: updateTeamMutation.isLoading,
		isSuccess: updateTeamMutation.isSuccess,
		isError: updateTeamMutation.isError,
		error: updateTeamMutation.error,
	};
};

export const useDeleteTeam = () => {
	const queryClient = useQueryClient();

	const deleteTeamMutation = useMutation({
		mutationFn: (id) => teamApi.deleteTeam(id),
		onSuccess: (deletedId) => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			queryClient.removeQueries({ queryKey: ['team', deletedId] });
		},
		onError: (error) => {
			console.error("Failed to delete team:", error);
		},
	});

	return {
		deleteTeamAsync: deleteTeamMutation.mutateAsync,
		isLoading: deleteTeamMutation.isLoading,
		isSuccess: deleteTeamMutation.isSuccess,
		isError: deleteTeamMutation.isError,
		error: deleteTeamMutation.error,
	};
};

