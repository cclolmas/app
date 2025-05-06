/**
 * Formata bytes para uma representação legível (KB, MB, GB, etc)
 * @param {number} bytes - Número de bytes para formatar
 * @param {number} decimals - Número de casas decimais (padrão: 1)
 * @returns {string} Valor formatado com unidade
 */
export const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Formata número para milhares/milhões (1K, 2.5M, etc)
 * @param {number} num - Número para formatar 
 * @returns {string} Valor formatado
 */
export const formatNumber = (num) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
};

/**
 * Formata memória para representação específica (ex: "8GB")
 * @param {number} bytes - Número de bytes
 * @returns {string} Representação formatada
 */
export const formatMemory = (bytes) => {
  const gb = bytes / (1024 * 1024 * 1024);
  
  if (gb < 1) {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(0) + 'MB';
  }
  
  return gb < 10 ? gb.toFixed(1) + 'GB' : gb.toFixed(0) + 'GB';
};
