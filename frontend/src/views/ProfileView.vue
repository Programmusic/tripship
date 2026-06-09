<template>
  <div class="profile-page">
    <h1 class="page-title">Yer Manifest Entry</h1>
    <p class="page-subtitle">Trip Ship crew member — aboard the Unsocial Media</p>

    <div class="profile-card card">
      <div class="profile-card__avatar">☠</div>
      <div class="profile-card__info">
        <h2>{{ auth.displayName }}</h2>
        <p class="profile-card__username">@{{ auth.user?.username }}</p>
        <span :class="['badge', auth.isDj ? 'badge--dj' : 'badge--gold']">
          {{ auth.isDj ? 'Selector / DJ' : 'Crew Member' }}
        </span>
      </div>
    </div>

    <div class="profile-actions">
      <RouterLink to="/memories" class="btn">Spin a Yarn</RouterLink>
      <RouterLink to="/the-list" class="btn">The List</RouterLink>
      <RouterLink v-if="auth.isDj" to="/mixes" class="btn btn--pink">Drop a Mix</RouterLink>
      <RouterLink to="/captains-cabin" class="btn btn--ghost">Captain's Cabin</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<style scoped>
.profile-page { max-width: 600px; margin: 0 auto; }
.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.profile-card__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--wood-mid));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border: 2px solid var(--gold);
  flex-shrink: 0;
}
.profile-card__info h2 { font-size: 1.8rem; margin-bottom: 0.25rem; color: var(--gold); }
.profile-card__username { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.75rem; }
.profile-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
</style>
