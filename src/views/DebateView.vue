<template>
  <div class="debate-view">
    <!-- Recursos básicos visíveis para todos -->
    <div class="basic-search">
      <input type="text" v-model="searchQuery" placeholder="Pesquisar debates..." />
      <button @click="search">Buscar</button>
    </div>
    
    <!-- Recursos avançados que aparecem conforme nível de expertise -->
    <adaptive-feature feature-name="advancedSearch" help-text="Use filtros avançados para refinar sua pesquisa.">
      <div class="advanced-search-panel">
        <h3>Busca Avançada</h3>
        <div class="filters">
          <!-- Filtros avançados aqui -->
        </div>
      </div>
    </adaptive-feature>
    
    <!-- Análise de dados - apenas para usuários avançados -->
    <adaptive-feature feature-name="dataAnalytics" help-text="Visualize estatísticas dos debates.">
      <div class="analytics-panel">
        <h3>Análise de Dados</h3>
        <!-- Gráficos e visualizações aqui -->
      </div>
    </adaptive-feature>
    
    <!-- Apresenta configurações de experiência -->
    <div class="settings-section">
      <button @click="showExpertiseSettings = !showExpertiseSettings">
        Configurar Interface
      </button>
      <expertise-settings v-if="showExpertiseSettings" />
    </div>
  </div>
</template>

<script>
import AdaptiveFeature from '@/components/AdaptiveFeature.vue';
import ExpertiseSettings from '@/components/ExpertiseSettings.vue';
import expertiseService from '@/services/expertiseService';

export default {
  components: {
    AdaptiveFeature,
    ExpertiseSettings,
  },
  
  data() {
    return {
      showExpertiseSettings: false,
      searchQuery: '',
    };
  },
  
  methods: {
    search() {
      expertiseService.trackProgress('search', 1);
      // Lógica de busca...
    },
  }
};
</script>

<style scoped>
.debate-view {
  padding: 20px;
}

.basic-search {
  margin-bottom: 20px;
}

.advanced-search-panel, .analytics-panel {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.settings-section {
  margin-top: 30px;
}
</style>