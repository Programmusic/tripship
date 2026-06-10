<template>
  <div class="cabin-page">
    <template v-if="post">
      <RouterLink to="/captains-cabin" class="cabin-back">← Back to the Cabin</RouterLink>
      <p class="cabin-eyebrow">Captain's Log</p>
      <h1 class="page-title">{{ post.title }}</h1>
      <time class="cabin-date">{{ formatDate(post.createdAt) }}</time>
      <div class="cabin-content card" v-html="formattedContent"></div>
      <p class="cabin-signoff">— Captain Flystyle ☠</p>
    </template>

    <template v-else>
      <h1 class="page-title">Captain's Cabin</h1>
      <p class="page-subtitle">Captain Flystyle's log — news, voyages & orders from the helm</p>

      <div v-if="loading" class="empty-state">Readin' the Captain's log...</div>

      <template v-else>
        <article v-if="welcomePost" class="cabin-welcome card">
          <header class="cabin-welcome__header">
            <img src="/images/skull-crossbones.svg" alt="" class="cabin-welcome__skull" />
            <div>
              <p class="cabin-eyebrow">Captain's Log · Latest</p>
              <h2 class="cabin-welcome__title">{{ welcomePost.title }}</h2>
              <time class="cabin-date">{{ formatDate(welcomePost.createdAt) }}</time>
            </div>
          </header>
          <div class="cabin-content cabin-welcome__body" v-html="formatContent(welcomePost.content)"></div>
          <p class="cabin-signoff cabin-welcome__signoff">— Captain Flystyle ☠</p>
        </article>

        <section v-if="otherPosts.length" class="cabin-archive">
          <h2 class="cabin-archive__title">Earlier entries</h2>
          <div class="cabin-list">
            <BlogPostCard v-for="p in otherPosts" :key="p.id" :post="p" />
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/client'
import BlogPostCard from '@/components/BlogPostCard.vue'
import { CAPTAIN_LOG_WELCOME_SLUG } from '@/demo/mockData.js'

const route = useRoute()
const posts = ref([])
const post = ref(null)
const loading = ref(true)

const welcomePost = computed(() =>
  posts.value.find((p) => p.slug === CAPTAIN_LOG_WELCOME_SLUG || p.featured) ?? posts.value[0]
)

const otherPosts = computed(() =>
  posts.value.filter((p) => p.id !== welcomePost.value?.id)
)

const formattedContent = computed(() => formatContent(post.value?.content))

function formatInline(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

function formatContent(content) {
  if (!content) return ''
  return content
    .split('\n\n')
    .map((block) => {
      const lines = block.split('\n')
      if (lines.every((l) => l.startsWith('- '))) {
        return `<ul>${lines.map((l) => `<li>${formatInline(l.slice(2))}</li>`).join('')}</ul>`
      }
      if (lines.some((l) => l.startsWith('- '))) {
        return lines.map((line) => {
          if (line.startsWith('- ')) {
            return `<ul><li>${formatInline(line.slice(2))}</li></ul>`
          }
          return line ? `<p>${formatInline(line)}</p>` : ''
        }).join('')
      }
      return `<p>${formatInline(block)}</p>`
    })
    .join('')
}

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

.cabin-eyebrow {
  font-size: 0.65rem;
  color: var(--neon-cyan);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.cabin-date {
  display: block;
  color: var(--gold);
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
}

.cabin-content {
  line-height: 1.8;
}

.cabin-content :deep(p) {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.cabin-content :deep(ul) {
  margin: 0 0 1rem 1.25rem;
  color: var(--text-primary);
}

.cabin-content :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
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

.cabin-welcome {
  margin-bottom: 2.5rem;
  border: 2px solid var(--gold);
  box-shadow: 0 0 32px rgba(201, 162, 39, 0.15);
}

.cabin-welcome__header {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.cabin-welcome__skull {
  width: 72px;
  flex-shrink: 0;
}

.cabin-welcome__title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--gold);
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.cabin-welcome__body {
  margin-bottom: 1rem;
}

.cabin-welcome__signoff {
  margin-top: 0.5rem;
}

.cabin-archive__title {
  font-size: 1rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.25rem;
}

.cabin-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
