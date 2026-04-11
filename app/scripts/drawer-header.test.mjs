import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { readFileSync } from 'node:fs'

const drawerNavigatorPath = path.resolve(
  import.meta.dirname,
  '..',
  'navigation',
  'DrawerNavigator.tsx',
)

test('drawer navigator uses a custom header-left toggle button', () => {
  const source = readFileSync(drawerNavigatorPath, 'utf8')

  assert.match(source, /headerLeft\s*:/, 'Expected a custom headerLeft option in DrawerNavigator')
  assert.match(
    source,
    /DrawerActions\.toggleDrawer\(\)/,
    'Expected the custom headerLeft button to toggle the drawer directly',
  )
})
