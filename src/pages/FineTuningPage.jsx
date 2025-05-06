import React, { useState } from 'react';
import { Container, Form, Card, Row, Col, Toast } from 'react-bootstrap';
import FineTuningButton from '../components/FineTuningButton';

const FineTuningPage = () => {
  const [fineTuningConfig, setFineTuningConfig] = useState({
    model: '',
    trainingData: null,
    epochs: 3,
    learningRate: 0.0001,
    batchSize: 8
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [taskId, setTaskId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFineTuningConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    setFineTuningConfig(prev => ({
      ...prev,
      trainingData: e.target.files[0]
    }));
  };
  
  const handleSuccess = (response) => {
    setTaskId(response.taskId);
    setShowSuccess(true);
    // Aqui você poderia redirecionar para uma página de monitoramento
    // ou implementar polling para verificar o status
  };
  
  const handleError = (error) => {
    console.error("Erro no processo de fine-tuning:", error);
    // Você pode implementar logs adicionais aqui
  };

  return (
    <Container className="py-4">
      <h1>Configuração de Fine-Tuning</h1>
      
      <Card className="my-4">
        <Card.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="model">
                  <Form.Label>Modelo Base</Form.Label>
                  <Form.Select 
                    name="model"
                    value={fineTuningConfig.model}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um modelo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="davinci-002">Davinci-002</option>
                    <option value="babbage-002">Babbage-002</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="trainingData">
                  <Form.Label>Dados de Treinamento</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".jsonl,.json"
                    required
                  />
                  <Form.Text className="text-muted">
                    Arquivo JSONL com exemplos de treinamento
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="epochs">
                  <Form.Label>Épocas</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="epochs"
                    value={fineTuningConfig.epochs}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group controlId="learningRate">
                  <Form.Label>Taxa de Aprendizado</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="learningRate"
                    value={fineTuningConfig.learningRate}
                    onChange={handleInputChange}
                    step="0.0001"
                    min="0.0001"
                    max="0.1"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group controlId="batchSize">
                  <Form.Label>Tamanho do Batch</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="batchSize"
                    value={fineTuningConfig.batchSize}
                    onChange={handleInputChange}
                    min="1"
                    max="64"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
          
          <div className="mt-4">
            <FineTuningButton 
              config={fineTuningConfig}
              onSuccess={handleSuccess}
              onError={handleError}
              disabled={!fineTuningConfig.model || !fineTuningConfig.trainingData}
            />
          </div>
        </Card.Body>
      </Card>
      
      <Toast 
        show={showSuccess} 
        onClose={() => setShowSuccess(false)}
        delay={5000}
        autohide
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
        }}
      >
        <Toast.Header>
          <strong className="me-auto">Processo Iniciado</strong>
        </Toast.Header>
        <Toast.Body>
          O processo de fine-tuning foi iniciado com sucesso! ID da tarefa: {taskId}
        </Toast.Body>
      </Toast>
    </Container>
  );
};

export default FineTuningPage;
