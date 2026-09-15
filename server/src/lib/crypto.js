import crypto from 'node:crypto'
import { env } from './env.js'

/**
 * Criptografia dos tokens das integrações.
 *
 * AES-256-GCM: além de cifrar, autentica — se alguém adulterar o valor no
 * banco, o decrypt falha em vez de devolver lixo. A chave vive no ambiente
 * (CREDENTIALS_KEY) e nunca no banco: assim um dump do Postgres sozinho não
 * entrega os tokens de pagamento da lojista.
 *
 * Formato guardado: v1:<iv em base64>:<authTag em base64>:<cifra em base64>
 * O prefixo de versão existe para permitir trocar o algoritmo um dia sem
 * quebrar o que já está gravado.
 */

const ALGO = 'aes-256-gcm'
const VERSION = 'v1'

function key() {
  // 64 caracteres hex = 32 bytes = AES-256.
  const buf = Buffer.from(env.CREDENTIALS_KEY, 'hex')
  if (buf.length !== 32) {
    throw new Error('CREDENTIALS_KEY precisa ter 64 caracteres hexadecimais (32 bytes)')
  }
  return buf
}

export function encrypt(plain) {
  if (plain == null || plain === '') return null

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key(), iv)
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [VERSION, iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(
    ':'
  )
}

export function decrypt(stored) {
  if (!stored) return null

  const [version, ivB64, tagB64, dataB64] = String(stored).split(':')
  if (version !== VERSION || !ivB64 || !tagB64 || !dataB64) {
    console.error('[crypto] valor guardado em formato inesperado')
    return null
  }

  try {
    const decipher = crypto.createDecipheriv(ALGO, key(), Buffer.from(ivB64, 'base64'))
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    // Chave trocada ou dado adulterado. Não derrubamos a API: a integração
    // simplesmente aparece como não configurada, e a lojista cola de novo.
    console.error('[crypto] falha ao decifrar — CREDENTIALS_KEY mudou?')
    return null
  }
}

/** Mostra só o final do token, para a lojista reconhecer o que está salvo. */
export function mask(plain) {
  if (!plain) return null
  const tail = String(plain).slice(-4)
  return `••••••••${tail}`
}
