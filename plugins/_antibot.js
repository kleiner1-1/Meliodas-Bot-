export async function before(m, { conn, isAdmin, isBotAdmin, participants, isMods }) {
    if (!m.isGroup) return;
    
    let chat = global.db.data.chats[m.chat];
    let bot = global.db.data.settings[conn.user.jid] || {};
    
    let isOwner = false;
    try {
        isOwner = Array.isArray(global.owner) 
            ? global.owner.some(([number]) => m.sender && m.sender.includes(number))
            : false;
    } catch {
        isOwner = false;
    }
    
    let isSelf = m.sender === conn.user.jid;

    function isJidSpoofed(jid) {
        return typeof jid === 'string' && /:|@lid/.test(jid)
    }
    
    function isMsgIDFake(id) {
        return typeof id === 'string' && /^[A-Z]{2,6}-[0-9A-F]{8,}$/i.test(id)
    }
    
    const protectionLevels = {
        low: {
            patterns: [
                msg => msg.key?.id?.startsWith('BAE5') && msg.key?.id?.length >= 16,
                msg => msg.key?.id?.startsWith('MD') && msg.key?.id?.length >= 20,
                msg => msg.body?.match(/\b(bot response|auto response)\b/i),
                msg => {
                    const isCommandResponse = msg.quoted && 
                                           msg.quoted.text?.match(/^[.!\/][a-zA-Z]/) &&
                                           Date.now() - (msg.messageTimestamp * 1000) < 2000;
                    return isCommandResponse;
                }
            ],
            description: 'Detección básica de bots'
        },
        medium: {
            patterns: [
                msg => msg.key?.id?.startsWith('NJX-'),
                msg => msg.key?.id?.startsWith('B24E'),
                msg => msg.key?.id?.startsWith('3EB0'),
                msg => msg.key?.id?.length >= 40,
                msg => msg.body?.includes('Powered by'),
                msg => msg.pushName?.match(/\b(bot|auto|script)\b/i),
                msg => msg?.messageTimestamp && (Date.now() - (msg.messageTimestamp * 1000) < 50),
                msg => {
                    const isAutoResponse = msg.quoted && 
                                         msg.quoted.text?.match(/^[.!\/]/) &&
                                         Date.now() - (msg.messageTimestamp * 1000) < 1000;
                    return isAutoResponse;
                }
            ],
            description: 'Detección moderada con análisis de patrones'
        },
        high: {
            patterns: [
                msg => msg.messageTimestamp && (Date.now() - (msg.messageTimestamp * 1000) < 100),
                msg => msg.key?.fromMe === false && msg.key?.id?.length > 21,
                msg => msg.key?.id?.startsWith('WhatsApp'),
                msg => msg.key?.id?.match(/^[A-Z0-9]{20,}$/),
                msg => /\b(automated|script|webhook)\b/i.test(msg.body || ''),
                msg => msg.body?.match(/(wa\.me|whatsapp\.com).*bot/i),
                msg => msg.body?.match(/^[.!\/]([a-zA-Z]+\.?)+/),
                msg => msg.messageTimestamp && msg?.messageStamp && 
                      (msg.messageStamp - msg.messageTimestamp < 0.1)
            ],
            description: 'Detección agresiva con análisis profundo'
        }
    };

    if (!chat.protectionLevel) chat.protectionLevel = 'medium';
    
    // Función eliminada para evitar notificaciones duplicadas
    
    if (m.fromMe) return true;

    const isBotMessage = (msg) => {
        if (!msg) return false;
        
        let suspectJIDs = [
            msg.sender,
            msg.quoted?.sender,
            msg.key?.participant,
            msg.participant,
            msg.msg?.contextInfo?.participant
        ].filter(Boolean);
        
        let isSpoofed = suspectJIDs.some(isJidSpoofed);
        let isFakeMsg = isMsgIDFake(msg.key?.id);
        
        if (isSpoofed || isFakeMsg) return true;
        
        const currentLevel = chat.protectionLevel || 'medium';
        const levelPatterns = protectionLevels[currentLevel].patterns;
        
        const messageToCheck = {
            ...msg,
            body: msg.text || msg.caption || msg.message?.conversation || '',
            pushName: msg.pushName || msg.verifiedName || '',
            key: msg.key || {},
            messageTimestamp: msg.messageTimestamp || (msg.timestamp ? msg.timestamp / 1000 : 0)
        };
        
        return levelPatterns.some(pattern => {
            try {
                return pattern(messageToCheck);
            } catch (error) {
                console.error('Error en patrón de detección:', error);
                return false;
            }
        });
    };

    const isUserCommand = m.text?.startsWith('.bot') || m.text?.startsWith('!bot') || m.text?.startsWith('/bot');
    if (isUserCommand || isSelf || isAdmin || isMods || isOwner) return true;

    if (chat.antiBot) {
        let shouldCheck = false;
        let targetMsg = null;
        let targetParticipant = null;
        let targetMessageId = null;

        if (m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetMsg = {
                ...m.quoted || m.message?.extendedTextMessage?.contextInfo,
                text: m.quoted?.text || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation,
                message: m.quoted?.message || m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
                key: m.quoted?.key || m.message?.extendedTextMessage?.contextInfo?.stanzaId
            };
            targetParticipant = targetMsg?.participant || targetMsg?.sender;
            targetMessageId = targetMsg?.stanzaId || targetMsg?.id || targetMsg?.key;
            shouldCheck = true;
        }

        if (!shouldCheck || m.message?.conversation?.match(/^[.!\/][a-zA-Z]/) || m.key?.id?.length > 21) {
            targetMsg = {
                ...m,
                text: m.text || m.message?.conversation,
                message: m.message,
                key: m.key
            };
            targetParticipant = m.sender;
            targetMessageId = m.key?.id;
            shouldCheck = true;
        }

        if (!shouldCheck || targetParticipant === conn.user.jid) return true;

        const botParticipant = targetParticipant;
        const botMessageId = targetMessageId;

        if (isBotMessage(targetMsg)) {


            const warningMsg = {
                text: `*🤖 Bot Detectado Respondiendo Comandos*\n\n` +
                      `• ID: ${botParticipant.split('@')[0]}\n` +
                      `• Nivel: ${chat.protectionLevel.toUpperCase()}\n` +
                      `• Acción: Eliminación automática\n` +
                      `• Tiempo: 5 segundos\n\n` +
                      `_Este grupo está protegido contra bots_\n` +
                      `_Nivel de protección: ${protectionLevels[chat.protectionLevel].description}_`,
                mentions: [botParticipant]
            };

            await conn.sendMessage(m.chat, { text: warningMsg.text, mentions: warningMsg.mentions }, { quoted: antibot });

            if (isBotAdmin) {
                const eliminationTimeout = new Promise((resolve) => {
                    setTimeout(resolve, 5000);
                });

                try {
                    await eliminationTimeout;
                    
                    if (botMessageId) {
                        await conn.sendMessage(m.chat, { 
                            delete: { 
                                remoteJid: m.chat, 
                                fromMe: false, 
                                id: botMessageId, 
                                participant: botParticipant 
                            }
                        });
                    }

                    await conn.groupParticipantsUpdate(m.chat, [botParticipant], 'remove');
                    
                    await conn.sendMessage(m.chat, {
                        text: `✅ Bot eliminado exitosamente\n👤 ID: @${botParticipant.split('@')[0]}`,
                        mentions: [botParticipant]
                    }, { quoted: antibot });
                } catch (error) {
                    console.error('Error al eliminar bot:', error);
                    await conn.sendMessage(m.chat, { 
                        text: '❌ Error al intentar eliminar el bot detectado' 
                    }, { quoted: antibot });
                }
            } else {
                await conn.sendMessage(m.chat, { 
                    text: `⚠️ *Alerta*\n\nSe ha detectado un bot pero no tengo permisos de administrador para eliminarlo.\n\n_Para activar la protección completa, por favor dame permisos de administrador._`
                }, { quoted: antibot });
            }
        }
    }

    return true;
}