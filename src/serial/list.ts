import SerialPort from "serialport";
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
    console.log(`received message`, decode(buffer));
  }
}

async function main() {
  const ports = await SerialPort.list();

  console.log(
    `serialport detects ports [${ports.map((port) => port.path).join(", ")}]`
  );

  for (const port of ports) {
    const decoder = new StatefulCobsDecoder();
    console.log(`connecting to ${port.path}`);

    if (port.path.includes("Bluetooth")) continue;

    const openedPort = await new Promise<SerialPort>((resolve, reject) => {
      let opened: SerialPort;

      opened = new SerialPort(port.path, {
        autoOpen: false,
        baudRate: 115200,
      });

      opened.open((err: Error) => {
        if (err) {
          reject(err);
          return;
        }

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
    });

    const requestBoardIDMessage = new Message(
      MESSAGEIDS.BOARD_IDENTIFIER,
      null
    );
    requestBoardIDMessage.metadata.type = TYPES.UINT16;
    requestBoardIDMessage.metadata.internal = true;
    requestBoardIDMessage.metadata.query = true;

    const requestBuffer = encodeCobs(encode(requestBoardIDMessage));
    console.log(`writing`, requestBuffer);
    openedPort.write(requestBuffer);
    openedPort.flush();

    // wait a few seconds for a reply
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));

    openedPort.close();
    console.log(`closing connection to ${port.path}`);
  }
}

main();
