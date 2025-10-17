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
    workMinutes,
    breakMinutes,
    totalHours,
    weekDay,
    workDay,
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

  if (workMinutes != null && (!Number.isInteger(Number(workMinutes)) || Number(workMinutes) < 0)) {
    throw badRequest("workMinutes doit être un entier positif", "WORK_MINUTES_INVALID");
  }

  if (breakMinutes != null && (!Number.isInteger(Number(breakMinutes)) || Number(breakMinutes) < 0)) {
    throw badRequest("breakMinutes doit être un entier positif", "BREAK_MINUTES_INVALID");
  }

  if (totalHours != null && (isNaN(Number(totalHours)) || Number(totalHours) < 0)) {
    throw badRequest("totalHours doit être un nombre positif", "TOTAL_HOURS_INVALID");
  }

  if (weekDay != null && typeof weekDay !== "string") {
    throw badRequest("weekDay doit être une chaîne", "WEEK_DAY_INVALID");
  }

  if (workDay != null && (!Number.isInteger(Number(workDay)) || Number(workDay) < 0)) {
    throw badRequest("workDay doit être un entier positif", "WORK_DAY_INVALID");
  }

  req.body = {
    userId: Number(userId),
    clockingDate,
    firstArrival: firstArrival || null,
    lastDeparture: lastDeparture || null,
    workMinutes: workMinutes != null ? Number(workMinutes) : 0,
    breakMinutes: breakMinutes != null ? Number(breakMinutes) : 0,
    totalHours: totalHours != null ? Number(totalHours) : 0,
    weekDay: weekDay || "",
    workDay: workDay != null ? Number(workDay) : 0,
  };

  next();
}

export function validateUpdateClocking(req, _res, next) {
  const {
    firstArrival,
    lastDeparture,
    workMinutes,
    breakMinutes,
    totalHours,
    weekDay,
    workDay,
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

  if (workMinutes !== undefined) {
    if (!Number.isInteger(Number(workMinutes)) || Number(workMinutes) < 0) {
      throw badRequest("workMinutes doit être un entier positif", "WORK_MINUTES_INVALID");
    }
    patch.workMinutes = Number(workMinutes);
  }

  if (breakMinutes !== undefined) {
    if (!Number.isInteger(Number(breakMinutes)) || Number(breakMinutes) < 0) {
      throw badRequest("breakMinutes doit être un entier positif", "BREAK_MINUTES_INVALID");
    }
    patch.breakMinutes = Number(breakMinutes);
  }

  if (totalHours !== undefined) {
    if (isNaN(Number(totalHours)) || Number(totalHours) < 0) {
      throw badRequest("totalHours doit être un nombre positif", "TOTAL_HOURS_INVALID");
    }
    patch.totalHours = Number(totalHours);
  }

  if (weekDay !== undefined) {
    if (typeof weekDay !== "string") {
      throw badRequest("weekDay doit être une chaîne", "WEEK_DAY_INVALID");
    }
    patch.weekDay = weekDay;
  }

  if (workDay !== undefined) {
    if (!Number.isInteger(Number(workDay)) || Number(workDay) < 0) {
      throw badRequest("workDay doit être un entier positif", "WORK_DAY_INVALID");
    }
    patch.workDay = Number(workDay);
  }

  req.body = patch;
  next();
}


