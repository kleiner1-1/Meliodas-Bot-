import {WAMessageStubType} from '@whiskeysockets/baileys';
import PhoneNumber from 'awesome-phonenumber';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import { watchFile } from 'fs';
import '../config.js';

const terminalImage = global.opts['img'] ? require('terminal-image') : '';
const urlRegex = (await import('url-regex-safe')).default({ strict: false });
const mid = { idioma_code: 'es' };

export default async function (m, conn = { user: {} }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES');
  const timeStr = now.toLocaleTimeString('it-IT', { hour12: false }).slice(0, 8);
  
  const hour = now.getHours();
  const dayIcon = hour < 6 ? '🌙' : hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙';
  
  let _name = await conn.getName(m.sender) || 'Anónimo';
  let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ` ~${_name}` : '');
  let chat = await conn.getName(m.chat);
  let user = global.db.data.users[m.sender];
  let me = PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international');


  
  const typeRaw = m.mtype || 'Unknown';
  const grad = gradient(['#ff5f6d', '#ffc371']);
  const stamp = grad(`${dayIcon} ${dateStr} ${timeStr}`);


  
  let filesize = (m.msg ?
    m.msg.vcard ?
      m.msg.vcard.length :
      m.msg.fileLength ?
        m.msg.fileLength.low || m.msg.fileLength :
        m.msg.axolotlSenderKeyDistributionMessage ?
          m.msg.axolotlSenderKeyDistributionMessage.length :
          m.text ?
            m.text.length :
            0
    : m.text ? m.text.length : 0) || 0;


  const lines = [
    `${chalk.cyan('❯')} ${chalk.white.bold('Bot:')} ${chalk.cyan(me + (conn.user.name ? ` ~${conn.user.name}` : '') + (conn.user.jid == global.conn.user.jid ? '' : ' 【𝗦𝗨𝗕 𝗕𝗢𝗧】'))}`,
    `${chalk.cyan('❯')} ${chalk.white.bold('ID:')} ${chalk.yellow(m.sender)}`,
    `${chalk.cyan('❯')} ${chalk.white.bold('Usuario:')} ${chalk.yellow(sender)} / ${chalk.magentaBright.bold(user?.role?.replace(/\*/g, '') || 'N/A')}`,
    `${chalk.cyan('❯')} ${chalk.white.bold('Premium:')} ${user?.premiumTime > 0 ? '✅' : '❌'}`,
    `${chalk.cyan('❯')} ${chalk.white.bold('Recursos:')} 🆙 ${user?.level || 0} ❇️ ${user?.exp || 0} 💎 ${user?.limit || 0} 🐱 ${user?.money || 0}`,
    m.chat.includes('@s.whatsapp.net')
      ? `${chalk.cyan('❯')} ${chalk.white.bold('Chat:')} ${chalk.greenBright('Privado')} ${chalk.dim(`con ${_name}`)}`
      : m.chat.includes('@g.us')
        ? `${chalk.cyan('❯')} ${chalk.white.bold('Chat:')} ${chalk.magentaBright('Grupo')} ${chalk.dim(`${chat}`)}`
        : m.chat.includes('@newsletter')
          ? `${chalk.cyan('❯')} ${chalk.white.bold('Chat:')} ${chalk.yellowBright('Canal')} ${chalk.dim(`${chat}`)}`
          : '',
    `${chalk.cyan('❯')} ${chalk.white.bold('Tipo:')} ${chalk.bgBlueBright.bold(mid.idioma_code === 'es' ? await formatMessageTypes(m.mtype) : await formaTxt(m.mtype))}`,
    `${chalk.cyan('❯')} ${chalk.white.bold('Tamaño:')} ${chalk.red(filesize + ' B')}`
  ].filter(Boolean);


  
  console.log(
    boxen(lines.join('\n'), {
      title: stamp,
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      float: 'center'
    })
  );


  
  let img;
  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false;
  } catch (e) {
    console.error(e);
  }
  if (img) console.log(img.trimEnd());

  
  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '');
    log = log.split('\n').map(line => {
      if (line.trim().startsWith('>')) {
        return chalk.bgGray.dim(line.replace(/^>/, '┃'));
      }
      return line;
    }).join('\n');
    
    if (log.length < 1024) {
      log = log.replace(urlRegex, (url) => chalk.blueBright(url));
    }
    
    if (m.mentionedJid) {
      for (let user of m.mentionedJid) {
        log = log.replace('@' + user.split`@`[0], chalk.blueBright('@' + await conn.getName(user)));
      }
    }
    
    console.log(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log);
  }
}

let file = global.__filename(import.meta.url);
watchFile(file, () => {
  console.log(chalk.redBright("Update 'lib/print.j'"));
});

async function formatMessageStubType(messageStubType, name_user) {
  switch (messageStubType) {
    case 0:
      return 'Desconocido';
    case 1:
      return 'Revocado';
    case 2:
      return 'Texto cifrado';
    case 20:
      return 'Se ha creado un grupo';
    case 21:
      return 'Nombre del grupo modificado';
    case 22:
      return 'Se cambió la imagen del grupo';
    case 23:
      return 'Nuevo enlace del grupo';
    case 24:
      return 'Nueva descripción del grupo';
    case 25:
      return 'Restricciones del grupo cambiada';
    case 26:
      return 'Se configuró quien puede enviar mensajes en el grupo';
    case 27:
      return `${name_user} se ha unido al grupo`;
    case 28:
      return `${name_user} ha sido eliminado del grupo`;
    case 29:
      return `${name_user} es nuevo admin. del grupo`;
    case 30:
      return `${name_user} dejó de ser admin. del grupo`;
    case 31:
      return `Se ha invitado a ${name_user} al grupo`;
    case 32:
      return `${name_user} ha salido del grupo`;
    case 145:
      return `Se configuró "aprobar miembros nuevo" en el grupo`;
    case 171:
      return `Se configuró "agregar a otros miembros" en el grupo`;
    default:
      return messageStubType;
  }
}

async function formatMessageTypes(messageStubType) {
  switch (messageStubType) {
    case 'conversation':
      return 'Conversación';
    case 'imageMessage':
      return 'Imagen';
    case 'contactMessage':
      return 'Contacto';
    case 'locationMessage':
      return 'Ubicación';
    case 'extendedTextMessage':
      return 'Texto';
    case 'documentMessage':
      return 'Documento';
    case 'audioMessage':
      return 'Audio';
    case 'videoMessage':
      return 'Video';
    case 'call':
      return 'Llamada';
    case 'chat':
      return 'Chat';
    case 'protocolMessage':
      return 'Cifrado';
    case 'contactsArrayMessage':
      return 'Lista de contactos';
    case 'highlyStructuredMessage':
      return 'Estructurado';
    case 'fastRatchetKeySenderKeyDistributionMessage':
      return 'Distribución de claves';
    case 'sendPaymentMessage':
      return 'Mensaje de pago';
    case 'liveLocationMessage':
      return 'Ubicación en vivo';
    case 'requestPaymentMessage':
      return 'Solicitar pago';
    case 'declinePaymentRequestMessage':
      return 'Rechazar solicitud de pago';
    case 'cancelPaymentRequestMessage':
      return 'Cancelar solicitud de pago';
    case 'templateMessage':
      return 'Mensaje de plantilla';
    case 'stickerMessage':
      return 'Sticker';
    case 'groupInviteMessage':
      return 'Invitación a grupo';
    case 'templateButtonReplyMessage':
      return 'Respuesta de botón de plantilla';
    case 'productMessage':
      return 'Producto';
    case 'deviceSentMessage':
      return 'Mensaje enviado por dispositivo';
    case 'messageContextInfo':
      return 'Contexto del mensaje';
    case 'listMessage':
      return 'Lista';
    case 'viewOnceMessage':
      return 'Mensaje de una sola vez';
    case 'orderMessage':
      return 'Pedido';
    case 'listResponseMessage':
      return 'Respuesta de lista';
    case 'ephemeralMessage':
      return 'Efímero';
    case 'invoiceMessage':
      return 'Factura';
    case 'buttonsMessage':
      return 'Botones';
    case 'buttonsResponseMessage':
      return 'Respuesta de botones';
    case 'paymentInviteMessage':
      return 'Invitación de pago';
    case 'interactiveMessage':
      return 'Interactivo';
    case 'reactionMessage':
      return 'Reacción';
    case 'stickerSyncRmrMessage':
      return 'Sincronización de sticker';
    case 'interactiveResponseMessage':
      return 'Respuesta interactiva';
    case 'pollCreationMessage':
      return 'Creación de encuesta';
    case 'pollUpdateMessage':
      return 'Actualización de encuesta';
    case 'keepInChatMessage':
      return 'Mensaje de mantener en chat';
    case 'documentWithCaptionMessage':
      return 'Documento con leyenda';
    case 'requestPhoneNumberMessage':
      return 'Solicitud de número de teléfono';
    case 'viewOnceMessageV2':
      return 'Mensaje de una sola vez v2';
    case 'encReactionMessage':
      return 'Reacción encriptada';
    case 'editedMessage':
      return 'Mensaje editado';
    case 'viewOnceMessageV2Extension':
      return 'Extensión de mensaje de una vista v2';
    case 'pollCreationMessageV2':
      return 'Creación de encuesta v2';
    case 'scheduledCallCreationMessage':
      return 'Llamada programada';
    case 'groupMentionedMessage':
      return 'Mención en grupo';
    case 'pinInChatMessage':
      return 'Mensaje fijado en chat';
    case 'pollCreationMessageV3':
      return 'Creación de encuesta v3';
    case 'scheduledCallEditMessage':
      return 'Edición de llamada programada';
    case 'ptvMessage':
      return 'Mensaje de PTV';
    case 'botInvokeMessage':
      return 'Invocación de bot';
    case 'callLogMesssage':
      return 'Registro de llamada';
    case 'messageHistoryBundle':
      return 'Paquete de historial de mensajes';
    case 'encCommentMessage':
      return 'Comentario encriptado';
    case 'bcallMessage':
      return 'Mensaje de llamada B';
    case 'lottieStickerMessage':
      return 'Mensaje de sticker Lottie';
    case 'eventMessage':
      return 'Evento';
    case 'commentMessage':
      return 'Comentario';
    case 'newsletterAdminInviteMessage':
      return 'Mensaje de invitación de administrador';
    case 'extendedTextMessageWithParentKey':
      return 'Mensaje de texto con clave principal';
    case 'placeholderMessage':
      return 'Marcador de posición';
    case 'encEventUpdateMessage':
      return 'Actualización de evento encriptado';
    default:
      return messageStubType || 'No especificado';
  }
}

async function formaTxtStub(messageType_) {
  let words = messageType_.split('_');
  let formattedMessage = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  formattedMessage = formattedMessage.join(' ');
  return formattedMessage;
}

async function formaTxt(messageType) {
  let formattedMessage = messageType.charAt(0).toUpperCase() + messageType.slice(1);
  formattedMessage = formattedMessage.replace(/([A-Z])/g, ' $1').trim();
  return formattedMessage;
}