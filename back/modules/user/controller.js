import {
  findAllUsers,
  findUserById,
  findByRole,
  findByName,
  findByPhoneNumber,
  findByContractType,
  updateUser,
  deleteUser,
  countUsers,
  countUsersByRole,
  countUsersByContractType,
  updateRoleUserById as updateRoleSvc,
} from "./service.js";

import { asyncHandler } from "../../core/async.js";
import { badRequest, notFound, unauthorized } from "../../core/httpErrors.js";
import { parsePagination } from "../../core/pagination.js";
import { ROLE_SET } from "../../core/roles.js";

const TEXTS = {
  USER_NOT_FOUND: "Utilisateur non trouvé",
  USERS_NOT_FOUND: "Aucun utilisateur trouvé",
  NOT_AUTHENTICATED: "Non authentifié",
  ID_INVALID: "ID invalide",
  NAME_MISSING: "Nom manquant",
  PHONE_MISSING: "Numéro de téléphone manquant",
  CONTRACT_TYPE_MISSING: "Type de contrat manquant",
  ROLE_REQUIRED: "Rôle requis",
  IMPOSSIBLE_TO_CHANGE_OWN_ROLE: "Impossible de modifier son propre rôle",
  INVALID_ROLE: "Rôle invalide",
};

export const getAllUsers = asyncHandler(async (req, res) => {
  const { skip, take } = parsePagination(req.query, {
    maxTake: 200,
    defaultTake: 50,
  });

  const users = await findAllUsers({ skip, take });
  res.status(200).json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw badRequest(TEXTS.ID_INVALID, "ID_INVALID");

  const user = await findUserById(id);
  if (!user) throw notFound(TEXTS.USER_NOT_FOUND, "USER_NOT_FOUND");

  res.status(200).json(user);
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user?.id)
    throw unauthorized(TEXTS.NOT_AUTHENTICATED, "NOT_AUTHENTICATED");

  const user = await findUserById(req.user.id);
  if (!user) throw notFound(TEXTS.USER_NOT_FOUND, "USER_NOT_FOUND");

  res.status(200).json(user);
});

export const getUserByRole = asyncHandler(async (req, res) => {
  const role = req.params.role;
  if (!role) throw badRequest(TEXTS.ROLE_REQUIRED, "ROLE_REQUIRED");

  const users = await findByRole(role);
  res.status(200).json(users);
});

export const getUserByName = asyncHandler(async (req, res) => {
  const search = req.params.name;
  if (!search?.trim()) throw badRequest(TEXTS.NAME_MISSING, "NAME_MISSING");

  const users = await findByName(search);
  res.status(200).json(users);
});

export const getUserByPhoneNumber = asyncHandler(async (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  if (!phoneNumber?.trim())
    throw badRequest(TEXTS.PHONE_MISSING, "PHONE_MISSING");

  const users = await findByPhoneNumber(phoneNumber);
  res.status(200).json(users);
});

export const getUserByContractType = asyncHandler(async (req, res) => {
  const contractType = req.params.contractType;
  if (!contractType?.trim())
    throw badRequest(TEXTS.CONTRACT_TYPE_MISSING, "CONTRACT_TYPE_MISSING");

  const users = await findByContractType(contractType);
  res.status(200).json(users);
});

export const updateUserById = asyncHandler(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw badRequest(TEXTS.ID_INVALID, "INVALID_ID");

  const { firstName, lastName, phoneNumber, contractType, email } = req.body;
  const data = { firstName, lastName, phoneNumber, contractType, email };

  const user = await updateUser(id, data);
  if (!user) throw notFound(TEXTS.USER_NOT_FOUND, "USER_NOT_FOUND");

  res.status(200).json(user);
});

export const updateRoleUserById = asyncHandler(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw badRequest(TEXTS.ID_INVALID, "INVALID_ID");
  if (!req.user?.id)
    throw unauthorized(TEXTS.NOT_AUTHENTICATED, "NOT_AUTHENTICATED");
  if (String(req.user.id) === String(id)) {
    throw badRequest(
      TEXTS.IMPOSSIBLE_TO_CHANGE_OWN_ROLE,
      "CANNOT_CHANGE_OWN_ROLE"
    );
  }
  const { role } = req.body;
  if (!ROLE_SET.has(role)) {
    throw badRequest(TEXTS.INVALID_ROLE, "INVALID_ROLE");
  }
  const user = await updateRoleSvc(id, role);
  if (!user) throw notFound(TEXTS.USER_NOT_FOUND, "USER_NOT_FOUND");

  res.status(200).json(user);
});

export const deleteUserById = asyncHandler(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw badRequest(TEXTS.ID_INVALID, "INVALID_ID");
  await deleteUser(id);
  res.status(204).send();
});

export const getCountUsers = asyncHandler(async (_req, res) => {
  const sumUsers = await countUsers();
  res.status(200).json({ count: sumUsers });
});

export const getCountUsersByRole = asyncHandler(async (req, res) => {
  const role = req.params.role;
  if (!role) throw badRequest(TEXTS.ROLE_REQUIRED, "ROLE_REQUIRED");

  const sumUsers = await countUsersByRole(role);
  res.status(200).json({ count: sumUsers });
});

export const getCountUsersByContractType = asyncHandler(async (req, res) => {
  const contractType = req.params.contractType;
  if (!contractType)
    throw badRequest(TEXTS.CONTRACT_TYPE_MISSING, "CONTRACT_TYPE_MISSING");

  const sumUsers = await countUsersByContractType(contractType);
  res.status(200).json({ count: sumUsers });
});
