<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600">Just A Drop</h1>
          </div>
          <div class="flex items-center gap-4">
            <router-link to="/login" class="btn-outline">Login</router-link>
            <router-link to="/register" class="btn-primary">Get Started</router-link>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-1 flex items-center justify-center">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 class="text-5xl font-bold mb-6 text-gray-900">
          Make a Difference,<br />One Drop at a Time
        </h2>
        <p class="text-xl text-gray-600 mb-8">
          Connect with meaningful volunteer opportunities and organizations making an impact.
        </p>
        <router-link to="/register" class="btn-primary text-lg px-8 py-3">
          Start Volunteering
        </router-link>
      </div>
    </main>

    <footer class="bg-white border-t border-gray-200 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
        <p>&copy; 2025 Just A Drop. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

