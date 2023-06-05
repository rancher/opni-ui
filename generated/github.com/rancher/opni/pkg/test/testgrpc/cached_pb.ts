// @generated by protoc-gen-es v1.2.1 with parameter "target=ts,import_extension=none"
// @generated from file github.com/rancher/opni/pkg/test/testgrpc/cached.proto (package testgrpc.cached, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3, protoInt64 } from "@bufbuild/protobuf";

/**
 * @generated from message testgrpc.cached.RefreshRequest
 */
export class RefreshRequest extends Message<RefreshRequest> {
  /**
   * @generated from field: bool refresh = 1;
   */
  refresh = false;

  constructor(data?: PartialMessage<RefreshRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testgrpc.cached.RefreshRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "refresh", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RefreshRequest {
    return new RefreshRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RefreshRequest {
    return new RefreshRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RefreshRequest {
    return new RefreshRequest().fromJsonString(jsonString, options);
  }

  static equals(a: RefreshRequest | PlainMessage<RefreshRequest> | undefined, b: RefreshRequest | PlainMessage<RefreshRequest> | undefined): boolean {
    return proto3.util.equals(RefreshRequest, a, b);
  }
}

/**
 * ObjectReference must implement the `CacheKeyer` interface
 *
 * @generated from message testgrpc.cached.ObjectReference
 */
export class ObjectReference extends Message<ObjectReference> {
  /**
   * @generated from field: string id = 1;
   */
  id = "";

  constructor(data?: PartialMessage<ObjectReference>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testgrpc.cached.ObjectReference";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ObjectReference {
    return new ObjectReference().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ObjectReference {
    return new ObjectReference().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ObjectReference {
    return new ObjectReference().fromJsonString(jsonString, options);
  }

  static equals(a: ObjectReference | PlainMessage<ObjectReference> | undefined, b: ObjectReference | PlainMessage<ObjectReference> | undefined): boolean {
    return proto3.util.equals(ObjectReference, a, b);
  }
}

/**
 * @generated from message testgrpc.cached.ObjectList
 */
export class ObjectList extends Message<ObjectList> {
  /**
   * @generated from field: repeated testgrpc.cached.ObjectReference items = 1;
   */
  items: ObjectReference[] = [];

  constructor(data?: PartialMessage<ObjectList>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testgrpc.cached.ObjectList";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "items", kind: "message", T: ObjectReference, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ObjectList {
    return new ObjectList().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ObjectList {
    return new ObjectList().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ObjectList {
    return new ObjectList().fromJsonString(jsonString, options);
  }

  static equals(a: ObjectList | PlainMessage<ObjectList> | undefined, b: ObjectList | PlainMessage<ObjectList> | undefined): boolean {
    return proto3.util.equals(ObjectList, a, b);
  }
}

/**
 * @generated from message testgrpc.cached.IncrementRequest
 */
export class IncrementRequest extends Message<IncrementRequest> {
  /**
   * @generated from field: int64 value = 1;
   */
  value = protoInt64.zero;

  constructor(data?: PartialMessage<IncrementRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testgrpc.cached.IncrementRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "value", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IncrementRequest {
    return new IncrementRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IncrementRequest {
    return new IncrementRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IncrementRequest {
    return new IncrementRequest().fromJsonString(jsonString, options);
  }

  static equals(a: IncrementRequest | PlainMessage<IncrementRequest> | undefined, b: IncrementRequest | PlainMessage<IncrementRequest> | undefined): boolean {
    return proto3.util.equals(IncrementRequest, a, b);
  }
}

/**
 * @generated from message testgrpc.cached.IncrementObjectRequest
 */
export class IncrementObjectRequest extends Message<IncrementObjectRequest> {
  /**
   * @generated from field: testgrpc.cached.ObjectReference id = 1;
   */
  id?: ObjectReference;

  /**
   * @generated from field: int64 value = 2;
   */
  value = protoInt64.zero;

  constructor(data?: PartialMessage<IncrementObjectRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testgrpc.cached.IncrementObjectRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "message", T: ObjectReference },
    { no: 2, name: "value", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IncrementObjectRequest {
    return new IncrementObjectRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IncrementObjectRequest {
    return new IncrementObjectRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IncrementObjectRequest {
    return new IncrementObjectRequest().fromJsonString(jsonString, options);
  }

  static equals(a: IncrementObjectRequest | PlainMessage<IncrementObjectRequest> | undefined, b: IncrementObjectRequest | PlainMessage<IncrementObjectRequest> | undefined): boolean {
    return proto3.util.equals(IncrementObjectRequest, a, b);
  }
}

/**
 * @generated from message testgrpc.cached.Value
 */
export class Value extends Message<Value> {
  /**
   * @generated from field: int64 value = 1;
   */
  value = protoInt64.zero;

  constructor(data?: PartialMessage<Value>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "testgrpc.cached.Value";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "value", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Value {
    return new Value().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Value {
    return new Value().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Value {
    return new Value().fromJsonString(jsonString, options);
  }

  static equals(a: Value | PlainMessage<Value> | undefined, b: Value | PlainMessage<Value> | undefined): boolean {
    return proto3.util.equals(Value, a, b);
  }
}

