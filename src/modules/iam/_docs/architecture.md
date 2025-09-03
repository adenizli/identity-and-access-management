# Identity and Access Management (IAM) Module Architecture

## IAM Module Overview

The **IAM (Identity and Access Management)** module is a core component of the system, enabling user classification, authorization, and authentication. To ensure modularity and independence, IAM is implemented as a standalone main module, divided into three submodules:

1. **Identity**
   - Manages user lifecycle and profile data.
   - Designed to serve as an abstract user entity, adaptable across domains (e.g., ERP systems serving both dealers and administrators).
   - Inspired by Boğaziçi University’s registration system, where instructors and students share a unified login system.
   - Supports discriminator-based modeling for systems where separate entities are preferred over associations.
   - Provides an abstract `UserModel` (excluding sensitive fields like password) for frontend safety.
   - Introduces a `UserAuthenticationModel` dedicated to authentication, containing only credentials.
   - User creation is generic, unifying both self-registration and admin-created users under one service logic.
   - Delegates domain-specific attributes (e.g., student details) to external modules via references (`user_id`).
   - Transactions are enforced to guarantee atomic data submission.

2. **Authorization**
   - Inspired by AWS IAM policies.
   - Implements a role and scope-based system, with fine-grained flexibility:
     - Roles define general permissions.
     - Scopes allow overrides through **included** and **excluded** permissions.
     - Exclusion overrides inclusion, ensuring restrictive security.
     - Undefined permissions default to “not permitted.”
   - Supports dynamic role creation and policy-based authorization.

3. **Authentication**
   - Implements a **semi-stateless session model**:
     - Sessions are stored in the database for revocation and tracking.
     - Each login generates an access token, refresh token, and session ID.
     - Tokens are encrypted to prevent client-side inspection.
   - **Session Flow**:
     1. User submits credentials.
     2. On success, system issues tokens + session ID.
     3. Clients must present both `accessToken` (in Authorization header) and `sessionId` (in cookies) on every request.
   - **Token Management**:
     - Expired access tokens return `401 EXPIRED_ACCESS_TOKEN`.
     - Clients can request a refresh by presenting the access token, refresh token, and session ID.
     - If valid, new tokens are generated; if invalid, `INVALID_REFRESH_TOKEN` is returned.

---

Notes
-> Session cleanup is not implemented yet and left as DevOps task.
--> DevOps can create a cron job (or in example lambda function for AWS) to clean up expired sessions.

-> It is highly recommeded to implement an additional database for session management such as DynamoDB or SQLite because it is not a scalable approach to store sessions in the entire database which might come with a lot of resource usage and performance issues.

-> Unit and integration tests are not implemented yet but will be implemented in the future.

-> For first user, we have created a CLI command to create initial user with all of the permissions.

## Security Principles

- Passwords are never included in user-facing models.
- JWT tokens and session IDs are encrypted to mitigate client-side inspection.
- Strict error messaging improves client efficiency (e.g., distinguishing between `INVALID_ACCESS_TOKEN` and `EXPIRED_ACCESS_TOKEN`).

---

## Conclusion

This IAM design demonstrates a modular, extensible, and secure approach to identity, authorization, and authentication. The layered architecture ensures maintainability, while the IAM submodules provide flexibility for integration into diverse systems. Future enhancements should focus on scalability, auditing, and zero-trust adoption to align with enterprise-grade standards.
