import { AuthenticatedRequest } from "../interfaces/interfaces.js";
import { Response } from "express";

import prisma from "../services/db.js";

const notificationController = {
	getNotifications: async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user!.id;
			const notifications = await prisma.notification.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
			});
			return res.status(200).json({ data: notifications });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error fetching notifications' });
		}
	},

	markAsRead: async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user!.id;
			const id = Number(req.params.id);
			if (isNaN(id))
				return res.status(400).json({ error: 'Invalid notification ID' });

			const notif = await prisma.notification.findUnique({ where: { id } });
			if (!notif)
				return res.status(404).json({ error: 'Notification not found' });
			if (notif.userId !== userId)
				return res.status(403).json({ error: 'Not authorized' });

			const updated = await prisma.notification.update({
				where: { id },
				data: { read: true },
			});
			return res.status(200).json({ data: updated });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error updating notification' });
		}
	},

	markAllRead: async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user!.id;
			await prisma.notification.updateMany({
				where: { userId, read: false },
				data: { read: true },
			});
			return res.status(200).json({ message: 'All notifications marked as read' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error updating notifications' });
		}
	},

	deleteNotification: async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user!.id;
			const id = Number(req.params.id);
			if (isNaN(id))
				return res.status(400).json({ error: 'Invalid notification ID' });

			const notif = await prisma.notification.findUnique({ where: { id } });
			if (!notif)
				return res.status(404).json({ error: 'Notification not found' });
			if (notif.userId !== userId)
				return res.status(403).json({ error: 'Not authorized' });

			await prisma.notification.delete({ where: { id } });
			return res.status(204).send();
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error deleting notification' });
		}
	},
};

export default notificationController;