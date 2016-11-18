// Dependencies
const Eris = require('eris')
const fs = require('fs')
const path = require('path')

// Setting up objects & vars
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
let pf = config.prefix
let notifyMessage = null
let cooldown = false
let bot = new Eris.CommandClient(config.bot_token, {}, {
  'name': 'ModBot',
  'owner': 'CF12',
  'prefix': pf,
  'description': 'A moderation bot designed by CF12'
})

// Attempts to connect the bot
bot.connect()

// Class: Logger
class Logger {
  // Log to console
  logConsole (log, type) {
    if (type === 'info') {
      console.log('INFO > ' + log)
    } else if (type === 'err') {
      console.log('ERROR > ' + log)
    } else if (type === 'debug') {
      console.log('DEBUG > ' + log)
    } else {
      console.log('ERROR > Invalid console log')
    }
  }

  // Log to channel
  logChannel (log, type) {
    if (type === 'info') {
      return '```> INFO: ' + log + '```'
    } else if (type === 'err') {
      return '```> ERROR: ' + log + '```'
    } else {
      console.log('ERROR > Invalid channel log')
    }
  }
}

// Def Logger
const logger = new Logger()

// On: Bot Ready
bot.on('ready', () => {
  console.log('INFO > Bot activated')
})

/*
  Commands
*/

// Simple Ping Command
bot.registerCommand('ping', (msg, args) => {
  msg.channel.createMessage('Pong!')
})

// Purge Command
bot.registerCommand('purge', (msg, args) => {
  if (args.length > 1) return logger.logChannel('Invalid usage! Correct syntax: ' + pf + 'purge [1-100]', 'err')
  if (args.length === 0) return logger.logChannel('Purges messages: Syntax - ' + pf + 'purge [1-100]', 'info')
  if (!msg.member.permission.has('manageMessages')) return logger.logChannel('User does not have the manageMessages permission!', 'err')
  if (cooldown) return logger.logChannel('Please wait a few seconds before trying again.', 'err')
  logger.logConsole('Memes', 'debug')
  let arg = args[0]
  if (arg % 1 === 0 && arg >= 1 && arg <= 100) {
    cooldown = true
    msg.channel.purge(args).then(() => {
      msg.channel.createMessage(logger.logChannel('Successfully purged ' + arg + ' message(s).', 'info')).then(msg => {
        setTimeout(() => {
          msg.delete()
          cooldown = false
        }, 3000)
      }, (err) => {
        return logger.logChannel('Error while processing request. (Does the bot have proper permissions?) See error below:\n' + err, 'err')
      })
    }, (err) => {
      return logger.logChannel('Error while processing request. (Does the bot have proper permissions?) See error below:\n' + err, 'err')
    })
  } else {
    return logger.logChannel('Invalid arguments! Use an integer from 1 to 100 for your parameter.', 'err')
  }
}, {
  'description': 'Purge messages in the current channel',
  'fullDescription': 'Purges a number of messages from channel the command is called in.',
  'usage': pf + 'purge <1-100>'
})

// Debug Command
bot.registerCommand('db', (msg, args) => {
  logger.logConsole(msg.member.permission.has('manageMessages'), 'debug')
})

bot.on('messageCreate', (msg) => {
  if (msg.author.bot) return
  if (notifyMessage === null) notifyMessage = msg

  msg.channel.getMessages(1, notifyMessage.id)
  .then((msgs) => {
    if (msgs[0].content === msg.content && msgs[0].author.id === msg.author.id) {
      msg.channel.unsendMessage(msg.id)
      if (notifyMessage === msg) {
        msg.channel.createMessage('```SPAMBLOCK™: Spam detected. Please don\'t spam.```')
        .then((nmsg) => {
          notifyMessage = nmsg
          setTimeout(() => {
            notifyMessage = null
            nmsg.delete()
          }, 3000)
        })
      } else return
    }
  }, (err) => {
    logger.logConsole(err, 'err')
  })
})

// On: Bot Error
bot.on('error', (err, id) => {
  if (err) {
    logger.logConsole('Unknown error has occured to shard ' + id + '. Please see stack trace', 'err')
    throw err
  }
})
