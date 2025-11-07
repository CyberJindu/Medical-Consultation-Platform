// Mock data for development and testing
export const mockSpecialists = [
  {
    id: 'spec_1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Emergency Medicine',
    subSpecialty: 'Critical Care',
    bio: 'Board-certified emergency medicine physician with 12 years of experience in urgent care and critical situations. Available for teleconsultation 24/7.',
    rating: 4.8,
    reviewCount: 124,
    experience: '12 years',
    responseTime: '< 15 mins',
    phone: '+1234567890',
    languages: ['English', 'Spanish'],
    image: '/images/specialists/dr-sarah.jpg',
    availability: '24/7',
    consultationFee: '$99',
    isOnline: true
  },
  {
    id: 'spec_2',
    name: 'Dr. Michael Chen',
    specialty: 'General Physician',
    subSpecialty: 'Internal Medicine',
    bio: 'Experienced general physician specializing in comprehensive diagnosis and treatment of common medical conditions. Focus on preventive care and patient education.',
    rating: 4.6,
    reviewCount: 89,
    experience: '8 years',
    responseTime: '< 30 mins',
    phone: '+0987654321',
    languages: ['English', 'Mandarin'],
    image: '/images/specialists/dr-chen.jpg',
    availability: 'Mon-Fri, 9AM-6PM',
    consultationFee: '$79',
    isOnline: true
  },
  {
    id: 'spec_3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    subSpecialty: 'Medical Dermatology',
    bio: 'Dermatologist specializing in skin conditions, rashes, and allergic reactions. Passionate about helping patients achieve healthy skin through proper diagnosis and treatment.',
    rating: 4.9,
    reviewCount: 156,
    experience: '10 years',
    responseTime: '< 1 hour',
    phone: '+1122334455',
    languages: ['English', 'Spanish'],
    image: '/images/specialists/dr-rodriguez.jpg',
    availability: 'Tue-Sat, 10AM-4PM',
    consultationFee: '$120',
    isOnline: false
  },
  {
    id: 'spec_4',
    name: 'Dr. James Wilson',
    specialty: 'Cardiology',
    subSpecialty: 'Preventive Cardiology',
    bio: 'Cardiologist focused on heart health, chest pain evaluation, and preventive care. Extensive experience in managing cardiac emergencies and chronic conditions.',
    rating: 4.7,
    reviewCount: 203,
    experience: '15 years',
    responseTime: '< 45 mins',
    phone: '+5566778899',
    languages: ['English'],
    image: '/images/specialists/dr-wilson.jpg',
    availability: 'Mon-Thu, 8AM-5PM',
    consultationFee: '$150',
    isOnline: true
  }
];

export const mockHealthFeed = [
  {
    id: 'feed_1',
    title: 'Understanding Headaches: Causes and Prevention Strategies',
    content: 'Headaches can stem from various causes including stress, dehydration, poor posture, or underlying health conditions. Staying hydrated, managing stress through meditation or exercise, and maintaining regular sleep patterns can significantly reduce headache frequency. If headaches persist or are severe, consult a healthcare professional for proper diagnosis.',
    excerpt: 'Learn about common headache causes and effective prevention methods to improve your daily wellbeing.',
    author: 'MediGuide Health Team',
    publishDate: new Date(Date.now() - 86400000), // 1 day ago
    readTime: '4 min read',
    topics: ['Headaches', 'Prevention', 'Wellness', 'Pain Management'],
    image: '/images/feed/headaches.jpg',
    isSaved: false,
    isShared: false,
    relevanceScore: 0.95
  },
  {
    id: 'feed_2',
    title: 'The Importance of Regular Sleep Patterns for Overall Health',
    content: 'Consistent sleep schedules help regulate your body\'s internal clock, leading to better sleep quality and overall health. Adults should aim for 7-9 hours of sleep per night. Irregular sleep patterns can disrupt circadian rhythms, affecting mood, cognitive function, and immune system performance.',
    excerpt: 'Discover how maintaining regular sleep patterns can transform your health and daily energy levels.',
    author: 'MediGuide Sleep Experts',
    publishDate: new Date(Date.now() - 172800000), // 2 days ago
    readTime: '5 min read',
    topics: ['Sleep', 'Health', 'Wellness', 'Circadian Rhythm'],
    image: '/images/feed/sleep-patterns.jpg',
    isSaved: true,
    isShared: false,
    relevanceScore: 0.88
  },
  {
    id: 'feed_3',
    title: 'Managing Seasonal Allergies: Tips and Treatment Options',
    content: 'Seasonal allergies affect millions worldwide. Common symptoms include sneezing, runny nose, itchy eyes, and fatigue. Over-the-counter antihistamines, nasal sprays, and avoiding allergen exposure can help manage symptoms. For persistent allergies, consult an allergist for personalized treatment plans.',
    excerpt: 'Effective strategies to manage seasonal allergy symptoms and improve your quality of life during allergy season.',
    author: 'MediGuide Allergy Specialists',
    publishDate: new Date(Date.now() - 259200000), // 3 days ago
    readTime: '6 min read',
    topics: ['Allergies', 'Seasonal', 'Treatment', 'Health Tips'],
    image: '/images/feed/allergies.jpg',
    isSaved: false,
    isShared: true,
    relevanceScore: 0.92
  },
  {
    id: 'feed_4',
    title: 'Stress Management Techniques for Better Mental Health',
    content: 'Chronic stress can impact both mental and physical health. Effective stress management techniques include mindfulness meditation, regular exercise, deep breathing exercises, and maintaining social connections. Identifying stress triggers and developing healthy coping mechanisms is crucial for long-term wellbeing.',
    excerpt: 'Learn practical techniques to manage stress and improve your mental health in daily life.',
    author: 'MediGuide Mental Health Team',
    publishDate: new Date(Date.now() - 345600000), // 4 days ago
    readTime: '7 min read',
    topics: ['Stress', 'Mental Health', 'Wellness', 'Mindfulness'],
    image: '/images/feed/stress-management.jpg',
    isSaved: false,
    isShared: false,
    relevanceScore: 0.85
  }
];

export const mockChatHistory = [
  {
    id: 'chat_1',
    title: 'Headache and Fatigue Discussion',
    preview: 'I\'ve been having headaches and fatigue for the past week...',
    messages: [
      {
        id: 'msg_1_1',
        text: "I've been having headaches and fatigue for the past week",
        isUser: true,
        timestamp: new Date(Date.now() - 86400000)
      },
      {
        id: 'msg_1_2',
        text: "I understand you're experiencing headaches and fatigue. Let me ask a few questions to better understand your situation. How would you describe the headache - is it throbbing, constant, or sharp?",
        isUser: false,
        timestamp: new Date(Date.now() - 86350000)
      }
    ],
    startedAt: new Date(Date.now() - 86400000),
    endedAt: new Date(Date.now() - 86300000),
    messageCount: 2,
    tags: ['headache', 'fatigue']
  },
  {
    id: 'chat_2',
    title: 'Seasonal Allergy Symptoms',
    preview: 'What are the symptoms of seasonal allergies?',
    messages: [
      {
        id: 'msg_2_1',
        text: "What are the symptoms of seasonal allergies?",
        isUser: true,
        timestamp: new Date(Date.now() - 172800000)
      },
      {
        id: 'msg_2_2',
        text: "Seasonal allergies typically include sneezing, runny nose, itchy eyes, and sometimes fatigue. Some people may also experience coughing or headaches. Are you experiencing any of these symptoms currently?",
        isUser: false,
        timestamp: new Date(Date.now() - 172750000)
      }
    ],
    startedAt: new Date(Date.now() - 172800000),
    endedAt: new Date(Date.now() - 172700000),
    messageCount: 2,
    tags: ['allergies', 'symptoms']
  },
  {
    id: 'chat_3',
    title: 'Chest Pain Emergency',
    preview: 'I am having severe chest pain and difficulty breathing...',
    messages: [
      {
        id: 'msg_3_1',
        text: "I am having severe chest pain and difficulty breathing",
        isUser: true,
        timestamp: new Date(Date.now() - 259200000)
      },
      {
        id: 'msg_3_2',
        text: "This sounds serious and requires immediate medical attention. I recommend consulting an emergency medicine specialist right away. I've found some available specialists who can help you immediately.",
        isUser: false,
        timestamp: new Date(Date.now() - 259190000)
      }
    ],
    startedAt: new Date(Date.now() - 259200000),
    endedAt: new Date(Date.now() - 259180000),
    messageCount: 2,
    tags: ['chest pain', 'emergency', 'breathing'],
    hadEmergency: true
  }
];

export const mockUserProfile = {
  id: 'user_123',
  phoneNumber: '+1234567890',
  name: null, // Not set yet
  email: null,
  dateOfBirth: null,
  gender: null,
  bloodType: null,
  allergies: [],
  medications: [],
  medicalConditions: [],
  emergencyContact: null,
  createdAt: new Date(Date.now() - 604800000), // 1 week ago
  lastLogin: new Date(),
  isProfileComplete: false
};

// Utility function to get specialists by specialty
export const getSpecialistsBySpecialty = (specialty) => {
  return mockSpecialists.filter(spec => 
    spec.specialty.toLowerCase().includes(specialty.toLowerCase()) ||
    spec.subSpecialty.toLowerCase().includes(specialty.toLowerCase())
  );
};

// Utility function to get feed by topics
export const getFeedByTopics = (topics) => {
  return mockHealthFeed.filter(article =>
    article.topics.some(topic =>
      topics.some(searchTopic =>
        topic.toLowerCase().includes(searchTopic.toLowerCase())
      )
    )
  );
};

export default {
  mockSpecialists,
  mockHealthFeed,
  mockChatHistory,
  mockUserProfile,
  getSpecialistsBySpecialty,
  getFeedByTopics
};