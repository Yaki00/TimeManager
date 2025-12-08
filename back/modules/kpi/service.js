import prisma from "../../db.js";

/**
 * Convertit une date en format YYYY-MM-DD
 */
function toDateOnly(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

/**
 * Calcule le nombre de jours ouvrés entre deux dates
 */
function computeBusinessDays(start, end) {
  let count = 0;
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * Convertit les heures décimales en format heures:minutes
 */
function decimalToTime(decimal) {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return hours + minutes / 60;
}

/**
 * KPI pour la vue Responsable
 */
export async function getResponsableKPI(startDate, endDate) {
  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setMonth(new Date().getMonth() - 6));
  const end = endDate ? new Date(endDate) : new Date();

  // Statistiques des congés
  const leaves = await prisma.leave.findMany({
    where: {
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });

  const leaveStats = {
    accepted: 0,
    refused: 0,
    pending: 0,
  };

  leaves.forEach((leave) => {
    if (leave.status === "Approved") leaveStats.accepted++;
    else if (leave.status === "Refused") leaveStats.refused++;
    else if (leave.status === "Pending") leaveStats.pending++;
  });

  const total = leaves.length || 1;
  const leaveStatsFormatted = [
    {
      name: "Acceptés",
      value: Math.round((leaveStats.accepted / total) * 100),
      color: "#4CAF50",
    },
    {
      name: "Refusés",
      value: Math.round((leaveStats.refused / total) * 100),
      color: "#F44336",
    },
    {
      name: "En attente",
      value: Math.round((leaveStats.pending / total) * 100),
      color: "#FF9800",
    },
  ];

  // Temps de traitement par mois
  const processingTime = [];
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  const currentDate = new Date(start);
  currentDate.setDate(1); // Commencer au premier jour du mois
  let maxIterations = 12; // Limiter à 12 mois maximum
  let iterations = 0;

  while (currentDate <= end && iterations < maxIterations) {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const monthLeaves = await prisma.leave.findMany({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { in: ["Approved", "Refused"] },
      },
    });

    let totalDays = 0;
    let count = 0;
    monthLeaves.forEach((leave) => {
      const days = Math.floor(
        (new Date(leave.updatedAt) - new Date(leave.createdAt)) /
          (1000 * 60 * 60 * 24)
      );
      totalDays += days;
      count++;
    });

    processingTime.push({
      month: months[currentDate.getMonth()],
      days: count > 0 ? Number((totalDays / count).toFixed(1)) : 0,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
    iterations++;
  }

  // Ratio manager par équipe
  const teams = await prisma.team.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  const managerRatio = teams.map((team) => {
    const managers = team.members.filter(
      (m) => m.user.role === "Manager"
    ).length;
    const total = team.members.length || 1;
    return {
      team: team.teamName,
      ratio: Number((managers / total).toFixed(2)),
    };
  });

  // Top managers (basé sur le score de gestion des congés)
  const managers = await prisma.user.findMany({
    where: { role: "Manager" },
    include: {
      ownedTeams: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  leaves: {
                    where: {
                      startDate: { lte: end },
                      endDate: { gte: start },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const topManagers = managers
    .map((manager) => {
      let score = 100;
      manager.ownedTeams.forEach((team) => {
        team.members.forEach((member) => {
          const pendingLeaves = member.user.leaves.filter(
            (l) => l.status === "Pending"
          ).length;
          const refusedLeaves = member.user.leaves.filter(
            (l) => l.status === "Refused"
          ).length;
          score -= pendingLeaves * 2;
          score -= refusedLeaves * 1;
        });
      });
      return {
        name: `${manager.firstName} ${manager.lastName}`,
        score: Math.max(0, Math.min(100, score)),
        team: manager.ownedTeams[0]?.teamName || "Aucune équipe",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Top équipes (basé sur la présence et les performances)
  const topTeams = await Promise.all(
    teams
      .filter((team) => team.members.length > 0) // Filtrer les équipes sans membres
      .map(async (team) => {
        const memberIds = team.members.map((m) => m.userId);
        const clockings =
          memberIds.length > 0
            ? await prisma.clocking.findMany({
                where: {
                  userId: { in: memberIds },
                  clockingDate: { gte: start, lte: end },
                },
              })
            : [];

        const totalDays = clockings.length;
        const expectedDays = memberIds.length * computeBusinessDays(start, end);
        const attendanceRate =
          expectedDays > 0 ? (totalDays / expectedDays) * 100 : 0;

        const topUser = team.members[0]?.user
          ? team.members[0].user.firstName
          : "N/A";

        return {
          name: team.teamName,
          score: Math.round(Math.min(100, attendanceRate)),
          topUser,
        };
      })
  );

  topTeams.sort((a, b) => b.score - a.score);

  return {
    leaveStats: leaveStatsFormatted,
    processingTime: processingTime.slice(0, 6),
    managerRatio: managerRatio.slice(0, 5),
    topManagers: topManagers.slice(0, 5),
    topTeams: topTeams.slice(0, 5),
  };
}

/**
 * KPI pour la vue Manager (par équipe)
 */
export async function getManagerKPI(teamId, startDate, endDate) {
  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: {
            include: {
              clockings: {
                where: {
                  clockingDate: { gte: start, lte: end },
                },
              },
              leaves: {
                where: {
                  startDate: { lte: end },
                  endDate: { gte: start },
                },
              },
              warnings: {
                where: {
                  date: { gte: start, lte: end },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw new Error("Équipe non trouvée");
  }

  const businessDays = computeBusinessDays(start, end);
  const memberIds = team.members.map((m) => m.userId);

  // Présence par membre
  const attendance = await Promise.all(
    team.members.map(async (member) => {
      const userClockings = member.user.clockings;
      const expectedDays = businessDays;
      const actualDays = userClockings.length;
      const rate =
        expectedDays > 0 ? Math.round((actualDays / expectedDays) * 100) : 0;
      return {
        name: member.user.firstName,
        rate,
      };
    })
  );

  // Taux de présence de l'équipe
  const allClockings = await prisma.clocking.findMany({
    where: {
      userId: { in: memberIds },
      clockingDate: { gte: start, lte: end },
    },
  });
  const teamAttendanceRate =
    memberIds.length * businessDays > 0
      ? Math.round(
          (allClockings.length / (memberIds.length * businessDays)) * 100
        )
      : 0;

  // Heures travaillées par membre
  const hoursWorked = await Promise.all(
    team.members.map(async (member) => {
      const totalHours = member.user.clockings.reduce((sum, c) => {
        return sum + Number(c.totalHours || 0);
      }, 0);
      return {
        member: member.user.firstName,
        hours: Number(totalHours.toFixed(1)),
      };
    })
  );

  // Conformité au contrat par mois
  const contractCompliance = [];
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  const currentDate = new Date(start);
  while (currentDate <= end && contractCompliance.length < 5) {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const monthData = { month: months[currentDate.getMonth()] };
    for (const member of team.members) {
      const monthClockings = await prisma.clocking.findMany({
        where: {
          userId: member.userId,
          clockingDate: { gte: monthStart, lte: monthEnd },
        },
      });
      const totalHours = monthClockings.reduce(
        (sum, c) => sum + Number(c.totalHours || 0),
        0
      );
      const expectedHours = getExpectedHours(member.user.contractType);
      const percentage =
        expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : 0;
      monthData[member.user.firstName] = percentage;
    }
    contractCompliance.push(monthData);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Avertissements par membre
  const warnings = team.members.map((member) => ({
    member: member.user.firstName,
    count: member.user.warnings.length,
  }));

  // Temps de pause par membre
  const pauseTime = await Promise.all(
    team.members.map(async (member) => {
      const avgBreakTime =
        member.user.clockings.length > 0
          ? member.user.clockings.reduce(
              (sum, c) => sum + (c.breakTime || 0),
              0
            ) / member.user.clockings.length
          : 0;
      return {
        member: member.user.firstName,
        minutes: Math.round(avgBreakTime),
      };
    })
  );

  // Jours de congé par membre
  const leaveDays = team.members.map((member) => {
    const totalDays = member.user.leaves
      .filter((l) => l.status === "Approved")
      .reduce((sum, l) => sum + l.daysLeave, 0);
    return {
      member: member.user.firstName,
      days: Number((totalDays / businessDays).toFixed(1)),
    };
  });

  // Fonction pour mapper le type de congé
  const mapLeaveType = (type) => {
    switch (type) {
      case "PaidLeave":
        return "Congé";
      case "Absence":
        return "Absence";
      case "Training":
        return "Formation";
      case "Remote":
        return "Télétravail";
      default:
        return type;
    }
  };

  // Demandes de congé
  const requests = [];
  for (const member of team.members) {
    for (const leave of member.user.leaves) {
      requests.push({
        id: leave.id,
        member: member.user.firstName,
        type: mapLeaveType(leave.type),
        startDate: toDateOnly(leave.startDate),
        endDate: toDateOnly(leave.endDate),
        status:
          leave.status === "Pending"
            ? "En attente"
            : leave.status === "Approved"
            ? "Approuvé"
            : "Refusé",
        reason: leave.justification,
      });
    }
  }

  return {
    name: team.teamName,
    attendance,
    teamAttendance: { rate: teamAttendanceRate },
    hoursWorked,
    contractCompliance,
    warnings,
    pauseTime,
    leaveDays,
    requests: requests.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    ),
  };
}

/**
 * KPI pour la vue Utilisateur
 */
export async function getUserKPI(userId, startDate, endDate) {
  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setMonth(new Date().getMonth() - 6));
  const end = endDate ? new Date(endDate) : new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clockings: {
        where: {
          clockingDate: { gte: start, lte: end },
        },
        orderBy: { clockingDate: "asc" },
      },
      leaves: {
        where: {
          startDate: { lte: end },
          endDate: { gte: start },
        },
      },
      warnings: {
        where: {
          date: { gte: start, lte: end },
        },
      },
    },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  // Présence personnelle par mois
  const personalAttendance = [];
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  const currentDate = new Date(start);
  while (currentDate <= end && personalAttendance.length < 6) {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const monthBusinessDays = computeBusinessDays(monthStart, monthEnd);

    const monthClockings = user.clockings.filter(
      (c) => c.clockingDate >= monthStart && c.clockingDate <= monthEnd
    );

    const rate =
      monthBusinessDays > 0
        ? Math.round((monthClockings.length / monthBusinessDays) * 100)
        : 0;
    personalAttendance.push({
      month: months[currentDate.getMonth()],
      rate,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Heures mensuelles
  const monthlyHours = [];
  const currentDate2 = new Date(start);
  while (currentDate2 <= end && monthlyHours.length < 6) {
    const monthStart = new Date(
      currentDate2.getFullYear(),
      currentDate2.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate2.getFullYear(),
      currentDate2.getMonth() + 1,
      0
    );

    const monthClockings = user.clockings.filter(
      (c) => c.clockingDate >= monthStart && c.clockingDate <= monthEnd
    );

    const totalHours = monthClockings.reduce(
      (sum, c) => sum + Number(c.totalHours || 0),
      0
    );
    monthlyHours.push({
      month: months[currentDate2.getMonth()],
      hours: Math.round(totalHours),
    });

    currentDate2.setMonth(currentDate2.getMonth() + 1);
  }

  // Heures d'arrivée et de départ par jour de la semaine
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
  const arrivalDeparture = weekDays.map((day) => {
    const dayClockings = user.clockings.filter((c) => {
      const dayOfWeek = new Date(c.clockingDate).getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      return weekDays[dayIndex] === day;
    });

    if (dayClockings.length === 0) {
      return { day, arrival: 0, departure: 0 };
    }

    const avgArrival =
      dayClockings.reduce((sum, c) => {
        if (c.firstArrival) {
          const time = new Date(c.firstArrival);
          return sum + time.getHours() + time.getMinutes() / 60;
        }
        return sum;
      }, 0) / dayClockings.length;

    const avgDeparture =
      dayClockings.reduce((sum, c) => {
        if (c.lastDeparture) {
          const time = new Date(c.lastDeparture);
          return sum + time.getHours() + time.getMinutes() / 60;
        }
        return sum;
      }, 0) / dayClockings.length;

    return {
      day,
      arrival: Number(avgArrival.toFixed(1)),
      departure: Number(avgDeparture.toFixed(1)),
    };
  });

  // Taux de conformité au contrat
  const expectedHours = getExpectedHours(user.contractType);
  const totalHours = user.clockings.reduce(
    (sum, c) => sum + Number(c.totalHours || 0),
    0
  );
  const businessDays = computeBusinessDays(start, end);
  const expectedTotalHours = expectedHours * businessDays;
  const contractRate =
    expectedTotalHours > 0
      ? Number(((totalHours / expectedTotalHours) * 100).toFixed(1))
      : 0;

  // Avertissements par type
  const warningsByType = [
    {
      type: "Retard",
      count: user.warnings.filter((w) => w.status === "Late").length,
      color: "#FF9800",
    },
    {
      type: "Absence",
      count: user.warnings.filter((w) => w.status === "UnjustifiedAbsence")
        .length,
      color: "#F44336",
    },
    {
      type: "Autres",
      count: user.warnings.filter((w) => w.status === "Alert").length,
      color: "#9E9E9E",
    },
  ];

  // Temps de pause moyen
  const avgBreakTime =
    user.clockings.length > 0
      ? user.clockings.reduce((sum, c) => sum + (c.breakTime || 0), 0) /
        user.clockings.length
      : 0;

  // Jours de congé moyen
  const approvedLeaves = user.leaves.filter((l) => l.status === "Approved");
  const totalLeaveDays = approvedLeaves.reduce(
    (sum, l) => sum + l.daysLeave,
    0
  );
  const leaveDaysAverage =
    businessDays > 0 ? Number((totalLeaveDays / businessDays).toFixed(1)) : 0;

  // Jours d'absence moyen
  const absenceLeaves = user.leaves.filter(
    (l) => l.type === "Absence" && l.status === "Approved"
  );
  const totalAbsenceDays = absenceLeaves.reduce(
    (sum, l) => sum + l.daysLeave,
    0
  );
  const absenceDaysAverage =
    businessDays > 0 ? Number((totalAbsenceDays / businessDays).toFixed(1)) : 0;

  return {
    personalAttendance,
    monthlyHours,
    arrivalDeparture,
    contractRate: { rate: contractRate },
    warningsByType,
    pauseAverage: { minutes: Math.round(avgBreakTime) },
    leaveDays: { average: leaveDaysAverage },
    absenceDays: { average: absenceDaysAverage },
  };
}

/**
 * Retourne les heures attendues selon le type de contrat
 */
function getExpectedHours(contractType) {
  switch (contractType) {
    case "H15":
      return 15;
    case "H35":
      return 35;
    case "H40":
      return 40;
    default:
      return 35;
  }
}
