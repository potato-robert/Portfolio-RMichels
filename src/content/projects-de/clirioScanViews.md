---
slug: "clirioScanViews"
name:
  en: "Clirio View"
  de: "Clirio View"
projectType:
  en: "Unity App"
  de: "Unity App"
year: "2024"
company: "Clirio"
inDevelopment: false
roles: ["vr", "front-end"]
description:
  en: "Shipped Clirio View scan views across six platforms. I owned the UX and most of the scan-view logic."
  de: "Die Scan-Ansichten von Clirio View wurden auf sechs Plattformen ausgeliefert. Ich verantwortete die UX und den Großteil der Scan-Ansichts-Logik."
links:
  - label: "Clirio View Desktop"
    url: "https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP"
heroAltLayout: false
threeMockup: "hololens"
order: 1
---

<section class="sectionText">
  <h2>Überblick</h2>
  <p>Ich habe die meisten Scan-Ansichten in Clirio View entworfen und umgesetzt, damit man Photogrammetrie-Scans auf einer Karte und in XR laden, messen, vergleichen und inspizieren kann.</p>
  <ul>
    <li><strong>Rolle:</strong> Mixed-Reality-Softwareentwickler. Ich verantwortete die UX und den Großteil der Scan-Ansichts-Logik vom Prototyp bis zur Auslieferung.</li>
    <li><strong>Team:</strong> Robert Michels, mit Beiträgen von Tonio Stillman, Timothy Thibault, Jordan Wischmann und Erdem Gunay. Ein Teil des Verhaltens wurde aus Ada Viewer übernommen.</li>
    <li><strong>Zeitraum:</strong> Mai 2021–März 2024.</li>
    <li><strong>Plattformen:</strong> HoloLens, Quest 2, Apple Vision Pro, iPhone AR, Android AR, Windows UWP.</li>
    <li><strong>Stack:</strong> Unity, C#, .NET, MRTK2 und MRTK3.</li>
    <li><strong>Status:</strong> Ausgeliefert auf HoloLens, Quest 2, Apple Vision Pro, iPhone- und Android-AR sowie Windows UWP. Clirio View Desktop: https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP</li>
  </ul>
</section>
<section class="sectionMedia">
  <div class="auto-resizable-iframe">
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/hdPXCnyH6us?playlist=hdPXCnyH6us&loop=1&autoplay=1&cc_load_policy=1&mute=1&modestbranding=1&rel=0" title="YouTube video player" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
    <figcaption>Quest-Rundgang durch die Scan-Ansichten in Clirio View. Ein Scan öffnet sich auf der Karte, dann misst die Scan-Ansicht ihn und vergleicht ihn mit einem anderen Scan.</figcaption>
  </div>
</section>
<section class="sectionText">
  <h2>Kontext und Problem</h2>
  <p>Clirio View war der Ort, an dem Photogrammetrie-Scans inspiziert wurden, nachdem sie auf LiDAR-fähigen iOS-Geräten erfasst worden waren. Die Ansichten unterstützten die Analyse und Überwachung von Baustellen: Der Vergleich zeigte, was sich geändert hatte, und Messen zeigte den Maßstab. Andere 3D-Modelle, die in <a href="/de/clirioCloud">Clirio Cloud</a> hochgeladen wurden, öffneten sich in denselben Ansichten.</p>
</section>
<section class="sectionText">
  <h2>Meine Rolle und mein Vorgehen</h2>
  <p>Ich habe zuerst UX und UI entworfen, dann in Unity Prototypen erstellt und jede Funktion verfeinert, bis sie ausgeliefert war. Ich habe den Großteil der Logik und der Ansichten in Clirio View eingerichtet, und ein Teil des Verhaltens wurde aus Ada Viewer übernommen.</p>
</section>
<section class="sectionText">
  <h2>Zentrale Arbeit</h2>
  <h3>Scan-Ansicht ohne Karte</h3>
  <p><strong>Problem.</strong> Die erste Anforderung war ein Scan ohne Karte: AR auf der HoloLens 2 und eine 3D-Ansicht ohne AR auf iOS.</p>
  <p><strong>Entscheidung.</strong> Ich habe diese Ansicht als Kern entworfen und den Großteil ihrer Logik eingerichtet, bevor es Kartenwerkzeuge gab.</p>
  <p><strong>Ergebnis.</strong> Die Inspektion auf Headset und iOS teilte eine Ansicht, die spätere Werkzeuge erweitern konnten.</p>
  <h3>Messen und Vergleich</h3>
  <p><strong>Problem.</strong> Die Baustellenüberwachung brauchte einen Weg, Veränderung zu sehen, und einen Weg, den Maßstab abzulesen. Die einfache Scan-Ansicht konnte beides nicht.</p>
  <p><strong>Entscheidung.</strong> Ich habe Vergleich und Messen entworfen und den Großteil der Logik dafür eingerichtet.</p>
  <p><strong>Ergebnis.</strong> Aus der Scan-Ansicht konnte man die Baustelle messen und einen Scan gegen einen anderen prüfen.</p>
  <h3>Auf der Karte und in XR</h3>
  <p><strong>Problem.</strong> Nachdem Messen ausgeliefert war, standen ein verorteter Scan, die XR-Skalierung und der plattformspezifische Vergleich noch aus.</p>
  <p><strong>Entscheidung.</strong> Ich habe die Ansicht auf der Karte entworfen, einschließlich eines Modus, der den Scan als Teil der Karte sichtbar hält, und ich habe den Großteil dieser Logik eingerichtet. In XR skaliert der Scan auf 1 m³, auf 1:1 oder durch Freihandmanipulation. Der Vergleich wuchs auf drei Modi: Seite an Seite, Wischen und Überlagerung. Der Wischvergleich auf iOS beschneidet die Ansichtsfenster. Der Überlagerungsvergleich in XR blendet die Transparenz aus.</p>
  <p><strong>Ergebnis.</strong> Die Ansicht auf der Karte, die XR-Skalierung und die drei Vergleichsmodi wurden ausgeliefert.</p>
</section>
<section class="sectionText mockup hololens">
  <figcaption>HoloLens-2-Scan-Ansicht: die erste Headset-Anforderung, AR ohne Karte.</figcaption>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
      <figure>
        <img src="/assets/img/clirioScanViews/lqip/bridgeMapView.jpg" class="whiteFrame" alt="Desktop-Ansicht eines Photogrammetrie-Scans auf der Karte">
        <figcaption>Desktop-Ansicht auf der Karte. Der Scan liegt auf der Karte, damit eine Baustelle im Kontext gelesen werden kann.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/clirioScanViews/lqip/bridgeScanView.jpg" class="whiteFrame" alt="Desktop-Scan-Ansicht eines Photogrammetrie-Scans">
        <figcaption>Desktop-Scan-Ansicht. Messen und Vergleich liegen in dieser nahen 3D-Inspektionsansicht.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/clirioScanViews/lqip/scanComparison.jpg" lqip-webp class="whiteFrame" alt="Desktop-Scan-Ansicht im Vergleichsmodus">
        <figcaption>Desktop-Vergleichsmodus. Scans zu vergleichen ist die Art, wie die Baustellenüberwachung nach Veränderung sucht.</figcaption>
      </figure>
    </div>
  </figure>
</section>
<section class="sectionText">
  <h2>Plattformübergreifende Herausforderungen</h2>
  <p>Diese Ansichten wurden aus einer Codebasis auf sechs Plattformen ausgeliefert: HoloLens, Quest 2, Apple Vision Pro, iPhone AR, Android AR und Windows UWP. Jede Plattform brachte ihre eigene Eingabe mit. Die Ansichten reagierten auf Handtracking, Controller, Touch und Maus. In XR war das die Freihandmanipulation. Auf iOS und Desktop waren es Touch oder Maus. Die Entwicklungsarbeit bestand darin, ein einziges Verhalten der Scan-Ansicht beizubehalten, während Abläufe, Funktionen und Zustände wuchsen.</p>
  <h3>MRTK2, dann MRTK3</h3>
  <p>Die Komplexität blähte sich in den letzten <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a>-Versionen auf. MRTK2 hatte eine schlechte plattformübergreifende Unterstützung, sodass iOS und die Headsets unterschiedliche Prefabs, UI und Logik nutzten. Ich habe den Großteil der Ansichtslogik innerhalb dieser Trennung eingerichtet. Die Migration zu <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a> kombinierte Ansichtslogik und Prefabs, was die Komplexität erheblich reduzierte.</p>
  <p>TODO(Robert): a quantified Clirio View simplification. The page says the move to MRTK3 greatly reduced complexity and combined view logic and prefabs, and it does not give a count or percentage.</p>
  <h3>Formate, Materialien und Einheiten</h3>
  <p>Dateiformate waren die andere Quelle der Komplexität. Scans und andere 3D-Modelle kamen aus unterschiedlichen Quellen, mit unterschiedlichen Merkmalen, Materialeigenschaften, Texturreferenzformaten, Koordinaten und Einheitensystemen. Ich habe für diese Unterschiede entwickelt und getestet. Modelle, die in Clirio Cloud hochgeladen wurden, durchliefen dieselbe Arbeit wie Scans, die auf iOS erfasst wurden.</p>
  <h3>Gemeinsamer Zustand</h3>
  <p>Wenn zwei Modi dieselbe Aufgabe erfüllten, habe ich das Verhalten vereinheitlicht, sobald Zeit für ein Refactoring war. Das Speichern des Ausgangszustands und das Rücksetzverhalten wurden über Plattformen und Modi hinweg zu einem Pfad. Die Logik für das Betreten und Verlassen von AR in der Scan-Ansicht wurde mit der Logik dafür in der Kartenansicht zusammengeführt, sodass beide Ansichten einen Weg hinein und einen Weg hinaus teilten.</p>
</section>
<section class="sectionText">
  <h2>Ergebnis</h2>
  <p>Ausgeliefert auf HoloLens, Quest 2, Apple Vision Pro, iPhone- und Android-AR sowie Windows UWP. <a href="https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP" target="_blank">Clirio View Desktop</a> ist im Microsoft Store. Diese Ansichten wurden für die Baustellenüberwachung ausgeliefert.</p>
</section>
<section class="sectionText">
  <h2>Reflexion</h2>
  <p>Drei Gewohnheiten aus dieser Arbeit würde ich wiederholen. Ich würde UX und UI weiterhin vor dem Prototyping entwerfen. Ich würde zwei Kopien desselben Verhaltens weiterhin zu einem Pfad zusammenführen. Ich würde Ansichtslogik und Prefabs weiterhin gemeinsam nutzen.</p>
</section>
<section class="sectionText">
  <h2>Mitwirkende und Links</h2>
  <p>Beiträge kamen von <a href="https://www.linkedin.com/in/toniostillman" target="_blank">Tonio Stillman</a>, <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>, <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> und <a href="https://www.linkedin.com/in/merdemgunay" target="_blank">Erdem Gunay</a>. Ich ordne hier keiner von ihnen eine Funktion zu.</p>
  <ul>
    <li><a href="https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP" target="_blank">Clirio View Desktop</a> im Microsoft Store.</li>
    <li>Andere 3D-Modelle werden in <a href="/de/clirioCloud">Clirio Cloud</a> hochgeladen.</li>
    <li>Mixed-Reality-Werkzeuge: <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> und <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a>.</li>
  </ul>
</section>
