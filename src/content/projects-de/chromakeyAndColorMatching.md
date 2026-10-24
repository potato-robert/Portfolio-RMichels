---
slug: "chromakeyAndColorMatching"
name:
  en: "Chromakey & Color Matching"
  de: "Chromakey & Color Matching"
projectType:
  en: "Java App"
  de: "Java App"
year: "2018"
inDevelopment: false
roles: ["java-dev", "design"]
description:
  en: "Java compositor that keys a subject without color spill, then matches its color to the new background."
  de: "Java-Compositor, der ein Motiv ohne Color Spill freistellt und seine Farbe anschließend an den neuen Hintergrund anpasst."
links:
  - label: "Download app"
    url: "/assets/other/ChromakeyAndColorMatching.exe"
order: 11
---

<section class="sectionText">
  <h2>Überblick</h2>
  <p>Ich habe einen Java-Compositor implementiert, der ein Motiv von komplementären Hintergründen ohne Color Spill freistellt und die Motivfarbe anschließend an den neuen Hintergrund anpasst.</p>
  <p>Studienprojekt, SIAT, 2018.</p>
  <ul>
    <li><strong>Rolle:</strong> Implementierung der Algorithmen und der Java-Anwendung.</li>
    <li><strong>Team:</strong> Kursteam. Größe und Namen stehen nicht auf der Seite.</li>
    <li><strong>Zeitraum:</strong> 2018.</li>
    <li><strong>Plattformen:</strong> Windows-Desktop.</li>
    <li><strong>Stack:</strong> Java. Farbinvarianter Chroma Key (Grundhöfer, Kurz, Thiele und Bimber, 2010) und Farbübertragung in lαβ (Reinhard, Adhikhmin, Gooch und Shirley, 2001).</li>
    <li><strong>Status:</strong> Download: /assets/other/ChromakeyAndColorMatching.exe</li>
  </ul>
  <p>TODO(Robert): Chromakey teammate names, and any limitations beyond the dual-background key and the lαβ transfer already described on the page.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure class="wide">
      <img src="/assets/img/chromakeyAndColorMatching/lqip/overview.jpg" alt="Eine Übersicht des gesamten Prozesses, mit klarer Unterscheidung der beiden implementierten Techniken und zusätzlicher Verarbeitung der Bilder.">
      <figcaption>Das Diagramm zeigt, wie Chroma Key mit zwei Hintergründen und Farbübertragung in lαβ zusammenwirken, sodass das Motiv ohne Color Spill freigestellt und an den neuen Hintergrund angepasst wird.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <p>TODO(Robert): which chromakey images 1.jpg through 8.jpg are the before and after pair, if a pair should be shown besides overview.jpg.</p>
</section>
<section class="sectionText">
  <h2>Konzept</h2>
  <p>Das war eine Signalverarbeitungsübung von 2018: ein Java-Compositor für zwei Bildtechniken. Ein farbinvarianter Chroma Key behielt jede Vordergrundfarbe und neutralisierte den Color Spill, danach passte eine Farbübertragung das Motiv an den neuen Hintergrund an.</p>
</section>
<section class="sectionText">
  <h2>Was ich gebaut habe</h2>
  <ul>
    <li>Ich habe beide Algorithmen und die Java-Anwendung für den Windows-Desktop implementiert.</li>
    <li>Nutzer wählen den Vordergrund und den neuen Hintergrund und stellen dann die Intensität der Farbübertragung, die Helligkeitsübertragung und die Unschärfe der Mattenkante ein.</li>
    <li>Nutzer können Zwischenbilder einsehen und das Composite speichern.</li>
  </ul>
</section>
<section class="sectionText">
  <h2>Vorher und nachher</h2>
  <p>Der Key folgte Grundhöfer, Kurz, Thiele und Bimber (2010). Die App erwartet einen Vordergrund, der sowohl auf Grün als auch auf Magenta fotografiert wurde. Jede Vordergrundfarbe ist das Maximum der beiden einfachen Matten. Spill wird neutralisiert, indem die komplementären Aufnahmen zu grauem Spill gemischt werden.</p>
  <p>Die Farbübertragung folgte Reinhard, Adhikhmin, Gooch und Shirley (2001). Sie wendet Mittelwert und Standardabweichung je Kanal des Quellbilds in lαβ an, dem Farbraum, den das Paper verwendet, weil er zum menschlichen visuellen System passt und natürliche Szenen dekorreliert.</p>
</section>
<section class="sectionMedia">
  <div class="auto-resizable-iframe">
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/6KXxwxTnbgM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <figcaption>App-Demo, Code-Walkthrough und Erklärung der Theorie hinter dem Chroma Key mit zwei Hintergründen und der Farbübertragung in lαβ.</figcaption>
  </div>
</section>
<section class="sectionText">
  <h2>Was es heute zeigt</h2>
  <p>Es zeigt Design-Engineering-Arbeit: eine visuelle Methode plus Steuerung, damit das Ergebnis beurteilt werden kann.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <ul>
    <li><a href="/assets/other/ChromakeyAndColorMatching.exe">Windows-App herunterladen</a></li>
    <li><a href="https://link.springer.com/article/10.1007/s00371-010-0464-8" target="_blank"><cite>Color invariant chroma keying and color spill neutralization for dynamic scenes and cameras</cite></a> (2010).</li>
    <li><a href="https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf" target="_blank"><cite>Color transfer between images</cite></a> (2001).</li>
  </ul>
</section>
