export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class WorkoutPlanNotActiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkoutPlanNotActiveError";
  }
}

export class SessionAlreadyStartedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionAlreadyStartedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class SessionAlreadyCompletedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionAlreadyCompletedError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
