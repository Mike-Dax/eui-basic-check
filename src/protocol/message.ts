export type DeviceID = string;

export interface MessageMetadata {
  [key: string]: any;
  type: number;
  internal: boolean;
  query: boolean;
  offset: number | null;
  ack: boolean;
  ackNum: number;
  timestamp: number;
}

export type MessageID = string;

export class Message<
  PayloadType = any,
  MetadataType extends MessageMetadata = MessageMetadata
> {
  deviceID: DeviceID | null;
  messageID: MessageID;
  payload: PayloadType | null;
  metadata: MetadataType;

  isMessage = true as const;

  constructor(messageID: string, payload: PayloadType) {
    this.deviceID = null;
    this.messageID = messageID;
    this.payload = payload;

    // metadata defaults
    this.metadata = {
      type: 0,
      internal: false,
      query: false,
      offset: null,
      ack: false,
      ackNum: 0,
      timestamp: 0,
    } as MetadataType;

    this.setPayload = this.setPayload.bind(this);
  }

  setPayload<NewPayloadType>(payload: NewPayloadType) {
    this.payload = payload as any;

    return this as any as Message<NewPayloadType>;
  }

  /**
   * Create (clone) a new message from an old message
   * @param message Old message
   */
  static from(message: Message) {
    // We don't need to do any complicated cloning, if later on the payload is mutated that's fine,
    // since the old message will still point at the original payload reference
    const newMessage = new Message(message.messageID, message.payload);
    newMessage.deviceID = message.deviceID;
    newMessage.metadata = Object.assign({}, message.metadata);

    return newMessage;
  }
}
