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
roles: ["back-end", "front-end"]
description:
  en: "Satire presenting 1889 death omens as real. I built the PHP routing, schema, and accessible form UI."
  de: "Satire, die Todesomen von 1889 als real darstellt. Ich habe das PHP-Routing, das Schema und die barrierefreie Formular-UI gebaut."
links:
  - label: "View Website"
    url: "http://harbingersofdeath.rmichels.com"
order: 12
---

<section class="sectionText">
  <h2>Überblick</h2>
  <p>Ich habe das PHP-Routing und die Modelle, das Datenbankschema und die barrierefreie Formular-UI für Harbingers of Death gebaut, eine Satire, die Todesomen von 1889 so darstellt, als wären sie real.</p>
  <p>Studienprojekt, SIAT, 2018.</p>
  <ul>
    <li><strong>Rolle:</strong> Full-Stack: PHP-Routing und Modelle, Schema und die barrierefreie Formular-UI.</li>
    <li><strong>Team:</strong> Kursteam. Namen stehen nicht auf der Seite.</li>
    <li><strong>Zeitraum:</strong> 2018.</li>
    <li><strong>Plattformen:</strong> Web.</li>
    <li><strong>Stack:</strong> LAMP, PHP, MySQL, JavaScript und ARIA.</li>
    <li><strong>Status:</strong> http://harbingersofdeath.rmichels.com</li>
  </ul>
  <p>TODO(Robert): Harbingers of Death teammate names.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/harbingersOfDeath/lqip/screen-home.jpg" alt="Startseite von Harbingers of Death.">
      <figcaption class="center">Die Startseite, auf der Besucher die Omen zu durchstöbern beginnen.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h2>Konzept</h2>
  <p>Harbingers of Death präsentiert Omen aus einem Artikel von 1889, als wären sie real, als Satire auf das heutige Gerede über Verschwörungen. Jedes Omen nennt, wen es betrifft, was es auslöst und das Szenario. Besucher filtern nach der Person, die schuld ist, nach der Person, die sterben wird, und nach dem Lebensaspekt, oder sie suchen per Text, und Mitglieder vermerken, welchen Omen sie begegnet sind und auf wen das Omen zeigt.</p>
</section>
<section class="sectionText">
  <h2>Was ich gebaut habe</h2>
  <ul>
    <li>Ich habe die Darstellung der Omen-Seite von ihren Daten getrennt: <code>index.php</code> erzeugte ein <code>Omen</code> über <code>OmenCollection.php</code> und übergab es an <code>omen.php</code>.</li>
    <li>Ich habe die Datenbank entworfen und ihre Abfragen geschrieben.</li>
    <li>Ich habe die schwebenden Labels als getrennte Label- und Eingabeknoten gebaut.</li>
  </ul>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/6af2a14f9fd4d08094ef29c3dc8bcd6b.js"></script>
</section>
<section class="sectionText">
  <h2>Datenmodell und Barrierefreiheit</h2>
  <p>Das Schema hat sechs Tabellen. <code>user</code> speichert Nutzerinformationen. <code>user_omen</code> speichert, welchen Omen ein Mitglied begegnet ist. <code>omen</code> speichert jedes Omen. <code>aspect</code>, <code>death</code> und <code>fault</code> sind die Taxonomie-Tabellen, die Omen verschlagworten. Nur <code>user</code> und <code>user_omen</code> ändern sich über die Website. Die Omen- und Taxonomie-Tabellen bleiben statisch.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/harbingersOfDeath/lqip/db.jpg" alt="Entity-Relationship-Diagramm der Datenbank.">
      <figcaption class="center">Entity-Relationship-Diagramm des Schemas: user, user_omen, omen, aspect, death und fault. Nur user und user_omen ändern sich über die Website; die übrigen Tabellen sind die statische Taxonomie.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <p>Schwebende Labels sehen aus wie Platzhaltertext, bis jemand tippt, dann schrumpfen sie und sitzen über dem Eingabefeld. Ich habe das Label und die Eingabe als getrennte Knoten belassen, damit das Formular ARIA-freundlich bleibt.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/harbingersOfDeath/lqip/animated-form.jpg" lqip-gif alt="Textfeld mit einem Label, das schrumpft und über das Eingabefeld wandert.">
      <figcaption class="center">Das Label wandert über das Feld, während jemand tippt, und Label und Eingabe bleiben getrennte Knoten.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/27652e3e6cb30ac861fd8be6895d80df.js"></script>
</section>
<section class="sectionText">
  <h2>Was es heute zeigt</h2>
  <p>Die Route, das Schema und das barrierefreie Formular sind die Art von Full-Stack-Webarbeit, die ich noch immer mache. Heute würde ich Views von den Daten getrennt halten und Labels und Eingaben als getrennte Knoten belassen, damit das Formular barrierefrei bleibt.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <ul>
    <li>Website ansehen: http://harbingersofdeath.rmichels.com</li>
  </ul>
</section>
