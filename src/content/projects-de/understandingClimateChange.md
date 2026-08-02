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
  en: "A website that uses D3.js to visually analyze climate change data. Data visualizations include line charts and stacked area charts of global climate change data, as well as a detailed choropleth map and other visualizations of Canadian weather data."
  de: "Eine Website, die D3.js nutzt, um Klimawandeldaten visuell zu analysieren. Visualisierungen umfassen Linien- und Stacked-Area-Charts globaler Klimadaten sowie eine detaillierte Choropleth-Karte und weitere Darstellungen kanadischer Wetterdaten."
links:
  - label: "View Project"
    url: "http://understandingclimatechange.rmichels.com/ccImpacts.html"
order: 13
---

<section class="sectionText">
    <h2>Die Aufgabe</h2>
    <p>Als Übung interaktiver Datenvisualisierung planten wir, Klimawandeldaten umfassend zu visualisieren. Unser Ziel war, komplexe Datensätze in einfache Diagramme zu verdichten, die Mechanismen, Ursprünge und lokale Auswirkungen des Klimawandels in Kanada vermitteln. Um Nutzer anzusprechen, entwickelten wir einfache Interaktionen wie Pop-up-Tooltips sowie komplexere wie Brushing, Darstellungswechsel und Animation.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart1.jpg" alt="Liniendiagramm globaler CO₂-Emissionen">
      </figure>
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart2.jpg" alt="Liniendiagramm der atmosphärischen CO₂-Konzentration">
      </figure>
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart3.jpg" alt="Stacked-Area-Chart der CO₂-Emissionen nach Region">
      </figure>
    </div>
  </section>
  <section class="sectionText">
    <h2>Das Ergebnis</h2>
    <h3>Klimawandel verstehen</h3>
    <p>Vier farbcodierte Liniendiagramme globaler CO₂-Emissionen und atmosphärischer Konzentration sowie ein Stacked-Area-Chart der CO₂-Emissionen nach Region.</p>
    <h3>Auswirkungen des Klimawandels verstehen</h3>
    <p>Mit der Choropleth-Karte Kanadas und seiner Provinzen und Territorien können Nutzer kanadische Wetterdaten – einschließlich Temperatur und Niederschlag – nach Jahr, Monat und Provinz erkunden. Zusätzlich gibt es ein Spider-Chart der globalen Temperaturanomalie über die Zeit. Beide Diagramme sind dynamisch abfragbar und animierbar.</p>
    <h3>Zusammenfassung der Klimawandelauswirkungen</h3>
    <p>Die Summary-Charts zeigen einen Zusammenhang – oder dessen Fehlen – zwischen CO₂-Emissionen und Wetteranomalien. Vier Liniendiagramme der mittleren kanadischen Wettertemperatur, des Niederschlags und deren Anomalien sind mit einem Liniendiagramm globaler CO₂-Emissionen gruppiert.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure id="chart4">
        <img src="/assets/img/understandingClimateChange/lqip/chart4.jpg" alt="Interaktive Choropleth-Karte kanadischer Wetterdaten">
      </figure>
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart5.jpg" alt="Spider-Chart der globalen Temperaturanomalie">
      </figure>
    </div>
  </section>
  <section class="sectionText">
    <h2>Prozess</h2>
    <p>Wir entwickelten das Projekt zu zweit über zwei Monate hinweg – unsere erste Erfahrung mit D3.js. Früh definierten wir zwei zentrale Fragen, die das Projekt beantworten sollte:</p>
    <ol>
      <li>Was sind die Beitragsfaktoren zum Klimawandel?</li>
      <li>Da der Klimawandel das Wetter beeinflusst: Gibt es Anzeichen dafür, dass sich das kanadische Wetter abnormal verhält?</li>
    </ol>
    <p>Nach der Fragestellung suchten wir relevante Daten. Die meisten mussten von Ausreißern und fehlerhaften Werten bereinigt werden. Am komplexesten war der kanadische Wetterdatensatz: Mehrere große Datensätze mussten manuell zusammengeführt, bereinigt, sortiert und monatliche sowie jährliche Durchschnitte berechnet werden.</p>
    <p>In der finalen Phase entwickelten wir die D3.js-gesteuerten Visualisierungen und bauten die Website, die zugleich als Projektbericht dient. Die meisten Diagramme – einschließlich Linien- und Stacked-Area-Charts – waren relativ unkompliziert. Mit Abstand am komplexesten war die Choropleth-Karte kanadischer Wetterdaten. Die visuelle Zuordnung von Daten zu Geografie und Farbe war anspruchsvoll, das Ergebnis lohnte sich: Die Karte bietet eine ansprechende, interaktive Möglichkeit, einen großen Wetterdatensatz schnell zu durchsuchen und lokale sowie bundesweite Beobachtungen zu machen.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart6.jpg" alt="Korrelationsdiagramm von CO₂-Emissionen und Wetteranomalien in Kanada">
      </figure>
    </div>
  </section>
  <section class="sectionText">
    <h2>Der Code</h2>
    <p>Das Projekt ist in HTML, CSS und JS entwickelt; für die Visualisierungen nutzen wir die datengetriebene Bibliothek <a href="https://d3js.org/" target="_blank">D3.js</a>. Die Umsetzung aller Visualisierungen war anspruchsvoll, da D3 für uns neu war – besonders die Ketten-Syntax war anfangs umständlich. Der allgemeine Workflow lädt Daten, wählt DOM-Elemente aus und fügt SVG-Elemente mit bestimmten, an die Daten gebundenen Attributen ein. Im Auszug unten wird das <a href="#chart4">kanadische Wetterdaten-Diagramm</a> in <code>drawMap()</code> gerendert; die Farbe jeder Provinz wird Temperatur- oder Niederschlagsdaten je nach Nutzereingabe zugeordnet. Der Auszug enthält ab Zeile 58 auch Hover-Interaktionen für einzelne Provinzen: Die Provinz wird hervorgehoben und die Legende über <code>updateDataData()</code> aktualisiert (im Beispiel nicht gezeigt).</p>
  </section>
  <section class="sectionMedia">
    <script src="https://gist.github.com/potato-robert/fea50c19b3bcdff1b1ee446cad3a8028.js"></script>
  </section>
