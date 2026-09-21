import { Server as HttpServer, METHODS } from 'http';
import { Server, Socket } from 'socket.io';
import { MessageService } from './messageUtils.js';

// userId (string) -> Set de socket.id : un même user peut avoir plusieurs
// onglets/appareils ouverts, on ne le considère hors-ligne que quand SON
// DERNIER socket se déconnecte.
const onlineUsers = new Map<string, Set<string>>();
// Mapping inverse, socket.id -> userId : indispensable dans 'disconnect'
// puisque cet event ne reçoit aucune donnée, juste le socket concerné.
const socketToUser = new Map<string, string>();

export function initializeWebServer(server: HttpServer) {
	const io = new Server(server, {
		cors: {
			origin: ["http://localhost:8080","https://localhost:4443"],
			methods: ['GET', 'POST'],
			credentials: true
		}
	})
	
	io.on('connection', (socket: Socket) => {
		socket.on('register_user', (userId: Number) => {
			const uid = String(userId);
			socket.join(`user_${uid}`);
			socketToUser.set(socket.id, uid);

			const wasOffline = !onlineUsers.has(uid) || onlineUsers.get(uid)!.size === 0;
			if (!onlineUsers.has(uid))
				onlineUsers.set(uid, new Set());
			onlineUsers.get(uid)!.add(socket.id);

			// Snapshot envoyé UNIQUEMENT à ce socket, pour qu'il initialise son
			// affichage sans attendre un event futur.
			socket.emit('online_users_list', Array.from(onlineUsers.keys()));

			// Broadcast seulement sur une vraie transition offline → online
			// (pas à chaque nouvel onglet ouvert par le même utilisateur).
			if (wasOffline) {
				io.emit('user_online', { userId: uid });
			}
    })
		
		socket.on('send_direct_message', async (data: { senderId: number, receiverId: number, content: string }) => {
			try {
				const savedMessage = await MessageService.saveMessage(
					data.senderId,
					data.receiverId,
					data.content
				)
				io.to(`user_${data.receiverId}`).emit('receive_direct_message', savedMessage);
				io.to(`user_${data.senderId}`).emit('receive_direct_message', savedMessage);
			}
			catch (error) {
				console.error('Error while processing message:', error); //
				socket.emit('error', { message: 'Failed to send message' });
			}
		});
		socket.on('disconnect', () => {
			const uid = socketToUser.get(socket.id);
			socketToUser.delete(socket.id);
			if (!uid)
				return;
			const sockets = onlineUsers.get(uid);
			if (!sockets)
				return;
			sockets.delete(socket.id);

			// Hors-ligne seulement si c'était son DERNIER socket connecté.
			if (sockets.size === 0) {
				onlineUsers.delete(uid);
				io.emit('user_offline', { userId: uid });
			}
		});
	})
	return (io);
}
