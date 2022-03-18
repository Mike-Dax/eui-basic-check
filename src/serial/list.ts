import { SerialPort } from "serialport";
import { encode } from "../protocol/encode";
import { decode } from "../protocol/decode";
import { MESSAGEIDS, TYPES } from "../protocol/constants";
import { Message } from "../protocol/message";
import { encodeCobs, decodeCobs, nullByteBuffer } from "../protocol/cobs";

import debug from "debug";

const onAttachmentPortSettingsDefault = {
  rts: false,
};

const dPipelines = debug("electricui-protocol-binary-cobs:pipelines");

class StatefulCobsDecoder {
  buffer = Buffer.alloc(0);

  async receiveCobs(packet: Buffer) {
    const promises: Array<Promise<any>> = [];

    dPipelines(`Received data to cobs decode`, packet);

    let data = Buffer.concat([this.buffer, packet]);
    let position;

    while ((position = data.indexOf(nullByteBuffer)) !== -1) {
      const framed = data.slice(0, position);

      if (framed.length > 0) {
        dPipelines(
          `...Found a delimiter, pushing a chunk up to the binary decoder`
        );

        const decoded = decodeCobs(framed);
        if (decoded.length > 0) {
          this.receiveBinary(decoded);
        }
      }
      data = data.slice(position + 1);
    }

    this.buffer = data;
    dPipelines(`buffer leftover: `, this.buffer);

    await Promise.all(promises);
  }

  async receiveBinary(buffer: Buffer) {
    const msg = decode(buffer);
    console.log(`received message ${msg.messageID} with payload`, msg.payload);
  }
}

async function main() {
  const ports = await SerialPort.list();

  console.log(
    `serialport detects ports [${ports.map((port) => port.path).join(", ")}]`
  );

  for (const port of ports) {
    const decoder = new StatefulCobsDecoder();

    if (port.path.includes("Bluetooth")) continue;
    console.log(`connecting to ${port.path}`);

    const openedPort = await new Promise<SerialPort>(
      async (resolve, reject) => {
        let opened: SerialPort;

      opened = new SerialPort({
        path: port.path,
        autoOpen: false,
        baudRate: 115200,
      });

        console.log(`port created`);
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));

        console.log(`opening port`);
        opened.open(async (err: Error) => {
          if (err) {
            reject(err);
            return;
          }
          console.log(`port opened`);

          await new Promise((resolve, reject) => setTimeout(resolve, 1000));

          console.log(`rts set`);
          // Set our port settings immediately
          opened.set(onAttachmentPortSettingsDefault);

          console.log(`connected to ${port.path}`);
          resolve(opened);
        });

        opened.on("data", (data: Buffer) => {
          console.log(`received data`, data);
          decoder.receiveCobs(data);
        });

        opened.on("error", (error: Error) => {
          console.log(`received error from ${port.path}:`, error);
        });

        opened.on("close", () => {
          console.log(`closed ${port.path}:`);
        });
      }
    );

    await new Promise((resolve, reject) => setTimeout(resolve, 1000));

    console.log(`sending messages:`);

    const requestBoardIDMessage = new Message(
      MESSAGEIDS.BOARD_IDENTIFIER,
      null
    );
    requestBoardIDMessage.metadata.type = TYPES.UINT16;
    requestBoardIDMessage.metadata.internal = true;
    requestBoardIDMessage.metadata.query = true;

    for (let index = 0; index < 5; index++) {
      const requestBuffer = encodeCobs(encode(requestBoardIDMessage));
      console.log(`writing #${index}`, requestBuffer);
      openedPort.write(requestBuffer);
      openedPort.flush();

      // wait a few seconds for a reply
      await new Promise((resolve, reject) => setTimeout(resolve, 1000));
    }

    openedPort.close();
  }
}

main();
