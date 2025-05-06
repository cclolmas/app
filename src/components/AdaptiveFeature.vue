<template>
  <div v-if="isVisible" class="adaptive-feature">
    <slot></slot>
    
    <div v-if="showHelp && helpText" class="feature-help">
      <button class="help-icon" @click="toggleHelpText">?</button>
      <div v-if="isHelpVisible" class="help-text">
        {{ helpText }}
      </div>
    </div>
  </div>
</template>

<script>
import expertiseService from '@/services/expertiseService';

export default {
  name: 'AdaptiveFeature',
  
  props: {
    featureName: {
      type: String,
      required: true
    },
    helpText: {
      type: String,
      default: ''
    },
    showHelp: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      isHelpVisible: false
    };
  },
  
  computed: {
    isVisible() {
      return expertiseService.isFeatureVisible(this.featureName);
    }
  },
  
  methods: {
    toggleHelpText() {
      this.isHelpVisible = !this.isHelpVisible;
    }
  }
};
</script>

<style scoped>
.adaptive-feature {
  position: relative;
}

.feature-help {
  position: relative;
  display: inline-block;
}

.help-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.help-text {
  position: absolute;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  z-index: 100;
  width: 250px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  top: 25px;
  right: 0;
}
</style>
