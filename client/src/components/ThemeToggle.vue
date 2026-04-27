<template>
  <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
    <span v-if="isDark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>

<script>
import { useTheme } from '../composables/useTheme'

export default {
  name: 'ThemeToggle',
  setup() {
    const { isDark, toggleTheme } = useTheme()
    return { isDark, toggleTheme }
  }
}
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.375rem 0.625rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: background 0.15s ease;
  margin-right: 0.5rem;
}

.theme-toggle:hover {
  background: var(--bg-hover);
}
</style>
