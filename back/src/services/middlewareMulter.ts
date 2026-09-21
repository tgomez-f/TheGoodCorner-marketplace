import multer from 'multer';
import { Request } from 'express'
import { randomUUID } from 'crypto';
import createError from 'http-errors';

// import multer and path dependencies

/**
 * create the storage locations of the file and give the stored file unique name
 */
const storage = multer.diskStorage({
	destination: (_req: Request, _file: Express.Multer.File,
		callback: CallableFunction,) =>
		{
			callback(null, '/app/uploads'); // success, save file to /app/upload
		},
	filename: (_req, file, callback) => 
	{
		try {
			const id = randomUUID(); // set a random id (The UUID is generated using a cryptographic pseudorandom number generator)
			const extArray = file.mimetype.split('/'); //Extracts the file extension from the MIME type (e.g., image/jpeg becomes jpeg)
			const extension = extArray[extArray.length - 1];
			callback(null, `${id}.${extension}`); // sucessm give the file its id.extension name
		}
		catch(error)
		{
			console.log(`an error occurred inside Multer !` + error);
		}
	}
})
/** 
 * filter the images if their original extension is not part of the extension list callback create a 400 bad request error
 */
const fileFilter = (_req: Request,file: Express.Multer.File, callback: CallableFunction,) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) // check for file extension if not === to supported format create a 400 http error
		return callback(createError(400,('Only image files are allowed')), false);
	callback(null, true); // success, callback true
};
// export a multer instance configured to store file on container path, filter the wrong format files and have a sizelimit for png
export const uploadMiddleware = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 }});