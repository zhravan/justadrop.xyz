export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  initials: string;
  accent: 'primary' | 'accent' | 'mint' | 'dark';
  linkedIn?: string;
  email?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Co-Founder & CEO',
    department: 'Leadership',
    bio: 'Building bridges between volunteers and causes that matter.',
    initials: 'PS',
    accent: 'primary',
    linkedIn: 'https://linkedin.com/in/priyasharma',
    email: 'priya@justadrop.xyz',
  },
  {
    id: '2',
    name: 'Arjun Mehta',
    role: 'Co-Founder & CTO',
    department: 'Leadership',
    bio: 'Tech for good. Making impact measurable.',
    initials: 'AM',
    accent: 'accent',
    linkedIn: 'https://linkedin.com/in/arjunmehta',
    email: 'arjun@justadrop.xyz',
  },
  {
    id: '3',
    name: 'Sneha Patel',
    role: 'Head of Partnerships',
    department: 'Operations',
    bio: 'Connecting NGOs with the right volunteers.',
    initials: 'SP',
    accent: 'mint',
    linkedIn: 'https://linkedin.com/in/snehapatel',
    email: 'sneha@justadrop.xyz',
  },
  {
    id: '4',
    name: 'Rahul Krishnan',
    role: 'Product Lead',
    department: 'Product',
    bio: 'Designing experiences that drive action.',
    initials: 'RK',
    accent: 'dark',
    linkedIn: 'https://linkedin.com/in/rahulkrishnan',
    email: 'rahul@justadrop.xyz',
  },
  {
    id: '5',
    name: 'Ananya Gupta',
    role: 'Community Manager',
    department: 'Operations',
    bio: 'Nurturing our volunteer community.',
    initials: 'AG',
    accent: 'primary',
    linkedIn: 'https://linkedin.com/in/ananyagupta',
    email: 'ananya@justadrop.xyz',
  },
  {
    id: '6',
    name: 'Vikram Singh',
    role: 'Engineering Lead',
    department: 'Engineering',
    bio: 'Building scalable solutions for social impact.',
    initials: 'VS',
    accent: 'accent',
    linkedIn: 'https://linkedin.com/in/vikramsingh',
    email: 'vikram@justadrop.xyz',
  },
];
