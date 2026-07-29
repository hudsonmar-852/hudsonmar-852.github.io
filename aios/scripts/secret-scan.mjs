import path from 'node:path';

export const forbiddenValuePatterns = [
  { name: 'OpenAI API key', pattern: /\bsk-[A-Za-z0-9_-]{16,}\b/ },
  { name: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/ },
  { name: 'GitHub fine-grained token', pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: 'AWS access key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { name: 'Google API key', pattern: /\bAIza[A-Za-z0-9_-]{35}\b/ },
  {
    name: 'Google service-account credential',
    pattern: /"type"\s*:\s*"service_account"[\s\S]{0,4000}"private_key"\s*:\s*"(?=[^"\r\n]{20,}")/i
  },
  { name: 'Bearer token', pattern: /\bBearer\s+[A-Za-z0-9._~+/-]{24,}={0,2}\b/i },
  { name: 'JWT', pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
  { name: 'webhook URL', pattern: /https:\/\/[^\s"']*webhook/i },
  { name: 'private key', pattern: /BEGIN (?:ENCRYPTED |RSA |EC |DSA |OPENSSH )?PRIVATE KEY/ },
  {
    name: 'assigned secret',
    pattern: /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|private[_-]?key|secret)\b\s*[:=]\s*["'](?=[^"'\r\n]{16,}["'])[^"'\r\n]*[A-Za-z0-9][^"'\r\n]*["']/i
  }
];

const scannableExtensions = new Set([
  '.html',
  '.js',
  '.json',
  '.key',
  '.md',
  '.mjs',
  '.pem',
  '.txt',
  '.yml',
  '.yaml'
]);

export function isScannableFilename(filename) {
  return scannableExtensions.has(path.extname(filename).toLowerCase())
    || path.basename(filename).startsWith('.env');
}

export function findPotentialSecret(source) {
  for (const candidate of forbiddenValuePatterns) {
    if (candidate.pattern.test(source)) return candidate.name;
  }
  return null;
}
