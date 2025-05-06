// Configuração do ambiente para testes de visualização

// Mock para canvas usado pelo Chart.js
class MockCanvas {
  getContext() {
    return {
      measureText: () => ({ width: 100 }),
      fillRect: () => {},
      clearRect: () => {},
      getImageData: (x, y, w, h) => ({
        data: new Array(w * h * 4).fill(0)
      }),
      putImageData: () => {},
      createLinearGradient: () => ({
        addColorStop: () => {}
      }),
      createRadialGradient: () => ({
        addColorStop: () => {}
      }),
      createPattern: () => ({}),
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      bezierCurveTo: () => {},
      quadraticCurveTo: () => {},
      arc: () => {},
      arcTo: () => {},
      ellipse: () => {},
      rect: () => {},
      fill: () => {},
      stroke: () => {},
      drawImage: () => {},
      fillText: () => {},
      strokeText: () => {},
      setLineDash: () => {},
      setTransform: () => {},
      resetTransform: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      transform: () => {},
      clip: () => {},
      save: () => {},
      restore: () => {}
    };
  }
}

// Instalar o mock de canvas no ambiente global
global.HTMLCanvasElement.prototype.getContext = function() {
  return new MockCanvas().getContext();
};

// Mock para IntersectionObserver usado por componentes responsivos
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    // Simular que o elemento está visível
    this.callback([
      {
        isIntersecting: true,
        boundingClientRect: {
          width: 800,
          height: 600
        }
      }
    ]);
  }

  unobserve() {}
  disconnect() {}
};

// Mock para ResizeObserver usado para detectar mudanças de tamanho
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    // Simular que o elemento tem um tamanho inicial
    this.callback([
      {
        contentRect: {
          width: 800,
          height: 600
        }
      }
    ]);
  }

  unobserve() {}
  disconnect() {}
};

// Definir dimensões da janela para testes
global.innerWidth = 1024;
global.innerHeight = 768;
