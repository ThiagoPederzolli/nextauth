// criando uma nova classe de erro, conseguimos diferenciar um erro de outro
// a classe Error é muito genérica, pode ser qualquer erro.

export class AuthTokenError extends Error {
  constructor() {
    super('Error with authentication token.')
  }
}