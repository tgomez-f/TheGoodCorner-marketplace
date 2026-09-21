import { MessageService } from "../services/messages/messageUtils.js";
const messageController = {
    fetchConversation: async (req, res) => {
        try {
            const currentUserId = req.user.id;
            const recipientUserId = Number(req.params.recipientId);
            if (!currentUserId)
                return res.status(400).json({ error: 'Missing currentUserId' });
            if (isNaN(recipientUserId) || recipientUserId <= 0)
                return res.status(400).json({ status: 'ERROR', message: 'Valid recipient ID is required' });
            if (currentUserId === recipientUserId)
                return res.status(400).json({ status: 'ERROR', message: 'Cannot fetch conversation with yourself' });
            const messages = await MessageService.getConversation(currentUserId, recipientUserId, 50);
            console.log('Messages successfully fetched');
            return (res.status(200).json({ message: 'Messages successfully fetched', data: messages }));
        }
        catch (error) {
            console.log(' an error occured inside fetch conversation');
            return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
        }
    },
    fetchAllConversations: async (req, res) => {
        try {
            const currentUserId = req.user.id;
            if (!currentUserId)
                return res.status(400).json({ error: 'Missing currentUserId' });
            const conversationList = await MessageService.getConversationList(currentUserId);
            console.log('Messages successfully fetched');
            return (res.status(200).json({ message: 'ConversationList sucessfully fetched', data: conversationList }));
        }
        catch (error) {
            console.log(' an error occured inside fetchAllConversation');
            return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
        }
    },
    sendMessage: async (req, res) => {
        try {
            const currentUserId = req.user.id;
            const recipientUserId = Number(req.params.recipientId);
            const { content } = req.body;
            if (!currentUserId)
                return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
            if (isNaN(recipientUserId) || recipientUserId <= 0)
                return res.status(400).json({ status: 'ERROR', message: 'Valid recipient ID is required' });
            if (currentUserId === recipientUserId)
                return res.status(400).json({ status: 'ERROR', message: 'You cannot send a message to yourself' });
            if (!content || typeof content !== 'string' || !content.trim())
                return res.status(400).json({ status: 'ERROR', message: 'Message content cannot be empty' });
            const savedMsg = await MessageService.saveMessage(currentUserId, recipientUserId, content.trim());
            const io = req.app.get('io');
            if (io)
                io.to(`user_${recipientUserId}`).emit('receive_direct_message', savedMsg);
            console.log('Messages successfully sent');
            return res.status(201).json({ data: savedMsg });
        }
        catch (error) {
            console.log(' an error occured inside send message');
            return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
        }
    },
    updateMessage: async (req, res) => {
        try {
            const currentUserId = req.user.id;
            const messageToUpdateId = Number(req.params.messageId);
            const { content } = req.body;
            if (!currentUserId)
                return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
            if (isNaN(messageToUpdateId) || messageToUpdateId <= 0)
                return res.status(400).json({ status: 'ERROR', message: 'Valid recipient ID is required' });
            if (!content || typeof content !== 'string' || !content.trim())
                return res.status(400).json({ status: 'ERROR', message: 'Message content cannot be empty' });
            const uniqueMessage = await MessageService.getMessage(messageToUpdateId);
            if (!uniqueMessage)
                return res.status(404).json({ status: 'ERROR', message: 'Message not found' });
            if (uniqueMessage.senderId !== currentUserId)
                return res.status(403).json({ status: 'ERROR', message: 'You can only edit your own messages' });
            const updatedMsg = await MessageService.updateMessage(uniqueMessage.id, content.trim());
            const io = req.app.get('io');
            if (io)
                io.to(`user_${uniqueMessage.receiverId}`).emit('message_updated', updatedMsg);
            console.log('Messages successfully updated');
            return res.status(200).json({ data: updatedMsg });
        }
        catch (error) {
            console.log(' an error occured inside update message');
            return (res.status(500).json({ status: 'ERROR', message: 'Internal server error' }));
        }
    },
    deleteMessage: async (req, res) => {
        try {
            const currentUserId = req.user.id;
            const messageId = Number(req.params.messageId);
            if (isNaN(messageId) || messageId <= 0)
                return res.status(400).json({ status: 'ERROR', message: 'Valid message ID is required' });
            const existingMessage = await MessageService.getMessage(messageId);
            if (!existingMessage)
                return res.status(404).json({ status: 'ERROR', message: 'Message not found' });
            if (existingMessage.senderId !== currentUserId)
                return res.status(403).json({ status: 'ERROR', message: 'You can only delete your own messages' });
            await MessageService.deleteMessage(messageId);
            const io = req.app.get('io');
            if (io)
                io.to(`user_${existingMessage.receiverId}`).emit('message_deleted', { messageId });
            console.log('Messages successfully deleted');
            return (res.status(200).json({ status: 'OK', message: 'Message deleted successfully' }));
        }
        catch (error) {
            console.error('An error occurred inside deleteMessage:', error);
            return res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
        }
    },
};
export default messageController;
