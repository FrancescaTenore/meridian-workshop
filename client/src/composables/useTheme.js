import { ref, watch } from 'vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

applyTheme(isDark.value)

watch(isDark, applyTheme)

export function useTheme() {
  const toggleTheme = () => { isDark.value = !isDark.value }
  return { isDark, toggleTheme }
}
