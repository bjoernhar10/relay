export class MissingModelError extends Error {
  constructor() {
    super('No model selected');
    this.name = 'MissingModelError';
  }
}
