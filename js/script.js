const frequencies = {
  L1: {
    weekday: { creuse: 24, pointe: 12, soirée: 48 },
    saturday: { creuse: 24, pointe: 16, soirée: 48 },
    sunday: { creuse: 48, pointe: 24, soirée: null }
  },
  L2: {
    weekday: { creuse: 11, pointe: 9, soirée: 27 },
    saturday: { creuse: 16, pointe: 11, soirée: 20 },
    sunday: { creuse: 40, pointe: 20, soirée: null }
  },
  L3: {
    weekday: { creuse: 16, pointe: 11, soirée: 32 },
    saturday: { creuse: 21, pointe: 16, soirée: 64 },
    sunday: { creuse: 32, pointe: 32, soirée: null }
  },
  L4: {
    weekday: { creuse: 28, pointe: 14, soirée: null },
    saturday: { creuse: null, pointe: 28, soirée: null },
    sunday: { creuse: null, pointe: 28, soirée: null }
  }
};

const serviceHours = {
  L1: { start: 5 * 60, end: () => 23 * 60 },
  L2: { start: 4 * 60 + 30, end: () => 24 * 60 + 30 },
  L3: { start: 5 * 60, end: () => 24 * 60 + 30 },
  L4: { start: 5 * 60 + 30, end: () => 22 * 60 + 45 }
};

function getDayType() {
  const d = new Date();
  const day = d.getDay();
  if (day === 0) return "sunday";
  if (day === 6) return "saturday";
  return "weekday";
}

function getPeriod(hour) {
  if ((hour >= 7 && hour < 10) || (hour >= 17 && hour < 19)) return "pointe";
  if (hour >= 20 || hour < 1) return "soirée";
  return "creuse";
}

function getVariableFrequency(baseFreq, stopName) {
  if (!baseFreq) return null;
  const variation = (stopName.charCodeAt(0) % 3) - 1;
  return baseFreq + variation;
}

function formatTime(minutes) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m} min`;
  }
  return `${minutes} min`;
}

function getNextDepartures(freq, offset = 0) {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes() + offset;
  const toNext = freq - (currentMin % freq);
  return [toNext, toNext + freq];
}

function updateTimes() {
  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const currentMin = hour * 60 + min;
  const period = getPeriod(hour);
  const dayType = getDayType();

  document.querySelectorAll(".time").forEach(span => {
    const line = span.dataset.line;
    const stop = span.dataset.stop;
    const freqBase = frequencies[line]?.[dayType]?.[period];
    const offset = stop.includes("Gare Centrale") ? 2 : 0;
    const endTime = typeof serviceHours[line].end === "function" ? serviceHours[line].end() : serviceHours[line].end;

    const inService = freqBase && currentMin >= serviceHours[line].start && currentMin <= endTime;

    if (!inService) {
      const startHour = Math.floor(serviceHours[line].start / 60);
      const startMin = serviceHours[line].start % 60;
      span.textContent = `Fin de service. Premier bus à ${startHour}h${startMin.toString().padStart(2, "0")}`;
      return;
    }

    const freq = getVariableFrequency(freqBase, stop);
    const [t1, t2] = getNextDepartures(freq, offset);
    span.textContent = `${formatTime(t1)} | ${formatTime(t2)}`;
  });
}

function getAffluenceNiveau(passagers, places) {
  if (!places || passagers == null) return "inconnu";
  const ratio = passagers / places;
  if (ratio < 0.4) return "faible";
  if (ratio < 0.8) return "moyenne";
  return "forte";
}

function afficherAffluenceParLigne(ligne) {
  fetch("affluence.json?t=" + Date.now())
    .then(r => r.json())
    .then(data => {
      const info = data[ligne];
      const icone = document.getElementById("icone-affluence");
      const texte = document.getElementById("texte-affluence");
      const bloc = document.getElementById("affluence");

      if (!info || info.passagers == null || info.places == null) {
        bloc.style.display = "none";
        return;
      }

      const niveau = getAffluenceNiveau(info.passagers, info.places);

      const icones = {
        faible: "affluFa.png",
        moyenne: "affluMoy.png",
        forte: "affluFo.png",
        inconnu: "affluInconnu.png"
      };

      const textes = {
        faible: "Affluence faible",
        moyenne: "Affluence moyenne",
        forte: "Affluence forte",
        inconnu: "Affluence inconnue"
      };

      icone.src = "img/icons/" + icones[niveau];
      texte.textContent = textes[niveau];
      bloc.style.display = niveau === "inconnu" ? "none" : "flex";
    });
}

// Init automatique
updateTimes();
setInterval(updateTimes, 60000);
const ligne = document.getElementById("affluence")?.dataset.ligne;
if (ligne) afficherAffluenceParLigne(ligne);
