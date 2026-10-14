---
title: 设置
---

# 设置

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const bannerPref = ref('on')
const steamid = ref('')
const updatedAt = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    bannerPref.value = localStorage.getItem('ff7-progress-banner') || 'on'
  } catch {}
  try {
    const r = await fetch(withBase('/progress.json'))
    if (r.ok) {
      const p = await r.json()
      steamid.value = p.steamid
      updatedAt.value = p.updated_at.replace('T', ' ').slice(0, 16)
    }
  } catch {}
  loading.value = false
})

function toggleBanner() {
  bannerPref.value = bannerPref.value === 'on' ? 'off' : 'on'
  try { localStorage.setItem('ff7-progress-banner', bannerPref.value) } catch {}
}
</script>

## Steam 账户绑定

- **当前绑定**：Jarry（`pkm365`）
- **SteamID64**：<code v-if="!loading">{{ steamid || '—' }}</code><span v-else>读取中…</span>
- **数据凭证**：Steam API Key（保存在服务端保险库，云电脑定时拉取，状态正常）

如需更换绑定的 Steam 账户，直接在聊天里跟 DQ 说一声即可。

## 数据状态

- **上次更新**：<span v-if="!loading">{{ updatedAt || '—' }}</span><span v-else>读取中…</span>
- **更新频率**：每 6 小时自动拉取一次
- 手动刷新：在聊天里说"更新下 Steam 进度"，DQ 会立刻跑一次

## 显示偏好

<div class="setting-row">
  <span>首页显示「我的开荒进度」横幅</span>
  <button class="setting-btn" @click="toggleBanner">{{ bannerPref === 'on' ? '开' : '关' }}</button>
</div>

<style scoped>
.setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px;
  margin: 12px 0;
}
.setting-btn {
  padding: 6px 18px; border-radius: 999px; cursor: pointer;
  border: 1px solid var(--vp-c-brand-1); background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1); font-weight: 600;
}
</style>
