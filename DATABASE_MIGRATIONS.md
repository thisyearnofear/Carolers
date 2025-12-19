# Database Migrations Guide

## 🚀 Quick Start

### 1. Set up environment variables

Create a `.env` file in the root directory with your PlanetScale database URL:

```env
DATABASE_URL="mysql://username:password@host/database_name"
```

### 2. Generate migrations

When you make changes to the schema in `shared/schema.ts`, generate migrations:

```bash
npm run db:generate
```

This creates migration files in the `migrations/` directory.

### 3. Run migrations

Apply the migrations to your database:

```bash
npm run db:migrate
```

### 4. Test database and synchronization

Run comprehensive database tests including user synchronization:

```bash
npm run db:test
```

This tests:
- Database connection
- Schema structure
- CRUD operations
- User synchronization

### 5. Push schema (alternative for development)

For rapid development, you can push the schema directly:

```bash
npm run db:push
```

## 📁 Migration Structure

Migrations are stored in the `migrations/` directory with the following structure:

```
migrations/
  └── {timestamp}_{description}/
      ├── migration.sql
      └── meta.json
```

## 🔄 Migration Workflow

### Development Workflow

1. **Make schema changes** in `shared/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Review migration** in the `migrations/` directory
4. **Apply migration**: `npm run db:migrate`
5. **Test** your changes

### Production Workflow

1. **Test migrations** in staging environment
2. **Create backup** of production database
3. **Apply migrations**: `npm run db:migrate`
4. **Verify** database functionality
5. **Monitor** for any issues

## 🛠 Database Connection Management

### Initialization

The database connection is automatically initialized when the server starts:

- Connection health check
- Retry logic for transient failures
- Graceful error handling

### Connection States

- **❌ Not Initialized**: Database connection not established
- **🔄 Initializing**: Connection attempt in progress
- **✅ Ready**: Database connection established and healthy
- **⚠️  Retrying**: Temporary failure, automatic retry in progress

### Graceful Shutdown

The server handles graceful shutdown with:

- **SIGTERM** and **SIGINT** signal handling
- Database connection cleanup
- Proper HTTP server closure
- 30-second timeout for forceful shutdown

## 🔧 Troubleshooting

### Common Issues

#### Connection Failed

```bash
❌ Database connection failed: Error: connect ECONNREFUSED
```

**Solution:**
- Verify `DATABASE_URL` is correct
- Check network connectivity
- Ensure PlanetScale database is accessible

#### Migration Failed

```bash
❌ Migration failed: Error: Table already exists
```

**Solution:**
- Check if migrations were already applied
- Review migration files for duplicates
- Consider resetting development database

#### Schema Mismatch

```bash
❌ Schema mismatch detected
```

**Solution:**
- Run `npm run db:generate` to create new migrations
- Apply migrations with `npm run db:migrate`
- Avoid mixing `db:push` and migrations

## 📊 Database Schema

### Core Tables

- **users**: User accounts (linked to Clerk authentication)
- **events**: Caroling events with metadata
- **carols**: Christmas carols and songs
- **contributions**: Items members bring to events
- **messages**: Event chat messages

### User Table Schema

The `users` table is designed for Clerk integration:

```sql
CREATE TABLE users (
  id VARCHAR(191) PRIMARY KEY,     -- Clerk user ID
  username TEXT NOT NULL,         -- User's display name
  email TEXT,                     -- User's email
  image_url TEXT,                 -- Profile picture URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Relationships

```mermaid
graph TD
    users -- createdBy --> events
    users -- memberId --> events
    users -- memberId --> contributions
    users -- memberId --> messages
    events -- eventId --> contributions
    events -- eventId --> messages
    carols -- carolId --> events
```

### User Synchronization Flow

```mermaid
flowchart TD
    A[Clerk Authentication] -->|User Data| B[Client App]
    B -->|POST /api/users/sync| C[Backend API]
    C -->|upsertUser| D[PlanetScale Database]
    D -->|User Record| C
    C -->|Success/Failure| B
    B -->|Ready| E[User Experience]
```

## 🎯 Best Practices

### Schema Design

1. **Use UUIDs** for primary keys
2. **Add timestamps** for created/updated fields
3. **Use proper data types** (text, datetime, json, etc.)
4. **Add indexes** for frequently queried fields
5. **Use constraints** for data integrity

### Migration Strategy

1. **Small, focused migrations** - One change per migration
2. **Backward compatibility** - Ensure existing code works
3. **Rollback plan** - Know how to revert if needed
4. **Test thoroughly** - Verify in staging before production
5. **Document changes** - Update this guide as needed

## 🔒 Security

- **Never commit** real database credentials
- **Use environment variables** for sensitive data
- **Rotate credentials** regularly
- **Monitor access** to production databases
- **Encrypt connections** (TLS/SSL)

## 📚 Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PlanetScale Documentation](https://planetscale.com/docs)
- [MySQL Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)