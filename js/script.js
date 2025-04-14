document.addEventListener("DOMContentLoaded", () => {
  const isVacation = false; // À changer selon période
  const now = new Date();
  const day = now.getDay(); // 0 = dimanche, 6 = samedi
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // Détermine la période horaire
  function getPeriod(hour, minutes) {
    const time = hour * 60 + minutes;
    if ((time >= 360 && time < 540) || (time >= 990 && time < 1170)) return "pointes";
    if (time >= 1170 && time < 1380) return "soirée";
    return "creuses";
  }

  const period = getPeriod(hour, minutes);

  // Détermine le type de jour
  const isWeekday = day >= 1 && day <= 5;
  const isSaturday = day === 6;
  const isSunday = day === 0;

  // Fréquences en minutes par ligne et condition
  const horaires = {
    L1: {
      creuses: isWeekday ? 24 : isSaturday ? 24 : null,
      pointes: isWeekday ? 16 : isSaturday ? 24 : 48,
      soirée: isSaturday ? 48 : null,
      dimanche: { creuses: null, pointes: 48 }
    },
    L2: {
      creuses: isWeekday ? 16 : isSaturday ? 20 : 40,
      pointes: isWeekday ? 11 : isSaturday ? 13 : 20,
      soirée: isWeekday ? 40 : isSaturday ? 40 : 40,
      dimanche: { creuses: 40, pointes: 20 }
    },
    L3: {
      creuses: isWeekday ? 32 : isSaturday ? 32 : 64,
      pointes: isWeekday ? 16 : isSaturday ? 21 : 32,
      soirée: 64,
      dimanche: { creuses: 64, pointes: 32 }
    },
    L4: {
      creuses: isWeekday ? 28 : null,
      pointes: isWeekday ? 19 : isSaturday ? 28 : null,
      soirée: null,
      dimanche: { creuses: null, pointes: null }
    }
  };

  function getFrequency(line) {
    const data = horaires[line];
    if (isSunday) {
      return data.dimanche[period] ?? "-";
    } else {
      return data[period] ?? "-";
    }
  }

  function renderLigne(id, nom) {
    const container = document.getElementById(id);
    const freq1 = getFrequency(id);
    const freq2 = getFrequency(id); // Peut être personnalisé si sens différent
    container.innerHTML = `
      <h2>L${id}.png</h2>
      <p>|</p>
      <p>|-->${nom[0]}: ${freq1} min | ${freq2} min</p>
      <p>|</p>
      <p>|-->${nom[1]}: ${freq2} min | ${freq1} min</p>
    `;
  }

  renderLigne("ligne1", ["Campus Alan Turing", "Gare Centrale"]);
  renderLigne("ligne2", ["Aéroport", "Gare Centrale"]);
  renderLigne("ligne3", ["Campus Marthe Gautier", "Gare Centrale"]);
  renderLigne("ligne4", ["Gare de l'Est", "Gare Centrale"]);

  // Affiche l'app après chargement
  document.getElementById("loader").style.display = "none";
  document.getElementById("app").classList.remove("hidden");
});
