import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Tabs, Alert } from 'react-bootstrap';
import EducatorFeedbackForm from '../components/EducatorFeedback/EducatorFeedbackForm';
import FeedbackDashboard from '../components/EducatorFeedback/FeedbackDashboard';

const EducatorCollaboration = () => {
  const [feedback, setFeedback] = useState([]);
  const [showThankYou, setShowThankYou] = useState(false);
  
  useEffect(() => {
    // Carregar feedbacks existentes (simulado)
    // Em um ambiente real, carregaria do banco de dados
    const mockFeedback = [
      {
        id: 'f1',
        resourceId: 'debate-tool-1',
        cltRatings: { intrinsic: 4, extraneous: 3, germane: 5 },
        tpackRatings: { technological: 4, pedagogical: 5, content: 4 },
        uiSuggestions: 'Interface mais intuitiva para criação de debates',
        generalComments: 'Excelente ferramenta, mas precisa de mais tutoriais',
        date: new Date(2023, 5, 15).toISOString()
      },
      {
        id: 'f2',
        resourceId: 'argument-analyzer',
        cltRatings: { intrinsic: 3, extraneous: 2, germane: 4 },
        tpackRatings: { technological: 3, pedagogical: 4, content: 5 },
        uiSuggestions: 'Simplificar o processo de análise de argumentos',
        generalComments: 'Bom potencial, mas a curva de aprendizado é íngreme',
        date: new Date(2023, 6, 20).toISOString()
      }
    ];
    
    setFeedback(mockFeedback);
  }, []);

  const handleFeedbackSubmit = (formData) => {
    const newFeedback = {
      id: `f${feedback.length + 1}`,
      ...formData,
      date: new Date().toISOString()
    };
    
    setFeedback([...feedback, newFeedback]);
    setShowThankYou(true);
    
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
    
    // Em um ambiente real, enviaria ao backend para armazenamento
  };

  return (
    <Container className="py-5">
      <h1>Colaboração com Educadores</h1>
      <p className="lead">
        Ajude-nos a aprimorar nossa plataforma para seguir os princípios da Teoria da Carga Cognitiva (CLT) 
        e o framework TPACK, fornecendo feedback sobre nossos recursos educacionais.
      </p>
      
      {showThankYou && (
        <Alert variant="success" onClose={() => setShowThankYou(false)} dismissible>
          Obrigado pela sua avaliação! Seu feedback é valioso para aprimorarmos nossa plataforma.
        </Alert>
      )}
      
      <Tabs defaultActiveKey="submit-feedback" className="mb-4">
        <Tab eventKey="submit-feedback" title="Enviar Feedback">
          <EducatorFeedbackForm onSubmit={handleFeedbackSubmit} />
        </Tab>
        <Tab eventKey="view-insights" title="Visualizar Insights">
          <FeedbackDashboard feedbackData={feedback} />
        </Tab>
        <Tab eventKey="guidelines" title="Diretrizes CLT/TPACK">
          <Container className="py-4">
            <Row>
              <Col md={6}>
                <h3>Teoria da Carga Cognitiva (CLT)</h3>
                <ul>
                  <li><strong>Carga intrínseca</strong> - Complexidade inerente do conteúdo</li>
                  <li><strong>Carga extrínseca</strong> - Elementos de design desnecessários que distraem</li>
                  <li><strong>Carga relevante</strong> - Esforço mental para construir esquemas cognitivos</li>
                </ul>
              </Col>
              <Col md={6}>
                <h3>Framework TPACK</h3>
                <ul>
                  <li><strong>Conhecimento Tecnológico</strong> - Compreensão das ferramentas</li>
                  <li><strong>Conhecimento Pedagógico</strong> - Métodos de ensino</li>
                  <li><strong>Conhecimento do Conteúdo</strong> - Domínio da matéria</li>
                  <li><strong>Interseções</strong> - Integração efetiva de todos os elementos</li>
                </ul>
              </Col>
            </Row>
          </Container>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default EducatorCollaboration;
