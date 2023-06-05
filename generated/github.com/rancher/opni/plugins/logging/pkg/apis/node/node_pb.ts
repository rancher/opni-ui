// @generated by protoc-gen-es v1.2.1 with parameter "target=ts,import_extension=none"
// @generated from file github.com/rancher/opni/plugins/logging/pkg/apis/node/node.proto (package node.logging, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from enum node.logging.ConfigStatus
 */
export enum ConfigStatus {
  /**
   * @generated from enum value: Unknown = 0;
   */
  Unknown = 0,

  /**
   * @generated from enum value: UpToDate = 1;
   */
  UpToDate = 1,

  /**
   * @generated from enum value: NeedsUpdate = 2;
   */
  NeedsUpdate = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(ConfigStatus)
proto3.util.setEnumType(ConfigStatus, "node.logging.ConfigStatus", [
  { no: 0, name: "Unknown" },
  { no: 1, name: "UpToDate" },
  { no: 2, name: "NeedsUpdate" },
]);

/**
 * @generated from message node.logging.LoggingCapabilityConfig
 */
export class LoggingCapabilityConfig extends Message<LoggingCapabilityConfig> {
  /**
   * @generated from field: bool enabled = 1;
   */
  enabled = false;

  /**
   * If enabled is false, conditions may contain a list of relevant status
   * messages describing why the capability is disabled.
   *
   * @generated from field: repeated string conditions = 2;
   */
  conditions: string[] = [];

  constructor(data?: PartialMessage<LoggingCapabilityConfig>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "node.logging.LoggingCapabilityConfig";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "enabled", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 2, name: "conditions", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): LoggingCapabilityConfig {
    return new LoggingCapabilityConfig().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): LoggingCapabilityConfig {
    return new LoggingCapabilityConfig().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): LoggingCapabilityConfig {
    return new LoggingCapabilityConfig().fromJsonString(jsonString, options);
  }

  static equals(a: LoggingCapabilityConfig | PlainMessage<LoggingCapabilityConfig> | undefined, b: LoggingCapabilityConfig | PlainMessage<LoggingCapabilityConfig> | undefined): boolean {
    return proto3.util.equals(LoggingCapabilityConfig, a, b);
  }
}

/**
 * @generated from message node.logging.SyncRequest
 */
export class SyncRequest extends Message<SyncRequest> {
  /**
   * @generated from field: node.logging.LoggingCapabilityConfig currentConfig = 1;
   */
  currentConfig?: LoggingCapabilityConfig;

  constructor(data?: PartialMessage<SyncRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "node.logging.SyncRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "currentConfig", kind: "message", T: LoggingCapabilityConfig },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SyncRequest {
    return new SyncRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SyncRequest {
    return new SyncRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SyncRequest {
    return new SyncRequest().fromJsonString(jsonString, options);
  }

  static equals(a: SyncRequest | PlainMessage<SyncRequest> | undefined, b: SyncRequest | PlainMessage<SyncRequest> | undefined): boolean {
    return proto3.util.equals(SyncRequest, a, b);
  }
}

/**
 * @generated from message node.logging.SyncResponse
 */
export class SyncResponse extends Message<SyncResponse> {
  /**
   * @generated from field: node.logging.ConfigStatus configStatus = 1;
   */
  configStatus = ConfigStatus.Unknown;

  /**
   * @generated from field: node.logging.LoggingCapabilityConfig updatedConfig = 2;
   */
  updatedConfig?: LoggingCapabilityConfig;

  constructor(data?: PartialMessage<SyncResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "node.logging.SyncResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "configStatus", kind: "enum", T: proto3.getEnumType(ConfigStatus) },
    { no: 2, name: "updatedConfig", kind: "message", T: LoggingCapabilityConfig },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SyncResponse {
    return new SyncResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SyncResponse {
    return new SyncResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SyncResponse {
    return new SyncResponse().fromJsonString(jsonString, options);
  }

  static equals(a: SyncResponse | PlainMessage<SyncResponse> | undefined, b: SyncResponse | PlainMessage<SyncResponse> | undefined): boolean {
    return proto3.util.equals(SyncResponse, a, b);
  }
}

