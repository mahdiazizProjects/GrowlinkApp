// Compiles (synthesizes) the Amplify backend locally to catch invalid schemas and access rules
// before deploying. Nothing is sent to AWS.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const outdir = mkdtempSync(join(tmpdir(), 'growlink-synth-'))
const result = spawnSync('npx', ['tsx', 'amplify/backend.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    CDK_OUTDIR: outdir,
    CDK_CONTEXT_JSON: JSON.stringify({
      'amplify-backend-namespace': 'growlink',
      'amplify-backend-name': 'localcheck',
      'amplify-backend-type': 'sandbox'
    })
  }
})
const templates = readdirSync(outdir).filter(f => f.endsWith('.template.json')).length
rmSync(outdir, { recursive: true, force: true })
if (result.status !== 0 || templates === 0) {
  console.error('\nBackend check failed.')
  process.exit(result.status || 1)
}
console.log(`\nBackend OK (${templates} CloudFormation templates generated).`)
