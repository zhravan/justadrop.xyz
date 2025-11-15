<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Just A Drop</h1>
        <h2 class="mt-2 text-xl text-gray-600">Create your account</h2>
      </div>

      <div class="card">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ authStore.error }}
          </div>

          <div>
            <label for="role" class="label">I am a</label>
            <select id="role" v-model="form.role" class="input">
              <option value="VOLUNTEER">Volunteer</option>
              <option value="ORGANIZATION">Organization</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="label">First Name</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                class="input"
                placeholder="John"
              />
            </div>
            <div>
              <label for="lastName" class="label">Last Name</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                class="input"
                placeholder="Doe"
              />
            </div>
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
            <label for="phone" class="label">Phone (optional)</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="input"
              placeholder="+1 (555) 000-0000"
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
            <p class="mt-1 text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-primary w-full"
          >
            {{ authStore.loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
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
  role: 'VOLUNTEER' as 'VOLUNTEER' | 'ORGANIZATION',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
});

const handleRegister = async () => {
  try {
    await authStore.register(form);
    router.push('/dashboard');
  } catch (error) {
    // Error handled by store
  }
};
</script>

