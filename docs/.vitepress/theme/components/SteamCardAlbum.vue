<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { withBase } from 'vitepress'

interface SteamCard { id: number; en: string; cn: string; img: string; price: string; market: string }

const cards = ref<SteamCard[]>([])
const owned = ref<Set<string>>(new Set())
const updatedAt = ref('')
const lightbox = ref<SteamCard | null>(null)

onMounted(async () => {
  try {
    const r = await fetch(withBase('/steam-cards.json'))
    if (r.ok) cards.value = await r.json()
  } catch {}
  try {
    const r = await fetch(withBase('/progress.json'))
    if (r.ok) {
      const p = await r.json()
      owned.value = new Set((p.trading_cards?.owned ?? []) as string[])
      updatedAt.value = (p.updated_at ?? '').replace('T', ' ').slice(0, 16)
    }
  } catch {}
})

const isOwned = (en: string) => owned.value.has(en)
const gotCount = computed(() => cards.value.filter(c => isOwned(c.en)).length)
const pct = computed(() => cards.value.length ? Math.round((gotCount.value / cards.value.length) * 100) : 0)
const missingCost = computed(() => {
  // 缺卡的市场价估算（静态数据里的 price 字段）
  return cards.value.filter(c => !isOwned(c.en) && c.price.startsWith('≈'))
    .map(c => c.price.replace('≈ $', ''))
})
const missingTotal = computed(() => {
  const nums = cards.value.filter(c => !isOwned(c.en))
    .map(c => parseFloat(c.price.replace(/[≈ $\u4e00-\u9fa5]/g, '')))
    .filter(n => !isNaN(n))
  return nums.length ? '≈ $' + nums.reduce((a, b) => a + b, 0).toFixed(2) : ''
})
</script>

<template>
  <div class="sc-album" v-if="cards.length">
    <div class="sc-head">
      <div class="sc-progress">
        <div class="sc-bar"><div class="sc-fill" :style="'width:' + pct + '%'"></div></div>
        <span class="sc-count">{{ gotCount }}/{{ cards.length }}（{{ pct }}%）</span>
      </div>
      <span class="sc-sync" v-if="updatedAt">库存同步于 {{ updatedAt }}</span>
    </div>
    <div class="sc-hint">
      与你的 Steam 库存实时联动，每 6 小时自动同步。集齐 8 张可在 Steam 上合成徽章、解锁个人资料背景与表情。
      <span v-if="missingTotal">还差 {{ cards.length - gotCount }} 张，市场价合计 {{ missingTotal }}。</span>
    </div>
    <div class="sc-grid">
      <div v-for="c in cards" :key="c.id"
           class="sc-card" :class="{ owned: isOwned(c.en), missing: !isOwned(c.en) }"
           @click="lightbox = c">
        <div class="sc-frame">
          <img :src="withBase(c.img)" :alt="c.cn" loading="lazy" />
          <span v-if="isOwned(c.en)" class="sc-check">✓</span>
          <span v-else class="sc-lock">🔒</span>
        </div>
        <span class="sc-name">{{ c.cn }}</span>
        <span class="sc-sub">{{ isOwned(c.en) ? '已拥有' : c.price }}</span>
      </div>
    </div>

    <div v-if="lightbox" class="sc-lightbox" @click.self="lightbox = null">
      <div class="sc-modal">
        <button class="sc-close" @click="lightbox = null">✕</button>
        <img :src="withBase(lightbox.img)" :alt="lightbox.cn" class="sc-big" />
        <div class="sc-info">
          <div class="sc-info-name">{{ lightbox.cn }}</div>
          <div class="sc-info-en">{{ lightbox.en }} · FINAL FANTASY VII REBIRTH 集换式卡牌</div>
          <div v-if="isOwned(lightbox.en)" class="sc-owned-tag">✓ 已在你的 Steam 库存中</div>
          <a v-else class="sc-buy" :href="lightbox.market" target="_blank" rel="noopener">
            去 Steam 市场购买（{{ lightbox.price }}）↗
          </a>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="sc-loading">卡片数据加载中…</div>
</template>

<style scoped>
.sc-album { margin: 20px 0 32px; }
.sc-head { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.sc-progress { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 220px; }
.sc-bar { flex: 1; height: 8px; border-radius: 4px; background: var(--vp-c-bg-mute); overflow: hidden; }
.sc-fill {
  height: 100%; border-radius: 4px; transition: width 0.6s;
  background: linear-gradient(90deg, #1b78d0, #66c0f4);
  box-shadow: 0 0 12px rgba(102, 192, 244, 0.45);
}
.sc-count { font-weight: 700; color: #66c0f4; white-space: nowrap; }
.sc-sync { font-size: 12px; color: var(--vp-c-text-3); }
.sc-hint { font-size: 12px; color: var(--vp-c-text-3); margin-bottom: 14px; line-height: 1.6; }
.sc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 14px;
}
.sc-card { cursor: pointer; text-align: center; }
.sc-frame {
  position: relative; border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(102, 192, 244, 0.2);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  aspect-ratio: 3 / 4;
  background: #0d1620;
}
.sc-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sc-card:hover .sc-frame {
  transform: translateY(-4px) scale(1.03);
  border-color: rgba(102, 192, 244, 0.6);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55), 0 0 24px rgba(102, 192, 244, 0.16);
}
.sc-card.missing .sc-frame img { filter: grayscale(0.9) brightness(0.6); }
.sc-card.owned .sc-frame { border-color: rgba(102, 192, 244, 0.55); }
.sc-check {
  position: absolute; top: 6px; right: 6px;
  width: 22px; height: 22px; border-radius: 50%;
  background: #66c0f4; color: #0d1620;
  font-size: 13px; font-weight: 800; line-height: 22px;
  box-shadow: 0 0 10px rgba(102, 192, 244, 0.6);
}
.sc-lock {
  position: absolute; top: 6px; right: 6px;
  font-size: 15px; opacity: 0.85;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.8));
}
.sc-name { display: block; font-size: 12px; margin-top: 6px; color: var(--vp-c-text-1); line-height: 1.3; }
.sc-sub { display: block; font-size: 11px; color: var(--vp-c-text-3); margin-top: 2px; }
.sc-card.owned .sc-sub { color: #66c0f4; }
.sc-loading { text-align: center; color: var(--vp-c-text-3); padding: 24px 0; }

.sc-lightbox {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(4, 8, 14, 0.88);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; backdrop-filter: blur(6px);
}
.sc-modal {
  position: relative; max-width: 420px; width: 100%;
  background: #101820; border: 1px solid rgba(102, 192, 244, 0.35);
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(102, 192, 244, 0.1);
}
.sc-big { width: 100%; display: block; aspect-ratio: 3 / 4; object-fit: cover; }
.sc-close {
  position: absolute; top: 10px; right: 10px;
  width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
  background: rgba(0, 0, 0, 0.6); color: #fff; border: 1px solid rgba(255,255,255,0.2);
  font-size: 14px;
}
.sc-info { padding: 16px 20px 20px; }
.sc-info-name { font-size: 18px; font-weight: 700; color: #66c0f4; margin-bottom: 4px; }
.sc-info-en { font-size: 12px; color: var(--vp-c-text-3); margin-bottom: 12px; }
.sc-owned-tag {
  display: inline-block; padding: 8px 16px; border-radius: 10px;
  background: rgba(102, 192, 244, 0.12); color: #66c0f4;
  border: 1px solid rgba(102, 192, 244, 0.4); font-size: 13px; font-weight: 600;
}
.sc-buy {
  display: block; text-align: center; padding: 10px; border-radius: 10px;
  border: 1px solid rgba(102, 192, 244, 0.5); color: #66c0f4;
  font-size: 14px; font-weight: 600; text-decoration: none;
}
.sc-buy:hover { background: rgba(102, 192, 244, 0.1); }
</style>
