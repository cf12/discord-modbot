// Dependencies
const Eris = require('eris')
const fs = require('fs')
const path = require('path')

// Setting up objects & vars
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
let pf = config.prefix
let cooldown = false
let spamblockMessage = false
let spamblockNotifyMessage
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

// Function: Kills message after duration in seconds
function timeoutMsg (promise, timeout) {
  return promise.then((msg) => {
    setTimeout(() => {
      msg.delete()
    }, timeout * 1000)
  })
}

// Function: Analyzes 2 messages for similarities, and returns a percentage of similarities
function analyzeMessage (msg1, msg2) {
  if (msg1.attachments.length >= 1 || msg2.attachments.length >= 1) {
    if (msg1.content === msg2.content) return 100
    return 0
  }

  msg1 = msg1.content.toUpperCase()
  msg2 = msg2.content.toUpperCase()
  let simchar = 0

  for (var i = 0; i < msg1.length; i++) {
    if (msg2.indexOf(msg1[i]) !== -1) simchar = simchar + 1
  }

  return simchar / msg2.length * 100
}

// Def Logger
const logger = new Logger()

// On: Bot Ready
bot.on('ready', () => {
  console.log('INFO > Bot activated')
  bot.editStatus('online', {
    'name': 'v0.1.1 - by CF12'
  })
})

/*
  Commands
*/

// Simple Ping Command
bot.registerCommand('ping', (msg, args) => {
  msg.channel.createMessage('Pong!')
}, {
  'description': 'Pings the bot',
  'fullDescription': 'Throws a ping pong ball at the bot'
})

// Text similarities db command
bot.registerCommand('compare', (msg, args) => {
  msg.channel.createMessage(analyzeMessage(args[0], args[1]))
}, {
  'description': 'DB Compares 2 strings',
  'fullDescription': ''
})

// Purge Command
bot.registerCommand('purge', (msg, args) => {
  if (args.length > 1) {
    timeoutMsg(msg.channel.createMessage(logger.logChannel('Invalid usage! Correct syntax: ' + pf + 'purge [1-100]', 'err')), 5)
    return
  } else if (args.length === 0) {
    timeoutMsg(msg.channel.createMessage(logger.logChannel('Purges messages: ' + pf + 'purge [1-100]', 'info')), 5)
    return
  } else if (!msg.member.permission.has('manageMessages')) {
    timeoutMsg(msg.channel.createMessage(logger.logChannel('User does not have the manageMessages permission!', 'err')), 5)
    return
  } else if (cooldown) {
    timeoutMsg(msg.channel.createMessage(logger.logChannel('Please wait a few seconds before trying again.', 'err')), 5)
    return
  }

  let arg = args[0]

  if (arg % 1 === 0 && arg >= 1 && arg <= 100) {
    cooldown = true
    msg.channel.purge(arg).then(() => {
      msg.channel.createMessage(logger.logChannel('Successfully purged ' + arg + ' message(s).', 'info')).then(msg => {
        setTimeout(() => {
          cooldown = false
          msg.delete()
        }, 3000)
      })
    })
  } else {
    return logger.logChannel('Invalid arguments! Use an integer from 1 to 100 for your parameter.', 'err')
  }
}, {
  'description': 'Purge messages in the current channel',
  'fullDescription': 'Purges a number of messages from channel the command is called in.',
  'usage': '<1-100>'
})

// Debug Command
bot.registerCommand('db', (msg, args) => {
  logger.logConsole(msg.member.permission.has('manageMessages'), 'debug')
}, {
  'description': 'Debug command',
  'fullDescription': 'Debug command. \'nouf said.'
})

bot.on('messageCreate', (msg) => {
  if (msg.author.bot) return

  if (spamblockMessage === false) {
    spamblockNotifyMessage = msg
  }

  msg.channel.getMessages(2, spamblockNotifyMessage.id)
  .then((msgs) => {
    if ((analyzeMessage(msgs[0], msg) >= 90 && msg.author.id === msgs[0].author.id) && (analyzeMessage(msgs[1], msg) >= 90) && msg.author.id === msgs[1].author.id) {
      msg.channel.unsendMessage(msg.id)
      if (spamblockMessage === false) {
        spamblockMessage = true
        msg.channel.createMessage('```SPAMBLOCK™: Spam detected. Please don\'t spam.```')
        .then((nmsg) => {
          spamblockNotifyMessage = nmsg
          setTimeout(() => {
            spamblockMessage = false
            nmsg.delete()
          }, 3000)
        })
      }
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
