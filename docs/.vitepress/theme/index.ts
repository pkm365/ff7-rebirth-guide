import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import terms from '../terms.json'
import './style.css'

interface Term { en: string; cn: string; desc: string }

const termMap = new Map<string, Term>()
for (const t of terms as Term[]) termMap.set(t.en, t)

function applyTooltips() {
  const root = document.querySelector('.vp-doc')
  if (!root) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) {
    const n = walker.currentNode as Text
    // 跳过已处理过、代码块、链接内部的文本
    const p = n.parentElement
    if (!p || p.closest('pre, code, a, .term-tip')) continue
    nodes.push(n)
  }
  for (const node of nodes) {
    const text = node.textContent || ''
    // 匹配 "中文名（English）" 形态
    const m = text.match(/（([A-Za-z][A-Za-z0-9' .&/-]*)）/)
    if (!m) continue
    const term = termMap.get(m[1])
    if (!term) continue
    const span = document.createElement('span')
    span.className = 'term-tip'
    span.tabIndex = 0
    span.setAttribute('role', 'button')
    span.setAttribute('aria-label', `${term.cn}：${term.desc}`)
    const tip = document.createElement('span')
    tip.className = 'term-tip-box'
    tip.textContent = `${term.cn}：${term.desc}`
    // 把 "（English）" 包起来
    const before = text.slice(0, m.index)
    const after = text.slice(m.index! + m[0].length)
    const frag = document.createDocumentFragment()
    if (before) frag.appendChild(document.createTextNode(before))
    const inner = document.createElement('span')
    inner.className = 'term-tip-text'
    inner.textContent = m[0]
    span.appendChild(inner)
    span.appendChild(tip)
    frag.appendChild(span)
    if (after) frag.appendChild(document.createTextNode(after))
    node.parentElement!.replaceChild(frag, node)
  }
}

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    onMounted(() => applyTooltips())
    watch(
      () => route.path,
      () => nextTick(() => setTimeout(applyTooltips, 50))
    )
  }
}
