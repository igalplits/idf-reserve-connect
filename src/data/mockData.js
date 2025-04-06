export const mockUsers = [
  {
    id: '1',
    name: 'David Cohen',
    email: 'david@example.com',
    unit: 'Givati',
    rank: 'Seren',
    proficiency: 'Combat Engineer',
    age: 28,
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Sarah Levy',
    email: 'sarah@example.com',
    unit: 'Kfir',
    rank: 'Rav Samal',
    proficiency: 'Intelligence Officer',
    age: 25,
    photo: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '3',
    name: 'Yosef Mizrahi',
    email: 'yosef@example.com',
    unit: 'Paratroopers',
    rank: 'Rav Seren',
    proficiency: 'Combat Medic',
    age: 32,
    photo: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
];

export const mockPosts = [
  {
    id: '1',
    userId: '1',
    text: 'Looking for experienced combat engineers for upcoming reserve duty. Givati Brigade.',
    timestamp: '2024-03-20T10:00:00Z',
    comments: [
      {
        id: '1',
        userId: '2',
        text: 'Interested! I have 5 years of experience.',
        timestamp: '2024-03-20T10:30:00Z',
      },
    ],
  },
  {
    id: '2',
    userId: '2',
    text: 'Kfir Brigade seeking intelligence officers for next month\'s training.',
    timestamp: '2024-03-20T11:00:00Z',
    comments: [],
  },
  {
    id: '3',
    userId: '3',
    text: 'Paratroopers medical unit looking for combat medics. Immediate positions available.',
    timestamp: '2024-03-20T12:00:00Z',
    comments: [
      {
        id: '2',
        userId: '1',
        text: 'What are the requirements?',
        timestamp: '2024-03-20T12:30:00Z',
      },
    ],
  },
];

export const mockMessages = {
  '1-2': [
    {
      id: '1',
      senderId: '1',
      text: 'Hi, I saw your post about the combat engineer position.',
      timestamp: '2024-03-20T10:35:00Z',
    },
    {
      id: '2',
      senderId: '2',
      text: 'Yes, we have immediate openings. What\'s your experience?',
      timestamp: '2024-03-20T10:36:00Z',
    },
  ],
}; 