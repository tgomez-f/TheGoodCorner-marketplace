import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import prisma from './services/db.js';
import http from 'http';
import { initializeWebServer } from './services/messages/messageSocket.js';
import productRouter from './routes/products.js';
import generalRouter from './routes/generalGetRouter.js';
import userRouter from './routes/users.js';
import reviewsRouter from './routes/reviews.js';
import messageRouter from './routes/messages.js';
import paymentRouter from './routes/payment.js';
import paymentController from './controllers/paymentController.js';
import friendRouter from './routes/friends.js';
// import { printRequest } from './utils/printHttpRequest.js';
const app = express(); // server initialization
const port = Number(process.env.port) || 3000; // port number
const allowedOrigin = [process.env.CLIENT_URL, 'http://localhost:8080', 'http://localhost:3000', 'https://TheGoodCorner.fr'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigin.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Non autorisé par le CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));
app.post('/newPayment/confirm', express.raw({ type: 'application/json' }), paymentController.stripeWebhook); // allow payment processing, do not move it
app.use(express.json()); // enable json body parsing
app.use(express.urlencoded({ extended: true })); // allow processing of urls encoded forms (json) to access as object
app.use(cookieParser()); // allow processing of cookie headers to access as objects
app.use('/uploads', express.static(('/app/uploads'))); // allow static file serving for images 
// app.set('trust proxy', 1);// pas sur necessaire sauf si reverse proxy ?
const rootPath = '/';
app.use(rootPath, generalRouter); // general routes
app.use(rootPath, productRouter); // product routes
app.use(rootPath, userRouter); // Users routes
app.use(rootPath, reviewsRouter); // reviews routes
app.use(rootPath, messageRouter); // message routes
app.use(rootPath, paymentRouter); // payment routes
app.use(rootPath, friendRouter); // friend routes
const socketServer = http.createServer(app);
const io = initializeWebServer(socketServer);
app.set('io', io);
// app.use(printRequest);
/**
 * asynchronous function that start the backend server while checking for errors
 * @returns a void promise relative to the async nature of the function
 */
async function startServer() {
    try {
        await prisma.$connect(); // await for promise fullfilment, here connect return a void promise. when fullfilled control flow continue, else error
        console.log('Connected to db.');
        await new Promise((resolve, reject) => // same as above, block until promise is fulfilled (server started correctly on port)
         {
            const server = socketServer.listen(port, '0.0.0.0', () => {
                console.log(`Serveur démarré sur :${origin_Url}`);
                resolve(); // resolve the promise
            });
            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE')
                    console.log(`port:${port} already in use cannot start server`);
                else
                    console.log(`server failed to start:`, error.message);
                reject(error); // reject the promise
            });
        });
    }
    catch (error) {
        console.error('Failed to start application:' + error);
        process.exit(1);
    }
}
startServer();
/**
 * when the server sucessfully starts, it listen on port and then the routes take the lead on how the server behave
 * depending on what request arrive to the backend.
 */ 
