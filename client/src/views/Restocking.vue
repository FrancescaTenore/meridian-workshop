<template>
  <div class="restocking">
    <div class="page-header">
      <div class="header-main">
        <div>
          <h2>{{ t('restocking.title') }}</h2>
          <p>{{ t('restocking.description') }}</p>
        </div>
        <div class="budget-input-group">
          <label for="budget-ceiling" class="budget-label">
            {{ t('restocking.budgetCeiling') }}
          </label>
          <div class="budget-input-wrapper">
            <span class="budget-prefix">$</span>
            <input
              id="budget-ceiling"
              v-model.number="budgetCeiling"
              type="number"
              min="0"
              step="1000"
              class="budget-input"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading restocking recommendations...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Stats row -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.stats.itemsToRestock') }}</div>
          <div class="stat-value">{{ annotatedRecommendations.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.stats.totalEstimatedCost') }}</div>
          <div class="stat-value">{{ formatCurrency(totalEstimatedCost) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.stats.itemsOverBudget') }}</div>
          <div class="stat-value">{{ itemsOverBudget }}</div>
        </div>
      </div>

      <!-- Recommendations table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.title') }}</h3>
        </div>

        <div v-if="annotatedRecommendations.length === 0" class="empty-state">
          {{ t('restocking.noItems') }}
        </div>

        <div v-else class="table-container">
          <table class="restocking-table">
            <thead>
              <tr>
                <th>{{ t('restocking.table.sku') }}</th>
                <th>{{ t('restocking.table.itemName') }}</th>
                <th>{{ t('restocking.table.warehouse') }}</th>
                <th>{{ t('restocking.table.stockOnHand') }} / {{ t('restocking.table.reorderPoint') }}</th>
                <th>{{ t('restocking.table.daysToStockout') }}</th>
                <th>{{ t('restocking.table.recommendedQty') }}</th>
                <th>{{ t('restocking.table.estimatedCost') }}</th>
                <th>{{ t('restocking.table.priority') }}</th>
                <th>{{ t('restocking.table.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in annotatedRecommendations" :key="item.sku">
                <td><code class="sku">{{ item.sku }}</code></td>
                <td>{{ translateProductName(item.name) }}</td>
                <td>{{ translateWarehouse(item.warehouse) }}</td>
                <td>{{ item.quantity_on_hand }} / {{ item.reorder_point }}</td>
                <td>{{ item.days_to_stockout != null ? item.days_to_stockout : '—' }}</td>
                <td>{{ item.recommended_qty }}</td>
                <td>{{ formatCurrency(item.estimated_cost) }}</td>
                <td>
                  <span :class="priorityClass(item.priority)">
                    {{ t('restocking.priority.' + item.priority) }}
                  </span>
                </td>
                <td class="status-cell">
                  <span v-if="item.isOverBudget" class="badge danger">
                    {{ t('restocking.overBudget') }}
                  </span>
                  <span v-if="item.has_backlog" class="badge warning">
                    {{ t('restocking.hasBacklog') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

const { t, translateProductName, translateWarehouse } = useI18n()
const { selectedLocation, selectedCategory, getCurrentFilters } = useFilters()

const loading = ref(true)
const error = ref(null)
const recommendations = ref([])
const budgetCeiling = ref(50000)

const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    const filters = getCurrentFilters()
    recommendations.value = await api.getRestockingRecommendations(filters)
  } catch (err) {
    error.value = 'Failed to load restocking data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Annotate each item with isOverBudget, tracking running total in priority order
const annotatedRecommendations = computed(() => {
  let running = 0
  return recommendations.value.map(item => {
    const isOverBudget = running + item.estimated_cost > budgetCeiling.value
    if (!isOverBudget) running += item.estimated_cost
    return { ...item, isOverBudget }
  })
})

const totalEstimatedCost = computed(() =>
  recommendations.value.reduce((sum, item) => sum + item.estimated_cost, 0)
)

const itemsOverBudget = computed(() =>
  annotatedRecommendations.value.filter(item => item.isOverBudget).length
)

const priorityClass = (priority) => {
  const map = {
    critical: 'badge danger',
    high: 'badge warning',
    medium: 'badge info'
  }
  return map[priority] || 'badge'
}

const formatCurrency = (value) =>
  Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

watch([selectedLocation, selectedCategory], loadData)
onMounted(loadData)
</script>

<style scoped>
.restocking {
  padding: 0;
}

.header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.budget-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.budget-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.budget-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.budget-prefix {
  padding: 0.5rem 0.625rem;
  background: #f8fafc;
  color: #64748b;
  font-weight: 500;
  border-right: 1px solid #e2e8f0;
  font-size: 0.9375rem;
}

.budget-input {
  border: none;
  outline: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  width: 130px;
  color: #0f172a;
}

.budget-input:focus {
  box-shadow: 0 0 0 2px #3b82f620;
}

.restocking-table {
  width: 100%;
  border-collapse: collapse;
}

.restocking-table th {
  background: #f8fafc;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.restocking-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.restocking-table tr:hover {
  background: #f8fafc;
}

.sku {
  font-family: ui-monospace, monospace;
  font-size: 0.8125rem;
  background: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  color: #475569;
}

.status-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
  font-size: 0.9375rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}
</style>
