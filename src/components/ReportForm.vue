<script setup lang="ts">
import { ref } from 'vue';
import { generateAndDownloadZip } from '../services/ZipService';

const domain = ref('');
const type = ref<'days' | 'reports'>('days');
const count = ref(1);
const loading = ref(false);
const error = ref('');
const success = ref(false);

const generate = async () => {
  if (!domain.value) {
    error.value = 'Please enter a domain.';
    return;
  }
  
  error.value = '';
  success.value = false;
  loading.value = true;

  try {
    await generateAndDownloadZip(domain.value, count.value, type.value);
    success.value = true;
  } catch (e) {
    error.value = 'Failed to generate reports. Please try again.';
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg p-6">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">DMARC Generator</h2>
      <p class="text-gray-600 mt-2">Generate realistic XML DMARC reports for QA.</p>
    </div>

    <form @submit.prevent="generate" class="space-y-4">
      <!-- Domain Input -->
      <div>
        <label for="domain" class="block text-sm font-medium text-gray-700">Domain</label>
        <input
          id="domain"
          v-model="domain"
          type="text"
          placeholder="example.com"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <!-- Type Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Generation Mode</label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="type"
              value="days"
              class="form-radio text-indigo-600"
            />
            <span class="ml-2 text-gray-700">Days of Data</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="type"
              value="reports"
              class="form-radio text-indigo-600"
            />
            <span class="ml-2 text-gray-700">Number of Reports</span>
          </label>
        </div>
      </div>

      <!-- Count Input -->
      <div>
        <label for="count" class="block text-sm font-medium text-gray-700">
          {{ type === 'days' ? 'Number of Days' : 'Number of Reports' }}
        </label>
        <input
          id="count"
          v-model="count"
          type="number"
          min="1"
          max="30"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p class="text-xs text-gray-500 mt-1">Max 30</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="success" class="text-green-600 text-sm">
        Reports generated and downloading!
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span v-if="loading">Generating...</span>
        <span v-else>Generate Report</span>
      </button>
    </form>
  </div>
</template>

