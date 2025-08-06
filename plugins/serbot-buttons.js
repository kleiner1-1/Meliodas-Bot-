import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
    const device = await getDevice(m.key.id);

    if (device !== 'desktop' && device !== 'web') {
        const messa = await prepareWAMessageMedia({ image: { url: 'https://iili.io/FGe9ybI.jpg' }}, { upload: conn.waUploadToServer });
        const interactiveMessage = {
            body: {
                text: `🤖 CONVIÉRTETE EN SUB BOT 🤖\n\nSelecciona el método de conexión que prefieres para convertirte en un sub bot. Elige entre:\n\n» QR: Escanea un código QR para conectarte\n» Código: Usa un código de 8 dígitos para vincularte\n\nElige una opción para comenzar.`
            },
            footer: { text: `${global.dev}`.trim() },
            header: {
                title: `MÉTODOS DE CONEXIÓN`,
                hasMediaAttachment: true,
                imageMessage: messa.imageMessage,
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: 'SELECCIONA TU MÉTODO DE CONEXIÓN',
                            sections: [{
                                title: "Métodos Disponibles",
                                rows: [
                                    { 
                                        title: "Código de vinculación",
                                        description: "Conectarse usando un código de 8 dígitos",
                                        id: `${prefijo}code`
                                    },
                                    {
                                        title: "Código QR",
                                        description: "Escanear un código QR para conectarse",
                                        id: `${prefijo}qr`
                                    }
                                ]
                            }]
                        })
                    }
                ],
                messageParamsJson: ''
            }
        };

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage,
                },
            },
        }, { userJid: conn.user.jid, quoted: null });
        conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } else {
        m.reply('⚠️ Este comando solo está disponible para dispositivos móviles.');
    }
};

handler.help = ['serbot'];
handler.tags = ['jadibot'];
handler.command = /^(serbot|jadibot|sersubbot)$/i;
handler.register = true;

export default handler;
