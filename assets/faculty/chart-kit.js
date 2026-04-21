// Faculty dashboards: Chart.js helpers (theme-aware, no build step).

let chartModPromise;

async function loadChart() {
  if (!chartModPromise) {
    chartModPromise = import('https://esm.sh/chart.js@4.4.8/auto');
  }
  const mod = await chartModPromise;
  return mod.default;
}

export function facultyChartColors() {
  const cs = getComputedStyle(document.documentElement);
  const g = (name, fallback) => {
    const v = cs.getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    ink: g('--ink', '#ececf2'),
    muted: g('--muted', '#8a8a9a'),
    line: g('--line', '#22222e'),
    accent: g('--accent', '#c3ff36'),
    accent2: g('--accent-2', '#8b5cf6'),
    accent3: g('--accent-3', '#ff6b6b'),
    accent4: g('--accent-4', '#38bdf8'),
    card: g('--card', '#14141c'),
  };
}

function basePlugins(c) {
  return {
    legend: {
      labels: { color: c.muted, font: { size: 11 } },
    },
    tooltip: {
      bodyColor: c.ink,
      titleColor: c.muted,
      backgroundColor: c.card,
      borderColor: c.line,
      borderWidth: 1,
    },
  };
}

export function destroyFacultyChart(canvas) {
  if (canvas && canvas._facultyChart) {
    canvas._facultyChart.destroy();
    canvas._facultyChart = null;
  }
}

/** Horizontal bar chart (labels on Y). */
export async function facultyHBarChart(canvas, { labels, values, label }) {
  const Chart = await loadChart();
  destroyFacultyChart(canvas);
  const c = facultyChartColors();
  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: label || 'Value',
          data: values,
          backgroundColor: `${c.accent}66`,
          borderColor: c.accent,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: basePlugins(c),
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: c.muted, font: { size: 10 } },
          grid: { color: `${c.line}55` },
        },
        y: {
          ticks: { color: c.muted, font: { size: 10 } },
          grid: { display: false },
        },
      },
    },
  });
  canvas._facultyChart = chart;
  return chart;
}

/** Vertical bar chart. */
export async function facultyVBarChart(canvas, { labels, values, label }) {
  const Chart = await loadChart();
  destroyFacultyChart(canvas);
  const c = facultyChartColors();
  const palette = [c.accent, c.accent2, c.accent4, c.accent3];
  const bg = values.map((_, i) => `${palette[i % palette.length]}88`);
  const bd = values.map((_, i) => palette[i % palette.length]);
  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: label || 'Count',
          data: values,
          backgroundColor: bg,
          borderColor: bd,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: basePlugins(c),
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: c.muted, precision: 0 },
          grid: { color: `${c.line}55` },
        },
        x: {
          ticks: { color: c.muted, font: { size: 10 } },
          grid: { display: false },
        },
      },
    },
  });
  canvas._facultyChart = chart;
  return chart;
}

/** Doughnut with explicit segment colors. */
export async function facultyDoughnutChart(canvas, { labels, values, colors }) {
  const Chart = await loadChart();
  destroyFacultyChart(canvas);
  const c = facultyChartColors();
  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors || [`${c.accent}aa`, `${c.line}`, `${c.accent3}aa`],
          borderColor: c.card,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        ...basePlugins(c),
        legend: { position: 'bottom', labels: { color: c.muted, font: { size: 11 } } },
      },
    },
  });
  canvas._facultyChart = chart;
  return chart;
}
