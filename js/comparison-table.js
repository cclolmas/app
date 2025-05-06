/**
 * Funções para manipulação da tabela de comparação CL-CompL
 */

/**
 * Atualiza a tabela de comparação com novos dados
 * @param {Array|Object} data - Dados para atualizar a tabela
 */
window.updateComparisonTable = function(data = {}) {
  console.log('Atualizando tabela de comparação com:', data);
  
  const tableBody = document.getElementById('comparison-table-body');
  if (!tableBody) {
    console.warn('Tabela de comparação não encontrada no DOM');
    return;
  }
  
  try {
    // Limpar tabela atual
    tableBody.innerHTML = '';
    
    // Verificar formato dos dados
    if (Array.isArray(data)) {
      // Formato de array de objetos
      data.forEach(row => {
        const tr = document.createElement('tr');
        
        // Criar células para cada propriedade
        Object.entries(row).forEach(([key, value]) => {
          const td = document.createElement('td');
          
          // Formatação especial para valores numéricos
          if (typeof value === 'number') {
            td.textContent = value.toFixed(2);
            
            // Adicionar classes para valores altos/baixos
            if (key.toLowerCase().includes('cl')) {
              td.classList.add(value > 75 ? 'high-cl' : value < 25 ? 'low-cl' : 'normal');
            } else if (key.toLowerCase().includes('compl')) {
              td.classList.add(value > 75 ? 'high-compl' : value < 25 ? 'low-compl' : 'normal');
            }
          } else {
            td.textContent = value;
          }
          
          tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
      });
    } else if (typeof data === 'object') {
      // Formato de objeto único
      const tr = document.createElement('tr');
      
      Object.entries(data).forEach(([key, value]) => {
        const td = document.createElement('td');
        td.textContent = typeof value === 'number' ? value.toFixed(2) : value;
        tr.appendChild(td);
      });
      
      tableBody.appendChild(tr);
    }
    
    // Disparar evento de atualização
    document.dispatchEvent(new CustomEvent('comparison-table-updated', { 
      detail: { data } 
    }));
  } catch (error) {
    console.error('Erro ao atualizar tabela de comparação:', error);
  }
};

// Informar que a função está disponível
console.log('✅ Função updateComparisonTable carregada com sucesso');
