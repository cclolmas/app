import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/router';

const CrossDebateNavbar = () => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  
  const isActive = (path) => router.pathname === path;
  
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm" expanded={expanded}>
      <Container>
        <Link href="/" passHref>
          <Navbar.Brand>CrossDebate</Navbar.Brand>
        </Link>
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/" passHref>
              <Nav.Link 
                active={isActive('/')}
                onClick={() => setExpanded(false)}
              >
                Home
              </Nav.Link>
            </Link>
            
            <NavDropdown 
              title="Carga Cognitiva" 
              id="cognitive-dropdown"
              active={router.pathname.includes('/analysis/cognitive')}
            >
              <Link href="/analysis/cognitive-1" passHref>
                <NavDropdown.Item onClick={() => setExpanded(false)}>
                  Mapa de Calor Cognitivo
                </NavDropdown.Item>
              </Link>
              <Link href="/analysis/cognitive-2" passHref>
                <NavDropdown.Item onClick={() => setExpanded(false)}>
                  Evolução da Carga Cognitiva
                </NavDropdown.Item>
              </Link>
            </NavDropdown>
            
            <NavDropdown 
              title="Carga Computacional" 
              id="computational-dropdown"
              active={router.pathname.includes('/analysis/computational')}
            >
              <Link href="/analysis/computational-1" passHref>
                <NavDropdown.Item onClick={() => setExpanded(false)}>
                  Consumo de Recursos
                </NavDropdown.Item>
              </Link>
              <Link href="/analysis/computational-2" passHref>
                <NavDropdown.Item onClick={() => setExpanded(false)}>
                  Tempo de Processamento
                </NavDropdown.Item>
              </Link>
            </NavDropdown>
            
            <NavDropdown 
              title="Justaposição" 
              id="juxtaposition-dropdown"
              active={router.pathname.includes('/analysis/juxtaposition')}
            >
              <Link href="/analysis/juxtaposition-1" passHref>
                <NavDropdown.Item onClick={() => setExpanded(false)}>
                  Correlação de Cargas
                </NavDropdown.Item>
              </Link>
              <Link href="/analysis/juxtaposition-2" passHref>
                <NavDropdown.Item onClick={() => setExpanded(false)}>
                  Análise Comparativa
                </NavDropdown.Item>
              </Link>
            </NavDropdown>
            
            <Link href="/model-tuning" passHref>
              <Nav.Link 
                active={isActive('/model-tuning')}
                onClick={() => setExpanded(false)}
                className="highlight-link"
              >
                Ajuste Fino de Modelos
              </Nav.Link>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CrossDebateNavbar;
