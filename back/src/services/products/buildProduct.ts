import { Prisma } from '@prisma/client';
import { ProductCrInput } from '../../interfaces/interfaces.js';


export const buildProduct = ({ body, file, userId }: ProductCrInput): Prisma.ProductCreateInput => {
	const { name, price, quantity, category, description } = body;
	if (!name?.trim() || price === null || price === undefined || !category?.trim() || !description?.trim())
		throw new Error('Name, price, and category are required.');

	const parsedPrice = typeof price === 'number' ? price : Number(price);
	if (isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 10000) 
		throw new Error('Price must be a valid number sitting in the range of 0.01€ and 10 000€.');
	const parsedUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
	const parsedQuantity = quantity ? (typeof quantity === 'number' ? quantity : parseInt(quantity, 10)) : 1;
	if (category.length > 256 || description.length > 256 || name.length > 256)
		throw new Error('Product category cannot be this long.');

	return {
		name: String(name),
		price: parsedPrice,
		quantity: parsedQuantity,
		description: description,
		imageUrl: file ? `/uploads/${file.filename}` : null,
		author: {
			connect: { id: parsedUserId }, // Matches 'authorId Int'
		},
		category: {
			connectOrCreate: {
				where: { name: category },
				create: { name: category }
			}
		},

	};
}
