<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Just A Drop</h1>
        <h2 class="mt-2 text-xl text-gray-600">Sign in to your account</h2>
      </div>

      <div class="card">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ authStore.error }}
          </div>

          <div>
            <label for="email" class="label">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label for="password" class="label">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-primary w-full"
          >
            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const handleLogin = async () => {
  try {
    await authStore.login(form);
    router.push('/dashboard');
  } catch (error) {
    // Error handled by store
  }
};
</script>

