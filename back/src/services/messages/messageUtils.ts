import { send } from 'node:process';
import prisma from '../db.js';

export class MessageService {
	static async saveMessage(senderId: number, receiverId: number, content: string) {
		return (await prisma.message.create({
			data: {
				senderId: Number(senderId),
				receiverId: Number(receiverId),
				content
			},
			include: {
				sender: { select: { id: true, username: true, email: true, avatar:true } },
				receiver: { select: { id: true, username: true, email: true, avatar:true } }
			}
		}));
	}

	static async getConversation(user1Id: number, user2Id: number, limit: number) {
		return (await prisma.message.findMany({
			where: {
				OR: [
					{ senderId: user1Id, receiverId: user2Id },
					{ senderId: user2Id, receiverId: user1Id }
				]
			},
			orderBy: { createdAt: 'asc' }, // a voir si on met desc
			take: limit,
			include: {
				sender: { select: { id: true, username: true, email:true, avatar:true } }
			}
		}));
	}
	static async getConversationList(userId: number) {
		const messages = await prisma.message.findMany({
		where: {
			OR: [
				{ senderId: userId },
				{ receiverId: userId }
			]
		},
		orderBy: { createdAt: 'desc' },
		include: {
			sender: { select: { id: true, username: true, email: true, avatar: true } },
			receiver: { select: { id: true, username: true, email: true, avatar: true } }
		}
		});
		const conversationList = new Map<number, typeof messages[0]>();
		for(const msg of messages)
		{
			const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
		
			if (!conversationList.has(otherUser.id))
				conversationList.set(otherUser.id, msg); // ajoute le nouvel utilisateur a la liste de conversation avec le message qu'il a send au user
		}
		const finalList = Array.from(conversationList.values()).map((lastMessage)=> {
			const otherUser = lastMessage.senderId === userId ? lastMessage.receiver : lastMessage.sender;
			return ({
			interlocutor: otherUser,
			lastMessage: {
				id: lastMessage.id,
				content: lastMessage.content,
				createdAt: lastMessage.createdAt,
				senderId: lastMessage.senderId,
				modifiedAt: lastMessage.modifiedAt
			}
			});
		})
		return (finalList);
	}
	static async getMessage(messageId: number) {
		return (await prisma.message.findUnique({
			where: { id: messageId}, 
			include: { sender: { select: { id:true, username:true, email:true, avatar:true }}}
		}));
	}
	static async updateMessage(messageId: number, newMessage: string){
		return (await prisma.message.update({
			where: { id: Number(messageId) },
		data: {
			content: newMessage,
			modifiedAt: new Date()
		},
		include: {
			sender: {
				select: {
					id: true,
					username: true,
					avatar: true,
				},
			},
		},
		}));
	}
	static async deleteMessage(messageId: number){
		return (await prisma.message.delete({
			where: {id: Number(messageId)}
		}));
	}
}