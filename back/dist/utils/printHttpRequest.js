export const printRequest = ((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    // Affiche le body s'il y en a un (POST/PUT)
    if (Object.keys(req.body || {}).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    void res;
    next(); // Passer la main au middleware/routeur suivant
});
