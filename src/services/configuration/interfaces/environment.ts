import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsNumber } from 'class-validator';

enum HashingAlgorithm {
  HS256 = 'HS256',
  RS256 = 'RS256',
  ES256 = 'ES256',
  PS256 = 'PS256',
}

enum NodeEnvironment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export interface EnvironmentVariableInterface {
  NODE_ENV: NodeEnvironment;
  MONGODB_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_USERNAME: string;
  REDIS_PASSWORD: string;
  REDIS_DB: string;
  ACCESS_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_EXPIRATION: string;
  SESSION_EXPIRATION: string;
  DEVELOPMENT_DEFAULT_USER_PASSWORD: string;
  JWT_SECRET: string;
  JWT_ALGORITHM: HashingAlgorithm;
  CRYPTO_KEY: string;
  BCRYPT_ROUNDS: number;
}

export class EnvironmentVariableModel implements EnvironmentVariableInterface {
  @IsNotEmpty()
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment;

  /* DATABASE */
  @IsNotEmpty()
  @IsString()
  MONGODB_URI: string;

  REDIS_HOST: string;
  @IsNotEmpty()
  @IsNumber()
  REDIS_PORT: number;
  @IsNotEmpty()
  @IsString()
  REDIS_USERNAME: string;
  @IsNotEmpty()
  @IsString()
  REDIS_PASSWORD: string;
  REDIS_DB: string;

  /* AUTHENTICATION */
  @IsNotEmpty()
  @IsString()
  ACCESS_TOKEN_EXPIRATION: string;
  @IsNotEmpty()
  @IsString()
  REFRESH_TOKEN_EXPIRATION: string;
  @IsNotEmpty()
  @IsString()
  SESSION_EXPIRATION: string;

  /* DEFAULT USER */
  @IsNotEmpty()
  @IsString()
  DEVELOPMENT_DEFAULT_USER_PASSWORD: string;

  /* JWT */
  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsEnum(HashingAlgorithm)
  JWT_ALGORITHM: HashingAlgorithm;

  /* CRYPTO */
  @IsNotEmpty()
  @IsString()
  CRYPTO_KEY: string;

  /* BCRYPT */
  @IsNotEmpty()
  @IsNumber()
  BCRYPT_ROUNDS: number;
}
