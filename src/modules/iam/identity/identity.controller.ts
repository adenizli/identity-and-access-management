import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IdentityService } from './identity.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserModel } from './model/user.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_TYPES } from './enum/user-types.enum';
import { ListQueryDto } from '@common/dto/list-query.dto';
import { ListResponseModel } from '@common/model/list-response.model';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AuthorizationGuard } from '../authorization/authorization.guard';
import { SetRequiredPermissions } from '../authorization/decorator/set-required-permissions';

@ApiTags('Identity Management')
@Controller('iam/identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('')
  @SetRequiredPermissions('CREATE_USER')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({
    summary: 'Create a new administrator user',
    description: 'Creates a new user in the system with the provided information including contact details, roles, and permissions.',
  })
  @ApiBody({ type: CreateUserDto, description: 'User creation data' })
  @ApiResponse({ status: 201, description: 'User has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Conflict - User with this email already exists.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Creates an administrator user.
   *
   * @param createUserDto - User creation DTO
   * @returns Created user model
   */
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserModel> {
    const model = CreateUserDto.toModel(createUserDto);
    return this.identityService.createUser(model);
  }

  @Get('admin')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'List administrators' })
  @ApiResponse({ status: 200, description: 'Administrators have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Lists administrator users with pagination.
   *
   * @param listQueryDto - Query parameters
   * @returns Paginated list response
   */
  async listAdministrators(@Query() listQueryDto: ListQueryDto<UserModel>): Promise<ListResponseModel<UserModel>> {
    const listQueryModel = ListQueryDto.toModel(listQueryDto);
    return this.identityService.listUsers(USER_TYPES.ADMIN, listQueryModel);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by id',
    description: 'Retrieves a user by their unique identifier.',
  })
  @ApiResponse({ status: 200, description: 'Users have been successfully retrieved.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Gets a user by id.
   *
   * @param id - User identifier
   * @returns User model
   */
  async getUserById(@Param('id') id: string): Promise<UserModel> {
    return this.identityService.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user by id',
    description: 'Updates a user by their unique identifier.',
  })
  @ApiResponse({ status: 200, description: 'User has been successfully updated.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  /**
   * Updates a user by id.
   *
   * @param id - User identifier
   * @param updateUserDto - Partial update DTO
   * @returns Updated user model
   */
  async updateUserById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserModel> {
    const model = UpdateUserDto.toModel(updateUserDto);
    return this.identityService.updateUser(id, model);
  }
}
