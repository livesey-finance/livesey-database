import { Strings, Numbers } from 'livesey-validation';
import dotenv from 'dotenv';
dotenv.config();

export const port = Numbers.parseEnvValue(process.env.PORT).isInt();

export const dbType = Strings.isString(process.env.DB_TYPE).getValue();
export const dbHost = Strings.isString(process.env.DB_HOST).getValue();
export const dbUser = Strings.isString(process.env.DB_USER).getValue();
export const dbPassword = Strings.isString(process.env.DB_PASSWORD).getValue();
export const dbName = Strings.isString(process.env.DB_NAME).getValue();
export const dbPort = Strings.isString(process.env.DB_PORT).getValue();
export const dbSsl = Strings.isString(process.env.DB_SSL).getValue();
