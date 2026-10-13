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
  en: "A web-based collection of tools for managing workspaces in Clirio View, plus a lightweight scan-sharing webviewer. Includes dashboard, workspace management, interactive Bing maps, and embeddable 3D scan shares."
  de: "Eine webbasierte Sammlung von Tools zur Verwaltung von Arbeitsbereichen in Clirio View plus ein leichtgewichtiger Webviewer zum Teilen von Scans. Enthält Dashboard, Workspace-Verwaltung, interaktive Bing-Karten und einbettbare 3D-Scan-Freigaben."
links:
  - label: "Clirio Cloud"
    url: "https://cloud.clir.io/"
  - label: "Sample Share"
    url: "https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn"
heroAltLayout: false
order: 4
---

<section class="sectionText">
    <h2>Übersicht</h2>
    <p>Clirio Cloud ist eine Sammlung von Tools, die im Laufe der Zeit gewachsen ist. Diese Tools werden den Nutzern der Clirio Suite auf einer mit Blazor entwickelten Website zur Verfügung gestellt. Clirio entwickelt Lösungen, die den Nutzern helfen, geodätische Arbeitsbereiche in 3D und XR zu inspizieren, zu dokumentieren und zusammenzuarbeiten.</p>
    <p>Eines der Hauptziele von Clirio Cloud ist es, die Upload- und Organisationsfunktionen der iOS-Apps von Clirio zu ergänzen, die als primäre Erfassungsplattform dienen. Während ein Benutzer mit den iOS-Apps von Clirio problemlos 3D-Photogrammetriescans erfassen und hochladen kann, möchte er möglicherweise auch andere 3D-Modelle hochladen, für die Clirio Cloud eine Schnittstelle bereitstellt. Weitere Werkzeuge für den Arbeitsbereich sind das Hochladen und Verwalten von benutzerdefinierten Basiskarten, das Hochladen von Bohrlöchern, das Einladen von Gästen, das Erstellen von Points of Interest und das Löschen von Arbeitsbereichen.</p>
    <p>Darüber hinaus bietet Clirio Cloud den Nutzern ein Analyse-Dashboard sowie eine einfache Möglichkeit, auf die Clirio-Wissensdatenbank und Schulungsvideos zuzugreifen. Schließlich gibt es auch Tools zur Abonnement- und Kontoverwaltung.</p>
    <p>Über die Workspace-Verwaltung hinaus nutzt derselbe Blazor- und Three.js-Stack Scan Share: einen leichtgewichtigen Webviewer und Gast-Links zum Teilen von Photogrammetrie-Scans aus Clirio View. Freigabeoptionen in der Unity-App konfigurieren Ablaufzeit, Passwortschutz, Workspace-Einladungen und einbettbare Iframes; Empfänger öffnen den Scan im Browser ohne App-Installation.</p>
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
  <section class="sectionText">
    <h2>Scan Share</h2>
    <p>Mit Scan Share können Nutzer einen mit der Clirio Scan-App erfassten Photogrammetrie-Scan schnell teilen. Die Funktion verbindet Freigabeoptionen in der Clirio View-App (Unity) mit einem Webviewer (Blazor und Three.js). Die Freigabe-Schaltfläche in Clirio View öffnet ein Pop-up zur Konfiguration: Ablaufzeit, Passwortschutz, optional die Anforderung, dass der Betrachter in den Workspace eingeladen wurde (Clirio-Login), Kopieren in die Zwischenablage oder native Freigabedialoge sowie die Erzeugung eines formatierten Embed-Iframes.</p>
    <p>Der Webviewer soll so leichtgewichtig und zugänglich wie möglich sein. Der Scan kann aus verschiedenen Blickwinkeln betrachtet werden; Metadaten und eine Maßstabslegende werden angezeigt, und Schaltflächen erlauben das Ein- und Ausblenden von Elementen.</p>
  </section>
  <figure ignorecarousel>
    <iframe src="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" style="width: 100%" class="clirioScanShareEmbed"></iframe>
    <figcaption>Ein interaktives Beispiel für eine eingebettete Scan-Freigabe. Klicken und ziehen, um das Modell aus verschiedenen Blickwinkeln zu betrachten. Dieselbe Freigabe ist auch auf einer eigenen <a href="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" target="_blank">Seite</a> erreichbar.</figcaption>
  </figure>
  <section class="sectionText">
    <h3>Share-UI und Webviewer</h3>
    <p>Die clientseitige Share-UI wurde mit C# in Unity als Pop-up aus den Beobachtungsdetails eines Scans entwickelt; die UI entstand in Figma mit <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a>. Webviewer und Three.js-Frontend waren mein Schwerpunkt; das Backend-Token-Sharing implementierte <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>.</p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaRow mediaRow-equalWidth">
        <figure>
          <img src="/assets/img/clirioScanShare/lqip/scanShareClientSideUi.png" alt="Clirio Scan Share – Freigabe-UI in Clirio View">
          <figcaption>Share-UI</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/clirioScanShare/lqip/scanShareClientSideUiEmbed.png" alt="Clirio Scan Share – Embed-Konfigurations-UI">
          <figcaption>Embed-UI</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/lqip/clirioScanShare.jpg" class="whiteFrame" alt="Clirio Scan Share – Webviewer mit 3D-Scan">
          <figcaption>Webviewer</figcaption>
        </figure>
      </div>
    </figure>
  </section>
  <section class="sectionText">
    <h3>Iterationen der Share-UI</h3>
    <p>Die Share-UI durchlief mehrere Iterationen. Ursprünglich für <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> mit wenigen Optionen entwickelt, wurde die Funktion später um Ablaufzeit, Passwortschutz und Embed-Funktionen erweitert. 2023 wurde die UI in Zusammenarbeit mit <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> überarbeitet, als die Clirio View-App auf <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a> migriert wurde.</p>
    <p>Die Backend-API zur Link-Generierung implementierte <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>. Das zurückgegebene Ergebnis enthält eine URL, die der Client dem Nutzer anzeigen und in die nativen Freigabeoptionen jeder Plattform einbinden kann.</p>
    <p>Die größte Herausforderung war die UX-Gestaltung, da es viele Optionen für den Nutzer gab – einschließlich privater Freigaben auf Workspace-Teams, was einen zusätzlichen Authentifizierungsfluss im Webviewer erforderte. Dynamische Layouts blendeten Optionen wie Ablaufverlängerung oder Passwortänderung elegant ein oder aus. Nach jeder Nutzerinteraktion aktualisiert sich die UI entsprechend der Freigabekonfiguration; gibt es eine passende bestehende Freigabe, wird der Link angezeigt, andernfalls die Schaltfläche zum Erzeugen einer neuen Freigabe.</p>
    <p>Eine Herangehensweise, die ich erstmals in diesem Feature testete – nach einer Diskussion mit <a href="https://www.linkedin.com/in/toniostillman" target="_blank">Tonio Stillman</a> – war, alle Event-Listener im Controller zu setzen, Listener-Funktionen privat zu halten und jede Schaltfläche nur einmal im Inspector zuzuweisen, statt viele <code>OnClick()</code>-Handler im Editor zu verdrahten.</p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaRow mediaRow-centered">
        <figure>
          <img src="/assets/img/clirioScanShare/lqip/scanShareWalkthrough.jpg" lqip-gif class="whiteFrame" alt="Animierter UX-Walkthrough der Clirio Scan Share-Freigabe">
          <figcaption>Share-UX-Walkthrough</figcaption>
        </figure>
      </div>
    </figure>
  </section>
  <section class="sectionText">
    <h3>Three.js-Webviewer</h3>
    <p>Die Implementierung des Webviewers war die komplexere Aufgabe, da er eigenständig ist und die meiste Funktionalität von Grund auf neu entstehen musste. Der Viewer nutzt Blazor, Three.js und Tailwind CSS. Herausforderungen waren das Laden von Texturdateien aus MTL mit korrekten SAS-Tokens, verschiedene MTL-Formate und Materialeigenschaften sowie ein dynamischer Viewer für unterschiedliche Modellgrößen und Geräte.</p>
  </section>
  <section class="sectionMedia">
    <div class="divText">
      <h2>Code-Beispiel</h2>
      <p>Scan-Share-Webviewer (Three.js).</p>
    </div>
    <script src="https://gist.github.com/potato-robert/ec153ae228a8ae3f6fe28b143073b669.js"></script>
  </section>
