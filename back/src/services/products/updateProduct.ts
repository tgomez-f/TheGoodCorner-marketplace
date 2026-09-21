import {Request, Response} from 'express'
import { Prisma } from '@prisma/client';
import { ProductUpdate } from '../../interfaces/interfaces.js'

export const productUpdate = ({ body, file}: ProductUpdate): Prisma.ProductUpdateInput => {
	const data: Prisma.ProductUpdateInput = {}; // vide 

	if (body.name !== undefined)
		data.name = String(body.name);
	if (body.price !== undefined)
		data.price = typeof body.price === 'number' ? body.price : parseFloat(body.price);
	if (body.quantity !== undefined)
		data.quantity = typeof body.quantity === 'number' ? body.quantity : parseInt(body.quantity, 10);
	if (body.description !== undefined)
		data.description = String(body.description);
	if (body.category !== undefined && body.category.trim()) {
		data.category = { connectOrCreate: { where: { name: body.category.trim() }, create: { name: body.category.trim() } } };
	} else if (body.CategoryId !== undefined) {
		const catId = typeof body.CategoryId === 'number' ? body.CategoryId : parseInt(body.CategoryId, 10);
		data.category = { connect: { id: catId } };
	}
	if (file)
		data.imageUrl = `/uploads/${file.filename}`;
	return data;
};