import { Strings, Numbers } from 'livesey-validation';
import dotenv from 'dotenv';
dotenv.config();

export const port = Numbers.parseEnvValue(process.env.PORT).isInt();

export const dbType = Strings.isString(process.env.DB_TYPE);
export const dbHost = Strings.isString(process.env.DB_HOST);
export const dbUser = Strings.isString(process.env.DB_USER);
export const dbPassword = Strings.isString(process.env.DB_PASSWORD);
export const dbName = Strings.isString(process.env.DB_NAME);
export const dbPort = Strings.isString(process.env.DB_PORT);
export const dbSsl = Strings.isString(process.env.DB_SSL);







