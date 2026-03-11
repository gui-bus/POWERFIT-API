export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, "FORBIDDEN", 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code = "BAD_REQUEST") {
    super(message, code, 400);
  }
}

export class WorkoutPlanNotActiveError extends BadRequestError {
  constructor(message: string) {
    super(message, "WORKOUT_PLAN_NOT_ACTIVE");
  }
}

export class SessionAlreadyStartedError extends BadRequestError {
  constructor(message: string) {
    super(message, "SESSION_ALREADY_STARTED");
  }
}

export class SessionAlreadyCompletedError extends BadRequestError {
  constructor(message: string) {
    super(message, "SESSION_ALREADY_COMPLETED");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}
