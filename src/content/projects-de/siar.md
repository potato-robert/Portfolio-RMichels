---
slug: "siar"
name:
  en: "Semester in Alternate Realities"
  de: "Semester in Alternate Realities"
projectType:
  en: "VR Game"
  de: "VR-Spiel"
year: "2019"
inDevelopment: false
roles: ["vr", "game", "pm", "design"]
description:
  en: "I was the sole Unity developer on FIT4U, a live VR privacy performance, and I co-built Rising Waters."
  de: "Ich war der einzige Unity-Entwickler bei FIT4U, einer Live-VR-Performance zum Thema Privatsphäre, und habe Rising Waters mitgebaut."
order: 7
---

<section class="sectionText">
  <h2>Kurzüberblick</h2>
  <p>Ich war der einzige Unity-Entwickler bei FIT4U, einer Live-VR-Performance zum Thema Privatsphäre, und habe Rising Waters mitgebaut, einen Walkthrough durch ein überflutetes Richmond.</p>
  <p>Studienprojekt, SIAT, 2019.</p>
  <ul>
    <li><strong>Rolle:</strong> FIT4U: einziger C#- und Unity-Entwickler, Operator des Live-Backends und eine untergeordnete Rolle im Konzept. Rising Waters: Konzept, Walkthrough-Bewegung in Unity und die meisten Blender-Modelle. Der Code von Rising Waters wurde mit Vlad Ryzhov aufgeteilt.</li>
    <li><strong>Team:</strong> Kurs Semester in Alternate Realities an der SFU. Professoren Bernhard Riecke und Patrick Pennefather. Die Entwicklung von Rising Waters wurde mit Vlad Ryzhov aufgeteilt.</li>
    <li><strong>Zeitraum:</strong> 2019, Semester in Alternate Realities, SFU.</li>
    <li><strong>Plattformen:</strong> FIT4U auf der Oculus Rift. Rising Waters auf der Oculus Go.</li>
    <li><strong>Stack:</strong> Unity, C#, Blender und das Paket Hermite Spline Controller.</li>
    <li><strong>Status:</strong> Kursseite: http://ispace.iat.sfu.ca/riecke/teaching/siar. Ein eigenständiger FIT4U-Build wurde auf itch.io veröffentlicht.</li>
  </ul>
  <p>TODO(Robert): SIAR teammate names besides Vlad Ryzhov.</p>
</section>
<section class="sectionMedia">
  <div class="auto-resizable-iframe">
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/SX7YzMAc1OE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <figcaption>Showcase-Aufnahmen von FIT4U: Die Fitness-Session schlug in ein personalisiertes Datenleck um.</figcaption>
  </div>
</section>
<section class="sectionText">
  <h2>Konzept</h2>
  <p>FIT4U war eine Oculus-Rift-Performance in einem Kurs über VR für positiven Impact. Sie begann als ruhige Fitness-Session und inszenierte dann ein dramatisiertes Datenleck aus Daten, die der Besucher eingegeben hatte, und aus zuvor gefundenen öffentlichen Daten, mit der Wahl, diese Daten zu löschen oder in einen Raum voller zielgerichteter Anzeigen zurückzukehren. Rising Waters war ein 3DOF-Walkthrough auf der Oculus Go durch ein überflutetes Richmond: Bildschirme zum Thema Erwärmung, dann eine Vermessungsdrohne durch vorstädtische Gebiete und unter dem SkyTrain zu einem Radio auf einem Dach.</p>
</section>
<section class="sectionText">
  <h2>Was ich gebaut habe</h2>
  <ul>
    <li>FIT4U: der Unity-Build und ein Live-Backend, das öffentliche Informationen in eine Operator-UI einspeiste, die der Besucher nicht sehen konnte.</li>
    <li>Rising Waters: Pausieren und Fortsetzen entlang einer Strecke mit dem <a href="https://wiki.unity3d.com/index.php/Hermite_Spline_Controller#Description" target="_blank">Hermite Spline Controller</a> (<code>GetHermiteInternal()</code> und <code>GetSquad()</code>) sowie die meisten Blender-Modelle (Gebäude, der SkyTrain und Richmond-Banner).</li>
  </ul>
</section>
<section class="sectionText">
  <h2>FIT4U</h2>
  <p>Ein kleineres Team entwickelte die Idee, und der Kurs stellte sie fertig. Ein Teammitglied spielte die Yoga-Lehrkraft, und der Showcase-Build wurde von Hand betrieben.</p>
  <p>Ich habe ein Mehrkamera-Setup nachgewiesen: Spielerkameras renderten auf das Headset, und eine zweite UI-Kamera renderte auf einen Operator-Bildschirm, sodass ich während der Session Daten eingeben konnte. Ich ergänzte eine temporäre Nutzerdatenbank, eine UI, die Eingaben speicherte, und eine Coroutine, die das Datenleck sequenzierte.</p>
  <p><code>Ads.cs</code> füllte den Raum mit generischen und zielgerichteten Anzeigen, wenn der Besucher die Daten behielt.</p>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/ecd16b13e1952fa3818c55f6d93eb5c5.js"></script>
</section>
<section class="sectionText">
  <h2>Was es heute zeigt</h2>
  <p>Es zeigt, dass ich live Unity-XR bauen kann: eine Headset-Ansicht und eine Operator-Ansicht.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <p>Ich danke Bernhard Riecke und Patrick Pennefather.</p>
  <p><a href="http://ispace.iat.sfu.ca/riecke/teaching/siar" target="_blank" title="iSpace Lab: Semester in Alternate Realities">Kursseite</a>.</p>
</section>
