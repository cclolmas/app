import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, Row, Col, Button, Select, Form, Input, Divider, Table, Tag } from 'antd';

// Service imports (adjust path as needed)
import systemMonitor from '../services/monitoring/systemMonitor';
import workflowManager from '../services/workflow/workflowManager';

const MonitoringDashboard = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    memory: 0,
  });
  const [workflowMetrics, setWorkflowMetrics] = useState({});
  const [runningWorkflows, setRunningWorkflows] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [form] = Form.useForm();
  
  const cpuChartRef = useRef(null);
  const memoryChartRef = useRef(null);
  const cpuChartInstance = useRef(null);
  const memoryChartInstance = useRef(null);
  
  // Initialize monitoring
  useEffect(() => {
    // Start system monitoring
    systemMonitor.start();
    
    // Listen for system metrics
    const onMetrics = (metrics) => {
      setSystemMetrics({
        cpu: metrics.cpu.toFixed(1),
        memory: metrics.memory.toFixed(1)
      });
      
      // Update charts
      if (cpuChartInstance.current) {
        const chart = cpuChartInstance.current;
        chart.data.labels.push(new Date().toLocaleTimeString());
        chart.data.datasets[0].data.push(metrics.cpu);
        
        // Keep only last 30 data points
        if (chart.data.labels.length > 30) {
          chart.data.labels.shift();
          chart.data.datasets[0].data.shift();
        }
        
        chart.update();
      }
      
      if (memoryChartInstance.current) {
        const chart = memoryChartInstance.current;
        chart.data.labels.push(new Date().toLocaleTimeString());
        chart.data.datasets[0].data.push(metrics.memory);
        
        // Keep only last 30 data points
        if (chart.data.labels.length > 30) {
          chart.data.labels.shift();
          chart.data.datasets[0].data.shift();
        }
        
        chart.update();
      }
    };
    
    systemMonitor.on('metrics', onMetrics);
    
    // Listen for workflow metrics updates
    const onWorkflowMetrics = (workflowId, metrics) => {
      setWorkflowMetrics(prev => ({
        ...prev,
        [workflowId]: {
          ...(prev[workflowId] || {}),
          ...metrics
        }
      }));
    };
    
    workflowManager.on('metrics-update', onWorkflowMetrics);
    
    // Listen for workflow completion
    const onWorkflowCompleted = (workflowId, result) => {
      setRunningWorkflows(prev => prev.filter(id => id !== workflowId));
      
      // Keep the last metrics for some time
      setTimeout(() => {
        setWorkflowMetrics(prev => {
          const newState = { ...prev };
          delete newState[workflowId];
          return newState;
        });
      }, 10000);
    };
    
    workflowManager.on('workflow-completed', onWorkflowCompleted);
    
    // Initialize charts
    initCharts();
    
    // Load configurations
    loadConfigurations();
    
    // Check running workflows
    updateRunningWorkflows();
    
    // Cleanup function
    return () => {
      systemMonitor.removeListener('metrics', onMetrics);
      workflowManager.removeListener('metrics-update', onWorkflowMetrics);
      workflowManager.removeListener('workflow-completed', onWorkflowCompleted);
      
      // Destroy charts
      if (cpuChartInstance.current) {
        cpuChartInstance.current.destroy();
      }
      if (memoryChartInstance.current) {
        memoryChartInstance.current.destroy();
      }
    };
  }, []);
  
  const initCharts = () => {
    // Initialize CPU chart
    if (cpuChartRef.current) {
      cpuChartInstance.current = new Chart(cpuChartRef.current, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'CPU Usage (%)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              min: 0,
              max: 100
            }
          },
          animation: {
            duration: 0
          }
        }
      });
    }
    
    // Initialize memory chart
    if (memoryChartRef.current) {
      memoryChartInstance.current = new Chart(memoryChartRef.current, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Memory Usage (%)',
            data: [],
            borderColor: 'rgb(153, 102, 255)',
            tension: 0.1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              min: 0,
              max: 100
            }
          },
          animation: {
            duration: 0
          }
        }
      });
    }
  };
  
  const loadConfigurations = () => {
    // Load predefined configurations or create defaults
    const configs = workflowManager.getAgentConfigurations();
    
    if (configs.length === 0) {
      // Create default configurations
      const defaultConfigs = [
        {
          name: 'Low CPU Usage',
          cpuIntensity: 0.2,
          memoryUsage: 100, // MB
          duration: 60000, // 1 minute
        },
        {
          name: 'Medium CPU Usage',
          cpuIntensity: 0.5,
          memoryUsage: 200, // MB
          duration: 60000, // 1 minute
        },
        {
          name: 'High CPU Usage',
          cpuIntensity: 0.8,
          memoryUsage: 300, // MB
          duration: 60000, // 1 minute
        }
      ];
      
      defaultConfigs.forEach((config, index) => {
        workflowManager.registerAgentConfiguration(`config-${index + 1}`, config);
      });
    }
    
    setConfigurations(workflowManager.getAgentConfigurations());
  };
  
  const updateRunningWorkflows = () => {
    setRunningWorkflows(workflowManager.getRunningWorkflows());
  };
  
  const handleCreateConfiguration = (values) => {
    const configId = `config-${Date.now()}`;
    workflowManager.registerAgentConfiguration(configId, {
      name: values.name,
      cpuIntensity: parseFloat(values.cpuIntensity),
      memoryUsage: parseInt(values.memoryUsage, 10),
      duration: parseInt(values.duration, 10) * 1000, // Convert to ms
    });
    
    setConfigurations(workflowManager.getAgentConfigurations());
    form.resetFields();
  };
  
  const handleStartWorkflow = async (configId) => {
    const workflowId = `workflow-${Date.now()}`;
    await workflowManager.executeWorkflow(workflowId, configId);
    updateRunningWorkflows();
  };
  
  const configColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'CPU Intensity',
      dataIndex: 'cpuIntensity',
      key: 'cpuIntensity',
      render: (value) => `${(value * 100).toFixed(0)}%`
    },
    {
      title: 'Memory Usage',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      render: (value) => `${value} MB`
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (value) => `${value / 1000} seconds`
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleStartWorkflow(record.id)}
        >
          Start Workflow
        </Button>
      ),
    },
  ];
  
  return (
    <div className="monitoring-dashboard">
      <h1>CompL Monitoring Dashboard</h1>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="System CPU Usage">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2>{systemMetrics.cpu}%</h2>
            </div>
            <canvas ref={cpuChartRef} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="System Memory Usage">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2>{systemMetrics.memory}%</h2>
            </div>
            <canvas ref={memoryChartRef} />
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <h2>Running Workflows</h2>
      {runningWorkflows.length === 0 ? (
        <p>No workflows currently running</p>
      ) : (
        <Row gutter={16}>
          {runningWorkflows.map(workflowId => {
            const metrics = workflowMetrics[workflowId] || { cpu: 0, memory: 0 };
            
            return (
              <Col span={8} key={workflowId}>
                <Card title={`Workflow: ${workflowId}`}>
                  <p><strong>CPU Usage:</strong> {metrics.cpu?.toFixed(1)}%</p>
                  <p><strong>Memory Usage:</strong> {metrics.memory?.toFixed(1)} MB</p>
                  <p><strong>Last Updated:</strong> {metrics.timestamp ? new Date(metrics.timestamp).toLocaleTimeString() : 'N/A'}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${metrics.cpu}%`, backgroundColor: metrics.cpu > 70 ? 'red' : 'green' }} 
                    />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      
      <Divider />
      
      <h2>Agent Configurations</h2>
      <Table 
        dataSource={configurations} 
        columns={configColumns} 
        rowKey="id"
        pagination={false}
      />
      
      <Divider />
      
      <h2>Create New Configuration</h2>
      <Form 
        form={form}
        layout="vertical"
        onFinish={handleCreateConfiguration}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="name"
              label="Configuration Name"
              rules={[{ required: true, message: 'Please enter a name' }]}
            >
              <Input placeholder="Configuration Name" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="cpuIntensity"
              label="CPU Intensity (0-1)"
              rules={[{ required: true, message: 'Please enter CPU intensity' }]}
            >
              <Input type="number" min="0.1" max="1" step="0.1" placeholder="0.5" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="memoryUsage"
              label="Memory Usage (MB)"
              rules={[{ required: true, message: 'Please enter memory usage' }]}
            >
              <Input type="number" min="10" placeholder="100" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="duration"
              label="Duration (seconds)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <Input type="number" min="10" placeholder="60" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Configuration
          </Button>
        </Form.Item>
      </Form>
      
      <style jsx>{`
        .monitoring-dashboard {
          padding: 24px;
        }
        .progress-bar {
          height: 20px;
          background-color: #f0f0f0;
          border-radius: 4px;
          margin-top: 10px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          transition: width 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MonitoringDashboard;
