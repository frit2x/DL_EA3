let model, wordToIdx, idxToWord;
let chartInstance = null;
let autoInterval = null;
const SEQUENCE_LENGTH = 3;

// 1. Modell und Daten asynchron beim Start laden
// Ermittelt den aktuellen Pfad der Webseite (wichtig für GitHub Pages Unterordner)
const BASE_URL = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/';

async function init() {
    const status = document.getElementById("statusMessage");
    try {
        status.textContent = "Lade Vokabular...";
        // Nutzt den dynamischen Basis-Pfad
        wordToIdx = await fetch(BASE_URL + 'word_to_idx.json').then(res => res.json());
        idxToWord = await fetch(BASE_URL + 'idx_to_word.json').then(res => res.json());
        
        status.textContent = "Lade neuronales Netz (TFJS)...";
        // Wichtig: Der Pfad zur model.json muss exakt stimmen
        model = await tf.loadLayersModel(BASE_URL + 'tfjs_model/model.json');
        
        status.textContent = "Bereit für Eingaben.";
        status.className = "text-sm mt-1 text-green-600 font-medium";
    } catch (error) {
        status.textContent = "Fehler beim Laden der Dateien! Überprüfe die Pfade im Repository.";
        status.className = "text-sm mt-1 text-red-600 font-medium";
        console.error(error);
    }
}


// 2. Mathematische Wortvorhersage via TFJS
async function predictNextWords() {
    if (!model) return null;
    
    const inputTextArea = document.getElementById("promptInput");
    const rawText = inputTextArea.value.trim().toLowerCase();
    const tokens = rawText.split(/\s+/).filter(t => t.length > 0);
    
    // Fehlerbehandlung & Validierung (QA Anforderung)
    if (tokens.length < SEQUENCE_LENGTH) {
        document.getElementById("statusMessage").textContent = `Bitte mindestens ${SEQUENCE_LENGTH} Wörter eingeben!`;
        return null;
    }
    
    document.getElementById("statusMessage").textContent = "Berechne Vorhersage...";

    // Die letzten X Wörter nehmen
    const lastWords = tokens.slice(-SEQUENCE_LENGTH);
    const inputIds = lastWords.map(w => wordToIdx[w] !== undefined ? wordToIdx[w] : 0); // Fallback auf 0 bei unbekannten Wörtern

    // Forward Pass durch das neuronale Netz
    const inputTensor = tf.tensor2d([inputIds], [1, SEQUENCE_LENGTH]);
    const predictionTensor = model.predict(inputTensor);
    const probabilities = await predictionTensor.data();
    
    // Aufräumen um Memory Leaks im Browser zu verhindern
    inputTensor.dispose();
    predictionTensor.dispose();

    // Wahrscheinlichkeiten mit Wörtern verknüpfen und sortieren
    let wordProbs = [];
    for (let i = 0; i < probabilities.length; i++) {
        wordProbs.push({ word: idxToWord[i], prob: probabilities[i] });
    }
    wordProbs.sort((a, b) => b.prob - a.prob);
    
    document.getElementById("statusMessage").textContent = "Vorhersage abgeschlossen.";
    return wordProbs;
}

// 3. UI Aktualisierung (Buttons & Diagramm)
async function handlePredictionUI() {
    const predictions = await predictNextWords();
    if (!predictions) return;

    // Wortauswahl-Buttons generieren (Top 5)
    const container = document.getElementById("wordSuggestions");
    container.innerHTML = "";
    
    const top5 = predictions.slice(0, 5);
    top5.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "bg-white border border-indigo-300 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-50 transition";
        btn.textContent = `${item.word} (${(item.prob * 100).toFixed(1)}%)`;
        btn.onclick = () => appendWord(item.word);
        container.appendChild(btn);
    });

    // Diagramm zeichnen / aktualisieren
    updateChart(predictions.slice(0, 7));
}

// Wort an Text anhängen (I1)
function appendWord(word) {
    const input = document.getElementById("promptInput");
    input.value = input.value.trim() + " " + word + " ";
    handlePredictionUI(); // Automatisch neue Vorhersage starten
}

// 4. Steuerungs-Logik für die Buttons (I1 - I4)
document.getElementById("btnPredict").addEventListener("click", handlePredictionUI);

document.getElementById("btnNext").addEventListener("click", async () => {
    const predictions = await predictNextWords();
    if (predictions && predictions.length > 0) {
        appendWord(predictions[0].word); // Nimmt das wahrscheinlichste Wort (k=1)
    }
});

document.getElementById("btnAuto").addEventListener("click", () => {
    if (autoInterval) clearInterval(autoInterval);
    let wordsCount = 0;
    
    autoInterval = setInterval(async () => {
        const predictions = await predictNextWords();
        if (predictions && predictions.length > 0 && wordsCount < 10) {
            appendWord(predictions[0].word);
            wordsCount++;
        } else {
            clearInterval(autoInterval);
        }
    }, 1000); // Generiert jede Sekunde ein Wort
});

document.getElementById("btnStop").addEventListener("click", () => {
    if (autoInterval) {
        clearInterval(autoInterval);
        document.getElementById("statusMessage").textContent = "Automatische Generierung gestoppt.";
    }
});

document.getElementById("btnReset").addEventListener("click", () => {
    if (autoInterval) clearInterval(autoInterval);
    document.getElementById("promptInput").value = "";
    document.getElementById("wordSuggestions").innerHTML = "";
    document.getElementById("statusMessage").textContent = "Zurückgesetzt. Bereit für neue Eingabe.";
    if (chartInstance) chartInstance.destroy();
});

// 5. Chart.js Visualisierungsfunktion
function updateChart(topPredictions) {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    const labels = topPredictions.map(p => p.word);
    const data = topPredictions.map(p => p.prob);

    if (chartInstance) {
        chartInstance.destroy(); // Altes Diagramm entfernen vor Neuzeichnung
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Wahrscheinlichkeit',
                data: data,
                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 1 } }
        }
    });
}

// Sicherer Start der Anwendung erst, wenn das Fenster und alle Skripte bereit sind
window.addEventListener('DOMContentLoaded', () => {
    // Kurze Verzögerung, um sicherzustellen, dass 'tf' global registriert ist
    setTimeout(() => {
        if (typeof tf !== 'undefined') {
            init();
        } else {
            const status = document.getElementById("statusMessage");
            status.textContent = "Fehler: TensorFlow.js konnte nicht geladen werden. Bitte Seite neu laden.";
            status.className = "text-sm mt-1 text-red-600 font-medium";
        }
    }, 500);
});

