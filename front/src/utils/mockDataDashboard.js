export const mockResponsableData = {
	leaveStats: [
		{ name: 'Acceptés', value: 65, color: '#4CAF50' },
		{ name: 'Refusés', value: 15, color: '#F44336' },
		{ name: 'En attente', value: 20, color: '#FF9800' }
	],
	processingTime: [
		{ month: 'Jan', days: 2.5 },
		{ month: 'Fév', days: 3.1 },
		{ month: 'Mar', days: 2.8 },
		{ month: 'Avr', days: 2.2 },
		{ month: 'Mai', days: 2.9 },
		{ month: 'Juin', days: 2.4 }
	],
	managerRatio: [
		{ team: 'Équipe A', ratio: 1 / 8 },
		{ team: 'Équipe B', ratio: 1 / 6 },
		{ team: 'Équipe C', ratio: 1 / 10 },
		{ team: 'Équipe D', ratio: 1 / 7 },
		{ team: 'Équipe E', ratio: 1 / 9 }
	],
	topManagers: [
		{ name: 'Sophie Martin', score: 95, team: 'Équipe A' },
		{ name: 'Pierre Dubois', score: 92, team: 'Équipe B' },
		{ name: 'Marie Lefebvre', score: 88, team: 'Équipe C' },
		{ name: 'Jean Moreau', score: 85, team: 'Équipe D' },
		{ name: 'Claire Bernard', score: 82, team: 'Équipe E' }
	],
	topTeams: [
		{ name: 'Équipe A', score: 94, topUser: 'Alice Dupont' },
		{ name: 'Équipe B', score: 89, topUser: 'Bob Martin' },
		{ name: 'Équipe C', score: 86, topUser: 'Charlie Petit' },
		{ name: 'Équipe D', score: 83, topUser: 'David Roux' },
		{ name: 'Équipe E', score: 80, topUser: 'Emma Blanc' }
	]
};

export const mockManagerTeams = {
	'team-1': {
		name: 'Équipe Développement',
		attendance: [
			{ name: 'Alice', rate: 95 },
			{ name: 'Bob', rate: 92 },
			{ name: 'Charlie', rate: 88 },
			{ name: 'David', rate: 90 },
			{ name: 'Emma', rate: 94 }
		],
		teamAttendance: { rate: 91.8 },
		hoursWorked: [
			{ member: 'Alice', hours: 38.5 },
			{ member: 'Bob', hours: 39.2 },
			{ member: 'Charlie', hours: 37.8 },
			{ member: 'David', hours: 38.9 },
			{ member: 'Emma', hours: 39.5 }
		],
		contractCompliance: [
			{ month: 'Jan', Alice: 98, Bob: 102, Charlie: 95, David: 100, Emma: 103 },
			{ month: 'Fév', Alice: 100, Bob: 98, Charlie: 97, David: 101, Emma: 99 },
			{ month: 'Mar', Alice: 99, Bob: 101, Charlie: 96, David: 99, Emma: 102 },
			{ month: 'Avr', Alice: 101, Bob: 100, Charlie: 98, David: 102, Emma: 100 },
			{ month: 'Mai', Alice: 100, Bob: 99, Charlie: 99, David: 100, Emma: 101 }
		],
		warnings: [
			{ member: 'Alice', count: 0 },
			{ member: 'Bob', count: 1 },
			{ member: 'Charlie', count: 2 },
			{ member: 'David', count: 0 },
			{ member: 'Emma', count: 1 }
		],
		pauseTime: [
			{ member: 'Alice', minutes: 45 },
			{ member: 'Bob', minutes: 52 },
			{ member: 'Charlie', minutes: 48 },
			{ member: 'David', minutes: 50 },
			{ member: 'Emma', minutes: 46 }
		],
		leaveDays: [
			{ member: 'Alice', days: 2.5 },
			{ member: 'Bob', days: 3.2 },
			{ member: 'Charlie', days: 2.8 },
			{ member: 'David', days: 3.0 },
			{ member: 'Emma', days: 2.3 }
		],
		requests: [
			{ id: 1, member: 'Alice', type: 'Congé', startDate: '2025-11-01', endDate: '2025-11-05', status: 'En attente', reason: 'Vacances familiales' },
			{ id: 2, member: 'Bob', type: 'Congé', startDate: '2025-10-28', endDate: '2025-10-29', status: 'Approuvé', reason: 'Congé personnel' },
			{ id: 3, member: 'Charlie', type: 'RTT', startDate: '2025-11-10', endDate: '2025-11-10', status: 'En attente', reason: 'Récupération heures sup' },
			{ id: 4, member: 'David', type: 'Télétravail', startDate: '2025-10-30', endDate: '2025-10-30', status: 'refused', reason: 'Rendez-vous médical' },
			{ id: 5, member: 'Emma', type: 'Congé', startDate: '2025-11-15', endDate: '2025-11-20', status: 'En attente', reason: 'Voyage' }
		]
	},
	'team-2': {
		name: 'Équipe Design',
		attendance: [
			{ name: 'Sophie', rate: 98 },
			{ name: 'Marc', rate: 91 },
			{ name: 'Julie', rate: 94 }
		],
		teamAttendance: { rate: 94.3 },
		hoursWorked: [
			{ member: 'Sophie', hours: 39.8 },
			{ member: 'Marc', hours: 38.1 },
			{ member: 'Julie', hours: 39.3 }
		],
		contractCompliance: [
			{ month: 'Jan', Sophie: 102, Marc: 97, Julie: 100 },
			{ month: 'Fév', Sophie: 101, Marc: 98, Julie: 99 },
			{ month: 'Mar', Sophie: 100, Marc: 99, Julie: 101 },
			{ month: 'Avr', Sophie: 103, Marc: 96, Julie: 100 },
			{ month: 'Mai', Sophie: 101, Marc: 99, Julie: 102 }
		],
		warnings: [
			{ member: 'Sophie', count: 0 },
			{ member: 'Marc', count: 2 },
			{ member: 'Julie', count: 0 }
		],
		pauseTime: [
			{ member: 'Sophie', minutes: 42 },
			{ member: 'Marc', minutes: 55 },
			{ member: 'Julie', minutes: 47 }
		],
		leaveDays: [
			{ member: 'Sophie', days: 2.1 },
			{ member: 'Marc', days: 3.5 },
			{ member: 'Julie', days: 2.6 }
		],
		requests: [
			{ id: 6, member: 'Sophie', type: 'Congé', startDate: '2025-11-08', endDate: '2025-11-12', status: 'En attente', reason: 'Congé maternité' },
			{ id: 7, member: 'Marc', type: 'RTT', startDate: '2025-10-27', endDate: '2025-10-27', status: 'Refusé', reason: 'Projet en cours' },
			{ id: 8, member: 'Julie', type: 'Congé', startDate: '2025-11-20', endDate: '2025-11-22', status: 'Approuvé', reason: 'Week-end prolongé' }
		]
	},
	'team-3': {
		name: 'Équipe Marketing',
		attendance: [
			{ name: 'Pierre', rate: 89 },
			{ name: 'Lucie', rate: 96 },
			{ name: 'Thomas', rate: 93 },
			{ name: 'Sarah', rate: 97 }
		],
		teamAttendance: { rate: 93.8 },
		hoursWorked: [
			{ member: 'Pierre', hours: 37.2 },
			{ member: 'Lucie', hours: 39.7 },
			{ member: 'Thomas', hours: 38.8 },
			{ member: 'Sarah', hours: 39.9 }
		],
		contractCompliance: [
			{ month: 'Jan', Pierre: 96, Lucie: 101, Thomas: 99, Sarah: 103 },
			{ month: 'Fév', Pierre: 95, Lucie: 100, Thomas: 98, Sarah: 102 },
			{ month: 'Mar', Pierre: 97, Lucie: 102, Thomas: 100, Sarah: 101 },
			{ month: 'Avr', Pierre: 96, Lucie: 101, Thomas: 99, Sarah: 104 },
			{ month: 'Mai', Pierre: 98, Lucie: 100, Thomas: 101, Sarah: 102 }
		],
		warnings: [
			{ member: 'Pierre', count: 3 },
			{ member: 'Lucie', count: 0 },
			{ member: 'Thomas', count: 1 },
			{ member: 'Sarah', count: 0 }
		],
		pauseTime: [
			{ member: 'Pierre', minutes: 58 },
			{ member: 'Lucie', minutes: 44 },
			{ member: 'Thomas', minutes: 49 },
			{ member: 'Sarah', minutes: 43 }
		],
		leaveDays: [
			{ member: 'Pierre', days: 3.8 },
			{ member: 'Lucie', days: 2.2 },
			{ member: 'Thomas', days: 2.9 },
			{ member: 'Sarah', days: 2.0 }
		],
		requests: [
			{ id: 9, member: 'Pierre', type: 'Congé maladie', startDate: '2025-10-26', endDate: '2025-10-27', status: 'Approuvé', reason: 'Arrêt maladie' },
			{ id: 10, member: 'Lucie', type: 'Télétravail', startDate: '2025-11-02', endDate: '2025-11-02', status: 'En attente', reason: 'Déménagement' },
			{ id: 11, member: 'Thomas', type: 'Congé', startDate: '2025-11-25', endDate: '2025-11-30', status: 'En attente', reason: 'Vacances de fin d\'année' },
			{ id: 12, member: 'Sarah', type: 'Formation', startDate: '2025-11-05', endDate: '2025-11-06', status: 'Approuvé', reason: 'Formation continue' }
		]
	}
};
export const mockUserData = {
	personalAttendance: [
		{ month: 'Jan', rate: 95 },
		{ month: 'Fév', rate: 92 },
		{ month: 'Mar', rate: 97 },
		{ month: 'Avr', rate: 94 },
		{ month: 'Mai', rate: 96 },
		{ month: 'Juin', rate: 93 }
	],
	monthlyHours: [
		{ month: 'Jan', hours: 152 },
		{ month: 'Fév', hours: 148 },
		{ month: 'Mar', hours: 156 },
		{ month: 'Avr', hours: 151 },
		{ month: 'Mai', hours: 154 },
		{ month: 'Juin', hours: 150 }
	],
	arrivalDeparture: [
		{ day: 'Lun', arrival: 8.5, departure: 17.5 },
		{ day: 'Mar', arrival: 8.3, departure: 17.3 },
		{ day: 'Mer', arrival: 8.7, departure: 17.7 },
		{ day: 'Jeu', arrival: 8.4, departure: 17.4 },
		{ day: 'Ven', arrival: 8.2, departure: 17.2 }
	],
	contractRate: { rate: 98.5 },
	warningsByType: [
		{ type: 'Retard', count: 2, color: '#FF9800' },
		{ type: 'Absence', count: 1, color: '#F44336' },
		{ type: 'Autres', count: 0, color: '#9E9E9E' }
	],
	pauseAverage: { minutes: 47 },
	leaveDays: { average: 2.8 },
	absenceDays: { average: 1.2 }
};