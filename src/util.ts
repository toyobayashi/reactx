export function isPlainObject (obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export function throwInvalidArgType (name: string, type: string, received: string): never {
  throw new TypeError('[ERR_INVALID_ARG_TYPE]: The "' + name + '" argument must be of type ' + type + '. Received ' + received)
}

export function isPrimitive (obj: any): boolean {
  return typeof obj !== 'object' || obj === null
}

export function isNative (Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

export function assertString (v: any, name: string): void {
  const type = typeof v
  if (type !== 'string') {
    throwInvalidArgType(name, 'string', type)
  }
}

export function assertFunction (v: any, name: string): void {
  const type = typeof v
  if (type !== 'function') {
    throwInvalidArgType(name, 'function', type)
  }
}

export function is (x: any, y: any): boolean {
  if (typeof Object.is === 'function') {
    return Object.is(x, y)
  }

  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    // eslint-disable-next-line no-self-compare
    return x !== x && y !== y
  }
}

export function noop (): void {}
