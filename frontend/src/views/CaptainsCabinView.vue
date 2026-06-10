<template>
  <div class="cabin-page">
    <template v-if="post">
      <RouterLink to="/captains-cabin" class="cabin-back">← Back to the Cabin</RouterLink>
      <h1 class="page-title">{{ post.title }}</h1>
      <time class="cabin-date">{{ formatDate(post.createdAt) }}</time>
      <div class="cabin-content card" v-html="formattedContent"></div>
      <p class="cabin-signoff">— Captain Flystyle ☠</p>
    </template>

    <template v-else>
      <h1 class="page-title">Captain's Cabin</h1>
      <p class="page-subtitle">Captain Flystyle's log — news, voyages & orders from the helm</p>

      <div class="cabin-hero card">
        <img src="/images/skull-crossbones.svg" alt="" class="cabin-hero__skull" />
        <p>Avast! This be me personal log. Updates on what's happenin' now, where the ship be sailin' next, and orders for the crew.</p>
      </div>

      <div v-if="loading" class="empty-state">Readin' the Captain's log...</div>
      <div v-else class="cabin-list">
        <BlogPostCard v-for="p in posts" :key="p.id" :post="p" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/client'
import BlogPostCard from '@/components/BlogPostCard.vue'

const route = useRoute()
const posts = ref([])
const post = ref(null)
const loading = ref(true)

const formattedContent = computed(() => {
  if (!post.value?.content) return ''
  return post.value.content
    .split('\n\n')
    .map((p) => `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
    .join('')
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function loadList() {
  loading.value = true
  post.value = null
  try {
    const { data } = await api.get('/blog')
    posts.value = data
  } finally {
    loading.value = false
  }
}

async function loadPost(slug) {
  loading.value = true
  try {
    const { data } = await api.get(`/blog/${slug}`)
    post.value = data
  } finally {
    loading.value = false
  }
}

watch(() => route.params.slug, (slug) => {
  if (slug) loadPost(slug)
  else loadList()
}, { immediate: true })
</script>

<style scoped>
.cabin-back {
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.cabin-date {
  display: block;
  color: var(--gold);
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
}

.cabin-content {
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.cabin-content :deep(p) {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.cabin-content :deep(strong) {
  color: var(--neon-cyan);
}

.cabin-signoff {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--gold);
  text-align: right;
}

.cabin-hero {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.cabin-hero__skull {
  width: 64px;
  flex-shrink: 0;
}

.cabin-hero p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
}

.cabin-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
