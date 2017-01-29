/*
███    ███  ██████  ██████  ██████   ██████  ████████
████  ████ ██    ██ ██   ██ ██   ██ ██    ██    ██
██ ████ ██ ██    ██ ██   ██ ██████  ██    ██    ██
██  ██  ██ ██    ██ ██   ██ ██   ██ ██    ██    ██
██      ██  ██████  ██████  ██████   ██████     ██
*/
// - A discord moderation bot
// - Built on discord.js v11.0
// - By: CF12

// Dependencies
const DiscordJS = require('discord.js')
const logger = require('./logger.js')
const fs = require('fs')
const path = require('path')

// Load Config Files
try {
  var config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'config.json'), 'utf8'))
} catch (err) {
  if (err) throw Error('Configuration files appear to be missing / corrupt. Please double check the configs.')
}

// Variables
let pf = config.prefix
let cache = {
  active_warning: false,
  user_cache: {}
}
let userCache = cache.user_cache

// Constructions
let bot = new DiscordJS.Client()

// Functions
function pfCommand (command) { return String(pf + command) }

// Event: On Ready
bot.on('ready', () => {
  logger.logConsole('info', 'Bot is now online')
})

// Event: On Message
bot.on('message', (msg) => {
  // If author is a bot, cancels interactions
  if (msg.author.bot) return

  // Variable Shortcuts - General
  let msgContent = msg.content
  let msgUser = msg.author
  let msgMember = msg.member
  let msgChannel = msg.channel
  let msgArray = msgContent.split(' ')
  let msgCommand = msgArray[0].slice(pf.length).toUpperCase()
  let msgArgs = msgArray.slice(1, msgArray.length)

  // Command Handler
  if (msg.content.startsWith(pf)) {
    // Command: Purge messages
    if (msgCommand === ('PURGE')) {
      // Checks for MANAGE_MESSAGES permission
      if (!msgMember.hasPermission('MANAGE_MESSAGES')) return logger.logChannel(msgChannel, 'noperm', 'You need the **MANAGE_MESSAGES** permission in order to use this command.')

      // Checks for proper args
      if (msgArgs.length > 1 || (msgArgs[0] > 100 || msgArgs[0] < 1)) return logger.logChannel(msgChannel, 'err', 'Invalid Usage! Proper Usage: **' + pfCommand('purge') + ' [1 - 100]**')

      // Grabs msgs and purges them
      msgChannel.fetchMessages({limit: msgArgs[0]})
      .then(msgs => {
        msg.delete()
        msgChannel.bulkDelete(msgs)
        logger.logChannel(msgChannel, 'info', 'Successfully purged **' + msgArgs[0] + '** message(s)')
        .then(msg => {
          setTimeout(() => {
            msg.delete()
          }, 5000)
        })
      })
    }

    return
  }

  // Caches members if they don't exist in the cache yet
  if (!(msgMember.id in userCache)) {
    userCache[msgMember.id] = {
      username: msgUser.username,
      identifier: msgUser.toString(),
      last_msg_timestamp: 0
    }
  }

  // Spam Protection
  if (msg.createdTimestamp - userCache[msgMember.id].last_msg_timestamp <= 1000) {
    msg.delete()
    if (!cache.active_warning) {
      cache.active_warning = true
      logger.logChannel(msgChannel, 'spam', 'Please don\'t spam, ' + userCache[msgMember.id].identifier)
      .then((msg) => {
        setTimeout(() => {
          cache.active_warning = false
          msg.delete()
        }, 5000)
      })
    }
  }

  // Updates last messahe timestamp for user
  userCache[msgMember.id].last_msg_timestamp = msg.createdTimestamp
})

// Logs the bot in
bot.login(config.bot_token)
