# CLI System Architecture

## Overview
The CLI (Command Line Interface) system provides an interactive application initialization and management interface built with **NestJS Commander**. This system serves as the application's bootstrap mechanism, enabling administrators to set up the initial system state, create the first admin user, and perform essential setup tasks.

**Location**: `src/cli/`  
**Status**: ✅ Production Ready  
**Dependencies**: `nest-commander`, `inquirer`

## Architecture Design

### Module Structure
```
src/cli/
├── _docs/
│   └── architecture.md           # This document
├── cli.module.ts                 # CLI module configuration ✅
├── main.ts                       # CLI bootstrap entry point ✅
└── init-application.cli.ts       # Application initialization command ✅
```

## Implementation Status

### CliModule ✅
**File**: `cli.module.ts`

**Features Implemented**:
- NestJS module integration with IAM system
- Dependency injection for identity services
- Configuration and database module imports
- Command provider registration

```typescript
@Module({
  imports: [IamModule, ConfigurationModule, MongoDbModule],
  providers: [InitApplicationCommand],
})
export class CliModule {}
```

**Integration Benefits**:
- Full access to application services and business logic
- Database connectivity for user creation operations
- Configuration management for environment-aware operations
- Type safety and dependency injection throughout CLI operations

### CLI Bootstrap ✅
**File**: `main.ts`

**Bootstrap Implementation**:
```typescript
async function bootstrapCli() {
  await CommandFactory.run(CliModule, {
    logger: ['error', 'warn'],
    errorHandler: (err) => {
      console.error('Command not found. Available commands:');
      console.error('  nest init-application - Initialize a new application');
      process.exit(0);
    },
  });
}
```

**Features**:
- NestJS Commander integration for enterprise-grade CLI
- Error handling with helpful command suggestions
- Minimal logging to keep CLI output clean
- Graceful error handling and process management

## Core Commands

### Init Application Command ✅
**File**: `init-application.cli.ts`  
**Command**: `npx nest-commander init-application`

**Purpose**: Interactive setup wizard for creating the first system administrator

#### Command Features ✅
- **Interactive Interface**: User-friendly prompts using Inquirer.js
- **Input Validation**: Comprehensive validation for all user inputs
- **Password Security**: Confirmation prompts and validation
- **Error Handling**: Graceful error handling with retry guidance
- **Progress Feedback**: Clear status updates during user creation

#### User Creation Workflow ✅
```typescript
1. Collect Basic Information
   ├── First Name (required, alphanumeric + underscore/hyphen)
   ├── Last Name (required)
   ├── Username (required, unique)
   ├── Email (required, unique)
   ├── Password (required)
   ├── Confirm Password (required, must match)
   ├── Phone Dial Code (required, e.g., +90)
   └── Phone Number (required)

2. Validate Input Data
   ├── Password confirmation match
   ├── Required field validation
   ├── Format validation where applicable
   └── Business rule validation

3. Create Admin User
   ├── Generate CreateUserModel with ADMIN type
   ├── Call IdentityService.createUser()
   ├── Handle success/error scenarios
   └── Provide clear feedback to user
```

#### Input Validation Rules ✅
**First Name Validation**:
- Required field validation
- Alphanumeric characters, hyphens, and underscores only
- No empty or whitespace-only inputs

**Email & Username Validation**:
- Required field validation
- Uniqueness validation handled by IdentityService
- Format validation through business layer

**Password Security**:
- Required field validation  
- Password confirmation matching
- Secure handling (not displayed in console)

**Phone Number Handling**:
- International dial code support
- Separate dial code and number collection
- Format validation for proper phone structure

#### Error Handling ✅
```typescript
// Password Mismatch Handling
if (basicInfo.password !== basicInfo.confirmPassword) {
  console.log('🚨 Password and confirm password do not match!');
  console.log('❌ Please try again!');
  return;
}

// Service Error Handling
try {
  const user = await this.identityService.createUser(createUserModel);
  console.log(`🚀 User ${user.username} created successfully`);
} catch (error) {
  console.log('🚨 Error creating user:', error.message);
  console.log('❌ Please try again!');
  process.exit(0);
}
```

## Integration with IAM System

### Service Dependencies ✅
The CLI system integrates directly with the IAM module:

**Identity Service Integration**:
- Uses `IdentityService.createUser()` for user creation
- Leverages existing business logic and validation
- Inherits all security features (password hashing, validation)
- Benefits from database transaction handling

**User Type Assignment**:
```typescript
createUserModel.userType = USER_TYPES.ADMIN;
```
- Automatically assigns ADMIN privileges to CLI-created users
- Ensures first user has full system access
- Follows existing user type enumeration patterns

### Data Model Integration ✅
Uses standard application data models:

```typescript
const createUserModel = new CreateUserModel();
createUserModel.firstName = basicInfo.firstName;
createUserModel.lastName = basicInfo.lastName;
createUserModel.username = basicInfo.username;
createUserModel.email = { address: basicInfo.email };
createUserModel.password = basicInfo.password;
createUserModel.phone = {
  dialCode: basicInfo.phoneDialCode,
  number: basicInfo.phoneNumber,
};
```

## CLI User Experience

### Interactive Design ✅
**User-Friendly Interface**:
- Clear, step-by-step prompts
- Emoji indicators for visual feedback
- Progress updates during operations
- Helpful error messages with guidance

**Professional Output**:
```
🚀 Initializing application...

? Enter your first name: admin
? Enter your last name: user
? Enter your username: administrator
? Enter your email: admin@company.com
? Enter your password: [hidden]
? Confirm your password: [hidden]
? Enter your dial code (ie: +90 for Turkiye): +1
? Enter your phone number (ie: 5555555555): 5555551234

⏳ Creating your user account, please wait...
🚀 User administrator created successfully
```

### Error Recovery ✅
**Validation Feedback**:
- Immediate validation feedback on input
- Clear error messages explaining requirements
- Retry guidance for failed operations
- Graceful exit on unrecoverable errors

## Development Benefits

### Enterprise-Grade CLI ✅
**NestJS Commander Advantages**:
- Dependency injection throughout CLI operations
- Type safety and TypeScript support
- Integration with existing application services
- Professional error handling and logging

**Development Efficiency**:
- Reuses existing business logic
- No duplicate validation or user creation code
- Consistent data handling with main application
- Maintainable and testable CLI commands

### Extensibility ✅
**Command Structure Ready for Extension**:
- Modular command organization
- Easy addition of new CLI commands
- Shared module imports for new functionality
- Consistent patterns for future commands

## Usage Instructions

### First-Time Setup ✅
**Required for Application Bootstrap**:
```bash
# After installing dependencies and configuring environment
npx nest-commander init-application

# Follow interactive prompts to create admin user
# This step is required before starting the application
```

**Prerequisites**:
- Database (MongoDB) connection configured
- Environment variables properly set
- All dependencies installed via `yarn install`

### Production Considerations ✅
**Security Notes**:
- CLI creates admin users with full system privileges
- Should only be used during initial application setup
- Consider restricting CLI access in production environments
- Admin user credentials should follow organizational password policies

## Future Enhancements TODO

### Additional CLI Commands
- [ ] **User Management**: CLI commands for user administration
- [ ] **Database Migration**: Database schema migration commands
- [ ] **System Health**: Health check and diagnostics commands
- [ ] **Backup & Restore**: Data backup and restore operations
- [ ] **Configuration Management**: Environment configuration validation

### Enhanced User Creation
- [ ] **Bulk User Import**: CSV/JSON batch user creation
- [ ] **Role Assignment**: CLI-based role and permission assignment
- [ ] **User Templates**: Pre-defined user creation templates
- [ ] **Integration Testing**: CLI integration with CI/CD pipelines

### Advanced Features
- [ ] **Interactive Menus**: Multi-level command menus
- [ ] **Progress Bars**: Visual progress indicators for long operations
- [ ] **Configuration Wizard**: Complete system configuration setup
- [ ] **Environment Management**: CLI-based environment switching

## Testing Strategy TODO

### CLI Testing Requirements
- [ ] **Command Testing**: Unit tests for command execution
- [ ] **Input Validation Testing**: Comprehensive input validation scenarios
- [ ] **Integration Testing**: CLI integration with application services
- [ ] **Error Scenario Testing**: Error handling and recovery testing
- [ ] **User Experience Testing**: Interactive flow testing

### Automated Testing
- [ ] **Mock Input Testing**: Automated testing with mock user inputs
- [ ] **Service Integration Testing**: CLI service dependency testing
- [ ] **Database Integration Testing**: User creation and persistence testing
- [ ] **Error Recovery Testing**: Validation and error handling testing

## Best Practices

### CLI Development ✅
1. **User Experience**: Clear prompts, helpful error messages, progress feedback
2. **Input Validation**: Comprehensive validation with immediate feedback
3. **Error Handling**: Graceful error handling with recovery guidance
4. **Service Integration**: Leverage existing application services and business logic

### Security Considerations ✅
1. **Admin User Creation**: Only for initial application setup
2. **Input Sanitization**: Validate all user inputs thoroughly
3. **Error Information**: Avoid exposing sensitive system information in errors
4. **Access Control**: Consider CLI access restrictions in production

### Maintenance ✅
1. **Documentation**: Keep CLI usage documentation current
2. **Command Organization**: Maintain clear command structure and naming
3. **Service Dependencies**: Keep CLI module imports minimal and focused
4. **Version Compatibility**: Ensure CLI compatibility with application updates

## Troubleshooting

### Common Issues
1. **"Command not found"**: Ensure `nest-commander` is properly installed
2. **Database connection errors**: Verify MongoDB configuration and connectivity
3. **User creation failures**: Check for duplicate usernames or emails
4. **Permission errors**: Ensure proper file system permissions for CLI execution

### Debugging Procedures
1. Verify environment configuration is complete and correct
2. Test database connectivity independently
3. Check application logs for detailed error information
4. Validate input data format and requirements
5. Ensure all required dependencies are installed and accessible

## Development Integration

### IDE Support ✅
- TypeScript support with full type safety
- Dependency injection container integration
- Debugging support through NestJS framework
- Code completion for service methods and models

### Development Workflow ✅
1. **Environment Setup**: Configure `.env.dev` with required variables
2. **CLI Execution**: Run `npx nest-commander init-application`
3. **Admin User Creation**: Complete interactive setup wizard
4. **Application Launch**: Start application with `yarn run start:dev`
5. **API Testing**: Access Swagger documentation for API testing

This CLI system provides a professional, user-friendly interface for application initialization while maintaining enterprise-grade code quality and integration with the existing IAM system architecture.