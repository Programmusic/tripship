<template>
  <div class="ship-wrap">
    <img src="/images/pirate-ship.svg" alt="Trip Ship pirate vessel with sound system rigging" class="ship-wrap__img" />
    <div class="ship-wrap__waves" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.ship-wrap {
  position: relative;
  max-width: 700px;
  margin: 0 auto 1.5rem;
}

.ship-wrap__img {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 0 30px rgba(201, 162, 39, 0.3));
  animation: rock 6s ease-in-out infinite;
}

@keyframes rock {
  0%, 100% { transform: rotate(-1deg) translateY(0); }
  50% { transform: rotate(1deg) translateY(-6px); }
}

.ship-wrap__waves {
  height: 20px;
  margin-top: -10px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 204, 0.15), transparent);
  animation: wave 3s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { opacity: 0.3; transform: scaleX(0.9); }
  50% { opacity: 0.8; transform: scaleX(1.1); }
}
</style>
