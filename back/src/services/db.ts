import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
// import all dependency such as PrismaClient, filesystem for read/write and path for env variables searche
// this code can be run through in local environment or in docker container when instantiated.

/**
 * this fetches the db password either inside the docker container itself or locally in the file hierarchy
 * @param nothing : void
 * @returns Password : string
 */

const getPassword = ():string =>
{
	let password : string = "";

	// check the file existence inside the docker container itself
	if (fs.existsSync('/run/secrets/db_password')) // run dir is where docker stores its runtime variables
	{
		password = fs.readFileSync('/run/secrets/db_password', 'utf8').trim();
		return (password);
	}

	// get local abosulte path to secret file
	const localSecretPath = path.resolve(process.cwd(), '../.secrets/password.txt');
	
	// more for local testing when using npm run dev
	if (fs.existsSync(localSecretPath)) // if the path exist
	{
		password = fs.readFileSync(localSecretPath, 'utf8').trim();
		return (password); // read the file there and return the string
	}
	password = process.env.POSTGRES_PASSWORD || "";
	if (!password)
		throw new Error("Database password is missing aborting...");
	return (password);
}

const password = encodeURIComponent(getPassword());
const user = process.env.POSTGRES_USER || 'GoodCorner';
const host = process.env.POSTGRES_HOST || 'localhost';
const port = process.env.POSTGRE_PORT || 5432;
const dbName = process.env.POSTGRES_DB || 'mydb';

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public`;
const prisma = new PrismaClient({
	datasources: {
	db: {
	  url: connectionString,
	},
  },
});

export default prisma;