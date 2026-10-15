<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { withBase } from 'vitepress'

interface QBCard { id: number; name: string; img: string; location: string }

const cards = ref<QBCard[]>([])
const collected = ref<Set<number>>(new Set())
const filter = ref<'all' | 'got' | 'todo'>('all')
const query = ref('')
const lightbox = ref<QBCard | null>(null)

const LS_KEY = 'ff7-qb-collected'

onMounted(async () => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) collected.value = new Set(JSON.parse(raw) as number[])
  } catch {}
  try {
    const r = await fetch(withBase('/qb-cards.json'))
    if (r.ok) cards.value = await r.json()
  } catch {}
})

function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...collected.value])) } catch {}
}
function toggle(id: number) {
  if (collected.value.has(id)) collected.value.delete(id)
  else collected.value.add(id)
  save()
}
function isGot(id: number) { return collected.value.has(id) }

const gotCount = computed(() => collected.value.size)
const pct = computed(() => cards.value.length ? Math.round((gotCount.value / cards.value.length) * 100) : 0)

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return cards.value.filter(c => {
    if (filter.value === 'got' && !isGot(c.id)) return false
    if (filter.value === 'todo' && isGot(c.id)) return false
    if (q && !c.name.toLowerCase().includes(q) && !String(c.id).includes(q)) return false
    return true
  })
})

function openCard(c: QBCard) { lightbox.value = c }
function closeLightbox() { lightbox.value = null }
</script>

<template>
  <div class="qb-album" v-if="cards.length">
    <div class="qb-head">
      <div class="qb-progress">
        <div class="qb-bar"><div class="qb-fill" :style="'width:' + pct + '%'"></div></div>
        <span class="qb-count">{{ gotCount }}/{{ cards.length }}（{{ pct }}%）</span>
      </div>
      <input v-model="query" class="qb-search" placeholder="搜索卡名或编号…" />
      <div class="qb-filters">
        <button :class="{ on: filter === 'all' }" @click="filter = 'all'">全部</button>
        <button :class="{ on: filter === 'got' }" @click="filter = 'got'">已收集</button>
        <button :class="{ on: filter === 'todo' }" @click="filter = 'todo'">未收集</button>
      </div>
    </div>
    <div class="qb-hint">点击卡片查看大图与获取方式，再点一次标记为已收集，进度保存在本机浏览器。</div>
    <div class="qb-grid">
      <div v-for="c in shown" :key="c.id"
           class="qb-card" :class="{ got: isGot(c.id), dim: !isGot(c.id) }"
           @click="openCard(c)">
        <div class="qb-frame">
          <img :src="withBase(c.img)" :alt="c.name" loading="lazy" />
          <span v-if="isGot(c.id)" class="qb-check">✓</span>
          <span class="qb-num">#{{ c.id }}</span>
        </div>
        <span class="qb-name">{{ c.name }}</span>
      </div>
    </div>
    <div v-if="!shown.length" class="qb-empty">没有匹配的卡片</div>

    <div v-if="lightbox" class="qb-lightbox" @click.self="closeLightbox">
      <div class="qb-modal">
        <button class="qb-close" @click="closeLightbox">✕</button>
        <img :src="withBase(lightbox.img)" :alt="lightbox.name" class="qb-big" />
        <div class="qb-info">
          <div class="qb-info-name">#{{ lightbox.id }} {{ lightbox.name }}</div>
          <div class="qb-info-loc">📍 {{ lightbox.location }}</div>
          <button class="qb-toggle" :class="{ got: isGot(lightbox.id) }" @click="toggle(lightbox.id)">
            {{ isGot(lightbox.id) ? '✓ 已收集（点击取消）' : '＋ 标记为已收集' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="qb-loading">卡片数据加载中…</div>
</template>

<style scoped>
.qb-album { margin: 20px 0 32px; }
.qb-head { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.qb-progress { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 220px; }
.qb-bar { flex: 1; height: 8px; border-radius: 4px; background: var(--vp-c-bg-mute); overflow: hidden; }
.qb-fill { height: 100%; background: linear-gradient(90deg, #b8860b, #ffd700); border-radius: 4px; box-shadow: 0 0 12px rgba(255, 215, 0, 0.45); transition: width 0.6s; }
.qb-count { font-weight: 700; color: #ffd700; white-space: nowrap; }
.qb-search {
  padding: 8px 14px; border-radius: 999px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 13px; width: 180px;
}
.qb-filters { display: flex; gap: 8px; }
.qb-filters button {
  padding: 6px 14px; border-radius: 999px; cursor: pointer; font-size: 13px;
  border: 1px solid var(--vp-c-divider); background: transparent; color: var(--vp-c-text-2);
}
.qb-filters button.on { border-color: #ffd700; color: #ffd700; background: rgba(255, 215, 0, 0.08); font-weight: 600; }
.qb-hint { font-size: 12px; color: var(--vp-c-text-3); margin-bottom: 14px; }
.qb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 14px;
}
.qb-card { cursor: pointer; text-align: center; }
.qb-frame {
  position: relative; border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.18);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  aspect-ratio: 4 / 3;
  background: #0a0e14;
}
.qb-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
.qb-card:hover .qb-frame {
  transform: translateY(-4px) scale(1.03);
  border-color: rgba(255, 215, 0, 0.55);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 215, 0, 0.14);
}
.qb-card.dim .qb-frame img { filter: grayscale(0.85) brightness(0.72); }
.qb-card.got .qb-frame { border-color: rgba(255, 215, 0, 0.5); }
.qb-card.got .qb-frame img { filter: none; }
.qb-check {
  position: absolute; top: 6px; right: 6px;
  width: 22px; height: 22px; border-radius: 50%;
  background: #ffd700; color: #3a2c00;
  font-size: 13px; font-weight: 800; line-height: 22px;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}
.qb-num {
  position: absolute; left: 6px; bottom: 4px;
  font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}
.qb-name { display: block; font-size: 12px; margin-top: 6px; color: var(--vp-c-text-2); line-height: 1.3; }
.qb-empty { text-align: center; color: var(--vp-c-text-3); padding: 32px 0; }
.qb-loading { text-align: center; color: var(--vp-c-text-3); padding: 24px 0; }

/* 灯箱 */
.qb-lightbox {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(4, 6, 10, 0.88);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; backdrop-filter: blur(6px);
}
.qb-modal {
  position: relative; max-width: 560px; width: 100%;
  background: #10151f; border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 215, 0, 0.08);
}
.qb-big { width: 100%; display: block; aspect-ratio: 16 / 10; object-fit: cover; }
.qb-close {
  position: absolute; top: 10px; right: 10px;
  width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
  background: rgba(0, 0, 0, 0.6); color: #fff; border: 1px solid rgba(255,255,255,0.2);
  font-size: 14px;
}
.qb-info { padding: 16px 20px 20px; }
.qb-info-name { font-size: 18px; font-weight: 700; color: #ffd700; margin-bottom: 6px; }
.qb-info-loc { font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 14px; }
.qb-toggle {
  width: 100%; padding: 10px; border-radius: 10px; cursor: pointer;
  font-size: 14px; font-weight: 600;
  border: 1px solid rgba(255, 215, 0, 0.4); background: transparent; color: #ffd700;
}
.qb-toggle.got { background: rgba(255, 215, 0, 0.14); }
</style>
