---
slug: "clirioScanViews"
name:
  en: "Clirio Scan Views"
  de: "Clirio Scan Views"
projectType:
  en: "Unity App Features"
  de: "Unity App Features"
year: "2024"
company: "Clirio"
inDevelopment: false
roles: ["vr", "front-end"]
description:
  en: "A collection of features in the Clirio View apps for loading and viewing photogrammetry scans. Includes on-map, XR, comparison, and other views."
  de: "Eine Sammlung von Funktionen in den Clirio View Apps zum Laden und Anzeigen von Photogrammetrie-Scans. Enthält Karten-, XR-, Vergleichs- und andere Ansichten."
links:
  - label: "Clirio View Desktop"
    url: "https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP"
heroAltLayout: false
threeMockup: "hololens"
order: 1
---

<section class="sectionText">
    <h2>Übersicht</h2>
    <p>Eine der wichtigsten Funktionen der Clirio-Produktsuite ist die Möglichkeit, photogrammetrische Scans mit LiDAR-fähigen iOS-Geräten zu erfassen und diese Scans anschließend zu verwalten und anzuzeigen. Erfasste Scans können auf der Karte angezeigt werden, sie können immer als integraler Bestandteil der Karte angezeigt werden, oder sie können im Scan-Ansichtsmodus angezeigt werden, der je nach Plattform über Mess-, Vergleichs- und XR-Funktionen verfügt. In der XR-Ansicht kann der Scan skaliert werden auf  1m³ oder im Maßstab 1:1, oder frei mit der Hand manipuliert werden. Auf iOS und Desktop wird die Ansicht durch Touch- oder Mauseingaben gesteuert. Vergleichsansichten bieten die Modi Seite-an-Seite, Streichen und Überlagern. Neben Scans, die mit Clirio Scan erfasst wurden, werden auch andere 3D-Modelle unterstützt und können hochgeladen werden in die <a href="/de/clirioCloud">Clirio Cloud</a>.</p>
  </section>
  <section class="sectionText mockup hololens"><figcaption>Scan View (HoloLens 2)</figcaption></section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
        <figure>
        <img src="/assets/img/clirioScanViews/lqip/bridgeMapView.jpg" class="whiteFrame" class="whiteFrame" alt="Auf der Karte Ansicht (Desktop)">
          <figcaption>Auf der Karte Ansicht (Desktop)</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/clirioScanViews/lqip/bridgeScanView.jpg" class="whiteFrame" class="whiteFrame" alt="Scan View (Desktop)">
          <figcaption>Scan View (Desktop)</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/clirioScanViews/lqip/scanComparison.jpg" lqip-webp class="whiteFrame" lqip-webp class="whiteFrame" alt="Scan View Vergleichsmodus (Desktop)">
          <figcaption>Scan View Vergleichsmodus (Desktop)</figcaption>
        </figure>
      </div>
    </figure>
  </section>
  <section class="sectionText">
    <h2>Entwicklung</h2>
    <p>An den Scanansichten wurde von 2021 bis 2023 kontinuierlich gearbeitet. In diesem Zeitraum war ich für die Einrichtung der meisten Logiken und Ansichten verantwortlich. Zu meinem Arbeitsablauf gehörte das Entwerfen von UX und UI und dann das schnelle Prototyping und die Verfeinerung, bis jede Funktion für die Veröffentlichung bereit war. Meine Teamkollegen <a href="https://www.linkedin.com/in/toniostillman" target="_blank">Tonio Stillman</a>, <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>, <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> und <a href="https://www.linkedin.com/in/merdemgunay" target="_blank">Erdem Gunay</a> leisteten ebenfalls Beiträge. Einige Funktionen wurden auch von der Ada-Viewer-App übernommen, auf der die Clirio-View-App basiert.</p>
    <p>Die ersten Anforderungen waren das Laden und Betrachten von Scans in einem Scan-Ansichtsmodus (keine Karte), der in AR auf der HoloLens 2 und in 3D-Non-AR auf iOS unterstützt werden sollte. Nachdem diese Kernfunktionalitäten implementiert worden waren, war eine der wichtigsten Ergänzungen der Vergleichs- und Messmodus. Ein wichtiger Arbeitsablauf, der von den Clirio View-Apps unterstützt wird, ist die Analyse und Überwachung von Baustellen, bei denen Scan-Vergleiche helfen, Unterschiede zu erkennen, und Scan-Messungen helfen, den Maßstab zu verstehen.</p>
    <p>Später kamen weitere Funktionen hinzu, z. B. die Anzeige von Scans auf der Karte, weitere Anzeigewerkzeuge wie die Freihandmanipulation in XR und weitere Vergleichsmodi wie der Überlagerungsmodus, mit dem die Transparenzen in XR ausgeblendet werden, und die Swipe-Vergleichsansicht in iOS, die die Ansichtsfenster beschneidet.</p>
  </section>
  <section class="sectionMedia">
    <div class="auto-resizable-iframe">
      <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/hdPXCnyH6us?playlist=hdPXCnyH6us&loop=1&autoplay=1&cc_load_policy=1&mute=1&modestbranding=1&rel=0" title="YouTube video player" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
      <figcaption>Ein Überblick über die verschiedenen Scanansichten in der Clirio View Meta Quest VR-App. Ein Scan wird zunächst auf der Karte geöffnet, dann wird die Scanansicht aufgerufen, in der der Scan aus verschiedenen Blickwinkeln betrachtet, gemessen und mit einem anderen Scan verglichen wird.</figcaption>
    </div>
  </section>
  <section class="sectionText">
    <h2>Herausforderungen</h2>
    <p>Eine der größten Herausforderungen war die Komplexität, die sich aus den verschiedenen UX-Flows, Plattformen, Funktionen und Zuständen ergab, die im Laufe der Zeit langsam erweitert wurden. Besonders in den letzten <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> Versionen der Clirio View-Apps hatte die Komplexität stark zugenommen, da MRTK2 nur unzureichend plattformübergreifende Unterstützung bot, was zu unterschiedlichen Prefabs, UI und Logik für iOS und HMDs führte.</p>
    <p>Eine weitere Ebene der Komplexität waren die verschiedenen Dateiformate, Funktionen und Quellen für 3D-Modelle. Insbesondere die verschiedenen Materialeigenschaften, Texturreferenzformate, Koordinaten- und Einheitensysteme waren schwierig zu entwickeln und zu testen.</p>
    <p>Die Lösungen für diese Komplexitätsherausforderungen bestanden in der Regel in der Vereinheitlichung von Verhaltensweisen, sobald Ähnlichkeiten identifiziert worden waren und Zeit für ein Refactoring zur Verfügung stand. So wurden beispielsweise das Speichern des Ausgangszustands und das Rücksetzverhalten plattform- und modusübergreifend vereinheitlicht, und die Logik für das Ein- und Ausschalten von AR in der Scanansicht wurde mit der Logik für dasselbe in der Kartenansicht kombiniert. Außerdem wurde mit der Migration zu <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a> Ansichtslogik und Prefabs kombiniert, was die Komplexität erheblich reduzierte.</p>
  </section>
