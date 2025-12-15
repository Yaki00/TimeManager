const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addMonthlyLeaveGain() {
  try {
    console.log("Début de l'ajout des congés mensuels...");

    const users = await prisma.user.findMany({
      where: {
        deletedAt: null, // Exclure les utilisateurs supprimés
      },
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let updatedUsers = 0;

    for (const user of users) {
      const lastReset = user.lastMonthlyReset;
      let shouldUpdate = false;

      if (!lastReset) {
        // Premier ajout pour cet utilisateur
        shouldUpdate = true;
      } else {
        const lastMonth = lastReset.getMonth();
        const lastYear = lastReset.getFullYear();

        // Vérifier si c'est un nouveau mois
        if (lastMonth !== currentMonth || lastYear !== currentYear) {
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            totalPayeLeave: {
              increment: user.monthlyLeaveGain,
            },
            lastMonthlyReset: currentDate,
          },
        });

        updatedUsers++;
        console.log(
          `Utilisateur ${user.firstName} ${user.lastName}: +${
            user.monthlyLeaveGain
          } jours (total: ${
            Number(user.totalPayeLeave) + Number(user.monthlyLeaveGain)
          })`
        );
      }
    }

    console.log(`Terminé ! ${updatedUsers} utilisateurs mis à jour.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout des congés mensuels:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
addMonthlyLeaveGain();
