import prisma from "../../db.js";

const teamSelect = {
  id: true,
  teamName: true,
  description: true,
  ownerId: true,
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phoneNumber: true,
      contractType: true,
    },
  },
  members: {
    select: {
      joinedAt: true,
      isLead: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          phoneNumber: true,
          contractType: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
};

export async function createTeam(data) {
  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        teamName: data.teamName,
        description: data.description,
        owner: { connect: { id: data.ownerId } },
      },
    });

    const membersToAdd = [
      { teamId: team.id, userId: data.ownerId, isLead: true },
      ...(data.members || []).map((member) => ({
        teamId: team.id,
        userId: member.userId,
        isLead: !!member.isLead,
      })),
    ];
    await tx.belongs.createMany({
      data: membersToAdd,
      skipDuplicates: true,
    });
    return tx.team.findUnique({
      where: { id: team.id },
      select: teamSelect,
    });
  });
}

export async function findTeamById(id) {
  return prisma.team.findUnique({
    where: { id },
    select: teamSelect,
  });
}

export async function findAllTeams({ skip = 0, take = 50 } = {}) {
  return prisma.team.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: teamSelect,
  });
}

export async function findTeamsByOwnerId(ownerId) {
  return prisma.team.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: teamSelect,
  });
}

export async function updateTeamById(id, data) {
  return prisma.$transaction(async (tx) => {
    // Mettre à jour les informations de base de l'équipe
    const teamData = { ...data };
    delete teamData.members; // Retirer les membres du data de mise à jour de l'équipe

    const updatedTeam = await tx.team.update({
      where: { id },
      data: teamData,
    });

    // Si des membres sont fournis, les gérer
    if (data.members !== undefined) {
      // Supprimer tous les membres existants
      await tx.belongs.deleteMany({
        where: { teamId: id },
      });

      // Ajouter les nouveaux membres (si il y en a)
      if (data.members.length > 0) {
        const membersToAdd = data.members.map((member) => ({
          teamId: id,
          userId: member.userId,
          isLead: member.isLead,
        }));

        await tx.belongs.createMany({
          data: membersToAdd,
          skipDuplicates: true,
        });
      }
    }

    // Retourner l'équipe avec ses membres
    return tx.team.findUnique({
      where: { id },
      select: teamSelect,
    });
  });
}

export async function deleteTeamById(id) {
  return prisma.team.delete({
    where: { id },
    select: teamSelect,
  });
}
