import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import { createTeam } from "../modules/team/service.js";

describe("Team Service", () => {
  let testUsers;

  beforeAll(async () => {
    // Créer des utilisateurs de test
    const pw = await bcrypt.hash("Secret123!", 10);

    testUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: "test-manager@example.com",
          password: pw,
          firstName: "Test",
          lastName: "Manager",
          role: "Manager",
          contractType: "H35",
          phoneNumber: "0600000001",
        },
      }),
      prisma.user.create({
        data: {
          email: "test-employee1@example.com",
          password: pw,
          firstName: "Test",
          lastName: "Employee1",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000002",
        },
      }),
      prisma.user.create({
        data: {
          email: "test-employee2@example.com",
          password: pw,
          firstName: "Test",
          lastName: "Employee2",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000003",
        },
      }),
    ]);
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await prisma.belongs.deleteMany({
      where: {
        user: {
          email: {
            in: testUsers.map((u) => u.email),
          },
        },
      },
    });
    await prisma.team.deleteMany({
      where: {
        owner: {
          email: {
            in: testUsers.map((u) => u.email),
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers.map((u) => u.email),
        },
      },
    });
  });

  it("should create team with members", async () => {
    const [manager, employee1, employee2] = testUsers;

    const teamData = {
      teamName: "Test Team",
      description: "Test team description",
      ownerId: manager.id,
      members: [
        { userId: employee1.id, isLead: false },
        { userId: employee2.id, isLead: true },
      ],
    };

    const team = await createTeam(teamData);

    expect(team).toBeDefined();
    expect(team.teamName).toBe("Test Team");
    expect(team.description).toBe("Test team description");
    expect(team.ownerId).toBe(manager.id);
    expect(team.members).toHaveLength(3); // owner + 2 members

    // Vérifier que le propriétaire est bien ajouté comme membre avec isLead: true
    const ownerMember = team.members.find((m) => m.user.id === manager.id);
    expect(ownerMember).toBeDefined();
    expect(ownerMember.isLead).toBe(true);

    // Vérifier que les autres membres sont ajoutés
    const employee1Member = team.members.find(
      (m) => m.user.id === employee1.id
    );
    expect(employee1Member).toBeDefined();
    expect(employee1Member.isLead).toBe(false);

    const employee2Member = team.members.find(
      (m) => m.user.id === employee2.id
    );
    expect(employee2Member).toBeDefined();
    expect(employee2Member.isLead).toBe(true);
  });

  it("should create team without members", async () => {
    const [manager] = testUsers;

    const teamData = {
      teamName: "Test Team No Members",
      description: "Test team without members",
      ownerId: manager.id,
      // Pas de propriété members
    };

    const team = await createTeam(teamData);

    expect(team).toBeDefined();
    expect(team.teamName).toBe("Test Team No Members");
    expect(team.description).toBe("Test team without members");
    expect(team.ownerId).toBe(manager.id);
    expect(team.members).toHaveLength(1); // Seulement le propriétaire

    // Vérifier que le propriétaire est bien ajouté comme membre avec isLead: true
    const ownerMember = team.members.find((m) => m.user.id === manager.id);
    expect(ownerMember).toBeDefined();
    expect(ownerMember.isLead).toBe(true);
  });

  it("should create team with empty members array", async () => {
    const [manager] = testUsers;

    const teamData = {
      teamName: "Test Team Empty Members",
      description: "Test team with empty members array",
      ownerId: manager.id,
      members: [], // Tableau vide
    };

    const team = await createTeam(teamData);

    expect(team).toBeDefined();
    expect(team.teamName).toBe("Test Team Empty Members");
    expect(team.description).toBe("Test team with empty members array");
    expect(team.ownerId).toBe(manager.id);
    expect(team.members).toHaveLength(1); // Seulement le propriétaire

    // Vérifier que le propriétaire est bien ajouté comme membre avec isLead: true
    const ownerMember = team.members.find((m) => m.user.id === manager.id);
    expect(ownerMember).toBeDefined();
    expect(ownerMember.isLead).toBe(true);
  });
});
