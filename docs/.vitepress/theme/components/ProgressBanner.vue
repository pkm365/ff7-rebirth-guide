<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { withBase } from 'vitepress'

interface Progress {
  updated_at: string
  steamid: string
  playtime_minutes: number
  achievements: { total: number; unlocked: number }
  current_chapter: number
  chapters: { n: number; title: string; done: boolean }[]
}

const progress = ref<Progress | null>(null)
const visible = ref(true)

onMounted(async () => {
  try {
    if (localStorage.getItem('ff7-progress-banner') === 'off') visible.value = false
  } catch {}
  try {
    const r = await fetch(withBase('/progress.json'))
    if (r.ok) progress.value = await r.json()
  } catch {}
})

const hours = computed(() => {
  if (!progress.value) return ''
  const m = progress.value.playtime_minutes
  return `${Math.floor(m / 60)}小时${m % 60}分`
})
const achPct = computed(() => {
  if (!progress.value) return 0
  const a = progress.value.achievements
  return Math.round((a.unlocked / a.total) * 100)
})
const barWidth = computed(() => 'width:' + achPct.value + '%')
const updatedStr = computed(() => {
  if (!progress.value) return ''
  return progress.value.updated_at.replace('T', ' ').slice(0, 16)
})
</script>

<template>
<div v-if="visible && progress" class="progress-banner">
  <div class="pb-main">
    <div class="pb-title">我的开荒进度</div>
    <div class="pb-stats">
      <span class="pb-chip">第 {{ progress.current_chapter }} 章 / 14</span>
      <span class="pb-chip">成就 {{ progress.achievements.unlocked }}/{{ progress.achievements.total }}</span>
      <span class="pb-chip">{{ hours }}</span>
    </div>
    <div class="pb-bar">
      <div class="pb-fill"></div>
    </div>
  </div>
  <div class="pb-side">
    <a :href="withBase('/chapters/ch' + String(progress.current_chapter).padStart(2, '0'))" class="pb-cta">继续第 {{ progress.current_chapter }} 章 →</a>
    <div class="pb-updated">数据更新于 {{ updatedStr }} · <a :href="withBase('/settings')">设置</a></div>
  </div>
</div>
</template>

<style scoped>
.progress-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: linear-gradient(135deg, var(--vp-c-bg-soft), transparent);
}
.pb-title { font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 8px; }
.pb-stats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.pb-chip {
  font-size: 14px; font-weight: 600;
  padding: 4px 12px; border-radius: 999px;
  background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1);
}
.pb-bar { height: 6px; border-radius: 3px; background: var(--vp-c-bg-mute); overflow: hidden; }
.pb-fill { height: 100%; background: var(--vp-c-brand-1); border-radius: 3px; transition: width .5s; }
.pb-side { text-align: right; flex-shrink: 0; }
.pb-cta { font-weight: 700; font-size: 15px; }
.pb-updated { font-size: 12px; color: var(--vp-c-text-3); margin-top: 6px; }
@media (max-width: 640px) {
  .progress-banner { flex-direction: column; align-items: stretch; }
  .pb-side { text-align: left; }
}
</style>
