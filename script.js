<!DOCTYPE html>

<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

```
<title>LSTM Wortvorhersage mit TensorFlow.js</title>

<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- TensorFlow.js -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"></script>

<!-- Chart.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
```

</head>

<body class="bg-gray-50 text-gray-800 font-sans p-6">

```
<!-- Versionsanzeige -->
<div class="bg-red-500 text-white text-center font-bold p-3 rounded mb-4">
    🚀 AKTUELLER SEITEN-STAND: VERSION 5.1
</div>

<div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 mb-8">

    <h1 class="text-2xl font-bold mb-4 text-indigo-700">
        🔮 Next Word Prediction (LSTM)
    </h1>

    <p class="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded border border-blue-200">
        <strong>Bedienungshilfe:</strong>
        Geben Sie mindestens drei Wörter ein und klicken Sie auf
        <em>Vorhersage</em>. Über <em>Weiter</em> wird das wahrscheinlichste
        Wort ergänzt. <em>Auto</em> generiert automatisch weitere Wörter.
    </p>

    <!-- Texteingabe -->
    <textarea
        id="promptInput"
        rows="3"
        class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
        placeholder="Geben Sie hier Ihren Text ein..."
    ></textarea>

    <!-- Status -->
    <div id="statusMessage" class="text-sm mt-2 text-gray-600 h-5">
        TensorFlow.js wird geladen...
    </div>

    <!-- Buttons -->
    <div class="flex flex-wrap gap-2 mt-4">
        <button id="btnPredict"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            Vorhersage
        </button>

        <button id="btnNext"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
            Weiter
        </button>

        <button id="btnAuto"
            class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md">
            Auto (Max 10)
        </button>

        <button id="btnStop"
            class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md">
            Stopp
        </button>

        <button id="btnReset"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md">
            Reset
        </button>
    </div>

    <!-- Wortvorschläge -->
    <div class="mt-6">
        <h3 class="font-semibold mb-2">
            Wortauswahl (Klicken zum Hinzufügen)
        </h3>

        <div id="wordSuggestions"
            class="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-100 rounded-md">
        </div>
    </div>

    <!-- Diagramm -->
    <div class="mt-6">
        <h3 class="font-semibold mb-2">
            Wahrscheinlichkeitsverteilung
        </h3>

        <div class="h-64 bg-gray-50 p-2 rounded border">
            <canvas id="predictionChart"></canvas>
        </div>
    </div>
</div>

<!-- Dokumentation -->
<div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">

    <h2 class="text-xl font-bold mb-4 border-b pb-2">
        Diskussion
    </h2>

    <p class="text-gray-700 leading-relaxed mb-6">
        In diesem Experiment wurde beobachtet, dass das LSTM-Modell kurze
        Wortfolgen aus den Trainingsdaten sehr präzise vorhersagen kann.
        Die Qualität der Vorhersagen hängt stark von Umfang und Qualität
        der Trainingsdaten ab. TensorFlow.js ermöglicht die direkte
        Ausführung des neuronalen Netzes im Browser ohne Server-Backend.
    </p>

    <h2 class="text-xl font-bold mb-4 border-b pb-2">
        Technische Dokumentation
    </h2>

    <ul class="list-disc pl-6 mb-6 space-y-1">
        <li>TensorFlow (Python) für das Training.</li>
        <li>TensorFlow.js für die Inferenz im Browser.</li>
        <li>Chart.js zur Visualisierung.</li>
        <li>Tailwind CSS für das UI.</li>
    </ul>

    <h2 class="text-xl font-bold mb-4 border-b pb-2">
        Fachliche Dokumentation
    </h2>

    <p class="text-gray-700">
        Die letzten drei Wörter des Eingabetextes werden tokenisiert und
        in numerische Indizes umgewandelt. Das Modell berechnet eine
        Wahrscheinlichkeitsverteilung über das Vokabular, aus der die
        wahrscheinlichsten Folgewörter extrahiert werden.
    </p>

</div>

<!-- Debug-Ausgabe -->
<script>
    console.log("TensorFlow verfügbar:", typeof tf !== "undefined");

    if (typeof tf !== "undefined") {
        console.log("TFJS Version:", tf.version.tfjs);
    }
</script>

<!-- Eigene Logik -->
<script src="script.js"></script>
```

</body>
</html>
