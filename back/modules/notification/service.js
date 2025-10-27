import prisma from "../../db.js";

/**
 * Service de gestion des notifications
 *
 * Le système de notifications permet :
 * - Aux Managers et Responsables de créer des notifications manuellement
 * - La création automatique de notifications pour les demandes de congé
 * - La gestion des notifications lues/non lues via la table Receive
 *
 * Règles importantes :
 * - Une notification peut avoir plusieurs destinataires (relation many-to-many via Receive)
 * - Le statut "lue" est déterminé par updatedAt == createdAt dans Receive
 * - Les notifications automatiques sont créées par utils.js (congés, avertissements)
 *
 * @module Notification Service
 */

/**
 * Champs à sélectionner pour les requêtes de notifications
 * Inclut les informations sur les destinataires et leurs données utilisateur
 */
const notificationSelect = {
  id: true,
  message: true,
  title: true,
  status: true,
  date: true,
  createdAt: true,
  updatedAt: true,
  receivers: {
    select: {
      userId: true,
      createdAt: true,
      updatedAt: true,
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
};

/**
 * Créer une notification avec ses destinataires
 * @param {Object} data - Données de la notification
 * @param {string} data.title - Titre de la notification
 * @param {string} data.message - Message de la notification
 * @param {string} data.status - Statut (Present, Late, Warning)
 * @param {Date|string} data.date - Date de la notification
 * @param {Array<number>} data.receiverIds - IDs des destinataires
 * @returns {Promise<Object>} La notification créée avec ses destinataires
 */
export async function createNotification(data) {
  return prisma.$transaction(async (tx) => {
    // Créer la notification
    const notification = await tx.notification.create({
      data: {
        message: data.message,
        title: data.title,
        status: data.status,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    // Ajouter les destinataires si fournis
    if (data.receiverIds && data.receiverIds.length > 0) {
      await tx.receive.createMany({
        data: data.receiverIds.map((userId) => ({
          userId,
          notificationId: notification.id,
        })),
        skipDuplicates: true,
      });
    }

    return tx.notification.findUnique({
      where: { id: notification.id },
      select: notificationSelect,
    });
  });
}

export async function findNotificationById(id) {
  return prisma.notification.findUnique({
    where: { id },
    select: notificationSelect,
  });
}

export async function findAllNotifications({ skip = 0, take = 50 } = {}) {
  return prisma.notification.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: notificationSelect,
  });
}

export async function findNotificationsByStatus(
  status,
  { skip = 0, take = 50 } = {}
) {
  return prisma.notification.findMany({
    where: { status },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: notificationSelect,
  });
}

export async function findNotificationsByUserId(
  userId,
  { skip = 0, take = 50 } = {}
) {
  return prisma.notification.findMany({
    where: {
      receivers: {
        some: {
          userId,
        },
      },
    },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: notificationSelect,
  });
}

/**
 * Récupérer les notifications non lues d'un utilisateur
 * Une notification est considérée comme non lue si createdAt == updatedAt dans Receive
 * (signifie qu'elle n'a jamais été "marquée comme lue" par l'utilisateur)
 *
 * Note: Cette méthode filtre côté serveur car elle nécessite de vérifier la relation Receive
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} pagination - Paramètres de pagination {skip, take}
 * @returns {Promise<Array>} Tableau des notifications non lues
 */
export async function findUnreadNotificationsByUserId(
  userId,
  { skip = 0, take = 50 } = {}
) {
  // Récupérer toutes les notifications de l'utilisateur
  const allNotifications = await prisma.notification.findMany({
    where: {
      receivers: {
        some: {
          userId,
        },
      },
    },
    select: notificationSelect,
  });

  // Filtrer pour obtenir uniquement les non lues
  // Une notification est considérée comme non lue si created == updated dans Receive
  const unreadNotifications = allNotifications.filter((notification) => {
    const receive = notification.receivers.find((r) => r.userId === userId);
    if (!receive) return false;
    // Si la notification a été modifiée récemment, elle est considérée comme lue
    // Sinon elle est non lue
    return receive.updatedAt.getTime() === receive.createdAt.getTime();
  });

  // Appliquer la pagination manuellement
  const paginated = unreadNotifications.slice(skip, skip + take);

  return paginated;
}

export async function updateNotificationById(id, data) {
  return prisma.$transaction(async (tx) => {
    // Mettre à jour la notification
    const updateData = {};
    if (data.message !== undefined) updateData.message = data.message;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.date !== undefined) updateData.date = new Date(data.date);

    await tx.notification.update({
      where: { id },
      data: updateData,
    });

    // Mettre à jour les destinataires si fournis
    if (data.receiverIds !== undefined) {
      // Supprimer tous les destinataires existants
      await tx.receive.deleteMany({
        where: { notificationId: id },
      });

      // Ajouter les nouveaux destinataires
      if (data.receiverIds.length > 0) {
        await tx.receive.createMany({
          data: data.receiverIds.map((userId) => ({
            userId,
            notificationId: id,
          })),
          skipDuplicates: true,
        });
      }
    }

    return tx.notification.findUnique({
      where: { id },
      select: notificationSelect,
    });
  });
}

/**
 * Marquer une notification comme lue pour un utilisateur
 * Met à jour le champ updatedAt du Receive pour cette paire notification/ utilisateur
 * @param {number} notificationId - ID de la notification
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object>} L'entrée Receive mise à jour
 */
export async function markNotificationAsRead(notificationId, userId) {
  return prisma.receive.update({
    where: {
      userId_notificationId: {
        userId,
        notificationId,
      },
    },
    data: {
      updatedAt: new Date(),
    },
  });
}

export async function deleteNotificationById(id) {
  return prisma.notification.delete({
    where: { id },
    select: notificationSelect,
  });
}

export async function countNotifications() {
  return prisma.notification.count();
}

export async function countNotificationsByStatus(status) {
  return prisma.notification.count({
    where: { status },
  });
}

export async function countNotificationsByUserId(userId) {
  return prisma.notification.count({
    where: {
      receivers: {
        some: {
          userId,
        },
      },
    },
  });
}

export async function countUnreadNotificationsByUserId(userId) {
  // Récupérer toutes les notifications de l'utilisateur
  const allNotifications = await prisma.notification.findMany({
    where: {
      receivers: {
        some: {
          userId,
        },
      },
    },
    select: {
      receivers: {
        select: {
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  // Filtrer pour obtenir uniquement les non lues
  const unreadCount = allNotifications.filter((notification) => {
    const receive = notification.receivers.find((r) => r.userId === userId);
    if (!receive) return false;
    // Si la notification a été modifiée récemment, elle est considérée comme lue
    return receive.updatedAt.getTime() === receive.createdAt.getTime();
  }).length;

  return unreadCount;
}
