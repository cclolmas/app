import React from 'react';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import AnalysisCard from '../components/AnalysisCard';
import ModelTuningPreview from '../components/ModelTuningPreview';
import '../styles/home.css';

export default function HomePage() {
  const analysisCategories = [
    {
      id: 'cognitive',
      title: 'Análises de Carga Cognitiva',
      description: 'Visualize métricas e dados relacionados à carga cognitiva nos debates.',
      icon: 'brain',
      color: '#4285F4',
      visualizations: [
        { id: 'cognitive-1', title: 'Mapa de Calor Cognitivo' },
        { id: 'cognitive-2', title: 'Evolução da Carga Cognitiva' },
      ]
    },
    {
      id: 'computational',
      title: 'Análises de Carga Computacional',
      description: 'Explore dados sobre o esforço computacional e processamento.',
      icon: 'cpu',
      color: '#34A853',
      visualizations: [
        { id: 'computational-1', title: 'Consumo de Recursos' },
        { id: 'computational-2', title: 'Tempo de Processamento' },
      ]
    },
    {
      id: 'juxtaposition',
      title: 'Justaposição de Cargas',
      description: 'Compare a relação entre carga cognitiva e computacional.',
      icon: 'compare',
      color: '#FBBC05',
      visualizations: [
        { id: 'juxtaposition-1', title: 'Correlação de Cargas' },
        { id: 'juxtaposition-2', title: 'Análise Comparativa' },
      ]
    },
  ];

  return (
    <Container className="home-container">
      <h1 className="text-center mb-5">Plataforma CrossDebate</h1>
      
      <Row className="mb-5">
        {analysisCategories.map((category) => (
          <Col md={4} key={category.id} className="mb-4">
            <AnalysisCard 
              title={category.title}
              description={category.description}
              icon={category.icon}
              color={category.color}
              visualizations={category.visualizations}
            />
          </Col>
        ))}
        
        <Col md={12} className="mt-4">
          <div className="model-tuning-section">
            <h2>Ajuste Fino de Modelos</h2>
            <p>Otimize seus modelos com visualização interativa não linear.</p>
            <ModelTuningPreview />
            <div className="text-center mt-3">
              <Link href="/model-tuning">
                <a className="btn btn-primary">Explorar Ajuste Fino</a>
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
