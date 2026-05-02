import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const aboutHeaderPath = path.resolve(
  import.meta.dirname,
  '..',
  'screens',
  'AboutScreen',
  'header.tsx',
)

test('about header constrains the account email text without truncating the domain', () => {
  const source = readFileSync(aboutHeaderPath, 'utf8')

  assert.match(source, /StyleSheet\.create\(/, 'Expected stable styles for the header layout')
  assert.match(source, /styles\.accountEmailButton/, 'Expected a constrained account email wrapper')
  assert.match(source, /styles\.accountEmailText/, 'Expected a dedicated account email text style')
  assert.match(source, /flexShrink:\s*1/, 'Expected the email text to shrink inside the row')
  assert.doesNotMatch(
    source,
    /numberOfLines=\{1\}/,
    'The email must not be forced to one line because the top-level domain can be clipped',
  )
})
