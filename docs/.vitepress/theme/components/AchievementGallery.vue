<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { withBase } from 'vitepress'

interface AchMeta { api: string; cn: string; desc: string; icon: string; icongray: string }
interface UnlockInfo { api: string; unlocktime_str?: string }

const GROUPS: { title: string; from: number; to: number }[] = [
  { title: '剧情章节', from: 0, to: 14 },
  { title: '战斗入门', from: 15, to: 25 },
  { title: '探索世界', from: 26, to: 41 },
  { title: '小游戏', from: 42, to: 55 },
  { title: '究极挑战', from: 56, to: 60 },
]

const meta = ref<AchMeta[]>([])
const unlockedMap = ref<Record<string, string>>({})
const filter = ref<'all' | 'got' | 'todo'>('all')

onMounted(async () => {
  try {
    const [m, p] = await Promise.all([
      fetch(withBase('/achievements.json')).then(r => r.ok ? r.json() : []),
      fetch(withBase('/progress.json')).then(r => r.ok ? r.json() : null),
    ])
    meta.value = m
    const map: Record<string, string> = {}
    for (const u of (p?.unlocked_all ?? []) as UnlockInfo[]) {
      if (u.unlocktime_str) map[u.api] = u.unlocktime_str
    }
    unlockedMap.value = map
  } catch {}
})

function num(api: string): number {
  return parseInt(api.replace('ACH_', ''), 10)
}
function isGot(api: string): boolean {
  return api in unlockedMap.value
}
const total = computed(() => meta.value.length)
const gotCount = computed(() => meta.value.filter(a => isGot(a.api)).length)
const pct = computed(() => total.value ? Math.round((gotCount.value / total.value) * 100) : 0)

function groupItems(g: { from: number; to: number }) {
  return meta.value
    .filter(a => { const n = num(a.api); return n >= g.from && n <= g.to })
    .filter(a => filter.value === 'all' || (filter.value === 'got') === isGot(a.api))
}
</script>

<template>
  <div class="ach-gallery" v-if="meta.length">
    <div class="ach-head">
      <div class="ach-progress">
        <div class="ach-bar"><div class="ach-fill" :style="'width:' + pct + '%'"></div></div>
        <span class="ach-count">{{ gotCount }}/{{ total }}（{{ pct }}%）</span>
      </div>
      <div class="ach-filters">
        <button :class="{ on: filter === 'all' }" @click="filter = 'all'">全部</button>
        <button :class="{ on: filter === 'got' }" @click="filter = 'got'">已解锁</button>
        <button :class="{ on: filter === 'todo' }" @click="filter = 'todo'">未解锁</button>
      </div>
    </div>
    <div v-for="g in GROUPS" :key="g.title" class="ach-group">
      <template v-if="groupItems(g).length">
        <h4 class="ach-group-title">{{ g.title }}</h4>
        <div class="ach-grid">
          <div v-for="a in groupItems(g)" :key="a.api"
               class="ach-item" :class="{ got: isGot(a.api) }"
               :title="a.cn + (a.desc ? '——' + a.desc : '') + (unlockedMap[a.api] ? '（' + unlockedMap[a.api] + ' 解锁）' : '')">
            <img :src="isGot(a.api) ? a.icon : a.icongray" :alt="a.cn" loading="lazy" />
            <span v-if="isGot(a.api)" class="ach-check">✓</span>
            <span class="ach-name">{{ a.cn }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
  <div v-else class="ach-loading">成就数据加载中…</div>
</template>

<style scoped>
.ach-gallery { margin: 20px 0 32px; }
.ach-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.ach-progress { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px; }
.ach-bar { flex: 1; height: 8px; border-radius: 4px; background: var(--vp-c-bg-mute); overflow: hidden; }
.ach-fill { height: 100%; background: linear-gradient(90deg, var(--vp-c-brand-3), var(--vp-c-brand-1)); border-radius: 4px; box-shadow: 0 0 12px rgba(47, 232, 164, 0.5); transition: width 0.6s; }
.ach-count { font-weight: 700; color: var(--vp-c-brand-1); white-space: nowrap; }
.ach-filters { display: flex; gap: 8px; }
.ach-filters button {
  padding: 6px 14px; border-radius: 999px; cursor: pointer; font-size: 13px;
  border: 1px solid var(--vp-c-divider); background: transparent; color: var(--vp-c-text-2);
}
.ach-filters button.on {
  border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft); font-weight: 600;
}
.ach-group { margin-bottom: 20px; }
.ach-group-title { font-size: 14px; color: var(--vp-c-text-2); margin: 0 0 10px; font-weight: 600; }
.ach-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 10px;
}
.ach-item {
  position: relative; text-align: center; padding: 10px 6px 8px;
  border: 1px solid var(--vp-c-divider); border-radius: 12px;
  background: var(--vp-c-bg-soft); cursor: help;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.ach-item:hover { transform: translateY(-3px); border-color: rgba(47, 232, 164, 0.4); }
.ach-item img { width: 56px; height: 56px; border-radius: 10px; }
.ach-item:not(.got) img { filter: grayscale(1); opacity: 0.45; }
.ach-item:not(.got) .ach-name { color: var(--vp-c-text-3); }
.ach-item.got { border-color: rgba(47, 232, 164, 0.35); }
.ach-item.got img { box-shadow: 0 0 16px rgba(47, 232, 164, 0.35); }
.ach-check {
  position: absolute; top: 4px; right: 6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--vp-c-brand-1); color: #06281c;
  font-size: 12px; font-weight: 800; line-height: 20px;
}
.ach-name { display: block; font-size: 11px; margin-top: 6px; line-height: 1.35; color: var(--vp-c-text-2); }
.ach-loading { color: var(--vp-c-text-3); padding: 24px 0; text-align: center; }
</style>
