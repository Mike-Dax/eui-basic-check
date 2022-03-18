# eui-basic-check

A basic check that sends the boardID request to all connected serial ports then prints any replies.

First, install dependencies with `yarn install`.

To run, `yarn test`.

Expect output like:

```
$ ts-node ./src/serial/list.ts
serialport detects ports [/dev/tty.usbmodem14301]
connecting to /dev/tty.usbmodem14301
connected to /dev/tty.usbmodem14301
writing <Buffer 00 01 06 60 11 69 66 d2 00>
received data <Buffer 00 09 02 60 01 69 62 c3 a5 6b 00>
received message Message {
  isMessage: true,
  deviceID: null,
  messageID: 'i',
  payload: <Buffer 62 c3>,
  metadata: {
    type: 8,
    internal: true,
    query: false,
    offset: null,
    ack: false,
    ackNum: 0,
    timestamp: 0
  },
  setPayload: [Function: bound setPayload]
}
closing connection to /dev/tty.usbmodem14301
```
