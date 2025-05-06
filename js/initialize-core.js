/**
 * Inicialização dos componentes do Design System GOV.BR
 */

document.addEventListener('DOMContentLoaded', function() {
  /**
   * Verifica se os componentes do Design System estão carregados
   */
  function initializeDesignSystem() {
    // Verificar se o objeto global está disponível
    if (typeof window.coreDefaults === 'undefined') {
      console.warn('Design System GOV.BR não encontrado, criando um wrapper...');
      
      // Criar um objeto wrapper para evitar erros
      window.coreDefaults = {
        initInstanceAll: function() {
          console.log('Inicializando componentes do Design System (wrapper)');
          initializeComponents();
        }
      };
    }
    
    // Tentar inicializar componentes
    if (typeof window.coreDefaults.initInstanceAll === 'function') {
      console.log('Inicializando componentes do Design System...');
      window.coreDefaults.initInstanceAll();
    }
  }
  
  /**
   * Inicializa componentes manualmente se necessário
   */
  function initializeComponents() {
    // Inicializar tooltips
    if (typeof jQuery !== 'undefined' && jQuery('[data-toggle="tooltip"]').length) {
      jQuery('[data-toggle="tooltip"]').tooltip();
    }
    
    // Inicializar dropdowns
    document.querySelectorAll('.br-button[data-toggle="dropdown"]').forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const target = document.querySelector(targetId);
        if (target) {
          target.classList.toggle('show');
        }
      });
    });
    
    // Inicializar collapses
    document.querySelectorAll('[data-toggle="collapse"]').forEach(toggle => {
      toggle.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const target = document.querySelector(targetId);
        if (target) {
          target.classList.toggle('show');
          
          // Alternar ícone
          const icon = this.querySelector('i');
          if (icon) {
            if (target.classList.contains('show')) {
              icon.classList.remove('fa-angle-down');
              icon.classList.add('fa-angle-up');
            } else {
              icon.classList.remove('fa-angle-up');
              icon.classList.add('fa-angle-down');
            }
          }
        }
      });
    });
    
    // Garantir que outros componentes do GOV.BR sejam inicializados
    initializeBrSelects();
  }
  
  /**
   * Inicializa os selects do Design System GOV.BR
   */
  function initializeBrSelects() {
    document.querySelectorAll('.br-select').forEach(select => {
      const input = select.querySelector('input');
      const list = select.querySelector('.br-list');
      const toggle = select.querySelector('[data-trigger]');
      
      if (input && list && toggle) {
        toggle.addEventListener('click', function() {
          list.classList.toggle('active');
          
          const icon = toggle.querySelector('i');
          if (icon) {
            if (list.classList.contains('active')) {
              icon.classList.remove('fa-angle-down');
              icon.classList.add('fa-angle-up');
            } else {
              icon.classList.remove('fa-angle-up');
              icon.classList.add('fa-angle-down');
            }
          }
        });
        
        select.querySelectorAll('.br-item').forEach(item => {
          item.addEventListener('click', function() {
            const radio = item.querySelector('input[type="radio"]');
            if (radio) {
              radio.checked = true;
              input.value = radio.nextElementSibling.textContent.trim();
              list.classList.remove('active');
              
              // Disparar evento change para o radio
              const event = new Event('change', { bubbles: true });
              radio.dispatchEvent(event);
            }
          });
        });
      }
    });
  }
  
  // Inicializar o Design System
  initializeDesignSystem();
});
