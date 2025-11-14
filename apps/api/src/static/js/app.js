const { createApp } = Vue;

// Icon SVG paths - simple, clean style
const icons = {
  users: `<svg class="w-12 h-12 text-orange-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>`,
  
  calendar: `<svg class="w-12 h-12 text-orange-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>`,
  
  chart: `<svg class="w-12 h-12 text-orange-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>`,
  
  chat: `<svg class="w-12 h-12 text-orange-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>`,
  
  badge: `<svg class="w-12 h-12 text-orange-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
  </svg>`,
  
  shield: `<svg class="w-12 h-12 text-orange-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>`
};

// Vue Components
const StatItem = {
  props: ['number', 'label'],
  template: `
    <div class="text-center">
      <div class="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
        {{ number }}
      </div>
      <div class="text-gray-600 text-lg">{{ label }}</div>
    </div>
  `
};

const GoalCard = {
  props: ['number', 'title', 'description'],
  template: `
    <div class="text-center">
      <div class="text-6xl font-light text-orange-600 mb-4">{{ number }}</div>
      <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ title }}</h3>
      <p class="text-gray-600 leading-relaxed">{{ description }}</p>
    </div>
  `
};

const FeatureCard = {
  props: ['icon', 'title', 'description'],
  template: `
    <div class="bg-white p-8 rounded-lg border border-gray-200 hover:border-orange-600 transition-colors">
      <div class="flex justify-center mb-6" v-html="icon"></div>
      <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ title }}</h3>
      <p class="text-gray-600 leading-relaxed">{{ description }}</p>
    </div>
  `
};

const StepCard = {
  props: ['number', 'title', 'description'],
  template: `
    <div class="bg-white p-8 rounded-lg border border-gray-200">
      <div class="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
        {{ number }}
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-3 text-center">{{ title }}</h3>
      <p class="text-gray-600 leading-relaxed text-center">{{ description }}</p>
    </div>
  `
};

const UserTypeCard = {
  props: ['title', 'description', 'features'],
  template: `
    <div class="bg-white p-8 rounded-lg border border-gray-200">
      <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ title }}</h3>
      <p class="text-gray-600 mb-6">{{ description }}</p>
      <ul class="space-y-3">
        <li v-for="feature in features" :key="feature" class="flex items-start">
          <svg class="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="text-gray-700">{{ feature }}</span>
        </li>
      </ul>
    </div>
  `
};

// Main App
createApp({
  components: {
    StatItem,
    GoalCard,
    FeatureCard,
    StepCard,
    UserTypeCard
  },
  data() {
    return {
      isLoggedIn: false,
      username: '',
      userRole: '',
      showUserMenu: false,
      stats: [
        { number: '1000+', label: 'Volunteers' },
        { number: '500+', label: 'Opportunities' },
        { number: '50+', label: 'Organizations' }
      ],
      goals: [
        { title: 'Connect Volunteers', description: 'Bridge the gap between passionate volunteers and meaningful opportunities.' },
        { title: 'Empower Organizations', description: 'Provide NGOs with tools to manage and grow their volunteer programs effectively.' },
        { title: 'Track Impact', description: 'Measure and celebrate the real-world difference volunteers make in their communities.' }
      ],
      features: [
        { icon: icons.users, title: 'Smart Matching', description: 'Connect volunteers with opportunities that match their skills and interests.' },
        { icon: icons.calendar, title: 'Simple Scheduling', description: 'Coordinate volunteer schedules with an intuitive calendar system.' },
        { icon: icons.chart, title: 'Impact Metrics', description: 'Track and visualize the impact of your volunteer programs.' },
        { icon: icons.chat, title: 'Communication', description: 'Keep everyone informed with built-in messaging.' },
        { icon: icons.badge, title: 'Recognition', description: 'Celebrate achievements with badges and certificates.' },
        { icon: icons.shield, title: 'Secure Platform', description: 'Enterprise-grade security to protect your data.' }
      ],
      steps: [
        { number: 1, title: 'Create Profile', description: 'Sign up and share your interests, skills, and availability.' },
        { number: 2, title: 'Find Opportunities', description: 'Browse and filter opportunities that match your preferences.' },
        { number: 3, title: 'Make Impact', description: 'Volunteer and track the difference you\'re making.' }
      ],
      userTypes: [
        {
          title: 'Volunteers',
          description: 'For individuals looking to make a difference',
          features: [
            'Browse verified opportunities',
            'Apply with cover letter',
            'Track application status',
            'Bookmark opportunities',
            'View impact metrics'
          ]
        },
        {
          title: 'Organizations',
          description: 'For NGOs seeking passionate volunteers',
          features: [
            'Post opportunities',
            'Manage applications',
            'Track volunteer roster',
            'View statistics',
            'Verified badge'
          ]
        },
        {
          title: 'Admins',
          description: 'For platform management',
          features: [
            'Verify organizations',
            'Manage users by role',
            'Platform statistics',
            'Monitor opportunities',
            'Oversight tools'
          ]
        }
      ]
    };
  },
  computed: {
    dashboardUrl() {
      if (this.userRole === 'volunteer') return '/dashboard/volunteer';
      if (this.userRole === 'organization') return '/dashboard/organization';
      if (this.userRole === 'admin') return '/dashboard/admin';
      return '/';
    }
  },
  mounted() {
    this.checkAuth();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('access_token');
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('user_role');
      
      if (token && username && role) {
        this.isLoggedIn = true;
        this.username = username;
        this.userRole = role.toLowerCase();
      }
    },
    handleClickOutside(event) {
      const dropdown = event.target.closest('.relative');
      if (!dropdown && this.showUserMenu) {
        this.showUserMenu = false;
      }
    },
    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      
      this.isLoggedIn = false;
      this.username = '';
      this.userRole = '';
      this.showUserMenu = false;
      
      window.location.href = '/';
    }
  }
}).mount('#app');

