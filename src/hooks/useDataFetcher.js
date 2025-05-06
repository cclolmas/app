import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para buscar e processar dados em tempo real
 * @param {Function} fetchFunction - Função assíncrona que retorna dados
 * @param {number} interval - Intervalo de atualização em milissegundos
 * @param {Function} processor - Função opcional para processar os dados recebidos
 */
const useDataFetcher = (fetchFunction, interval = 5000, processor = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  
  // Usar useCallback para memoizar a função de busca
  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFunction();
      const processedData = processor ? processor(result) : result;
      setData(processedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      setLoading(false);
    }
  }, [fetchFunction, processor]);

  useEffect(() => {
    // Buscar dados imediatamente ao montar
    fetchData();
    
    // Configurar intervalo para busca em tempo real
    if (interval > 0) {
      intervalRef.current = setInterval(fetchData, interval);
    }
    
    // Limpar intervalo ao desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval]);
  
  // Função para forçar uma atualização
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  // Função para cancelar atualizações
  const cancel = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // Função para retomar atualizações
  const resume = useCallback(() => {
    if (!intervalRef.current && interval > 0) {
      intervalRef.current = setInterval(fetchData, interval);
    }
  }, [fetchData, interval]);

  return { data, loading, error, refetch, cancel, resume };
};

export default useDataFetcher;
