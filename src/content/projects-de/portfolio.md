---
slug: "portfolio"
name:
  en: "Portfolio Website"
  de: "Portfolio Website"
projectType:
  en: "Static Website"
  de: "Statische Website"
year: "2020"
inDevelopment: false
roles: ["front-end", "back-end", "threejs", "design"]
description:
  en: "Bilingual site live at rmichels.com, from Figma through an Astro migration. I designed and built it solo."
  de: "Zweisprachige Website live auf rmichels.com, von Figma über die Astro-Migration. Ich habe sie allein entworfen und gebaut."
links:
  - label: "GitHub"
    url: "https://github.com/potato-robert/Portfolio-RMichels"
heroAltLayout: false
order: 6
---

<section class="sectionText">
  <h2>Überblick</h2>
  <p>Ich habe dieses Portfolio als zweisprachige statische Website entworfen und gebaut, von Figma über eine Astro-Migration, 3D und kontinuierliches Deployment.</p>
  <ul>
    <li><strong>Rolle:</strong> Alleiniger Designer und Entwickler.</li>
    <li><strong>Team:</strong> Allein.</li>
    <li><strong>Zeitraum:</strong> 2020–heute. Die Entwicklung begann 2020 auf einem LAMP-Stack und wechselte später zu Astro.</li>
    <li><strong>Plattformen:</strong> Web (https://rmichels.com).</li>
    <li><strong>Stack:</strong> Figma, Astro, TypeScript-Islands, Sass, Three.js und Markdown-Content-Collections. Die frühere Website war LAMP. Die Porträt-Pipeline ist RealityCapture und Blender. GitHub Actions baut die Website und deployt sie. Die Website setzt keine Cookies und nutzt cookieless Analytics mit Opt-out.</li>
    <li><strong>Status:</strong> Live unter https://rmichels.com. Quellcode: https://github.com/potato-robert/Portfolio-RMichels</li>
  </ul>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/portfolio/modelProcess.webp" alt="Screenshot aus Blender, in dem ich die Photogrammetrie-Aufnahme von mir bereinigt habe, die mit RealityCapture erstellt wurde.">
      <figcaption class="center">Ich habe diese Photogrammetrie-Aufnahme von mir in Blender bereinigt, nachdem ich sie in RealityCapture erstellt hatte. Der Screenshot ist die Porträt-Pipeline für das 3D auf dieser Website.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h2>Kontext und Problem</h2>
  <p>Diese Website ist für Arbeitgeber und Partner, die einen direkten Blick auf meine Fähigkeiten, meine Erfahrung und meine Interessen wollen. Eine Bewerbung macht dieses Publikum konkret: Der Link soll die Projekte öffnen, die zur Rolle passen, und dafür ist der Filter auf der Startseite da. Die Website hat einen zweiten Zweck. Ich übe Full-Stack- und Static-Site-Entwicklung auf denselben Seiten, auf denen ich die Arbeit zeige, ich teile diese Arbeit mit Design- und Entwickler-Communities, und ich probiere Technologien und Ideen aus, die mich interessieren.</p>
</section>
<section class="sectionText">
  <h2>Meine Rolle und mein Vorgehen</h2>
  <p>Ich bin der einzige Designer und der einzige Entwickler. Die Entwicklung begann 2020, und seitdem behandle ich Design und Umsetzung als eine Aufgabe. Bevor ich die Website gebaut habe, habe ich im Web nach Portfolios gesucht, eine Linksammlung gespeichert und daraus ein Moodboard gemacht. Die Seiten habe ich in Figma anhand dieses Moodboards entworfen. Das Embed darunter ist diese Datei, und sie bleibt die Design-Dokumentation.</p>
  <p>Ich verbinde dieses Design mit der Entwicklung, indem ich das Content-Modell, den Startseiten-Filter für Bewerbungslinks und das Deployment verantworte. Derselbe Build liefert Englisch und Deutsch aus.</p>
</section>
<div class="auto-resizable-iframe">
  <div>
    <iframe
      height="450"
      width="800"
      src="https://www.figma.com/embed?embed_host=astra&url=https://www.figma.com/file/xPdNmMgz0wm4pf0wcf1j8C/Portfolio?type=design&node-id=1%3A951&t=QGxHsmY0wqgq1XLX-1"
      allowfullscreen
    >
    </iframe>
  </div>
</div>
<section class="sectionText">
  <h2>Zentrale Arbeit</h2>
  <h3>Von LAMP zu einem statischen Build</h3>
  <p><strong>Problem.</strong> Die erste Version lief auf einem LAMP-Stack, mit den Portfolio-Daten in einer Datenbank. Ich brauchte schnellere Ladezeiten und einen einfacheren Weg zum Deployment.</p>
  <p><strong>Entscheidung.</strong> Ich habe die Website zu Astro migriert und baue sie als statische Dateien. Sass übernimmt die Styles. Das Client-Verhalten, einschließlich Three.js, liegt in TypeScript-Islands.</p>
  <p><strong>Ergebnis.</strong> Die Website hat jetzt die schnelleren Ladezeiten und das einfachere Deployment, wofür die Migration da war. Das Diagramm darunter ist das historische Entity-Relationship-Diagramm der Datenbank vor Astro. Ich habe es behalten, damit das LAMP-Modell sichtbar bleibt.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/portfolio/erDiagram.webp" alt="Historisches ER-Diagramm der Portfolio-Datenbank (LAMP-Stack vor Astro).">
      <figcaption class="center">Dieses Entity-Relationship-Diagramm ist die Portfolio-Datenbank der LAMP-Website vor Astro. Ich lasse es hier als Beleg dieses früheren Modells.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h3>Markdown-Case-Studies und Bewerbungslinks</h3>
  <p><strong>Problem.</strong> Die Case Studies mussten organisiert und unter Versionskontrolle bleiben, und eine Bewerbung brauchte einen Link zu den Projekten, die zur Rolle passen.</p>
  <p><strong>Entscheidung.</strong> Projektmetadaten liegen in Markdown-Content-Collections, sodass jede Case Study eine Datei im Repository ist. Der Filter auf der Startseite unterstützt weiterhin einen individuellen Link für Bewerbungen. VR-Arbeiten öffnen unter <a href="https://rmichels.com/?filter=vr">https://rmichels.com/?filter=vr</a> und zeigen nur VR-Projekte.</p>
  <p><strong>Ergebnis.</strong> Eine Case Study hinzuzufügen oder zu überarbeiten ist eine Inhaltsänderung, die ich committen kann, und ich kann eine gefilterte Startseite schicken, wenn ich mich bewerbe.</p>
  <h3>Ein Photogrammetrie-Porträt</h3>
  <p><strong>Problem.</strong> Das 3D auf der Website brauchte ein Porträt von mir, aufgebaut aus einer Aufnahme, die ich erstellt und danach bereinigt habe.</p>
  <p><strong>Entscheidung.</strong> Ich habe mich per Photogrammetrie in RealityCapture aufgenommen und das Modell danach in Blender bereinigt.</p>
  <p><strong>Ergebnis.</strong> RealityCapture und Blender sind die Porträt-Pipeline. Der Screenshot oben auf dieser Seite ist diese Bereinigung in Blender.</p>
</section>
<section class="sectionText">
  <h2>So ist es gebaut</h2>
  <p>Besucher sehen die Astro-Seiten und das Porträt. Routing, Tests und Datenschutz halten die Website funktionsfähig, auf dem statischen Build, mit Three.js-Islands als Client-Schicht.</p>
  <h3>Zweisprachige Routen</h3>
  <p>Das Portfolio ist zweisprachig. Ich liefere Englisch unter <code>/</code> und Deutsch unter <code>/de/</code> von derselben Astro-Website aus. Ein Leser wechselt die Sprache über die Route. GitHub Actions deployt diese eine Website, wobei die Sprachtrennung über das Routing läuft.</p>
  <h3>Tests und Deployment</h3>
  <p>Content-Tests und Unit-Tests liegen beim Projekt. GitHub Actions baut die Website und deployt sie. Wenn ich eine Case Study, einen Style oder eine Client-Island ändere, veröffentlicht diese Schleife das Update, sodass Repository und Live-Website übereinstimmen.</p>
  <h3>Keine Cookies</h3>
  <p>Die Website setzt keine Cookies. Ich nutze cookieless Analytics, und ein Besucher kann auf der Datenschutzerklärung widersprechen.</p>
</section>
<section class="sectionText">
  <h2>Ergebnis</h2>
  <p>Das Portfolio ist live unter <a href="https://rmichels.com">https://rmichels.com</a>, und der Quellcode ist <a href="https://github.com/potato-robert/Portfolio-RMichels">https://github.com/potato-robert/Portfolio-RMichels</a>. Englisch und Deutsch sind beide auf dieser Website. Der Filter auf der Startseite ist weiterhin der Link, den ich für Bewerbungen nutze, und GitHub Actions baut das Repository und deployt es. Arbeitgeber und Partner können die Arbeit lesen, eine rollenspezifische Ansicht wie den VR-Filter öffnen und eine Website sehen, die ich von der Figma-Datei bis zum statischen Deployment entwerfe und ausliefere.</p>
</section>
<section class="sectionText">
  <h2>Reflexion</h2>
  <p>Der Wechsel weg von LAMP ist die Entscheidung, die ich wiederholen würde. Ein statischer Astro-Build gibt dieser Content-Website schnellere Ladezeiten und ein einfacheres Deployment, und dieser Tausch passt weiterhin.</p>
  <p>Design und Entwicklung bleiben eine Praxis. Das Moodboard, die Figma-Datei, die Markdown-Case-Studies und das Porträt von RealityCapture zu Blender sind eine Arbeitslinie. Ich zeige, wie ich baue, indem ich es auf den Seiten tue, die Menschen gerade lesen.</p>
  <p>Ich werde weiter Arbeit in dieser Form hinzufügen. Eine Case Study kommt als Markdown hinein, ein Bewerbungslink kann nach Rolle filtern, Content-Tests und Unit-Tests bleiben bei GitHub Actions, und die Website setzt weiterhin keine Cookies.</p>
</section>
<section class="sectionText">
  <h2>Credits und Links</h2>
  <p>Ich habe dieses Portfolio allein entworfen und gebaut. Das Figma-Embed oben ist die Design-Datei. Der Blender-Screenshot und das Entity-Relationship-Diagramm sind die Prozessbilder.</p>
  <ul>
    <li>Live-Website: <a href="https://rmichels.com">https://rmichels.com</a></li>
    <li>Quellcode: <a href="https://github.com/potato-robert/Portfolio-RMichels">https://github.com/potato-robert/Portfolio-RMichels</a></li>
    <li>Design-Datei: <a href="https://www.figma.com/file/xPdNmMgz0wm4pf0wcf1j8C/Portfolio">https://www.figma.com/file/xPdNmMgz0wm4pf0wcf1j8C/Portfolio</a></li>
    <li>Beispiel für den VR-Filter: <a href="https://rmichels.com/?filter=vr">https://rmichels.com/?filter=vr</a></li>
  </ul>
</section>
