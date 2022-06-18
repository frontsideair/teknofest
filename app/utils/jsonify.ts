type Invalid = undefined | Function | symbol;

export type Jsonify<T> = T extends { toJSON(): infer U }
  ? U
  : T extends BigInt | Invalid
  ? never
  : T extends Number
  ? number
  : T extends String
  ? string
  : T extends Boolean
  ? boolean
  : T extends Array<infer v>
  ? Array<Jsonify<v extends Invalid ? null : v>>
  : T extends object
  ? {
      [k in keyof T as k extends symbol
        ? never
        : T[k] extends Invalid
        ? never
        : k]: Jsonify<T[k]>;
    }
  : T;
