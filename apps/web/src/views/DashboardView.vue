<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600">Just A Drop</h1>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ authStore.user?.email }}</span>
            <button @click="handleLogout" class="btn-outline">
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Welcome back!</h2>
        <p class="mt-2 text-gray-600">
          Role: <span class="font-medium">{{ authStore.user?.role }}</span>
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div class="card">
          <h3 class="text-lg font-semibold mb-2">Profile</h3>
          <p class="text-gray-600">Manage your account settings</p>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold mb-2">
            {{ authStore.user?.role === 'VOLUNTEER' ? 'Applications' : 'Opportunities' }}
          </h3>
          <p class="text-gray-600">
            {{ authStore.user?.role === 'VOLUNTEER' 
              ? 'View your volunteer applications' 
              : 'Manage your posted opportunities' 
            }}
          </p>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold mb-2">
            {{ authStore.user?.role === 'VOLUNTEER' ? 'Bookmarks' : 'Analytics' }}
          </h3>
          <p class="text-gray-600">
            {{ authStore.user?.role === 'VOLUNTEER' 
              ? 'Your saved opportunities' 
              : 'View your organization stats' 
            }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

