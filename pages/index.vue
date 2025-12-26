<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">KDS - Analiz Paneli</h1>
      
      <!-- Loading State -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">Veriler yükleniyor...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <p class="text-red-800">❌ Veri yüklenirken hata oluştu: {{ error.message }}</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="analysisData">
        <!-- Top Cards Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Card 1: Tahmini Get iri (M) -->
          <div class="card card-body">
            <h6 class="text-sm font-semibold text-gray-500 uppercase mb-2">Tahmini Getiri (M)</h6>
            <div class="flex items-center justify-between">
              <h2 class="text-3xl font-bold text-primary">{{ formatCurrency(tahminiGetiri) }}</h2>
              <div class="text-4xl text-primary opacity-25">📈</div>
            </div>
            <small class="text-gray-500 mt-2">{{ selectedFirmName }}</small>
          </div>

          <!-- Card 2: Kadın Girişimci Bütçesi (M) -->
          <div class="card card-body">
            <h6 class="text-sm font-semibold text-gray-500 uppercase mb-2">Kadın Girişimci Bütçesi (M)</h6>
            <div class="flex items-center justify-between">
              <h2 class="text-3xl font-bold text-success">{{ formatCurrency(kadinGirisimciButcesi) }}</h2>
              <div class="text-4xl text-success opacity-25">💰</div>
            </div>
          </div>

          <!-- Card 3: Firma Selector -->
          <div class="card card-body bg-gradient-to-br from-primary to-primary-dark text-white">
            <h6 class="text-sm font-semibold text-white opacity-75 uppercase mb-3">Firma Seçiniz</h6>
            <select 
              v-model="selectedFirmId" 
              @change="onFirmaChange"
              class="w-full px-4 py-3 rounded-lg border-0 shadow-sm text-gray-800 font-medium focus:ring-2 focus:ring-white"
            >
              <option value="" disabled>Firma Seçiniz...</option>
              <option 
                v-for="firm in analysisData.firms" 
                :key="firm.id" 
                :value="firm.id"
              >
                {{ firm.ad }}
              </option>
            </select>
          </div>
        </div>

        <!-- Charts Row 1: Pie & Line -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Pie Chart: Sustainability Score -->
          <div class="card">
            <div class="px-6 pt-6 pb-2 border-b border-gray-100">
              <h5 class="font-bold text-gray-800">Sürdürülebilirlik Uyum Puanı (Top 7)</h5>
            </div>
            <div class="p-6">
              <canvas ref="pieChartRef" style="max-height: 300px;"></canvas>
            </div>
          </div>

          <!-- Line Chart: Recycling Rate -->
          <div class="card">
            <div class="px-6 pt-6 pb-2 border-b border-gray-100 flex justify-between items-center">
              <h5 class="font-bold text-gray-800">Atık Geri Dönüşüm Oranı (Top 10)</h5>
              <button 
                @click="showRecyclingControls = !showRecyclingControls"
                class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                <span class="mr-1">⚙️</span> Hedef
              </button>
            </div>
            
            <!-- Recycling Controls -->
            <div v-show="showRecyclingControls" class="px-6 pt-4 pb-2">
              <div class="bg-gray-50 rounded-lg p-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Geri Dönüşüm Hedefi (%)
                </label>
                <input 
                  type="range" 
                  v-model.number="params.recyclingTarget" 
                  @input="updateLineChart"
                  min="0" 
                  max="100" 
                  class="w-full"
                />
                <div class="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span class="font-semibold text-gray-700">{{ params.recyclingTarget }}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <canvas ref="lineChartRef" style="max-height: 300px;"></canvas>
            </div>
          </div>
        </div>

        <!-- Charts Row 2: Bar Chart with Controls -->
        <div class="card mb-8">
          <div class="px-6 pt-6 pb-2 border-b border-gray-100 flex justify-between items-center">
            <h5 class="font-bold text-gray-800">Girişimci Uyumluluk Analizi (Top 10)</h5>
            <button 
              @click="showEntrepreneurControls = !showEntrepreneurControls"
              class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              <span class="mr-1">⚙️</span> Referans Değerleri
            </button>
          </div>

          <!-- Entrepreneur Controls -->
          <div v-show="showEntrepreneurControls" class="px-6 pt-4 pb-2">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Kadın Çalışan Oranı -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Kadın Çalışan Oranı Ref.
                  </label>
                  <input 
                    type="range" 
                    v-model.number="params.kadinCalisan" 
                    @input="updateBarChart"
                    min="0" 
                    max="100" 
                    class="w-full"
                  />
                  <div class="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0%</span>
                    <span class="font-semibold text-gray-700">{{ params.kadinCalisan }}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <!-- Engelli Çalışan Oranı -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Engelli Çalışan Oranı Ref.
                  </label>
                  <input 
                    type="range" 
                    v-model.number="params.engelliCalisan" 
                    @input="updateBarChart"
                    min="0" 
                    max="100" 
                    class="w-full"
                  />
                  <div class="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0%</span>
                    <span class="font-semibold text-gray-700">{{ params.engelliCalisan }}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <!-- Kuruluş Yılı -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Kuruluş Yılı Ref. (Min Yıl)
                  </label>
                  <input 
                    type="range" 
                    v-model.number="params.kurulusYili" 
                    @input="updateBarChart"
                    min="2000" 
                    max="2025" 
                    class="w-full"
                  />
                  <div class="flex justify-between text-sm text-gray-500 mt-1">
                    <span>2000</span>
                    <span class="font-semibold text-gray-700">{{ params.kurulusYili }}</span>
                    <span>2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6">
            <canvas ref="barChartRef" style="max-height: 400px;"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Fetch analysis data from Nitro API route (Vercel same-origin)
const { data: analysisData, pending, error } = await useFetch('/api/analiz');

// Chart refs
const pieChartRef = ref(null);
const lineChartRef = ref(null);
const barChartRef = ref(null);

// Chart instances
let pieChart = null;
let lineChart = null;
let barChart = null;

// UI state
const showRecyclingControls = ref(false);
const showEntrepreneurControls = ref(true);

// Selected firm
const selectedFirmId = ref('');
const selectedFirmName = ref('Firma Seçiniz');
const tahminiGetiri = ref(0);
const kadinGirisimciButcesi = ref(0);

// Parameters (defaults from backend)
const params = ref({
  kadinCalisan: 50,
  engelliCalisan: 30,
  kurulusYili: 2015,
  recyclingTarget: 50
});

// Initialize parameters from backend defaults
watch(analysisData, (newData) => {
  if (newData && newData.defaults) {
    params.value = { ...newData.defaults };
  }
  
  // Auto-select first firm
  if (newData && newData.firms && newData.firms.length > 0) {
    selectedFirmId.value = newData.firms[0].id;
    updateFirmMetrics();
  }
}, { immediate: true });

// Currency formatter (Turkish Lira)
const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

// Firm selection handler
function onFirmaChange() {
  updateFirmMetrics();
}

// EXACT LEGACY FORMULA: Update metric cards based on selected firm
function updateFirmMetrics() {
  if (!analysisData.value || !selectedFirmId.value) return;
  
  const selectedFirm = analysisData.value.firms.find(f => f.id === selectedFirmId.value);
  if (!selectedFirm) return;
  
  // Update Tahmini Getiri (direct from ML prediction)
  tahminiGetiri.value = parseFloat(selectedFirm.tahmini_getiri) || 0;
  
  // EXACT LEGACY FORMULA (analiz.ejs:185-197)
  // Kadın Girişimci Bütçesi = (ciro / 1,000,000) * 0.72
  const rawCiro = selectedFirm.ciro ? String(selectedFirm.ciro).replace(/,/g, '.') : '0';
  const ciroFull = parseFloat(rawCiro);
  const ciroInMillions = !isNaN(ciroFull) ? (ciroFull / 1000000) : 0;
  kadinGirisimciButcesi.value = ciroInMillions * 0.72;
  
  selectedFirmName.value = selectedFirm.ad;
}

// CHARTS INITIALIZATION
onMounted(() => {
  if (!analysisData.value) return;
  
  initPieChart();
  initLineChart();
  initBarChart();
});

// Cleanup on unmount
onUnmounted(() => {
  pieChart?.destroy();
  lineChart?.destroy();
  barChart?.destroy();
});

// PIE CHART (exact config from analiz.ejs:217-236)
function initPieChart() {
  if (!pieChartRef.value || !analysisData.value) return;
  
  const pieData = analysisData.value.charts.sustainability;
  
  pieChart = new Chart(pieChartRef.value, {
    type: 'doughnut',
    data: {
      labels: pieData.map(d => d.ad),
      datasets: [{
        data: pieData.map(d => d.surdurulebilirlik_uyum_puani),
        backgroundColor: [
          '#4e73df', '#1cc88a', '#36b9cc', 
          '#f6c23e', '#e74a3b', '#858796', '#5a5c69'
        ],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
}

// LINE CHART with reference line (exact config from analiz.ejs:243-275)
function initLineChart() {
  if (!lineChartRef.value || !analysisData.value) return;
  
  const lineData = analysisData.value.charts.recycling;
  
  lineChart = new Chart(lineChartRef.value, {
    type: 'line',
    data: {
      labels: lineData.map(d => d.ad),
      datasets: [
        {
          label: 'Geri Dönüşüm Oranı (%)',
          data: lineData.map(d => d.geri_donusum_orani),
          borderColor: '#1cc88a',
          backgroundColor: 'rgba(28, 200, 138, 0.1)',
          tension: 0.3,
          fill: true,
          order: 2
        },
        {
          label: 'Hedef Oran',
          data: Array(lineData.length).fill(params.value.recyclingTarget),
          borderColor: '#e74a3b',
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 2,
          fill: false,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

// BAR CHART with dual Y-axis (exact config from analiz.ejs:282-349)
function initBarChart() {
  if (!barChartRef.value || !analysisData.value) return;
  
  const barData = analysisData.value.charts.entrepreneur;
  
  barChart = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels: barData.map(d => d.isletme_adi),
      datasets: [
        {
          label: 'Kriter Uyumluluk Puanı',
          data: barData.map(d => d.kriter_uyumluluk_puani),
          backgroundColor: '#4e73df',
          order: 3,
          yAxisID: 'y'
        },
        {
          label: 'Ref: Kadın Çalışan (%)',
          data: Array(barData.length).fill(params.value.kadinCalisan),
          type: 'line',
          borderColor: '#f6c23e',
          borderDash: [5, 5],
          pointRadius: 0,
          order: 1,
          yAxisID: 'y'
        },
        {
          label: 'Ref: Engelli Çalışan (%)',
          data: Array(barData.length).fill(params.value.engelliCalisan),
          type: 'line',
          borderColor: '#e74a3b',
          borderDash: [2, 2],
          pointRadius: 0,
          order: 1,
          yAxisID: 'y'
        },
        {
          label: 'Ref: Kuruluş Yılı',
          data: Array(barData.length).fill(params.value.kurulusYili),
          type: 'line',
          borderColor: '#36b9cc',
          borderDash: [10, 5],
          pointRadius: 0,
          order: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: 'Puan / Oran (%)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 2000,
          max: 2025,
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Kuruluş Yılı' }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  });
}

// LINE CHART UPDATE (analiz.ejs:356-368)
function updateLineChart() {
  if (!lineChart) return;
  
  const lineData = analysisData.value.charts.recycling;
  lineChart.data.datasets[1].data = Array(lineData.length).fill(params.value.recyclingTarget);
  lineChart.update();
}

// BAR CHART UPDATE with EXACT LEGACY FORMULA (analiz.ejs:371-413)
function updateBarChart() {
  if (!barChart || !analysisData.value) return;
  
  const barDataRaw = analysisData.value.charts.entrepreneur;
  const { kadinCalisan, engelliCalisan, kurulusYili } = params.value;
  
  // EXACT LEGACY RECALCULATION FORMULA (analiz.ejs:389-401)
  const recalculated = barDataRaw.map(item => {
    let baseScore = parseFloat(item.kriter_uyumluluk_puani);
    
    const kadinDiff = (item.kadin_calisan_orani || 0) - kadinCalisan;
    baseScore += (kadinDiff / 2);
    
    const engelliDiff = (item.engelli_calisan_orani || 0) - engelliCalisan;
    baseScore += (engelliDiff * 5);
    
    const yilDiff = (item.kurulus_yili || 2000) - kurulusYili;
    baseScore += (yilDiff / 2);
    
    return Math.min(100, Math.max(0, Math.round(baseScore)));
  });
  
  // Update main data
  barChart.data.datasets[0].data = recalculated;
  
  // Update reference lines
  barChart.data.datasets[1].data = Array(barDataRaw.length).fill(kadinCalisan);
  barChart.data.datasets[2].data = Array(barDataRaw.length).fill(engelliCalisan);
  barChart.data.datasets[3].data = Array(barDataRaw.length).fill(kurulusYili);
  
  barChart.update();
}
</script>
