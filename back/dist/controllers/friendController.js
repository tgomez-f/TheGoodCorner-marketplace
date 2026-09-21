import prisma from "../services/db.js";
const friendController = {
    sendFriendRequest: async (req, res) => {
        try {
            const { receiverId } = req.body;
            const senderId = req.user.id;
            console.log(req.body);
            const parsedReceiverId = Number(receiverId);
            if (!receiverId || Number.isNaN(parsedReceiverId))
                return res.status(400).json({ error: 'Invalid receiver ID' });
            if (parsedReceiverId === senderId)
                return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
            const receiverExists = await prisma.user.findUnique({
                where: { id: parsedReceiverId }
            });
            if (!receiverExists)
                return res.status(404).json({ error: 'Receiver user not found' });
            const existingRequest = await prisma.friendRequest.findFirst({
                where: {
                    OR: [
                        { senderId, receiverId: parsedReceiverId },
                        { senderId: parsedReceiverId, receiverId: senderId }
                    ]
                }
            });
            if (existingRequest) {
                const isReciprocalPending = existingRequest.status === 'PENDING' &&
                    existingRequest.senderId === parsedReceiverId &&
                    existingRequest.receiverId === senderId;
                if (isReciprocalPending) {
                    const accepted = await prisma.friendRequest.update({
                        where: { id: existingRequest.id },
                        data: { status: 'ACCEPTED' },
                        include: {
                            sender: { select: { id: true, username: true, avatar: true } },
                            receiver: { select: { id: true, username: true, avatar: true } },
                        },
                    });
                    console.log(`Reciprocal friend request detected: request ${existingRequest.id} auto-accepted between ${senderId} and ${parsedReceiverId}`);
                    return res.status(200).json({ message: 'Friend request reciprocated, you are now friends', data: accepted });
                }
                if (existingRequest.status === 'REJECTED') {
                    const friendRequest = await prisma.$transaction(async (tx) => {
                        // Supprimer l'ancienne demande rejetée
                        await tx.friendRequest.delete({
                            where: { id: existingRequest.id }
                        });
                        // Créer une nouvelle demande PENDING dans le sens demandé
                        return await tx.friendRequest.create({
                            data: {
                                senderId,
                                receiverId: parsedReceiverId,
                            },
                            include: {
                                receiver: {
                                    select: {
                                        id: true,
                                        username: true,
                                        avatar: true
                                    }
                                }
                            }
                        });
                    });
                    console.log(`Old rejected request deleted. New friend request sent to ${parsedReceiverId}`);
                    return res.status(201).json({ message: 'Friend request sent (previous rejection cleared)', data: friendRequest });
                }
                return res.status(409).json({
                    error: existingRequest.status === 'ACCEPTED'
                        ? 'You are already friends'
                        : 'A friend request between you and this user already exists'
                });
            }
            const friendRequest = await prisma.friendRequest.create({
                data: {
                    senderId,
                    receiverId: parsedReceiverId,
                },
                include: {
                    receiver: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            });
            console.log(`A friend request has been sucessfully sent to ${parsedReceiverId}`);
            return (res.status(201).json({ message: `sucessfully sent friend request`, data: friendRequest }));
        }
        catch (error) {
            console.error(error);
            return (res.status(400).json({ error: error instanceof Error ? error.message : 'Error creating friend request' }));
        }
    },
    getFriendRequests: async (req, res) => {
        try {
            const userId = req.user.id;
            const { type, status } = req.query;
            let where = {};
            let include = { sender: { select: { id: true, username: true, avatar: true } }, receiver: { select: { id: true, username: true, avatar: true } } };
            if (type === 'received') {
                where = { receiverId: userId };
            }
            else if (type === 'sent') {
                where = { senderId: userId };
            }
            else {
                where = {
                    OR: [{ senderId: userId }, { receiverId: userId }],
                };
            }
            if (status) {
                where.status = status;
            }
            // no need to check for null here on findMany
            const requests = await prisma.friendRequest.findMany({
                where,
                include,
            });
            console.log(`all friends request have been retrieved sucessfully`);
            return (res.status(200).json({ message: 'sucess on retrieving friends requests', data: requests }));
        }
        catch (error) {
            console.error(error);
            return (res.status(500).json({ error: 'Error fetching friend requests' }));
        }
    },
    acceptFriendRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const requestId = Number(id);
            if (!id || !userId || Number.isNaN(requestId))
                return res.status(400).json({ error: 'Invalid route ID or invalid userId' });
            const request = await prisma.friendRequest.findUnique({
                where: { id: requestId },
            });
            if (!request)
                return res.status(404).json({ error: 'friend request not found' });
            if (request.receiverId !== userId)
                return res.status(403).json({ error: 'Not authorized' });
            if (request.status !== 'PENDING')
                return res.status(400).json({ error: `Cannot accept a request with status ${request.status}` });
            const updated = await prisma.friendRequest.update({
                where: { id: requestId },
                data: { status: 'ACCEPTED' },
            });
            console.log(`A friend request has been accepted by ${userId}`);
            return (res.status(200).json({ message: '', data: updated }));
        }
        catch (error) {
            console.error(error);
            return (res.status(500).json({ error: 'Error accepting friend request' }));
        }
    },
    rejectFriendRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const requestId = Number(id);
            if (!id || !userId || Number.isNaN(requestId))
                return res.status(400).json({ error: 'Invalid route ID or invalid userId' });
            const request = await prisma.friendRequest.findUnique({
                where: { id: requestId },
            });
            if (!request)
                return res.status(404).json({ error: 'friend request not found' });
            if (request.receiverId !== userId)
                return res.status(403).json({ error: 'Not authorized' });
            if (request.status !== 'PENDING')
                return res.status(400).json({ error: `Cannot reject a request with status ${request.status}` });
            const updated = await prisma.friendRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' },
            });
            console.log(`A friend request has been rejected by ${userId}`);
            return (res.status(200).json({ message: `a friend request has been rejected by ${requestId}`, data: updated }));
        }
        catch (error) {
            console.error(error);
            return (res.status(500).json({ error: 'Error rejecting friend request' }));
        }
    },
    deleteFriendRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const requestedId = Number(id);
            if (!id || !userId || Number.isNaN(requestedId))
                return res.status(400).json({ error: 'Invalid route ID or invalid userId' });
            const request = await prisma.friendRequest.findUnique({
                where: { id: requestedId },
            });
            if (!request)
                return res.status(404).json({ error: 'friend request not found' });
            if ((request.senderId !== userId && request.receiverId !== userId))
                return res.status(403).json({ error: 'Not authorized' });
            await prisma.friendRequest.delete({
                where: { id: requestedId },
            });
            console.log(`A friend request has been deleted by ${userId}`);
            return (res.status(204).send());
        }
        catch (error) {
            console.error(error);
            return (res.status(500).json({ error: 'Error deleting friend request' }));
        }
    },
    getFriends: async (req, res) => {
        try {
            const userId = req.user.id;
            if (!userId)
                return res.status(404).json({ error: 'Invalid route ID or invalid userId' });
            const friends = await prisma.friendRequest.findMany({
                where: {
                    status: 'ACCEPTED',
                    OR: [{ senderId: userId }, { receiverId: userId }],
                },
                include: {
                    sender: { select: { id: true, username: true, name: true, avatar: true, bio: true } },
                    receiver: { select: { id: true, username: true, name: true, avatar: true, bio: true } },
                },
            });
            const friendsList = friends.map((f) => (f.senderId === userId ? f.receiver : f.sender));
            console.log(`Sucessfully retrieved all friends of ${userId}`);
            return (res.status(200).json({ friends: friendsList, count: friendsList.length }));
        }
        catch (error) {
            console.error(error);
            return (res.status(500).json({ error: 'Error fetching friends' }));
        }
    },
};
export default friendController;
