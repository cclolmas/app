<template>
  <div class="expertise-settings">
    <h3>Configurações de Interface</h3>
    
    <div class="expertise-level-selector">
      <p>Selecione seu nível de experiência:</p>
      <div class="radio-group">
        <label>
          <input type="radio" v-model="selectedLevel" value="beginner" @change="updateExpertiseLevel" />
          Iniciante
        </label>
        <label>
          <input type="radio" v-model="selectedLevel" value="intermediate" @change="updateExpertiseLevel" />
          Intermediário
        </label>
        <label>
          <input type="radio" v-model="selectedLevel" value="advanced" @change="updateExpertiseLevel" />
          Avançado
        </label>
        <label>
          <input type="radio" v-model="selectedLevel" value="expert" @change="updateExpertiseLevel" />
          Especialista
        </label>
      </div>
    </div>
    
    <div class="features-visibility">
      <h4>Recursos Visíveis</h4>
      <div v-for="(isVisible, feature) in featureVisibility" :key="feature" class="feature-toggle">
        <label>
          <input type="checkbox" v-model="featureVisibility[feature]" @change="toggleFeatureVisibility(feature)" />
          {{ getFeatureDisplayName(feature) }}
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import expertiseService from '@/services/expertiseService';

export default {
  name: 'ExpertiseSettings',
  
  data() {
    return {
      selectedLevel: expertiseService.expertiseLevel,
      featureVisibility: { ...expertiseService.featureVisibility },
    };
  },
  
  methods: {
    updateExpertiseLevel() {
      expertiseService.setExpertiseLevel(this.selectedLevel);
      this.featureVisibility = { ...expertiseService.featureVisibility };
    },
    
    toggleFeatureVisibility(feature) {
      expertiseService.toggleFeature(feature, this.featureVisibility[feature]);
    },
    
    getFeatureDisplayName(feature) {
      const displayNames = {
        advancedSearch: 'Busca Avançada',
        customQueries: 'Consultas Personalizadas',
        dataAnalytics: 'Análise de Dados',
        exportTools: 'Ferramentas de Exportação',
        apiAccess: 'Acesso à API'
      };
      
      return displayNames[feature] || feature;
    }
  }
};
</script>

<style scoped>
.expertise-settings {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  max-width: 600px;
}

.radio-group, .feature-toggle {
  margin: 10px 0;
}

.radio-group label, .feature-toggle label {
  margin-right: 15px;
  display: block;
  cursor: pointer;
}

h3, h4 {
  margin-top: 0;
  color: #333;
}
</style>
