import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient();

// Préfixe pour identifier les données mockées
const MOCK_PREFIX = "mock_";
const DEFAULT_PASSWORD = "password123";
const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

// Données de prénom et nom pour générer des noms réalistes
const FIRST_NAMES = [
  "Jean",
  "Marie",
  "Pierre",
  "Sophie",
  "Paul",
  "Julie",
  "Luc",
  "Camille",
  "Antoine",
  "Emma",
  "Thomas",
  "Léa",
  "Nicolas",
  "Chloé",
  "Alexandre",
  "Manon",
  "David",
  "Sarah",
  "Julien",
  "Laura",
  "Maxime",
  "Clara",
  "Vincent",
  "Élise",
  "Romain",
  "Anaïs",
  "Sébastien",
  "Marion",
  "Guillaume",
  "Amélie",
  "Fabien",
  "Pauline",
  "Olivier",
  "Céline",
  "François",
  "Audrey",
  "Jérôme",
  "Caroline",
  "Benoît",
  "Émilie",
];

const LAST_NAMES = [
  "Martin",
  "Bernard",
  "Dubois",
  "Thomas",
  "Robert",
  "Richard",
  "Petit",
  "Durand",
  "Leroy",
  "Moreau",
  "Simon",
  "Laurent",
  "Lefebvre",
  "Michel",
  "Garcia",
  "David",
  "Bertrand",
  "Roux",
  "Vincent",
  "Fournier",
  "Morel",
  "Girard",
  "André",
  "Lefevre",
  "Mercier",
  "Dupont",
  "Lambert",
  "Bonnet",
  "François",
  "Martinez",
  "Legrand",
  "Garnier",
  "Faure",
  "Rousseau",
  "Blanc",
  "Guerin",
  "Muller",
  "Henry",
  "Roussel",
  "Nicolas",
];

const ROLES = ["Employer", "Manager", "Responsable"];
const CONTRACT_TYPES = ["H15", "H35", "H40"];

// Générer un email unique
function generateEmail(index) {
  return `${MOCK_PREFIX}user${index}@example.com`;
}

// Générer un numéro de téléphone
function generatePhoneNumber() {
  const prefix = ["06", "07"][Math.floor(Math.random() * 2)];
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${number}`;
}

// Générer un nom aléatoire
function generateName() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return { firstName, lastName };
}

// Générer une URL d'avatar
function generateAvatarUrl(firstName, lastName) {
  // Utilise DiceBear API pour générer des avatars aléatoires
  const styles = ["avataaars", "bottts", "micah", "personas", "initials"];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seed = `${firstName}-${lastName}`.toLowerCase();
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

// Générer une date aléatoire dans le passé
function generatePastDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

// Créer un utilisateur mock
async function createMockUser(index) {
  const { firstName, lastName } = generateName();
  const email = generateEmail(index);
  const phoneNumber = generatePhoneNumber();
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  const contractType =
    CONTRACT_TYPES[Math.floor(Math.random() * CONTRACT_TYPES.length)];

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, ROUNDS);
  const avatarUrl = generateAvatarUrl(firstName, lastName);

  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      firstName,
      lastName,
      phoneNumber,
      role,
      contractType,
      avatarUrl,
      totalWarningPoints: Math.floor(Math.random() * 5), // Entre 0 et 4 points
      totalPayeLeave: Math.floor(Math.random() * 20) + 5, // Entre 5 et 25 jours
      totalRemote: Math.floor(Math.random() * 3), // Entre 0 et 2
      weeklyLeaveLimit: Math.floor(Math.random() * 2) + 2, // Entre 2 et 3
      lastWeekReset: generatePastDate(7),
      monthlyLeaveGain: (Math.random() * 3 + 1.5).toFixed(1), // Entre 1.5 et 4.5
      lastMonthlyReset: generatePastDate(30),
    },
  });
}

// Créer une équipe mock
async function createMockTeam(ownerId, index) {
  const teamNames = [
    "Équipe Développement",
    "Équipe Marketing",
    "Équipe Ventes",
    "Équipe Support",
    "Équipe Design",
    "Équipe RH",
    "Équipe Finance",
    "Équipe Production",
  ];

  const teamName = `${
    teamNames[Math.floor(Math.random() * teamNames.length)]
  } ${index}`;
  const descriptions = [
    "Équipe dédiée au développement de produits innovants",
    "Équipe chargée de la stratégie marketing et communication",
    "Équipe commerciale pour le développement des ventes",
    "Équipe support client et assistance technique",
  ];

  const description =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  return prisma.team.create({
    data: {
      teamName,
      description,
      ownerId,
    },
  });
}

// Créer des congés mock
async function createMockLeaves(userId, count = 3) {
  const leaves = [];
  const now = new Date();

  // S'assurer que tous les types de congés et statuts sont représentés
  const statuses = ["Pending", "Approved", "Refused"];
  const types = ["Absence", "PaidLeave", "Training", "Remote"];

  for (let i = 0; i < count; i++) {
    const startDate = new Date(now);
    // Étaler les congés sur les 6 derniers mois et 3 mois à venir
    startDate.setDate(
      startDate.getDate() + Math.floor(Math.random() * 270) - 180
    ); // Entre -180 et +90 jours

    const duration = Math.floor(Math.random() * 5) + 1; // Entre 1 et 5 jours
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    // Garantir la diversité des types et statuts
    const type =
      i < types.length
        ? types[i]
        : types[Math.floor(Math.random() * types.length)];
    const status =
      i < statuses.length
        ? statuses[i]
        : statuses[Math.floor(Math.random() * statuses.length)];

    const justifications = {
      PaidLeave: "Congé payé pour vacances",
      Absence: "Absence pour raisons personnelles",
      Training: "Formation professionnelle",
      Remote: "Télétravail pour raisons de santé",
    };

    const leave = await prisma.leave.create({
      data: {
        userId,
        startDate,
        endDate,
        daysLeave: duration,
        justification: justifications[type] || `Congé mock ${i + 1}`,
        status,
        type,
      },
    });

    leaves.push(leave);
  }

  return leaves;
}

// Créer des pointages mock
async function createMockClockings(userId, count = 60) {
  const clockings = [];
  const now = new Date();
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Générer des pointages sur les 6 derniers mois (environ 120 jours ouvrables)
  let daysBack = 0;
  let clockingsCreated = 0;

  while (clockingsCreated < count && daysBack < 180) {
    const clockingDate = new Date(now);
    clockingDate.setDate(clockingDate.getDate() - daysBack);

    const dayOfWeek = clockingDate.getDay();

    // Ne pas générer de pointages pour le weekend (sauf rare exception)
    if ((dayOfWeek !== 0 && dayOfWeek !== 6) || Math.random() > 0.95) {
      const weekDay = weekDays[(dayOfWeek + 6) % 7]; // Ajuster pour que Lundi = 0

      // Génère des heures de travail réalistes avec variabilité
      const startHour = 7 + Math.floor(Math.random() * 3); // Entre 7h et 9h
      const startMinute = Math.floor(Math.random() * 60);
      const firstArrival = new Date(1970, 0, 1, startHour, startMinute);

      const workDuration = 6.5 + Math.random() * 4; // Entre 6.5h et 10.5h
      const endHour = startHour + Math.floor(workDuration);
      const endMinute = startMinute + Math.floor((workDuration % 1) * 60);
      const lastDeparture = new Date(1970, 0, 1, endHour, endMinute);

      const workTimeMinutes = Math.floor(workDuration * 60);
      const breakTime = 15 + Math.floor(Math.random() * 60); // Entre 15 et 75 min
      const totalHours = ((workTimeMinutes - breakTime) / 60).toFixed(2);

      const clocking = await prisma.clocking.create({
        data: {
          userId,
          clockingDate,
          firstArrival,
          lastDeparture,
          workTime: workTimeMinutes,
          breakTime,
          totalHours,
          weekDay,
        },
      });

      clockings.push(clocking);
      clockingsCreated++;
    }

    daysBack++;
  }

  return clockings;
}

// Créer des avertissements mock
async function createMockWarnings(userId, createdById, count = 3) {
  const warnings = [];
  const statuses = ["Alert", "Late", "UnjustifiedAbsence"];
  const descriptionsByStatus = {
    Late: [
      "Retard de 15 minutes sans justification",
      "Retard de 30 minutes - transport en retard",
      "Retard répété cette semaine",
      "Arrivée tardive sans prévenir",
    ],
    UnjustifiedAbsence: [
      "Absence injustifiée d'une journée",
      "Absence sans prévenir le manager",
      "Absence non justifiée documentée",
      "Journée d'absence non déclarée",
    ],
    Alert: [
      "Comportement inapproprié en réunion",
      "Non-respect des règles de sécurité",
      "Manquement aux procédures internes",
      "Alerte sur la qualité du travail",
    ],
  };

  for (let i = 0; i < count; i++) {
    // Étaler les warnings sur les 6 derniers mois
    const date = generatePastDate(180);

    // Garantir que tous les types de warnings sont représentés
    const status =
      i < statuses.length
        ? statuses[i]
        : statuses[Math.floor(Math.random() * statuses.length)];

    const statusDescriptions = descriptionsByStatus[status];
    const description =
      statusDescriptions[Math.floor(Math.random() * statusDescriptions.length)];

    const warning = await prisma.warning.create({
      data: {
        userId,
        createdById,
        status,
        description,
        date,
      },
    });

    warnings.push(warning);
  }

  return warnings;
}

// Créer des notifications mock
async function createMockNotifications(userIds, count = 5) {
  const notifications = [];
  const statuses = ["Present", "Late", "Warning"];

  const notificationTemplates = [
    {
      status: "Present",
      title: "Pointage validé",
      message: "Votre pointage d'aujourd'hui a été enregistré avec succès",
    },
    {
      status: "Present",
      title: "Rappel de pointage",
      message: "N'oubliez pas de pointer votre départ en fin de journée",
    },
    {
      status: "Late",
      title: "Retard signalé",
      message: "Un retard a été enregistré sur votre pointage du jour",
    },
    {
      status: "Late",
      title: "Alerte horaire",
      message: "Vous avez dépassé l'horaire prévu sans justification",
    },
    {
      status: "Warning",
      title: "Avertissement reçu",
      message:
        "Un avertissement a été ajouté à votre dossier. Veuillez consulter les détails.",
    },
    {
      status: "Warning",
      title: "Alerte importante",
      message:
        "Votre manager souhaite vous rencontrer concernant votre présence",
    },
    {
      status: "Present",
      title: "Validation de congé",
      message: "Votre demande de congé a été approuvée par votre manager",
    },
    {
      status: "Warning",
      title: "Congé refusé",
      message:
        "Votre demande de congé a été refusée. Contactez votre manager pour plus d'informations.",
    },
    {
      status: "Present",
      title: "Réunion d'équipe",
      message: "Réunion d'équipe prévue demain à 10h en salle de conférence",
    },
    {
      status: "Present",
      title: "Mise à jour",
      message:
        "Nouvelles directives disponibles sur l'intranet de l'entreprise",
    },
  ];

  for (let i = 0; i < count; i++) {
    // Étaler les notifications sur les 2 derniers mois
    const date = generatePastDate(60);

    const template = notificationTemplates[i % notificationTemplates.length];

    const notification = await prisma.notification.create({
      data: {
        title: template.title,
        message: template.message,
        status: template.status,
        date,
        isRead: Math.random() > 0.4, // 60% de chances d'être lues
      },
    });

    // Assigner la notification à des utilisateurs aléatoires (1 à 8 personnes)
    const numReceivers = Math.floor(Math.random() * 8) + 1;
    const receivers = userIds
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(numReceivers, userIds.length));

    for (const receiverId of receivers) {
      await prisma.receive.create({
        data: {
          userId: receiverId,
          notificationId: notification.id,
        },
      });
    }

    notifications.push(notification);
  }

  return notifications;
}

// Fonction principale
async function generateMockData() {
  try {
    const args = process.argv.slice(2);
    const userCount = parseInt(args[0]) || 50; // Par défaut 50 utilisateurs
    const teamCount = parseInt(args[1]) || 10; // Par défaut 10 équipes
    const leavesPerUser = parseInt(args[2]) || 3; // Par défaut 3 congés par utilisateur

    console.log(`Génération de données mockées...`);
    console.log(`   - Utilisateurs: ${userCount}`);
    console.log(`   - Équipes: ${teamCount}`);
    console.log(`   - Congés par utilisateur: ${leavesPerUser}`);
    console.log(`   - Préfixe email: ${MOCK_PREFIX}`);
    console.log(`   - Mot de passe par défaut: ${DEFAULT_PASSWORD}\n`);

    // Vérifier s'il existe déjà des données mockées
    const existingMocks = await prisma.user.count({
      where: {
        email: {
          startsWith: MOCK_PREFIX,
        },
      },
    });

    if (existingMocks > 0) {
      console.log(
        `Attention: ${existingMocks} utilisateurs mockés existent déjà.`
      );
      console.log(
        `   Utilisez le script deleteMockData.js pour les supprimer d'abord.\n`
      );
    }

    // Créer les utilisateurs
    console.log("Création des utilisateurs...");
    const users = [];
    for (let i = 0; i < userCount; i++) {
      const user = await createMockUser(i + existingMocks);
      users.push(user);
      if ((i + 1) % 10 === 0) {
        console.log(`   ${i + 1}/${userCount} utilisateurs créés`);
      }
    }
    console.log(`${users.length} utilisateurs créés\n`);

    // Créer les équipes
    console.log("Création des équipes...");
    const teams = [];
    const managers = users.filter(
      (u) => u.role === "Manager" || u.role === "Responsable"
    );
    const employers = users.filter((u) => u.role === "Employer");

    // S'assurer qu'il y a suffisamment d'équipes pour les managers
    const teamsToCreate = Math.max(
      Math.min(teamCount, managers.length),
      Math.ceil(employers.length / 5)
    );

    for (let i = 0; i < teamsToCreate; i++) {
      const owner = managers[i % managers.length];
      const team = await createMockTeam(owner.id, i + 1);
      teams.push(team);
    }
    console.log(`${teams.length} équipes créées\n`);

    // Assigner les membres aux équipes
    console.log("Assignation des membres aux équipes...");
    const usersWithoutTeam = [...employers];
    const userTeamCount = new Map(); // Pour suivre le nombre d'équipes par utilisateur

    // Initialiser le compteur
    employers.forEach((emp) => userTeamCount.set(emp.id, 0));

    // Première passe : s'assurer que chaque employer a au moins une équipe
    for (const employer of employers) {
      const randomTeam = teams[Math.floor(Math.random() * teams.length)];
      await prisma.belongs.create({
        data: {
          teamId: randomTeam.id,
          userId: employer.id,
          isLead: Math.random() > 0.8, // 20% de chance d'être lead
        },
      });
      userTeamCount.set(employer.id, 1);
    }

    // Deuxième passe : ajouter des membres supplémentaires aux équipes
    for (const team of teams) {
      const additionalMembers = Math.floor(Math.random() * 3); // 0 à 2 membres supplémentaires

      for (let j = 0; j < additionalMembers; j++) {
        const availableUsers = users.filter(
          (u) =>
            u.id !== team.ownerId &&
            (userTeamCount.get(u.id) || 0) < 3 && // Max 3 équipes par personne
            u.role === "Employer"
        );

        if (availableUsers.length > 0) {
          const member =
            availableUsers[Math.floor(Math.random() * availableUsers.length)];

          // Vérifier si l'utilisateur n'est pas déjà dans cette équipe
          const existingBelong = await prisma.belongs.findUnique({
            where: {
              teamId_userId: {
                teamId: team.id,
                userId: member.id,
              },
            },
          });

          if (!existingBelong) {
            await prisma.belongs.create({
              data: {
                teamId: team.id,
                userId: member.id,
                isLead: Math.random() > 0.8,
              },
            });
            userTeamCount.set(
              member.id,
              (userTeamCount.get(member.id) || 0) + 1
            );
          }
        }
      }
    }

    // Afficher un résumé des équipes
    for (const team of teams) {
      const memberCount = await prisma.belongs.count({
        where: { teamId: team.id },
      });
      console.log(`   Équipe "${team.teamName}" avec ${memberCount} membres`);
    }
    console.log("Assignation terminée\n");

    // Créer les congés (avec diversité des types et statuts)
    console.log("Création des congés...");
    let totalLeaves = 0;
    for (const user of users) {
      // S'assurer qu'il y a au moins 4 congés pour avoir tous les types
      const leavesCount = Math.max(leavesPerUser, 4);
      const leaves = await createMockLeaves(user.id, leavesCount);
      totalLeaves += leaves.length;
    }
    console.log(`${totalLeaves} congés créés\n`);

    // Créer les pointages (sur les 6 derniers mois)
    console.log("Création des pointages (6 derniers mois)...");
    let totalClockings = 0;
    for (const user of users) {
      // Générer entre 40 et 80 pointages par utilisateur (simule une présence variable)
      const clockingsCount = Math.floor(Math.random() * 40) + 40;
      const clockings = await createMockClockings(user.id, clockingsCount);
      totalClockings += clockings.length;

      if ((users.indexOf(user) + 1) % 10 === 0) {
        console.log(
          `   ${users.indexOf(user) + 1}/${users.length} utilisateurs traités`
        );
      }
    }
    console.log(`${totalClockings} pointages créés\n`);

    // Créer les avertissements
    console.log("Création des avertissements...");
    let totalWarnings = 0;
    const responsables = users.filter((u) => u.role === "Responsable");

    if (responsables.length === 0) {
      console.log("   Aucun responsable trouvé, avertissements non créés\n");
    } else {
      for (const user of users) {
        // ~50% des utilisateurs non-responsables ont des avertissements
        if (Math.random() > 0.5 && user.role !== "Responsable") {
          // 1 à 4 avertissements pour avoir tous les types représentés
          const warningsCount = Math.floor(Math.random() * 3) + 1;
          const createdBy =
            responsables[Math.floor(Math.random() * responsables.length)].id;

          const warnings = await createMockWarnings(
            user.id,
            createdBy,
            warningsCount
          );
          totalWarnings += warnings.length;
        }
      }
      console.log(`${totalWarnings} avertissements créés\n`);
    }

    // Créer les notifications (tous types de statuts)
    console.log("Création des notifications...");
    const userIds = users.map((u) => u.id);
    // Créer au moins 10 notifications pour couvrir tous les types
    const notificationsCount = Math.max(Math.floor(users.length * 0.8), 10);
    const notifications = await createMockNotifications(
      userIds,
      notificationsCount
    );
    console.log(`${notifications.length} notifications créées\n`);

    console.log("Génération terminée avec succès !");
    console.log(`\nRésumé:`);
    console.log(`   - ${users.length} utilisateurs créés`);
    console.log(`   - ${teams.length} équipes créées`);
    console.log(`   - ${totalLeaves} congés créés`);
    console.log(`   - ${totalClockings} pointages créés`);
    console.log(`   - ${totalWarnings} avertissements créés`);
    console.log(`   - ${notifications.length} notifications créées`);
    console.log(`\nPour vous connecter, utilisez:`);
    console.log(`   Email: ${MOCK_PREFIX}user0@example.com`);
    console.log(`   Mot de passe: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    console.error("Erreur lors de la génération des données mockées:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
generateMockData();
