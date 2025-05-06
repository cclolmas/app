import React, { useState, useEffect } from 'react';

interface CompLMetricsProps {
  modelId?: string;
}

interface MetricsData {
  vramUsage: number;
  estimatedTime: number;
  isLoading: boolean;
}

const CompLMetrics: React.FC<CompLMetricsProps> = ({ modelId }) => {
  const [metrics, setMetrics] = useState<MetricsData>({
    vramUsage: 0,
    estimatedTime: 0,
    isLoading: true
  });

  useEffect(() => {
    if (!modelId) return;
    
    // Função para buscar métricas atualizadas
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/compl/metrics?modelId=${modelId}`);
        const data = await response.json();
        
        setMetrics({
          vramUsage: data.vramUsage,
          estimatedTime: data.estimatedTime,
          isLoading: false
        });
      } catch (error) {
        console.error("Erro ao buscar métricas CompL:", error);
        setMetrics(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Buscar métricas iniciais
    fetchMetrics();
    
    // Configurar atualização periódica
    const intervalId = setInterval(fetchMetrics, 5000); // Atualiza a cada 5 segundos

    // Limpar intervalo quando componente for desmontado
    return () => clearInterval(intervalId);
  }, [modelId]);

  if (metrics.isLoading) {
    return <div className="p-3 bg-gray-100 rounded">Carregando métricas...</div>;
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Métricas CompL</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>VRAM:</span>
          <span className="font-medium">{metrics.vramUsage.toFixed(2)} GB</span>
        </div>
        <div className="flex justify-between">
          <span>Tempo estimado:</span>
          <span className="font-medium">{metrics.estimatedTime.toFixed(1)} segundos</span>
        </div>
      </div>
    </div>
  );
};

export default CompLMetrics;
