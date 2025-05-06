import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CounterIndicator from '../components/indicators/CounterIndicator';
import DataTable from '../components/indicators/DataTable';

describe('CounterIndicator', () => {
  test('renderiza o valor corretamente', () => {
    render(<CounterIndicator value={42} />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('42');
  });

  test('renderiza o label corretamente', () => {
    render(<CounterIndicator value={42} label="Usuários" />);
    expect(screen.getByText('Usuários')).toBeInTheDocument();
  });

  test('lida com valores grandes', () => {
    render(<CounterIndicator value={1000000} />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('1000000');
  });

  test('lida com valores não-numéricos', () => {
    render(<CounterIndicator value="N/A" />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('N/A');
  });
});

describe('DataTable', () => {
  const headers = ['Nome', 'Idade', 'Pontuação'];
  const data = [
    ['João', '25', '85'],
    ['Maria', '30', '92'],
    ['Pedro', '22', '78'],
  ];

  test('renderiza tabela com dados corretamente', () => {
    render(<DataTable headers={headers} data={data} />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // 3 linhas de dados + 1 cabeçalho
  });

  test('renderiza tabela vazia corretamente', () => {
    render(<DataTable headers={headers} data={[]} />);
    expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument();
  });
  
  test('lida com tabela com muitos dados', () => {
    const largeData = Array(100).fill(0).map((_, i) => [`Usuário ${i}`, `${20 + i % 50}`, `${Math.floor(Math.random() * 100)}`]);
    render(<DataTable headers={headers} data={largeData} />);
    expect(screen.getAllByRole('row').length).toBe(101); // 100 linhas + cabeçalho
  });

  test('renderiza caption quando fornecido', () => {
    render(<DataTable headers={headers} data={data} caption="Tabela de Usuários" />);
    expect(screen.getByText('Tabela de Usuários')).toBeInTheDocument();
  });
});
