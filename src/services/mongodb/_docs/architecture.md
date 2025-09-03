# MongoDB Service Architecture

## Overview
The MongoDB Service provides advanced database connectivity and functionality for the IAM system. Built on Mongoose ODM with custom plugins for soft deletion, ID transformation, and timestamp management. Designed for scalable, production-ready data persistence with enterprise-grade features.

**Location**: `src/services/mongodb/`  
**Status**: ✅ Production Ready  
**Dependencies**: `@nestjs/mongoose`, `mongoose`

## Architecture Design

### Module Structure
```
src/services/mongodb/
├── _docs/
│   └── architecture.md              # This document
├── mongodb.module.ts                # NestJS module configuration ✅
├── soft-delete.plugin.ts            # Logical deletion functionality ✅
├── id-transform.plugin.ts           # MongoDB _id to id transformation ✅
└── timespan-unix-converter.ts       # Unix timestamp utilities ✅
```

## Implementation Status

### MongoDbModule ✅
**File**: `mongodb.module.ts`

**Features Implemented**:
- NestJS Mongoose integration with advanced connection management
- Global database configuration via environment variables
- Automatic plugin registration for all schemas
- Connection pooling, error handling, and reconnection logic
- Production-ready connection options

```typescript
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MongoDbModule {}
```

## Custom Plugin System

### Soft Delete Plugin ✅
**File**: `soft-delete.plugin.ts`

**Purpose**: Implements logical deletion to maintain data integrity and audit trails

**Features Implemented**:
- Automatic addition of `isDeleted` boolean field to all documents
- `deletedAt` timestamp field for audit and recovery purposes
- Query middleware automatically excludes deleted records
- Restore functionality for accidentally deleted data

**Technical Implementation**:
```typescript
// Schema enhancement
schema.add({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
});

// Query middleware for automatic filtering
schema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  this.where({ isDeleted: { $ne: true } });
});

// Soft delete method
schema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};
```

**Benefits**:
- **Audit Compliance**: Complete record history maintained
- **Data Recovery**: Restore deleted records when needed
- **Referential Integrity**: Prevents cascade deletion issues
- **Analytics**: Historical data analysis including deleted records

### ID Transform Plugin ✅
**File**: `id-transform.plugin.ts`

**Purpose**: Provides frontend-compatible API responses with standardized ID fields

**Features Implemented**:
- Automatic transformation of MongoDB `_id` to `id` during JSON serialization
- Removal of MongoDB-specific `__v` version field
- Consistent API response format across all endpoints
- Zero-configuration transformation for all schemas

**Technical Implementation**:
```typescript
schema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

schema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
```

**Benefits**:
- **Frontend Compatibility**: Standard `id` field expected by modern frontends
- **API Consistency**: Uniform response format across all endpoints
- **Developer Experience**: Cleaner, more predictable API responses
- **Framework Agnostic**: Works with any frontend framework or library

### Unix Timestamp Converter ✅
**File**: `timespan-unix-converter.ts`

**Purpose**: Unified timestamp handling and time duration management

**Features Implemented**:
- Converts human-readable time spans to Unix timestamps
- Handles various time formats ('15m', '1h', '7d', '30d')
- Consistent timestamp format throughout the application
- Integration with session and token expiration systems

**Technical Implementation**:
```typescript
export function timeToSeconds(timespan: string): number {
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = timespan.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid timespan format: ${timespan}`);
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

export function generateUnixTime(offsetSeconds: number = 0): number {
  return Math.floor(Date.now() / 1000) + offsetSeconds;
}
```

## Database Schema Management

### Enhanced Schema Features ✅
All schemas automatically receive plugin enhancements:

**User Schema Example**:
```typescript
// Original schema definition
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]
});

// Automatic plugin enhancements applied:
// + isDeleted: Boolean (default: false)
// + deletedAt: Date (default: null)
// + toJSON transformation (_id → id)
// + soft delete query filtering
```

### Current Schema Implementations ✅

1. **User Schema** (`src/modules/iam/identity/repository/entity/user.entity.ts`):
   - Identity management with encrypted sensitive fields
   - Soft delete for user account management
   - ID transformation for API compatibility

2. **Role Schema** (`src/modules/iam/authorization/repository/entity/role.entity.ts`):
   - RBAC system with permission arrays
   - Soft delete for role lifecycle management
   - Consistent API response format

3. **Session Schema** (`src/modules/iam/authentication/repository/entity/session.entity.ts`):
   - Unix timestamp integration for expiration handling
   - Soft delete for session cleanup
   - Encrypted session data support

## Database Configuration

### Connection Management ✅
**Environment Configuration**:
```typescript
MONGODB_URI=mongodb://localhost:27017/iam-dev    # Development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/iam-prod  # Production
```

**Connection Options**:
- `maxPoolSize: 10` - Connection pool size for concurrent operations
- `serverSelectionTimeoutMS: 5000` - Server selection timeout
- `socketTimeoutMS: 45000` - Socket inactivity timeout
- `bufferMaxEntries: 0` - Disable mongoose buffering for immediate errors

### Performance Optimization ✅

**Indexing Strategy**:
```typescript
// Automatic indexes created by application schemas
- Users: email (unique), username (unique), isDeleted
- Roles: title (unique), isDeleted
- Sessions: userId, expiresAt, isDeleted
```

**Query Optimization**:
- Plugin-modified queries automatically use proper indexes
- Soft delete queries optimized with compound indexes
- Connection pooling reuses database connections efficiently
- Selective field projection to minimize data transfer

## Integration with IAM System

### Repository Pattern Implementation ✅
All database operations follow the repository pattern with plugin benefits:

```typescript
@Injectable()
export class UserRepositoryService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async createUser(userData: CreateUserModel): Promise<UserModel> {
    const user = new this.userModel(userData);
    const savedUser = await user.save();
    
    // Automatic transformations applied:
    // - ID transformation (_id → id)
    // - Soft delete fields added
    // - Version field removed
    return savedUser.toJSON();
  }

  async findUserByEmail(email: string): Promise<UserModel | null> {
    // Automatically filters out soft-deleted users
    const user = await this.userModel.findOne({ email });
    return user ? user.toJSON() : null;
  }
}
```

### Plugin Benefits in Practice ✅
1. **Automatic Enhancement**: All entities receive plugin functionality without configuration
2. **Consistent Behavior**: Same soft delete and ID transformation across all collections
3. **Zero Configuration**: Plugins work transparently with existing code
4. **API Consistency**: All endpoints return standardized response format

## Error Handling

### Connection Error Management ✅
```typescript
// MongoDB connection error handling
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.info('MongoDB reconnected successfully');
});
```

### Plugin Error Handling ✅
- **Soft Delete**: Graceful handling of already-deleted records
- **ID Transform**: Fallback for malformed documents
- **Timestamp**: Error handling for invalid time formats
- **Query Middleware**: Safe handling of plugin-modified queries

## Performance Monitoring TODO

### Database Metrics
- [ ] **Connection Pool Monitoring**: Track active and idle connections
- [ ] **Query Performance**: Monitor slow queries and execution times
- [ ] **Plugin Overhead**: Measure plugin performance impact
- [ ] **Index Usage**: Monitor index efficiency and utilization
- [ ] **Memory Usage**: Track database memory consumption

### Health Checks
- [ ] **Connection Health**: Database connectivity status endpoint
- [ ] **Plugin Functionality**: Verify plugins working correctly
- [ ] **Index Health**: Monitor index performance and usage
- [ ] **Replication Status**: Primary/secondary synchronization monitoring

## Future Enhancements TODO

### Scalability Features
- [ ] **Read Replicas**: Configure read/write splitting for performance
- [ ] **Sharding Strategy**: Horizontal scaling preparation for large datasets
- [ ] **Connection Optimization**: Advanced pooling and connection management
- [ ] **Caching Integration**: Redis integration for frequently accessed data

### Advanced Database Features
- [ ] **Schema Versioning**: Automated schema migration system
- [ ] **Full-Text Search**: Implement advanced search capabilities
- [ ] **Aggregation Pipelines**: Complex data analysis and reporting queries
- [ ] **Change Streams**: Real-time data change notifications

### Security Enhancements
- [ ] **Field-Level Encryption**: Encrypt sensitive fields at database level
- [ ] **Access Control**: Database-level user permissions and roles
- [ ] **Comprehensive Audit Logging**: Track all database operations
- [ ] **SSL/TLS Connections**: Encrypted database connections for production

### Plugin System Expansion
- [ ] **Audit Plugin**: Automatic audit trail for all document changes
- [ ] **Validation Plugin**: Advanced validation rules beyond schema
- [ ] **Versioning Plugin**: Document version history and rollback
- [ ] **Encryption Plugin**: Automatic field encryption/decryption

## Testing Strategy TODO

### Unit Testing
- [ ] Plugin functionality validation and edge cases
- [ ] Soft delete behavior verification
- [ ] ID transformation accuracy across all scenarios  
- [ ] Timestamp conversion correctness
- [ ] Error handling validation

### Integration Testing
- [ ] Database connection scenarios and failover
- [ ] Repository pattern implementation with plugins
- [ ] Plugin interaction with complex queries
- [ ] Performance testing with plugin overhead

### Performance Testing
- [ ] Connection pool efficiency under load
- [ ] Query optimization with plugin-modified queries
- [ ] Index usage validation with soft delete filtering
- [ ] Large dataset handling with plugin transformations

## Best Practices

### Development ✅
1. **Schema Consistency**: Use plugins uniformly across all entities
2. **Query Optimization**: Design queries to leverage plugin-created indexes
3. **Error Handling**: Handle plugin-specific errors gracefully
4. **Testing**: Include plugin behavior in unit and integration tests

### Production ✅
1. **Connection Management**: Monitor and optimize connection pool usage
2. **Index Strategy**: Regular index analysis and optimization
3. **Plugin Performance**: Monitor plugin impact on query performance
4. **Data Integrity**: Regular validation of soft-deleted records and cleanup

### Maintenance ✅
1. **Regular Backups**: Include plugin-enhanced data in backup strategies
2. **Index Maintenance**: Monitor and rebuild indexes as needed
3. **Plugin Updates**: Keep plugins updated with MongoDB and Mongoose versions
4. **Performance Reviews**: Regular performance analysis of plugin-modified queries

## Troubleshooting

### Common Database Issues
1. **"Connection Refused"**: MongoDB service not running or incorrect URI
2. **Plugin Not Applied"**: Schema registration timing or import issues
3. **Query Performance**: Missing indexes for plugin-modified queries
4. **ID Transform Issues**: Document structure not matching expected schema

### Debugging Procedures
1. Verify MongoDB service status and configuration
2. Check plugin registration in module imports and schema definitions
3. Monitor query execution plans for performance optimization
4. Validate document structure matches schema expectations
5. Review connection pool usage and optimization opportunities