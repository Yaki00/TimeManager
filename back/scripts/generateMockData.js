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

// Créer un utilisateur mock
async function createMockUser(index) {
  const { firstName, lastName } = generateName();
  const email = generateEmail(index);
  const phoneNumber = generatePhoneNumber();
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  const contractType =
    CONTRACT_TYPES[Math.floor(Math.random() * CONTRACT_TYPES.length)];

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, ROUNDS);

  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      firstName,
      lastName,
      phoneNumber,
      role,
      contractType,
      totalPayeLeave: Math.floor(Math.random() * 20) + 5, // Entre 5 et 25 jours
      totalRemote: Math.floor(Math.random() * 3), // Entre 0 et 2
      monthlyLeaveGain: Math.floor(Math.random() * 3) + 1.5, // Entre 1.5 et 4.5
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

  for (let i = 0; i < count; i++) {
    const startDate = new Date(now);
    startDate.setDate(
      startDate.getDate() + Math.floor(Math.random() * 180) - 90
    ); // Entre -90 et +90 jours

    const duration = Math.floor(Math.random() * 5) + 1; // Entre 1 et 5 jours
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    const statuses = ["Pending", "Approved", "Refused"];
    const types = ["Absence", "PaidLeave", "Training", "Remote"];

    const leave = await prisma.leave.create({
      data: {
        userId,
        startDate,
        endDate,
        daysLeave: duration,
        justification: `Congé mock ${i + 1} - ${
          types[Math.floor(Math.random() * types.length)]
        }`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: types[Math.floor(Math.random() * types.length)],
      },
    });

    leaves.push(leave);
  }

  return leaves;
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

    for (let i = 0; i < Math.min(teamCount, managers.length); i++) {
      const owner = managers[i];
      const team = await createMockTeam(owner.id, i + 1);
      teams.push(team);

      // Ajouter des membres à l'équipe
      const membersToAdd = users
        .filter((u) => u.id !== owner.id)
        .slice(0, Math.floor(Math.random() * 5) + 2); // Entre 2 et 6 membres

      for (const member of membersToAdd) {
        await prisma.belongs.create({
          data: {
            teamId: team.id,
            userId: member.id,
            isLead: Math.random() > 0.8, // 20% de chance d'être lead
          },
        });
      }

      console.log(
        `   Équipe "${team.teamName}" créée avec ${membersToAdd.length} membres`
      );
    }
    console.log(`${teams.length} équipes créées\n`);

    // Créer les congés
    console.log("Création des congés...");
    let totalLeaves = 0;
    for (const user of users) {
      const leaves = await createMockLeaves(user.id, leavesPerUser);
      totalLeaves += leaves.length;
    }
    console.log(`${totalLeaves} congés créés\n`);

    console.log("Génération terminée avec succès !");
    console.log(`\nRésumé:`);
    console.log(`   - ${users.length} utilisateurs créés`);
    console.log(`   - ${teams.length} équipes créées`);
    console.log(`   - ${totalLeaves} congés créés`);
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
