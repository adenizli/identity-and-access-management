import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module';

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

bootstrapCli();
