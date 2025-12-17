import { useQuery } from '@tanstack/react-query';
import { kpiApi } from '../api/kpi';

/**
 * Hook pour récupérer les KPI Responsable
 */
export const useGetResponsableKPIs = (startDate, endDate) => {
  return useQuery({
    queryKey: ['kpi', 'responsable', startDate, endDate],
    queryFn: () => kpiApi.getResponsableKPIs(startDate, endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

/**
 * Hook pour récupérer les KPI Manager d'une équipe
 */
export const useGetManagerKPIs = (teamId, startDate, endDate) => {
  return useQuery({
    queryKey: ['kpi', 'manager', teamId, startDate, endDate],
    queryFn: () => kpiApi.getManagerKPIs(teamId, startDate, endDate),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

/**
 * Hook pour récupérer les KPI d'un utilisateur
 */
export const useGetUserKPIs = (userId, startDate, endDate) => {
  return useQuery({
    queryKey: ['kpi', 'user', userId, startDate, endDate],
    queryFn: () => kpiApi.getUserKPIs(userId, startDate, endDate),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

/**
 * Hook pour récupérer les KPI de l'utilisateur connecté
 */
export const useGetCurrentUserKPIs = (startDate, endDate) => {
  return useQuery({
    queryKey: ['kpi', 'currentUser', startDate, endDate],
    queryFn: () => kpiApi.getCurrentUserKPIs(startDate, endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

