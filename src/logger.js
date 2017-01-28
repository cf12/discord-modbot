function logChannel (channel, type, msg) {
  if (type === 'info') return channel.sendMessage(':bulb:**  | INFO | ** ' + msg)
  if (type === 'spam') return channel.sendMessage(':octagonal_sign:**  | ANTI-SPAM | ** ' + msg)
  if (type === 'noperm') return channel.sendMessage(':no_entry:**  | ACCESS DENIED | ** ' + msg)
  if (type === 'help') return channel.sendMessage(':question:**  | HELP | ** ' + msg)
  if (type === 'err') return channel.sendMessage(':warning:**  | ERROR | ** ' + msg)

  console.log('ERROR IN LOG CHANNEL')
}

function logConsole (type, msg) {
  let timestamp = '[' + new Date().toLocaleTimeString() + '] '
  if (type === 'info') return console.log(timestamp + 'INFO >> ' + msg)
  if (type === 'err') return console.log(timestamp + 'ERROR >> ' + msg)
  if (type === 'db') return console.log(timestamp + 'DEBUG >> ' + msg)

  console.log('ERROR IN LOG CONSOLE')
}

module.exports = {
  logChannel: logChannel,
  logConsole: logConsole
}
