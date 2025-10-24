import { badRequest } from "../../core/httpErrors.js";

function isPositiveInt(n) {
  return Number.isInteger(n) && n > 0;
}

function isValidTime(timeStr) {
  if (!timeStr) return true;
  // Format HH:MM:SS ou HH:MM
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(timeStr);
}

function isValidDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

export function validateCreateClocking(req, _res, next) {
  const {
    userId,
    clockingDate,
    firstArrival,
    lastDeparture,
    workTime,
    breakTime,
    totalHours,
    weekDay,
  } = req.body ?? {};

  if (!isPositiveInt(Number(userId))) {
    throw badRequest("userId invalide", "USER_ID_INVALID");
  }

  if (!isValidDate(clockingDate)) {
    throw badRequest("clockingDate invalide", "CLOCKING_DATE_INVALID");
  }

  if (firstArrival && !isValidTime(firstArrival)) {
    throw badRequest(
      "firstArrival doit être au format HH:MM:SS",
      "FIRST_ARRIVAL_INVALID"
    );
  }

  if (lastDeparture && !isValidTime(lastDeparture)) {
    throw badRequest(
      "lastDeparture doit être au format HH:MM:SS",
      "LAST_DEPARTURE_INVALID"
    );
  }

  if (
    workTime != null &&
    (!Number.isInteger(Number(workTime)) || Number(workTime) < 0)
  ) {
    throw badRequest(
      "workTime doit être un entier positif",
      "WORK_TIME_INVALID"
    );
  }

  if (
    breakTime != null &&
    (!Number.isInteger(Number(breakTime)) || Number(breakTime) < 0)
  ) {
    throw badRequest(
      "breakTime doit être un entier positif",
      "BREAK_TIME_INVALID"
    );
  }

  if (
    totalHours != null &&
    (isNaN(Number(totalHours)) || Number(totalHours) < 0)
  ) {
    throw badRequest(
      "totalHours doit être un nombre positif",
      "TOTAL_HOURS_INVALID"
    );
  }

  if (weekDay != null && typeof weekDay !== "string") {
    throw badRequest("weekDay doit être une chaîne", "WEEK_DAY_INVALID");
  }

  req.body = {
    userId: Number(userId),
    clockingDate,
    firstArrival: firstArrival || null,
    lastDeparture: lastDeparture || null,
    workTime: workTime != null ? Number(workTime) : 0,
    breakTime: breakTime != null ? Number(breakTime) : 0,
    totalHours: totalHours != null ? Number(totalHours) : 0,
    weekDay: weekDay || "",
  };

  next();
}

export function validateUpdateClocking(req, _res, next) {
  const {
    firstArrival,
    lastDeparture,
    workTime,
    breakTime,
    totalHours,
    weekDay,
  } = req.body ?? {};

  const patch = {};

  if (firstArrival !== undefined) {
    if (firstArrival !== null && !isValidTime(firstArrival)) {
      throw badRequest(
        "firstArrival doit être au format HH:MM:SS",
        "FIRST_ARRIVAL_INVALID"
      );
    }
    patch.firstArrival = firstArrival;
  }

  if (lastDeparture !== undefined) {
    if (lastDeparture !== null && !isValidTime(lastDeparture)) {
      throw badRequest(
        "lastDeparture doit être au format HH:MM:SS",
        "LAST_DEPARTURE_INVALID"
      );
    }
    patch.lastDeparture = lastDeparture;
  }

  if (workTime !== undefined) {
    if (!Number.isInteger(Number(workTime)) || Number(workTime) < 0) {
      throw badRequest(
        "workTime doit être un entier positif",
        "WORK_TIME_INVALID"
      );
    }
    patch.workTime = Number(workTime);
  }

  if (breakTime !== undefined) {
    if (!Number.isInteger(Number(breakTime)) || Number(breakTime) < 0) {
      throw badRequest(
        "breakTime doit être un entier positif",
        "BREAK_TIME_INVALID"
      );
    }
    patch.breakTime = Number(breakTime);
  }

  if (totalHours !== undefined) {
    if (isNaN(Number(totalHours)) || Number(totalHours) < 0) {
      throw badRequest(
        "totalHours doit être un nombre positif",
        "TOTAL_HOURS_INVALID"
      );
    }
    patch.totalHours = Number(totalHours);
  }

  if (weekDay !== undefined) {
    if (typeof weekDay !== "string") {
      throw badRequest("weekDay doit être une chaîne", "WEEK_DAY_INVALID");
    }
    patch.weekDay = weekDay;
  }

  req.body = patch;
  next();
}
