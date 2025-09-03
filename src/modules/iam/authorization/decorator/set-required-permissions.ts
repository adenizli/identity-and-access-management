import { SetMetadata } from '@nestjs/common';
import { Permission } from '../types/permission';

/**
 * Decorator to attach required permissions metadata to route handlers.
 *
 * @param perms - Permission codes required to access the handler
 * @returns Custom decorator that sets `requiredPermissions` metadata
 */
export const SetRequiredPermissions = (...perms: Permission[]) => SetMetadata('requiredPermissions', perms);
