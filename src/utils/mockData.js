// Mock data for student cognitive load profiles
export const mockStudentData = [
  {
    id: 'student1',
    name: 'Alice Cooper',
    expertise: 'novice',
    taskType: 'qlora',
    configuration: 'q4',
    module: 'module1',
    complexity: 8, // ICL - Intrinsic Cognitive Load
    interface: 6,  // ECL - Extraneous Cognitive Load
    effort: 9,     // Related to GCL - Germane Cognitive Load
    confidence: 4,
    frustration: 7
  },
  {
    id: 'student2',
    name: 'Bob Smith',
    expertise: 'novice',
    taskType: 'qlora',
    configuration: 'q8',
    module: 'module1',
    complexity: 7,
    interface: 5,
    effort: 8,
    confidence: 5,
    frustration: 6
  },
  {
    id: 'student3',
    name: 'Charlie Davis',
    expertise: 'intermediate',
    taskType: 'lmas',
    configuration: '8bit',
    module: 'module2',
    complexity: 6,
    interface: 4,
    effort: 7,
    confidence: 6,
    frustration: 5
  },
  {
    id: 'student4',
    name: 'Diana Ross',
    expertise: 'intermediate',
    taskType: 'lmas',
    configuration: 'q4',
    module: 'module2',
    complexity: 5,
    interface: 3,
    effort: 6,
    confidence: 7,
    frustration: 4
  },
  {
    id: 'student5',
    name: 'Eddie Murphy',
    expertise: 'advanced',
    taskType: 'prompt',
    configuration: 'q8',
    module: 'module3',
    complexity: 4,
    interface: 2,
    effort: 4,
    confidence: 8,
    frustration: 3
  },
  {
    id: 'student6',
    name: 'Fiona Apple',
    expertise: 'advanced',
    taskType: 'prompt',
    configuration: '8bit',
    module: 'module3',
    complexity: 3,
    interface: 2,
    effort: 3,
    confidence: 9,
    frustration: 2
  },
  {
    id: 'student7',
    name: 'George Michael',
    expertise: 'novice',
    taskType: 'qlora',
    configuration: 'q4',
    module: 'module1',
    complexity: 9,
    interface: 7,
    effort: 9,
    confidence: 3,
    frustration: 8
  },
  {
    id: 'student8',
    name: 'Hannah Montana',
    expertise: 'intermediate',
    taskType: 'lmas',
    configuration: 'q8',
    module: 'module2',
    complexity: 6,
    interface: 4,
    effort: 7,
    confidence: 6,
    frustration: 5
  },
  {
    id: 'student9',
    name: 'Ian McKellen',
    expertise: 'advanced',
    taskType: 'prompt',
    configuration: 'q4',
    module: 'module3',
    complexity: 3,
    interface: 2,
    effort: 4,
    confidence: 9,
    frustration: 2
  },
  {
    id: 'student10',
    name: 'Julia Roberts',
    expertise: 'novice',
    taskType: 'qlora',
    configuration: '8bit',
    module: 'module1',
    complexity: 8,
    interface: 6,
    effort: 8,
    confidence: 4,
    frustration: 7
  },
  // Add more mock students as needed
];

// Mock data for class averages
export const mockClassData = [
  {
    taskType: 'qlora',
    configuration: 'q4',
    module: 'module1',
    complexity: 8.0,
    interface: 6.3,
    effort: 8.5,
    confidence: 3.7,
    frustration: 7.3
  },
  {
    taskType: 'qlora',
    configuration: 'q8',
    module: 'module1',
    complexity: 7.2,
    interface: 5.5,
    effort: 8.0,
    confidence: 4.5,
    frustration: 6.2
  },
  {
    taskType: 'lmas',
    configuration: '8bit',
    module: 'module2',
    complexity: 6.1,
    interface: 4.3,
    effort: 6.8,
    confidence: 6.3,
    frustration: 4.7
  },
  {
    taskType: 'all',
    configuration: 'all',
    module: 'all',
    complexity: 5.9,
    interface: 4.1,
    effort: 6.5,
    confidence: 6.6,
    frustration: 4.7
  }
];
