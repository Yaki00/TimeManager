import dayjs from 'dayjs';

export const formatedDataForCalendar = (leaves) => {
  if (!leaves || leaves.length === 0) return [];
	
  const formattedLeaves = [];
	
  leaves.forEach((leave) => {
    const start = dayjs(leave.startDate);
    const end = dayjs(leave.endDate);
    const daysDiff = end.diff(start, 'day');
		
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = start.add(i, 'day');
      formattedLeaves.push({
        date: currentDate.format('YYYY-MM-DD'),
        status: leave.status,
        type: leave.justification || 'Congé',
        color: leave.status === 'Accepte' ? 'green' : leave.status === 'EnAttente' ? 'orange' : 'red',
      });
    }
  });
  return formattedLeaves;
}

export const formatTeamDataForTableGetAllTeam = (teams) => {
  if (!teams || teams.length === 0) return [];
  return teams.map((team,i) => ({
    ...team,
    key: `team-${i}`,
    members: team.members.map((member, index) => ({
      key: `${team.id}-member-${index}`,
      joinedAt: member.joinedAt,
      isLead: member.isLead,
      ...member.user,
    })),
  }));
}

export const formatTeamDataForTableGetTeamById = (teams) => {
  if (!teams || teams.length === 0) return [];
  return {
    ...teams,
    key: `team-${teams.id}`,
    members: teams.members.map((member, index) => ({
      key: `${teams.id}-member-${index}`,
      joinedAt: member.joinedAt,
      isLead: member.isLead,
      ...member.user,
    })),
  };
}

