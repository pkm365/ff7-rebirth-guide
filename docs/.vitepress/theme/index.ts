import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute, withBase } from 'vitepress'
import terms from '../terms.json'
import ProgressBanner from './components/ProgressBanner.vue'
import AchievementGallery from './components/AchievementGallery.vue'
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
  enhanceApp({ app }) {
    app.component('ProgressBanner', ProgressBanner)
    app.component('AchievementGallery', AchievementGallery)
  },
  setup() {
    const route = useRoute()
    onMounted(() => {
      applyTooltips()
      markCurrentChapter()
    })
    watch(
      () => route.path,
      () => nextTick(() => {
        setTimeout(applyTooltips, 50)
        setTimeout(markCurrentChapter, 300)
      })
    )
  }
}

// 在侧边栏当前章节链接上加"进行中"徽标
async function markCurrentChapter() {
  try {
    const r = await fetch(withBase('/progress.json'))
    if (!r.ok) return
    const p = await r.json()
    const ch = String(p.current_chapter).padStart(2, '0')
    document.querySelectorAll('.badge-current').forEach(e => e.remove())
    const link = document.querySelector(
      `.VPSidebarItem a[href$="/chapters/ch${ch}"], .VPSidebarItem a[href$="/chapters/ch${ch}.html"]`
    )
    if (link && !link.querySelector('.badge-current')) {
      const b = document.createElement('span')
      b.className = 'badge-current'
      b.textContent = '▶ 进行中'
      link.appendChild(b)
    }
  } catch { /* 进度文件缺失时静默跳过 */ }
}
