<template>
  <article class="card blog-post">
    <header class="blog-post__header">
      <img src="/images/skull-crossbones.svg" alt="" class="blog-post__icon" />
      <div>
        <time class="blog-post__date">{{ formatDate(post.createdAt) }}</time>
        <h3 class="blog-post__title">{{ post.title }}</h3>
      </div>
    </header>
    <p class="blog-post__excerpt">{{ post.excerpt }}</p>
    <RouterLink :to="`/captains-cabin/${post.slug}`" class="blog-post__link">
      Read the Captain's log →
    </RouterLink>
  </article>
</template>

<script setup>
defineProps({
  post: { type: Object, required: true },
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<style scoped>
.blog-post__header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.blog-post__icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.blog-post__date {
  font-size: 0.7rem;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.blog-post__title {
  font-size: 1.3rem;
  color: var(--neon-cyan);
  margin-top: 0.25rem;
}

.blog-post__excerpt {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.blog-post__link {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
}
</style>
