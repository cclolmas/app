import type { NextApiRequest, NextApiResponse } from 'next';

type MetricsResponse = {
  vramUsage: number;
  estimatedTime: number;
};

// Mapeamento exemplo de modelos para requisitos de VRAM
const modelVramMap: Record<string, number> = {
  'gpt-3.5-turbo': 4.5,
  'gpt-4': 8.0,
  'llama-7b': 7.0,
  'llama-13b': 13.0,
  'default': 5.0
};

// Mapeamento exemplo de modelos para tempos estimados
const modelTimeMap: Record<string, number> = {
  'gpt-3.5-turbo': 2.5,
  'gpt-4': 6.0,
  'llama-7b': 4.0,
  'llama-13b': 7.5,
  'default': 4.0
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetricsResponse>
) {
  // Obter ID do modelo da consulta
  const { modelId } = req.query;
  const modelIdStr = Array.isArray(modelId) ? modelId[0] : modelId || 'default';

  // Obter métricas base para este modelo
  const baseVram = modelVramMap[modelIdStr] || modelVramMap.default;
  const baseTime = modelTimeMap[modelIdStr] || modelTimeMap.default;
  
  // Adicionar pequena variação para simular mudanças em tempo real
  // Em uma implementação real, esses valores viriam do servidor CompL
  const vramVariation = Math.random() * 0.5 - 0.25; // -0.25 a 0.25
  const timeVariation = Math.random() * 1.0 - 0.5;  // -0.5 a 0.5
  
  res.status(200).json({
    vramUsage: baseVram + vramVariation,
    estimatedTime: baseTime + timeVariation
  });
}
