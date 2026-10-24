---
slug: "understandingClimateChange"
name:
  en: "Understanding Climate Change"
  de: "Klimawandel verstehen"
projectType:
  en: "D3.js Website"
  de: "D3.js Website"
year: "2018"
inDevelopment: false
roles: ["d3js", "front-end"]
description:
  en: "Interactive choropleth of Canadian weather on a D3.js climate site from a two-person, two-month project."
  de: "Interaktive Choropleth des kanadischen Wetters auf einer D3.js-Website zum Klima aus einem Projekt zu zweit über zwei Monate."
links:
  - label: "View Project"
    url: "http://understandingclimatechange.rmichels.com/ccImpacts.html"
order: 10
---

<section class="sectionText">
  <h2>Überblick</h2>
  <p>Ich habe die Datenbereinigung und die interaktive Choropleth des kanadischen Wetters für eine D3.js-Website zum Klimawandel gebaut.</p>
  <p>Studienprojekt, SIAT, 2018.</p>
  <ul>
    <li><strong>Rolle:</strong> Datenpipeline, Choropleth-Karte und Diagramminteraktionen.</li>
    <li><strong>Team:</strong> Team zu zweit, über zwei Monate.</li>
    <li><strong>Zeitraum:</strong> 2018. Zwei Monate. Erstes D3.js-Projekt.</li>
    <li><strong>Plattformen:</strong> Web.</li>
    <li><strong>Stack:</strong> HTML, CSS, JavaScript und D3.js.</li>
    <li><strong>Status:</strong> http://understandingclimatechange.rmichels.com/ccImpacts.html</li>
  </ul>
  <p>TODO(Robert): the Understanding Climate Change partner's name.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure id="chart4">
      <img src="/assets/img/understandingClimateChange/lqip/chart4.jpg" alt="Choropleth-Karte der kanadischen Provinzen und Territorien, eingefärbt nach einer Wetterfarbskala.">
      <figcaption>Das kanadische Wetterdiagramm: eine Choropleth der Provinzen und Territorien für Temperatur und Niederschlag. Es ist die Ansicht, um den bereinigten kanadischen Wetterdatensatz nach Ort zu durchsuchen.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h2>Konzept</h2>
  <p>Understanding Climate Change war 2018 eine D3.js-Website, ausgerichtet auf zwei Fragen: was zum Klimawandel beiträgt, und ob das kanadische Wetter abnormales Verhalten zeigt. Ein Teammitglied und ich haben sie in zwei Monaten als unser erstes Projekt mit der Bibliothek gebaut.</p>
  <p>Die Website umfasste vier farbcodierte Liniendiagramme der globalen CO2-Emissionen und der atmosphärischen Konzentration, ein gestapeltes Flächendiagramm der CO2-Emissionen nach Region, ein Spider-Chart der globalen Temperaturanomalie im Zeitverlauf und vier Linienplots der kanadischen Mitteltemperatur, des Niederschlags und ihrer Anomalien, gruppiert mit den globalen CO2-Emissionen.</p>
</section>
<section class="sectionText">
  <h2>Was ich gebaut habe</h2>
  <p>Arbeitsannahme: Mein Anteil war die Datenpipeline, die Choropleth und die Diagramminteraktionen. Die ursprüngliche Seite sagt nur „wir“.</p>
  <ul>
    <li>Datenpipeline: Ausreißer und fehlerhafte Daten bereinigen, die kanadischen Wetterdatensätze von Hand zusammenführen, sie sortieren und monatliche sowie jährliche Durchschnitte berechnen.</li>
    <li>Choropleth der Provinzen und Territorien für Temperatur und Niederschlag nach Jahr, Monat und Provinz.</li>
    <li>Diagramminteraktionen: Tooltips, Brushing, Wechsel der Darstellung und Animation.</li>
  </ul>
</section>
<section class="sectionText">
  <h2>Choropleth-Karte</h2>
  <p>Dieser Abschnitt folgt der Arbeitsannahme oben. Die Choropleth war das komplexeste Diagramm. In <code>drawMap()</code> wird jede Provinz und jedes Territorium anhand der gewählten Messgröße, Temperatur oder Niederschlag, für das gewählte Jahr und den gewählten Monat eingefärbt. Hover hebt diese Provinz hervor und ruft <code>updateDataData()</code> auf, um die Legende zu aktualisieren. Der Auszug unten ist <code>drawMap()</code>.</p>
  <p>Die Karte lässt Besuchende eine große Menge kanadischer Wetterdaten durchsuchen und Beobachtungen auf lokaler und bundesweiter Ebene machen.</p>
  <p>TODO(Robert): the one climate data finding to highlight. Do not invent a statistic.</p>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/fea50c19b3bcdff1b1ee446cad3a8028.js"></script>
</section>
<section class="sectionText">
  <h2>Was es heute zeigt</h2>
  <p>Unter der Arbeitsannahme oben besteht die Fähigkeit darin, die Daten aufzubereiten und dann die Interaktion zu gestalten, die eine große Datenmenge lesbar macht.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <p><a href="http://understandingclimatechange.rmichels.com/ccImpacts.html" target="_blank">Projekt ansehen</a></p>
</section>
