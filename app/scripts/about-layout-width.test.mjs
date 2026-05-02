import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const aboutScreenDir = path.resolve(import.meta.dirname, '..', 'screens', 'AboutScreen')

const readAboutSource = (fileName) => readFileSync(path.join(aboutScreenDir, fileName), 'utf8')

test('about setting rows reserve available width for labels', () => {
  const selectableSource = readAboutSource('TextSelectable.tsx')
  const fabPositionSource = readAboutSource('FabPositionSetting.tsx')

  for (const source of [selectableSource, fabPositionSource]) {
    assert.match(source, /styles\.settingRow/, 'Expected setting rows to use stable row styles')
    assert.match(source, /styles\.settingLabel/, 'Expected labels to use stable width styles')
    assert.match(source, /styles\.settingControl/, 'Expected controls to opt out of shrinking')
    assert.match(source, /settingLabel:[\s\S]*flex:\s*1/, 'Expected labels to fill available space')
    assert.match(
      source,
      /settingLabel:[\s\S]*minWidth:\s*0/,
      'Expected labels to shrink predictably',
    )
    assert.match(
      source,
      /settingControl:[\s\S]*flexShrink:\s*0/,
      'Expected controls to keep their own width',
    )
  }
})

test('about channel rows avoid premature title truncation', () => {
  const source = readAboutSource('TabListSetting.tsx')

  assert.match(source, /styles\.itemTitleBlock/, 'Expected a stable channel title container')
  assert.match(source, /styles\.itemActions/, 'Expected channel actions to have stable width')
  assert.match(
    source,
    /itemTitleBlock:[\s\S]*flex:\s*1/,
    'Expected titles to fill available row width',
  )
  assert.match(
    source,
    /itemTitleBlock:[\s\S]*minWidth:\s*0/,
    'Expected titles to shrink predictably',
  )
  assert.match(
    source,
    /itemActions:[\s\S]*flexShrink:\s*0/,
    'Expected actions to keep their own width',
  )
  assert.doesNotMatch(
    source,
    /item:[\s\S]*justifyContent:\s*'space-between'/,
    'The list row should not spend spare width as a gap between title and controls',
  )
})
