---
slug: "chromakeyAndColorMatching"
name:
  en: "Chromakey & Color Matching"
  de: "Chromakey & Color Matching"
format: desktop-app
year: "2018"
context: coursework
inDevelopment: false
stack: ["java"]
description:
  en: "A digital image compositing process. Automatically creates high-quality composites. Advantages include the ability to deal with any foreground color, preventing color spill and color grading the subject to match the background."
  de: "Ein digitales Bild-Compositing-Verfahren. Erstellt automatisch hochwertige Composites. Vorteile: beliebige Vordergrundfarben, Unterdrückung von Color Spill und Farbanpassung des Motivs an den Hintergrund."
links:
  - label: "Download app"
    url: "/assets/other/ChromakeyAndColorMatching.exe"
order: 10
---

<section class="sectionText">
    <h2>Die Aufgabe</h2>
    <p>Ziel dieses Projekts war es, computergestützte Signalverarbeitungstechniken für digitale Medien zu üben. Wir recherchierten experimentelle Bildverarbeitungstechniken und entschieden uns, zwei Verfahren zu kombinieren, die sich unserer Meinung nach gut ergänzen. Das erste ist ein fortgeschrittener Chroma Key, der Color Spill neutralisiert und alle möglichen Vordergrundfarben unterstützt. Das zweite überträgt Farbcharakteristika von einem Bild auf ein anderes. Die Idee war, durch die Kombination dieser beiden Techniken einen sehr effektiven Prozess zu schaffen, der hochwertige Bild-Composites erzeugt, bei denen das Motiv sich nicht merklich vom Hintergrund unterscheidet.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn"><div class="mediaRow">
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/1.jpg" alt="Compositing-Schritt 1: Vordergrund mit grünem und magentafarbenem Hintergrund">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/2.jpg" alt="Compositing-Schritt 2: Erzeugte Matte aus dem Vordergrund">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/3.jpg" alt="Compositing-Schritt 3: Ausgewählter Hintergrund">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/4.jpg" alt="Compositing-Schritt 4: Farbübertragung vom Hintergrund auf das Motiv">
      </figure>
    </div>
    <div class="mediaRow">
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/5.jpg" alt="Compositing-Schritt 5: Anpassung von Helligkeit und Kantenunschärfe">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/6.jpg" alt="Compositing-Schritt 6: Zwischenergebnis der Bildverarbeitung">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/7.jpg" alt="Compositing-Schritt 7: Verfeinerung des Composites">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/8.jpg" alt="Compositing-Schritt 8: Finales Composite-Bild">
      </figure>
    </div></div>
  </section>
  <section class="sectionText">
    <h2>Das Ergebnis</h2>
    <p>Unsere Oberfläche ermöglicht es Nutzern, ein Vordergrundbild mit grünem und magentafarbenem Hintergrund auszuwählen und eine Matte zu erzeugen. Gleichzeitig kann der Nutzer das Hintergrundbild wählen, auf dem das Vordergrundbild erscheinen soll. Die Farbübertragung des Hintergrundbilds wirkt auf das Vordergrundbild und wendet dessen Charakteristika mit einem festen Wert an. Anschließend kann der Nutzer die Intensität der Farbübertragung, der Helligkeitsübertragung und die Unschärfe der Vordergrund-Mattenkanten steuern, um ein glaubwürdigeres Composite zu erzeugen. Außerdem können alle Zwischenbilder des Prozesses bis zum finalen Ergebnis eingesehen werden. Schließlich kann das erstellte Bild über eine Speichern-Schaltfläche am unteren Rand des Hauptbildschirms gespeichert werden.</p>
    <p>Der erste Schritt basiert auf dem Paper <cite>Color invariant chroma keying and color spill neutralization for dynamic scenes and cameras</cite> (Grundhöfer, Kurz, Thiele, & Bimber, 2010). Dieses Verfahren nutzt geschickt zwei komplementäre Hintergrundfarben wie Grün und Magenta, um A) beliebige Farben im Vordergrund zu ermöglichen und B) Color Spill automatisch zu unterdrücken. A) wird erreicht, indem das Maximum der beiden Mattes aus einem einfachen Chromakey mit jeder Hintergrundfarbe gebildet wird. B) wird erreicht, indem die beiden Bilder mit komplementären Hintergrundfarben gemischt werden, sodass das auf das Motiv fallende Licht in Grautöne neutralisiert wird, statt grün oder magenta zu erscheinen.</p>
    <p>Der zweite Schritt ist nicht speziell für Composites gedacht, erwies sich aber als sehr nützlich. Das in <cite>Color transfer between images</cite> (Reinhard, Adhikhmin, Gooch, & Shirley, 2001) beschriebene Verfahren analysiert die Farbcharakteristika eines Quellbilds, indem Mittelwert und Standardabweichung jedes Farbkanals berechnet werden. Diese Charakteristika werden dann auf die Farbverteilung des Zielbilds angewendet. Damit das funktioniert, müssen die Bilder in den lαβ-Farbraum konvertiert werden, der das menschliche visuelle System stark berücksichtigt und die Korrelation zwischen Kanälen für die meisten natürlichen Szenen minimiert.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure class="wide">
        <img src="/assets/img/chromakeyAndColorMatching/lqip/overview.jpg" alt="Übersicht des gesamten Chromakey- und Color-Matching-Prozesses">
        <figcaption>Übersicht des gesamten Prozesses mit klarer Unterscheidung der beiden implementierten Techniken und zusätzlicher Bildverarbeitung.</figcaption>
      </figure>
    </div>
    <div class="auto-resizable-iframe">
      <div>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/6KXxwxTnbgM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
      <figcaption>App-Demo, Code-Walkthrough und Erklärung der Theorie hinter dem Verfahren.</figcaption>
    </div>
  </section>
  <section class="sectionText">
    <h2>Literatur</h2>
    <div class="references">
    <p>Grundhöfer, A., Kurz, D., Thiele, S., &amp; Bimber, O. (2010). <a href="https://link.springer.com/article/10.1007/s00371-010-0464-8" target="_blank" title="Springer Link: Color invariant chroma keying and color spill neutralization for dynamic scenes and cameras"><cite>Color invariant chroma keying and color spill neutralization for dynamic scenes and cameras.</cite></a> The Visual Computer, 26(9), 1167-1176. doi:10.1007/s00371-010-0464-8</p>
    <p>Reinhard, E., Adhikhmin, M., Gooch, B., &amp; Shirley, P. (2001). <a href="https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf" target="_blank" title="IEEE PDF: Color transfer between images"><cite>Color transfer between images.</cite></a> IEEE Computer Graphics and Applications, 21(4), 34-41. doi:10.1109/38.946629</p>
    </div>
  </section>
