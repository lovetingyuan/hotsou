import assert from 'node:assert/strict'

import { getToutiaoSearchRewriteUrl } from './toutiaoSearch.ts'

assert.equal(
  getToutiaoSearchRewriteUrl(
    'https://so.toutiao.com/search?keyword=%E5%A4%B4%E6%9D%A1&search_json=%7B%22source_aid%22%3A0%7D&source=hotboard_list',
  ),
  'https://so.toutiao.com/search?keyword=%E5%A4%B4%E6%9D%A1&pd=information&dvpf=pc',
)

assert.equal(
  getToutiaoSearchRewriteUrl(
    'https://so.toutiao.com/search?keyword=%E5%A4%B4%E6%9D%A1&pd=video&dvpf=pc',
  ),
  null,
)

assert.equal(
  getToutiaoSearchRewriteUrl(
    'http://so.toutiao.com/search?keyword=%E5%A4%B4%E6%9D%A1&pd=video&dvpf=pc',
  ),
  'https://so.toutiao.com/search?keyword=%E5%A4%B4%E6%9D%A1&pd=video&dvpf=pc',
)

assert.equal(getToutiaoSearchRewriteUrl('https://www.toutiao.com/article/123'), null)

console.log('toutiao search rewrite test passed')
