const frequencies = {
  L1: {
    weekday: { creuse: 24, pointe: 16, soirée: null },
    saturday: { creuse: 24, pointe: 24, soirée: 48 },
    sunday: { creuse: null, pointe: 48, soirée: null },
  },
  L2: {
    weekday: { creuse: 16, pointe: 11, soirée: 40 },
    saturday: { creuse: 20, pointe: 13, soirée: 40 },
    sunday: { creuse: 40, pointe: 20, soirée: null },
  },
  L3: {
    weekday: { creuse: 32, pointe: 16, soirée: 64 },
    saturday: { creuse: 32, pointe: 21, soirée: 64 },
    sunday: { creuse: 64, pointe: 32, soirée: null },
  },
  L4: {
    weekday: { creuse: 28, pointe: 19, soirée: null },
    saturday: { creuse: null, pointe: 28, soirée: null },
    sunday: { creuse: null, pointe: null, soirée: null },
  }
};

function getPeriod(hour) {
  if ((hour >= 6 && hour < 9) || (hour >= 16 && hour < 19)) return "pointe";
  if (hour >= 20 || hour < 6) return "soirée";
  return "creuse";
}

function getDayType() {
  const now = new Date();
  const day = now.getDay();
  const isVacation = false;
  if (isVacation) return "vacances";
  if (day === 6) return "saturday";
  if (day === 0) return "sunday";
  return "weekday";
}

// Génère une fréquence légèrement variable (±1 min)
function getVariableFrequency(baseFreq, id) {
  const hash = id.charCodeAt(0) % 3 - 1; // -1, 0, +1
  return baseFreq + hash;
}

function getNextDepartures(freq, offset = 0) {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes() + offset;
  const minutesToNext = freq - (currentMin % freq);
  const secondNext = minutesToNext + freq;
  return [minutesToNext, secondNext];
}

function updateTimes() {
  const now = new Date();
  const hour = now.getHours();
  const dayType = getDayType();
  const period = getPeriod(hour);

  document.querySelectorAll(".time").forEach(span => {
    const line = span.dataset.line;
    const stop = span.dataset.stop;
    const baseFreq = frequencies[line]?.[dayType]?.[period];

    if (baseFreq) {
      const variableFreq = getVariableFrequency(baseFreq, stop);
      const offset = stop.includes("Gare Centrale") ? 2 : 0;
      const [min1, min2] = getNextDepartures(variableFreq, offset);
      span.textContent = `${min1} min | ${min2} min`;
    } else {
      span.textContent = "Pas de service";
    }
  });
}

function syncUpdate() {
  updateTimes();
  const now = new Date();
  const delay = (60 - now.getSeconds()) * 1000;
  setTimeout(syncUpdate, delay);
}

syncUpdate();
