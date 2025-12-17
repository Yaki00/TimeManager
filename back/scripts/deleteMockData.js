import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

// Préfixe pour identifier les données mockées (doit correspondre à generateMockData.js)
const MOCK_PREFIX = "mock_";

// Fonction principale
async function deleteMockData() {
  try {
    console.log(`Suppression des données mockées...`);
    console.log(`   Préfixe email: ${MOCK_PREFIX}\n`);

    // Trouver tous les utilisateurs mockés
    const mockUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: MOCK_PREFIX,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (mockUsers.length === 0) {
      console.log("Aucune donnée mockée trouvée.");
      await prisma.$disconnect();
      return;
    }

    console.log(`${mockUsers.length} utilisateurs mockés trouvés.\n`);

    // Demander confirmation (en mode non-interactif, on supprime directement)
    const args = process.argv.slice(2);
    const force = args.includes("--force") || args.includes("-f");

    if (!force) {
      console.log("Cette opération va supprimer toutes les données mockées.");
      console.log(
        "   Utilisez --force ou -f pour supprimer sans confirmation.\n"
      );
      console.log("   Exemple: node scripts/deleteMockData.js --force\n");
      await prisma.$disconnect();
      return;
    }

    console.log("Suppression en cours...\n");

    // Supprimer les équipes appartenant aux utilisateurs mockés
    const mockUserIds = mockUsers.map((u) => u.id);

    // Trouver les équipes dont le propriétaire est un utilisateur mocké
    const mockTeams = await prisma.team.findMany({
      where: {
        ownerId: {
          in: mockUserIds,
        },
      },
    });

    if (mockTeams.length > 0) {
      console.log(`   Suppression de ${mockTeams.length} équipes...`);
      // Supprimer les relations Belongs pour ces équipes
      await prisma.belongs.deleteMany({
        where: {
          teamId: {
            in: mockTeams.map((t) => t.id),
          },
        },
      });
      // Supprimer les équipes
      await prisma.team.deleteMany({
        where: {
          id: {
            in: mockTeams.map((t) => t.id),
          },
        },
      });
      console.log(`   ${mockTeams.length} équipes supprimées`);
    }

    // Supprimer les relations Belongs des utilisateurs mockés
    const belongsCount = await prisma.belongs.count({
      where: {
        userId: {
          in: mockUserIds,
        },
      },
    });
    if (belongsCount > 0) {
      await prisma.belongs.deleteMany({
        where: {
          userId: {
            in: mockUserIds,
          },
        },
      });
      console.log(`   ${belongsCount} relations d'appartenance supprimées`);
    }

    // Supprimer les congés des utilisateurs mockés
    const leavesCount = await prisma.leave.count({
      where: {
        userId: {
          in: mockUserIds,
        },
      },
    });
    if (leavesCount > 0) {
      await prisma.leave.deleteMany({
        where: {
          userId: {
            in: mockUserIds,
          },
        },
      });
      console.log(`   ${leavesCount} congés supprimés`);
    }

    // Supprimer les pointages des utilisateurs mockés
    const clockingsCount = await prisma.clocking.count({
      where: {
        userId: {
          in: mockUserIds,
        },
      },
    });
    if (clockingsCount > 0) {
      await prisma.clocking.deleteMany({
        where: {
          userId: {
            in: mockUserIds,
          },
        },
      });
      console.log(`   ${clockingsCount} pointages supprimés`);
    }

    // Supprimer les avertissements des utilisateurs mockés
    const warningsCount = await prisma.warning.count({
      where: {
        OR: [
          {
            userId: {
              in: mockUserIds,
            },
          },
          {
            createdById: {
              in: mockUserIds,
            },
          },
        ],
      },
    });
    if (warningsCount > 0) {
      await prisma.warning.deleteMany({
        where: {
          OR: [
            {
              userId: {
                in: mockUserIds,
              },
            },
            {
              createdById: {
                in: mockUserIds,
              },
            },
          ],
        },
      });
      console.log(`   ${warningsCount} avertissements supprimés`);
    }

    // Supprimer les relations Receive des utilisateurs mockés
    const receivesCount = await prisma.receive.count({
      where: {
        userId: {
          in: mockUserIds,
        },
      },
    });
    if (receivesCount > 0) {
      await prisma.receive.deleteMany({
        where: {
          userId: {
            in: mockUserIds,
          },
        },
      });
      console.log(`   ${receivesCount} relations de notifications supprimées`);
    }

    // Supprimer les notifications qui n'ont plus de destinataires
    const orphanNotifications = await prisma.notification.findMany({
      include: {
        receivers: true,
      },
    });

    const notificationsToDelete = orphanNotifications
      .filter((n) => n.receivers.length === 0)
      .map((n) => n.id);

    if (notificationsToDelete.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          id: {
            in: notificationsToDelete,
          },
        },
      });
      console.log(
        `   ${notificationsToDelete.length} notifications orphelines supprimées`
      );
    }

    // Enfin, supprimer les utilisateurs mockés
    console.log(`   Suppression de ${mockUsers.length} utilisateurs...`);
    await prisma.user.deleteMany({
      where: {
        id: {
          in: mockUserIds,
        },
      },
    });
    console.log(`   ${mockUsers.length} utilisateurs supprimés\n`);

    console.log("Suppression terminée avec succès !");
    console.log(`\nRésumé:`);
    console.log(`   - ${mockUsers.length} utilisateurs supprimés`);
    if (mockTeams.length > 0)
      console.log(`   - ${mockTeams.length} équipes supprimées`);
    if (leavesCount > 0) console.log(`   - ${leavesCount} congés supprimés`);
    if (clockingsCount > 0)
      console.log(`   - ${clockingsCount} pointages supprimés`);
    if (warningsCount > 0)
      console.log(`   - ${warningsCount} avertissements supprimés`);
  } catch (error) {
    console.error("Erreur lors de la suppression des données mockées:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
deleteMockData();
