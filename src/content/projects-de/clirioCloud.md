---
slug: "clirioCloud"
name:
  en: "Clirio Cloud"
  de: "Clirio Cloud"
projectType:
  en: "Blazor Web App"
  de: "Blazor Web App"
year: "2023"
company: "Clirio"
inDevelopment: false
roles: ["blazor", "back-end", "front-end"]
description:
  en: "A web-based collection of tools for managing workspaces in Clirio View. Includes a user dashboard, workspace and observation creation tools, and interactive Bing maps."
  de: "Eine webbasierte Sammlung von Tools zur Verwaltung von Arbeitsbereichen in Clirio View. Enthält ein Benutzer-Dashboard, Tools zur Erstellung von Arbeitsbereichen und Beobachtungen sowie interaktive Bing-Karten."
links:
  - label: "Clirio Cloud"
    url: "https://cloud.clir.io/"
heroAltLayout: false
order: 4
---

<section class="sectionText">
    <h2>Übersicht</h2>
    <p>Clirio Cloud ist eine Sammlung von Tools, die im Laufe der Zeit gewachsen ist. Diese Tools werden den Nutzern der Clirio Suite auf einer mit Blazor entwickelten Website zur Verfügung gestellt. Clirio entwickelt Lösungen, die den Nutzern helfen, geodätische Arbeitsbereiche in 3D und XR zu inspizieren, zu dokumentieren und zusammenzuarbeiten.</p>
    <p>Eines der Hauptziele von Clirio Cloud ist es, die Upload- und Organisationsfunktionen der iOS-Apps von Clirio zu ergänzen, die als primäre Erfassungsplattform dienen. Während ein Benutzer mit den iOS-Apps von Clirio problemlos 3D-Photogrammetriescans erfassen und hochladen kann, möchte er möglicherweise auch andere 3D-Modelle hochladen, für die Clirio Cloud eine Schnittstelle bereitstellt. Weitere Werkzeuge für den Arbeitsbereich sind das Hochladen und Verwalten von benutzerdefinierten Basiskarten, das Hochladen von Bohrlöchern, das Einladen von Gästen, das Erstellen von Points of Interest und das Löschen von Arbeitsbereichen.</p>
    <p>Darüber hinaus bietet Clirio Cloud den Nutzern ein Analyse-Dashboard sowie eine einfache Möglichkeit, auf die Clirio-Wissensdatenbank und Schulungsvideos zuzugreifen. Schließlich gibt es auch Tools zur Abonnement- und Kontoverwaltung.</p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaSquare">
        <figure>
          <img src="/assets/img/clirioCloud/lqip/dashboard.jpg" alt="Dashboard">
          <figcaption>Dashboard</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/clirioCloud/lqip/workspaceList.jpg" alt="Workspace Liste">
          <figcaption>Workspace Liste</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/clirioCloud/lqip/workspaceView.jpg" alt="Workspace Management Tools">
          <figcaption>Workspace Management Tools</figcaption>
        </figure>
        <figure id="img_createPoi">
          <img src="/assets/img/clirioCloud/lqip/createPoi.jpg" alt="Workspace Management Beispiel: Erstelle POI">
          <figcaption>Workspace Management Beispiel: Erstelle POI</figcaption>
        </figure>
      </div>
    </figure>
  </section>
  <section class="sectionText">
    <h2>Entwicklung</h2>
    <p>Die Website wurde ursprünglich eingerichtet von <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a> unter der verwendung von Blazor, um ein Web-Framework mit C# als Programmiersprache auszuprobieren, was ein Vorteil wäre, wenn man bedenkt, dass wir C# auch für die Unity-Entwicklung verwenden. Nach der Einrichtung der Authentifizierung, der Abonnementverwaltung und der Auflistung der Arbeitsbereiche mit Metadaten wurde die Entwicklung größtenteils an mich übergeben.</p>
    <p></p>
    <p>Nachdem ich alle Funktionen zur Verwaltung des Arbeitsbereichs, wie z. B. den Upload von 3D-Modellen und Benutzereinladungen, hinzugefügt hatte, begann ich mit der Arbeit an einer weiteren Reihe von Geschichten, die sich um das Dashboard drehten. Ich habe mich gepartnert mit<a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a>, der Mockups entwarf, die ich dann umsetzte.</p>
    <p></p>
    <h3>Lehren</h3>
    <p></p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
        <figure>
          <img src="/assets/img/clirioCloud/lqip/create3dModel.jpg" alt="clirio Cloud – create3d Model"> 
        </figure>
        <figure>
          <img src="/assets/img/clirioCloud/lqip/editBasemaps.jpg" alt="clirio Cloud – edit Basemaps">
        </figure>
      </div>
      <figcaption>Einige Beispiele für die Anbindung von Datenmodellen an Formulare in Blazor. Das Erweitern/Kollabieren von optionalen Abschnitten des Formulars und das Umordnen von Elementen in einer Liste wird mit Blazor leicht gemacht, da die Benutzereingaben zu einem direkten Feedback führen, ohne dass man Boilerplate-Code schreiben muss.</figcaption>
    </figure>
  </section>
  <section class="sectionMedia">
    <div class="divText">
      <h2>Code Beispiel</h2>
      <p>Ein Beispiel für die Datenbindung zwischen dem Formular und dem Datenmodell für die <span data-lightbox-id="img_createPoi" class="inTextLink">POI Erstellen</span> Seite.</p>
    </div>
    <script src="https://gist.github.com/potato-robert/062fa22fe781689ed11a85d85e4b2b3e.js"></script>
  </section>
