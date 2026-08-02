---
slug: "harbingersOfDeath"
name:
  en: "Harbingers Of Death"
  de: "Harbingers Of Death"
projectType:
  en: "LAMP Website"
  de: "LAMP Website"
year: "2018"
inDevelopment: false
roles: ["back-end", "front-end", "java-dev"]
description:
  en: "'Are you going to die?' compiles historic superstitions about death. This project satirizes present-day conspiracy theories, by presenting now-defunct superstitions as if they are real."
  de: "'Are you going to die?' sammelt historische Aberglauben über den Tod. Dieses Projekt satirisiert heutige Verschwörungstheorien, indem es veraltete Aberglauben als real darstellt."
links:
  - label: "View Website"
    url: "http://harbingersofdeath.rmichels.com"
order: 7
---

<section class="sectionText">
    <h2>Die Aufgabe</h2>
    <p>Ziel dieses Projekts war es, Back-end-Entwicklung mit dem LAMP-Stack zu üben. Nutzer können sich auf der Seite registrieren, mit Inhalten interagieren und werden von einer personalisierten Startseite begrüßt. Die Seite bietet datenbankgesteuerte Inhalte, sichere Authentifizierung sowie AJAX-Suche und -Filterung.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaSquare">
      <figure>
        <img src="/assets/img/harbingersofdeath/lqip/screen-home.jpg" alt="Harbingers of Death – Startseite">
        <figcaption class="center">Startseite</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/harbingersofdeath/lqip/screen-omen.jpg" alt="Harbingers of Death – Omen-Inhaltsseite">
        <figcaption class="center">Omen-Inhaltseinheit</figcaption>
      </figure>
    </div>
  </section>
  <section class="sectionText">
    <h2>Das Ergebnis</h2>
    <p>Harbingers of Death präsentiert veraltete Omen aus einem Artikel von 1889, als wären sie real – als Satire moderner Verschwörungstheorien. Die Content Units sind einzelne Omen. Sie enthalten Informationen darüber, wen sie betreffen, was sie auslöst und in welcher Situation man ihnen begegnet. Nutzer können sie über verschiedene Taxonomien und per Suche erkunden.</p>
    <p>Besucher können Omen filtern nach Schuldigen, Betroffenen und Lebensaspekt. Außerdem können Omen über ein Textfeld durchsucht werden.</p>
    <p>Mitglieder melden sich an, um zu verfolgen, welche Omen sie erlebt haben und wen sie als nächstes sterben lassen.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaSquare">
      <figure>
        <img src="/assets/img/harbingersofdeath/lqip/animated-form.jpg" lqip-gif alt="Animiertes Formular mit schwebenden Labels (ARIA-freundlich)">
        <figcaption class="center">Formular-Styling (ARIA-freundlich)</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/harbingersofdeath/lqip/screen-member-home.jpg" alt="Harbingers of Death – Mitglieder-Startseite">
        <figcaption class="center">Mitglieder-Startseite</figcaption>
      </figure>
    </div>
  </section>
  <section class="sectionText">
    <h2>Der Code</h2>
    <p>Ein entscheidendes Element für den Erfolg dieses Projekts war die Trennung von Views und Logik. So konnten wir sehr sauberen Code schreiben. Als ich die einzelnen Omen-Inhaltsseiten implementierte, trennte ich Code für die Darstellung von Code für das Abrufen und Organisieren der Daten. Zur Laufzeit wird beim Verarbeiten der Omen-Route in <code>index.php</code> eine <code>Omen</code>-Instanz über <code>OmenCollection.php</code> erzeugt und an die Seitenansicht <code>omen.php</code> übergeben.</p>
  </section>
  <section class="sectionMedia">
    <script src="https://gist.github.com/potato-robert/6af2a14f9fd4d08094ef29c3dc8bcd6b.js"></script>
    <script src="https://gist.github.com/potato-robert/c64698d770388ce87b755a84a700070e.js"></script>
    <script src="https://gist.github.com/potato-robert/3a1012cb7637403a0287918880e163ed.js"></script>
  </section>
  <section class="sectionText">
    <p>Eine interessante Herausforderung war die Implementierung schwebender Labels für Texteingaben. Die Labels erscheinen wie Platzhaltertext, bis der Nutzer Text eingibt; dann werden sie verkleinert und oberhalb des Eingabefelds positioniert – wie ein klassisches Label. Die Herausforderung bestand darin, Funktion und Form nicht zu beeinträchtigen. Labels und Eingabefelder sind daher separate DOM-Objekte, und das Formular ist ARIA-freundlich.</p>
  </section>
  <section class="sectionMedia">
    <script src="https://gist.github.com/potato-robert/27652e3e6cb30ac861fd8be6895d80df.js"></script>
  </section>
  <section class="sectionText">
    <p>Für dieses Projekt war ich außerdem für die Einrichtung der Datenbank und aller Abfragen verantwortlich. Ich entwarf die Datenbank mit folgenden Tabellen: <code>user</code> (Nutzerinformationen), <code>user_omen</code> (Zuordnungstabelle für erlebte Omen), <code>omen</code> (Informationen zu jedem Omen) sowie drei Taxonomie-Tabellen: <code>aspect</code>, <code>death</code> und <code>fault</code> (zum Taggen von Omen). Über die Website änderbar sind nur <code>user</code> und <code>user_omen</code>; die Omen- und Taxonomie-Tabellen sind statisch.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure>
        <img src="/assets/img/harbingersofdeath/lqip/db.jpg" alt="ER-Diagramm der Harbingers-of-Death-Datenbank">
        <figcaption class="center">ER-Diagramm unserer Datenbank.</figcaption>
      </figure>
    </div>
  </section>
