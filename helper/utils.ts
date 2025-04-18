import * as colors from "colors";
colors.enable();

export function log(message: string) {
  const timestamp = new Date().toISOString().slice(11, -5).cyan;
  console.log(`[${timestamp}] ${message}`);
}

colors.enable();

const BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = BigInt(BASE36.length);
const CODE_LENGTH = 6;

export function encrypt(id: string): string {
  let num = BigInt(id);
  let code = "";
  while (num > 0) {
    code = BASE36[Number(num % BASE)] + code;
    num /= BASE;
  }

  while (code.length < CODE_LENGTH) {
    code = "0" + code;
  }

  return code;
}

export function decrypt(code: string): string {
  let num = BigInt(0);

  for (const char of code) {
    num = num * BASE + BigInt(BASE36.indexOf(char));
  }

  return num.toString();
}

export function chunkize<T>(array: T[], opts: { length?: number; size?: number }): T[][] {
  if (!opts.length && !opts.size) {
    throw new Error("Either 'length' or 'size' must be provided in opts.");
  }
  if (opts.length && opts.size) {
    throw new Error("Only one of 'length' or 'size' can be provided in opts.");
  }

  const chunks: T[][] = [];

  if (opts.size) {
    if (opts.size <= 0) {
      throw new Error("'size' must be greater than 0.");
    }
    let i = 0;
    while (i < array.length) {
      chunks.push(array.slice(i, i + opts.size));
      i += opts.size;
    }
  } else if (opts.length) {
    // Divide array into the specified number of chunks
    if (opts.length <= 0) {
      throw new Error("'length' must be greater than 0.");
    }
    const chunkSize = Math.ceil(array.length / opts.length);
    let i = 0;
    while (i < array.length) {
      chunks.push(array.slice(i, i + chunkSize));
      i += chunkSize;
    }
  }

  return chunks;
}

export function calculateXP(level: number) {
  return Math.floor(50 * Math.pow(level / 7, 2) + 10 * level);
}

export function captialize(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function getRandomInRange([min, max]: [number, number]): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


export const tableBorder = {
  top: "",
  "top-mid": "",
  "top-left": "",
  "top-right": "",
  bottom: "",
  "bottom-mid": "",
  "bottom-left": "",
  "bottom-right": "",
  left: "",
  "left-mid": "",
  mid: "",
  "mid-mid": "",
  right: "",
  "right-mid": "",
  middle: " ",
};