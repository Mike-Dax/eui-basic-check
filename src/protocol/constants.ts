export const enum TYPES {
  CALLBACK = 0,
  CUSTOM_MARKER = 1,
  OFFSET_METADATA = 2,
  BYTE = 3,
  CHAR = 4,
  INT8 = 5,
  UINT8 = 6,
  INT16 = 7,
  UINT16 = 8,
  INT32 = 9,
  UINT32 = 10,
  FLOAT = 11,
  DOUBLE = 12,
}

export const enum MESSAGEIDS {
  LIBRARY_VERSION = "o",
  BOARD_IDENTIFIER = "i",
  HEARTBEAT = "h",
  DEFAULT_INTERFACE = "k",
  READWRITE_MESSAGEIDS_REQUEST_LIST = "t",
  READWRITE_MESSAGEIDS_REQUEST_MESSAGE_OBJECTS = "w",
  READWRITE_MESSAGEIDS_ITEM = "u",
  READWRITE_MESSAGEIDS_COUNT = "v",
  SESSION_ID = "r",
  SESSION_ID_BROADCAST = "s",
}

export const enum VARIABLE_NAMESPACE {
  INTERNAL = 0,
  DEVELOPER = 1,
}

export const enum DISCOVERY_METHOD {
  POLLING = "pollingDiscovery",
  EVENT = "eventDiscovery",
}

export const enum ACK_NUM {
  BITS = 3,
  MAX = 7, // we have to manually do this.
}

export const enum EVENTS {
  DEVICE_UPDATE = "deviceUpdate",
  DEVICE_CONNECTED = "deviceConnected",
  DEVICE_HEARTBEAT_UPDATE = "deviceHeartbeatUpdate",
  UPDATE_STATE = "updateState",
  RECEIVED_ACK = "receivedAck",
  FAILURE_TO_DELIVER = "failedDelivery",
  DEVICE_DISCONNECTED = "deviceDisconnected",
  LARGE_TRANSFER_PROGRESS = "largeTransferProgress",
  LARGE_TRANSFER_START = "largeTransferStart",
  LARGE_TRANSFER_END = "largeTransferEnd",
  LARGEST_PAYLOAD_SIZE_SEEN = "largestPayloadSizeSeen",
  DEVICE_AVAILABILITY_HINT = "deviceHint",
  DEVICE_UNAVAILABILITY_HINT = "deviceDisconnectionHint",
}

export const CALLBACK_PAYLOAD: null = null;

export const MAX_ACK_NUM = 3;

export const SESSION_ID_NULL = 0;
