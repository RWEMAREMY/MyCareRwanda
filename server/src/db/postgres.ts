export const pool = {
  query: async () => {
    throw new Error('PostgreSQL is no longer configured. Use MongoDB repository functions instead.')
  },
}
