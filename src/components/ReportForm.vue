<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  generateAndDownloadReports,
  type ExportFormat,
  type GenerationMode,
} from '../services/ExportService';

const domain = ref('');
const mode = ref<GenerationMode>('days');
const count = ref(1); // Default to 1 day/report
const format = ref<ExportFormat>('zip');
const loading = ref(false);
const error = ref('');
const success = ref(false);

// Standard DMARC reporting periods often default to daily (1 day).
// Users might want to see trends over a week (7), two weeks (14), or a month (30).
const commonDays = [1, 7, 14, 30];
const isGzip = computed(() => format.value === 'gzip');

const generate = async () => {
  if (!domain.value) {
    error.value = 'Please enter a domain.';
    return;
  }
  
  error.value = '';
  success.value = false;
  loading.value = true;

  const requestedCount = isGzip.value ? 1 : count.value;

  try {
    await generateAndDownloadReports(domain.value, requestedCount, mode.value, format.value);
    if (isGzip.value) {
      count.value = 1;
    }
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

      <!-- Mode Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Generation Mode</label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="mode"
              value="days"
              class="form-radio text-indigo-600"
            />
            <span class="ml-2 text-gray-700">Days of Data</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="mode"
              value="reports"
              class="form-radio text-indigo-600"
            />
            <span class="ml-2 text-gray-700">Number of Reports</span>
          </label>
        </div>
      </div>

      <!-- Compression Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="format"
              value="zip"
              class="form-radio text-indigo-600"
            />
            <span class="ml-2 text-gray-700">ZIP Archive (.zip)</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="format"
              value="gzip"
              class="form-radio text-indigo-600"
            />
            <span class="ml-2 text-gray-700">GZIP File (.xml.gz)</span>
          </label>
        </div>
        <p v-if="format === 'gzip'" class="text-xs text-gray-500 mt-1">
          GZIP output includes a single report (latest date range).
        </p>
      </div>

      <!-- Count/Duration Input -->
      <div>
        <label for="count" class="block text-sm font-medium text-gray-700">
          {{ mode === 'days' ? 'Duration (Days)' : 'Number of Reports' }}
        </label>
        
        <div
          v-if="mode === 'days' && format === 'zip'"
          class="mt-2 grid grid-cols-4 gap-2"
        >
          <button
            v-for="days in commonDays"
            :key="days"
            type="button"
            @click="count = days"
            :class="[
              'px-3 py-2 border text-sm font-medium rounded-md focus:outline-none',
              count === days
                ? 'bg-indigo-600 text-white border-transparent'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ days }}d
          </button>
        </div>
        
        <template v-else>
          <input
            id="count"
            v-model="count"
            type="number"
            :disabled="format === 'gzip'"
            min="1"
            max="30"
            class="mt-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          />
          <p v-if="format === 'gzip'" class="text-xs text-gray-500 mt-1">
            Count is fixed to 1 when exporting GZIP reports.
          </p>
          <p v-else-if="mode === 'reports'" class="text-xs text-gray-500 mt-1">Max 30</p>
        </template>
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
