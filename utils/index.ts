export class SimpleCrypto {
  private key: string

  constructor(key: string) {
    this.key = key
  }

  private xorCipher(text: string): string {
    return text
      .split('')
      .map((char, index) =>
        String.fromCharCode(char.charCodeAt(0) ^ this.key.charCodeAt(index % this.key.length))
      )
      .join('')
  }

  private toBase64(text: string): string {
    return btoa(encodeURIComponent(text))
  }

  private fromBase64(base64: string): string {
    return decodeURIComponent(atob(base64))
  }

  public encrypt(plaintext: string): string {
    const xored = this.xorCipher(plaintext)
    return this.toBase64(xored)
  }

  public decrypt(ciphertext: string): string {
    const decoded = this.fromBase64(ciphertext)
    return this.xorCipher(decoded)
  }
}
