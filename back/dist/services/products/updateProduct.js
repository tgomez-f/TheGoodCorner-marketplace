export const productUpdate = ({ body, file }) => {
    const data = {}; // vide 
    if (body.name !== undefined)
        data.name = String(body.name);
    if (body.price !== undefined)
        data.price = typeof body.price === 'number' ? body.price : parseInt(body.price, 10);
    if (body.quantity !== undefined)
        data.quantity = typeof body.quantity === 'number' ? body.quantity : parseInt(body.quantity, 10);
    if (body.CategoryId !== undefined) {
        const catId = typeof body.CategoryId === 'number' ? body.CategoryId : parseInt(body.CategoryId, 10);
        data.category = { connect: { id: catId } };
    }
    if (file)
        data.imageUrl = `/uploads/${file.filename}`;
    return data;
};
