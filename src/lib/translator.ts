// ============================================================
// Alien Language Translator — Translation Engine
// ============================================================

// Base letter-to-alien mapping
export const BASE_MAP: Record<string, string> = {
  a: "ka",
  b: "zu",
  c: "mi",
  d: "ta",
  e: "lo",
  f: "ve",
  g: "ri",
  h: "xa",
  i: "no",
  j: "pi",
  k: "se",
  l: "di",
  m: "fu",
  n: "ge",
  o: "ha",
  p: "jo",
  q: "qe",
  r: "ul",
  s: "va",
  t: "ke",
  u: "zi",
  v: "ye",
  w: "wo",
  x: "ix",
  y: "ya",
  z: "oz",
  " ": "/",
};

// Variant map: letters with multiple alien outputs
export const VARIANT_MAP: Record<string, string[]> = {
  a: ["ka", "ra", "za"],
  e: ["lo", "ae", "el"],
  h: ["xa", "sha"],
  n: ["ge", "ne", "un"],
  o: ["ha", "oh", "ao"],
  r: ["ul", "ra", "ur"],
  s: ["va", "sa", "ss"],
  t: ["ke", "te", "tk"],
};

// Build a reverse map from alien tokens back to original characters
export function buildReverseMap(): Record<string, string> {
  const reverse: Record<string, string> = {};

  // Base map (including variants)
  for (const [char, token] of Object.entries(BASE_MAP)) {
    reverse[token] = char;
  }

  // All variant tokens map back to the same original character
  for (const [char, tokens] of Object.entries(VARIANT_MAP)) {
    for (const token of tokens) {
      reverse[token] = char;
    }
  }

  return reverse;
}

// Translate English → Alien
export function translateToAlien(input: string, useVariants: boolean): string {
  const chars = input.toLowerCase().split("");
  const tokens: string[] = [];

  for (const char of chars) {
    if (useVariants && VARIANT_MAP[char]) {
      const variants = VARIANT_MAP[char];
      tokens.push(variants[Math.floor(Math.random() * variants.length)]);
    } else if (BASE_MAP[char] !== undefined) {
      tokens.push(BASE_MAP[char]);
    } else {
      // Unknown characters are preserved as-is
      tokens.push(char);
    }
  }

  // Separate tokens with spaces, but "/" is already a separator for spaces
  return tokens.join(" ");
}

// Translate Alien → English
export function translateToNormal(input: string): string {
  const reverse = buildReverseMap();
  const parts = input.trim().split(/\s+/);
  let result = "";

  for (const part of parts) {
    if (part === "/") {
      result += " ";
    } else if (reverse[part.toLowerCase()] !== undefined) {
      const original = reverse[part.toLowerCase()];
      result += original === " " ? " " : original;
    } else {
      result += part;
    }
  }

  return result;
}
