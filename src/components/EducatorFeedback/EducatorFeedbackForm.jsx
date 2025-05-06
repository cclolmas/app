import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';

const CLT_PRINCIPLES = [
  { id: 'intrinsic', label: 'Carga intrínseca adequada' },
  { id: 'extraneous', label: 'Minimização da carga extrínseca' },
  { id: 'germane', label: 'Otimização da carga relevante' },
];

const TPACK_DIMENSIONS = [
  { id: 'technological', label: 'Conhecimento Tecnológico' },
  { id: 'pedagogical', label: 'Conhecimento Pedagógico' },
  { id: 'content', label: 'Conhecimento do Conteúdo' },
  { id: 'tpk', label: 'Integração Tecnológico-Pedagógica' },
  { id: 'tck', label: 'Integração Tecnológico-Conteúdo' },
  { id: 'pck', label: 'Integração Pedagógico-Conteúdo' },
  { id: 'tpack', label: 'Integração TPACK completa' },
];

const EducatorFeedbackForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    resourceId: '',
    cltRatings: {},
    tpackRatings: {},
    uiSuggestions: '',
    generalComments: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRatingChange = (category, id, value) => {
    setFormData(prevState => ({
      ...prevState,
      [`${category}Ratings`]: {
        ...prevState[`${category}Ratings`],
        [id]: parseInt(value)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header as="h4">Avaliação Pedagógica do Recurso</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Identificador do Recurso</Form.Label>
              <Form.Control
                type="text"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Card className="mb-4">
              <Card.Header>Princípios da Carga Cognitiva</Card.Header>
              <Card.Body>
                {CLT_PRINCIPLES.map(principle => (
                  <Form.Group key={principle.id} className="mb-3">
                    <Form.Label>{principle.label} (1-5)</Form.Label>
                    <Form.Control
                      type="range"
                      min="1"
                      max="5"
                      value={formData.cltRatings[principle.id] || 3}
                      onChange={(e) => handleRatingChange('clt', principle.id, e.target.value)}
                    />
                    <Row>
                      <Col xs={4} className="text-start">Inadequado</Col>
                      <Col xs={4} className="text-center">Neutro</Col>
                      <Col xs={4} className="text-end">Excelente</Col>
                    </Row>
                  </Form.Group>
                ))}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>Dimensões TPACK</Card.Header>
              <Card.Body>
                {TPACK_DIMENSIONS.map(dimension => (
                  <Form.Group key={dimension.id} className="mb-3">
                    <Form.Label>{dimension.label} (1-5)</Form.Label>
                    <Form.Control
                      type="range"
                      min="1"
                      max="5"
                      value={formData.tpackRatings[dimension.id] || 3}
                      onChange={(e) => handleRatingChange('tpack', dimension.id, e.target.value)}
                    />
                    <Row>
                      <Col xs={4} className="text-start">Inadequado</Col>
                      <Col xs={4} className="text-center">Neutro</Col>
                      <Col xs={4} className="text-end">Excelente</Col>
                    </Row>
                  </Form.Group>
                ))}
              </Card.Body>
            </Card>

            <Form.Group className="mb-3">
              <Form.Label>Sugestões para Interface do Usuário</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="uiSuggestions"
                value={formData.uiSuggestions}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comentários Gerais</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="generalComments"
                value={formData.generalComments}
                onChange={handleChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Enviar Avaliação
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EducatorFeedbackForm;
