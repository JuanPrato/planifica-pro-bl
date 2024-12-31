export class DocNotFoundError extends Error {
  constructor() {
    super();
    this.message = 'Doc not found';
  }
}
