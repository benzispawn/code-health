export class CodeHealthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodeHealthError";
  }
}
