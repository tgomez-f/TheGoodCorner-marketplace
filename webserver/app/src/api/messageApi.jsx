import { useUserStore } from '../stores/userStore';
import { socket } from '../socket';
import { apiClient } from './client';

export async function SendMessage(receiver_id, content) {
    const userId = useUserStore.getState().user?.id;
    
    if (!userId) {
        throw new Error('Pas d\'userId trouvé');
    }
    if (!receiver_id) {
        throw new Error('Pas de destinataire trouvé');
    }
    
    const text = typeof content === 'string' ? content.trim() : '';
    if (!text) {
        throw new Error('Le contenu du message ne peut pas être vide');
    }
    
    if (text.length > 5000) {
        throw new Error('Contenu du message trop long');
    }
    
    if (!socket || !socket.connected) {
        throw new Error('Socket non connecté');
    }
    
    socket.emit('send_direct_message', {
        senderId: Number(userId),
        receiverId: Number(receiver_id),
        content: content
    });
}

export async function GetMessage(receiver_id)
{
    const { data } = await apiClient.get(`/message/${receiver_id}`)
    return data.data
}

export async function GetAllMessages()
{
    const { data } = await apiClient.get("/message")
    return data.data
}



export async function UpdateMessage(message_id, content)
{
    const { data } = await apiClient.put(`/message/${message_id}`, {
        content: content
    })
    return data.data
}

export async function DeleteMessage(message_id)
{
    await apiClient.delete(`/message/${message_id}`)
}