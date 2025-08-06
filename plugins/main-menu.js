import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import { promises as fsPromises } from 'fs'
import { join } from 'path'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn, usedPrefix, __dirname, participants }) => {
  try {
    await m.react('✨️')

    let { exp, bank, registered } = global.db.data.users[m.sender]
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let groupUserCount = m.isGroup ? participants.length : '-'

    let perfil = await conn.profilePictureUrl(conn.user.jid, 'image')
      .catch(() => 'https://i.postimg.cc/GmJ3fQ0g/1753130552980.jpg')

    // Preparar el tag del usuario
    const userId = m.sender.split('@')[0]
    let taguser = `@${userId}`
    let phone = PhoneNumber('+' + userId)
    let pais = phone.getRegionCode() || 'Desconocido 🌐'

    const vids = [
      'https://files.cloudkuimages.guru/videos/3WYTgqIb.mp4',
      'https://files.cloudkuimages.guru/videos/3WYTgqIb.mp4',
      'https://files.cloudkuimages.guru/videos/3WYTgqIb.mp4'
    ]
    let videoUrl = vids[Math.floor(Math.random() * vids.length)]

    const header = [
      `╔═━★•°*"'*°•★━═╗`,
      `    ✦ ꧁𝐖𝐞𝐥𝐜𝐨𝐦𝐞꧂ ✦`,
      `╚═━★•°*"'*°•★━═╝`
    ].join('\n')

    const user = global.db.data.users[m.sender] || {};
    const country = user.country || '';
    const isPremium = user.premium || false;


    const channelRD = { 
      id: '120363422492747023@newsletter', 
      name: 'Oficial channel Melodias-MD'
    }


    const metaMsg = {
      quoted: global.fakeMetaMsg,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        },
        externalAdReply: {
          title: 'Melodias-MD',
          body: '© 𝑃𝑜𝑤𝑒𝑟𝑒𝑑 𝐵𝑦 Juan',
          mediaUrl: null,
          description: null,
          previewType: "PHOTO",
          thumbnailUrl: 'https://i.postimg.cc/GmJ3fQ0g/1753130552980.jpg',
          sourceUrl: 'https://github.com/El-brayan502/Roxy-MD--Multi-Device/',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }


    let battery = '';
    try {
      if (global.battery) {
        battery = global.battery.value + '%';
      } else {
        battery = 'N/A';
      }
    } catch {
      battery = 'N/A';
    }

    let activeConnections = 1;
    try {
      if (global.conns && typeof global.conns === 'object') {
        activeConnections = Object.keys(global.conns).length || 1;
      }
    } catch {
      activeConnections = 1;
    }

    const body = `
╭──❀「 💫 𝑴𝒆𝒍𝒐𝒅𝒊𝒂𝒔-𝑴𝑫 」❀───╮
│ 🧸 Nombre del bot: *Melodias-MD*
│ 👑 Usuario: *${taguser}*
│ 💖 Estado: *Premium Gratuito*
│ ⏱️ Tiempo activo: *${uptime}*
│ 🔋 Batería: *${battery}*
│ 🛡️ Modo: *${global.opts['self'] ? 'Privado 🔒' : 'Público 🌐'}*
│ 🧠 Inteligencia: *Nivel Senpai 🧠*
│ 💬 Chats activos: *${activeConnections}*
│
├───〔 🗓️ 𝐃𝐀𝐓𝐎𝐒 𝐃𝐄 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 🗓️ 〕────
│ 📆 Fecha: *${new Date().toLocaleDateString('es-MX')}*
│ ⏰ Hora: *${new Date().toLocaleTimeString('es-MX')}*
│ 💻 Plataforma: *WhatsApp*
│ 🧩 Versión del Bot: *1.0.0-MD*
╰────────────────────────────╯
 𝓜𝓮𝓵𝓸𝓭𝓲𝓪𝓼  -MD

𓆩 𝓛𝓲𝓼𝓽𝓪 - 𝓓𝓮 - 𝓒𝓸𝓶𝓪𝓷𝓭𝓸𝓼 𓆪


╭╼┤🎮 𝙈𝘼𝙄𝙉 & 𝙍𝙋𝙂 ├╾╮
│✨ ${usedPrefix}reg <nombre edad>
│✨ ${usedPrefix}unreg
│✨ ${usedPrefix}menu
│✨ ${usedPrefix}juegos
│✨ ${usedPrefix}ping
│✨ ${usedPrefix}grupos
│✨ ${usedPrefix}owner
╰───────────────╯

╭╼┤🎉 𝙁𝙐𝙉 ├╾╮
│🎲 ${usedPrefix}top <texto>
│🤣 ${usedPrefix}gay
│🫦 ${usedPrefix}pajeame
│📦 ${usedPrefix}doxeo @usuario
│🧨 ${usedPrefix}doxuer @usuario
│💘 ${usedPrefix}formarpareja
│🎴 ${usedPrefix}huevo
╰───────────────╯

╭╼┤🍥 𝘼𝙉𝙄𝙈𝙀 ├╾╮
│💋 ${usedPrefix}kiss
│😠 ${usedPrefix}angry
│🦊 ${usedPrefix}bite
│🌙 ${usedPrefix}buenasnoches
│🌞 ${usedPrefix}buenosdías
│☕ ${usedPrefix}cafe
│😭 ${usedPrefix}cry
│🫂 ${usedPrefix}cuddle
│😄 ${usedPrefix}happy
│🙋 ${usedPrefix}hello
│🧸 ${usedPrefix}loli
│💌 ${usedPrefix}rw
│📜 ${usedPrefix}reclamawaifu
╰───────────────╯

╭╼┤📥 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝙎 ├╾╮
│📹 ${usedPrefix}tiktok
│🎶 ${usedPrefix}play
│📌 ${usedPrefix}pindl <link>
│📸 ${usedPrefix}instagram <link>
│📘 ${usedPrefix}facebook <link>
╰───────────────╯

╭╼┤🔍 𝘽𝙐𝙎𝘾𝘼𝘿𝙊𝙍𝙀𝙎 ├╾╮
│🔎 ${usedPrefix}yts
│🖼️ ${usedPrefix}pinterest
│🧩 ${usedPrefix}aptoide <texto>
│📲 ${usedPrefix}tiktoksearch
│🕸️ ${usedPrefix}ssweb
│🎧 ${usedPrefix}spotify
╰───────────────╯

╭╼┤👥 𝙂𝙍𝙐𝙋𝙊 ├╾╮
│🚫 ${usedPrefix}advertencia <@tag> <texto>
│📛 ${usedPrefix}perfil
│🔐 ${usedPrefix}grupocerrar
│🔓 ${usedPrefix}grupoabrir
│📢 ${usedPrefix}invocar
│🖼️ ${usedPrefix}setppgrupo
│👢 ${usedPrefix}kick <@tag>
│🔖 ${usedPrefix}tag
│🗑️ ${usedPrefix}del
╰───────────────╯

╭╼┤🎨 𝙄𝘼 & 𝘼𝙍𝙏𝙀 ├╾╮
│🎨 ${usedPrefix}magicstudio <texto>
│🤖 ${usedPrefix}ai <texto>
│🖌️ ${usedPrefix}editfoto <descripción>
│🧠 ${usedPrefix}wpw
│🌸 ${usedPrefix}pollinations <texto>
│🔮 ${usedPrefix}gemini
│🧼 ${usedPrefix}bgremover <imagen>
╰───────────────╯

╭╼┤🌐 𝙄𝙉𝙏𝙀𝙍𝙉𝙀𝙏 ├╾╮
│🌍 ${usedPrefix}nimegamesearch
│🛜 ${usedPrefix}meio
╰───────────────╯

╭╼┤🤖 𝙅𝘼𝘿𝙄𝘽𝙊𝙏 ├╾╮
│🧬 ${usedPrefix}bots
│🧾 ${usedPrefix}code
╰───────────────╯

╭╼┤👑 𝙊𝙒𝙉𝙀𝙍 ├╾╮
│✍️ ${usedPrefix}setname
│🖼️ ${usedPrefix}setpp <img>
│♻️ ${usedPrefix}restart
│⬆️ ${usedPrefix}update
╰───────────────╯

╭╼┤🎭 𝙎𝙏𝙄𝘾𝙆𝙀𝙍 ├╾╮
│🎟️ ${usedPrefix}sticker <img>
│🎀 ${usedPrefix}brat *<texto>*
╰───────────────╯

╭╼┤🧰 𝙏𝙊𝙊𝙇𝙎 ├╾╮
│🧠 ${usedPrefix}iqc <texto>
│🎙️ ${usedPrefix}rvocal <audio>
│🌐 ${usedPrefix}tourl2
│💎 ${usedPrefix}hd
│🌆 ${usedPrefix}tourl <imagen>
╰───────────────╯
`.trim()

    // Configurar datos para el mensaje
    const botname = '◌*̥₊ Melodias-Mᴅ ◌❐🎋༉'
    const textbot = ' Melodias by Juan ✨️'
    const banner = perfil
    const redes = 'https://whatsapp.com/channel/0029VbAQWwrEAKWOSpS8lL1e'
    
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: body,
      gifPlayback: true,
      mentions: [m.sender], 
      ...metaMsg
    })

  } catch (e) {
    console.error(e)
    try {
      await conn.sendMessage(m.chat, { 
        text: `✘ Error al enviar el menú: ${e.message}`,
        mentions: [m.sender] 
      }, { 
        quoted: m 
      })
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError)
      await conn.sendMessage(m.chat, { 
        text: `✘ Error al enviar el menú: ${e.message}`
      })
    }
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu','help','menú','allmenu','menucompleto']
handler.register = true
export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
