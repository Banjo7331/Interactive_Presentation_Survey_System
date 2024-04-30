export default () => ({
    database: {
      type: process.env.DATABASE_TYPE || 'postgres',
      host: process.env.DATABASE_HOST || 'postgres_db',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USERNAME || 'testuser',
      password: process.env.DATABASE_PASSWORD || 'testuser123',
      database: process.env.DATABASE_NAME || 'post_new_structure',
    },
});