import React, { useMemo } from 'react';
import { Container, Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FeedbackDashboard = ({ feedbackData }) => {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Avaliações Médias' }
    },
    scales: {
      y: { min: 1, max: 5, ticks: { stepSize: 1 } }
    }
  };

  const cltChartData = useMemo(() => {
    const principles = ['intrinsic', 'extraneous', 'germane'];
    const labels = ['Carga Intrínseca', 'Carga Extrínseca', 'Carga Relevante'];
    
    const data = principles.map(principle => {
      const ratings = feedbackData.filter(fb => fb.cltRatings && fb.cltRatings[principle]);
      return ratings.length > 0 
        ? ratings.reduce((sum, fb) => sum + fb.cltRatings[principle], 0) / ratings.length 
        : 0;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Classificação média (1-5)',
          data,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    };
  }, [feedbackData]);

  const tpackChartData = useMemo(() => {
    const dimensions = ['technological', 'pedagogical', 'content', 'tpk', 'tck', 'pck', 'tpack'];
    const labels = ['Tecnológico', 'Pedagógico', 'Conteúdo', 'TPK', 'TCK', 'PCK', 'TPACK'];
    
    const data = dimensions.map(dimension => {
      const ratings = feedbackData.filter(fb => fb.tpackRatings && fb.tpackRatings[dimension]);
      return ratings.length > 0 
        ? ratings.reduce((sum, fb) => sum + fb.tpackRatings[dimension], 0) / ratings.length 
        : 0;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Classificação média (1-5)',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
  }, [feedbackData]);

  const uiFeedback = useMemo(() => {
    return feedbackData
      .filter(fb => fb.uiSuggestions && fb.uiSuggestions.trim() !== '')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [feedbackData]);

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Estatísticas de Feedback</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <h3>{feedbackData.length}</h3>
                  <p>Total de avaliações</p>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <h3>
                    {feedbackData.length > 0
                      ? (feedbackData.reduce((sum, fb) => {
                          const cltSum = Object.values(fb.cltRatings || {}).reduce((s, v) => s + v, 0);
                          const cltCount = Object.values(fb.cltRatings || {}).length;
                          return sum + (cltCount > 0 ? cltSum / cltCount : 0);
                        }, 0) / feedbackData.length).toFixed(1)
                      : '0.0'}
                  </h3>
                  <p>Média CLT</p>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <h3>
                    {feedbackData.length > 0
                      ? (feedbackData.reduce((sum, fb) => {
                          const tpackSum = Object.values(fb.tpackRatings || {}).reduce((s, v) => s + v, 0);
                          const tpackCount = Object.values(fb.tpackRatings || {}).length;
                          return sum + (tpackCount > 0 ? tpackSum / tpackCount : 0);
                        }, 0) / feedbackData.length).toFixed(1)
                      : '0.0'}
                  </h3>
                  <p>Média TPACK</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card>
            <Card.Header>Avaliação CLT</Card.Header>
            <Card.Body>
              <Bar options={chartOptions} data={cltChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card>
            <Card.Header>Avaliação TPACK</Card.Header>
            <Card.Body>
              <Bar options={chartOptions} data={tpackChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Sugestões de UI Recentes</Card.Header>
            <Card.Body>
              {uiFeedback.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Recurso</th>
                      <th>Sugestão</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uiFeedback.slice(0, 5).map((fb, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg="info">{fb.resourceId}</Badge>
                        </td>
                        <td>{fb.uiSuggestions}</td>
                        <td>{new Date(fb.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">Nenhuma sugestão de UI disponível</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FeedbackDashboard;
