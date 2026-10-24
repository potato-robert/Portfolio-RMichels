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
  en: "Live browser tools for managing workspaces and sharing photogrammetry scans. I was the primary developer after the initial setup."
  de: "Live-Browser-Tools zur Verwaltung von Arbeitsbereichen und zum Teilen von Photogrammetrie-Scans. Nach der Ersteinrichtung war ich der Hauptentwickler."
links:
  - label: "Clirio Cloud"
    url: "https://cloud.clir.io/"
  - label: "Sample Share"
    url: "https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn"
heroAltLayout: false
order: 2
---

<section class="sectionText">
  <h2>Überblick</h2>
  <p>Ich habe Clirio Cloud ausgebaut, die Blazor-Website, auf der Nutzer der Clirio Suite geospatiale Arbeitsbereiche verwalten und Photogrammetrie-Scans im Browser teilen.</p>
  <ul>
    <li><strong>Rolle:</strong> Mixed-Reality-Softwareentwickler. Nach der Ersteinrichtung war ich der Hauptentwickler der Workspace-Verwaltung, des Dashboards und des Webviewers von Clirio Scan Share.</li>
    <li><strong>Team:</strong> Robert Michels. Timothy Thibault hat Blazor, Authentifizierung, Abonnements und die Workspace-Auflistung eingerichtet und die Link-Erzeugung sowie das Token-Sharing von Scan Share implementiert. Jordan Wischmann hat die Dashboard-Mockups und die Share-UI entworfen. Tonio Stillman hat zum Event-Listener-Muster im Unity-Controller beraten.</li>
    <li><strong>Zeitraum:</strong> Mai 2021–März 2024.</li>
    <li><strong>Plattformen:</strong> HoloLens, Quest 2, Apple Vision Pro, iPhone AR, Android AR, Windows UWP.</li>
    <li><strong>Stack:</strong> Blazor, C#, Three.js, Tailwind CSS, Azure und Bing Maps.</li>
    <li><strong>Status:</strong> Live unter https://cloud.clir.io/. Beispiel-Freigabe: https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn</li>
  </ul>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <img src="/assets/img/clirioCloud/lqip/dashboard.jpg" alt="Analyse-Dashboard von Clirio Cloud">
    <figcaption>Analyse-Dashboard, das ich nach den Mockups von Jordan Wischmann umgesetzt habe.</figcaption>
  </figure>
</section>
<section class="sectionText">
  <h2>Kontext und Problem</h2>
  <p>Nutzer der Clirio Suite erfassen und laden Photogrammetrie-Scans in den iOS-Apps hoch, die als primäre Erfassungsplattform dienen. Clirio Cloud ist im Browser der Zugang zum Rest eines geospatialen Arbeitsbereichs: weitere 3D-Modelle, benutzerdefinierte Basemaps, Bohrlöcher, Gasteinladungen, Points of Interest und das Löschen von Arbeitsbereichen. Dieselbe Website enthält ein Analyse-Dashboard, die Wissensdatenbank und Schulungsvideos sowie Tools für Abonnement und Konto.</p>
</section>
<section class="sectionText">
  <h2>Meine Rolle und mein Vorgehen</h2>
  <p>Von Mai 2021 bis März 2024 war ich Mixed-Reality-Softwareentwickler. Timothy Thibault hat Blazor eingerichtet, um ein C#-Webframework auszuprobieren, weil die Unity-Apps C# nutzten, und er hat Authentifizierung, Abonnements und die Workspace-Auflistung mit Metadaten eingerichtet. Nach dieser Übergabe habe ich die Workspace-Verwaltung und das Dashboard verantwortet. Jordan Wischmann hat die Dashboard-Mockups entworfen, und ich habe sie umgesetzt.</p>
</section>
<section class="sectionText">
  <h2>Zentrale Arbeit</h2>
  <h3>Workspace-Tools</h3>
  <p><strong>Problem.</strong> Die iOS-Apps übernahmen die Erfassung. Für den Rest eines Arbeitsbereichs gab es keine Browser-Tools.</p>
  <p><strong>Entscheidung.</strong> Ich habe diese Tools auf der Workspace-Liste aufgebaut, die bereits auf der Website war.</p>
  <p><strong>Ergebnis.</strong> Nutzer konnten den Arbeitsbereich im Browser verwalten, einschließlich Modellen von außerhalb der Erfassungs-Apps.</p>
  <h3>Dashboard</h3>
  <p><strong>Problem.</strong> Die Verwaltungstools enthielten kein Analyse-Dashboard.</p>
  <p><strong>Entscheidung.</strong> Ich habe mit Jordan Wischmann zusammengearbeitet. Er hat die Dashboard-Mockups entworfen, und ich habe sie in Blazor umgesetzt.</p>
  <p><strong>Ergebnis.</strong> Dieses Analyse-Dashboard wurde ausgeliefert.</p>
  <h3>An das Modell gebundene Formulare</h3>
  <p><strong>Problem.</strong> <span data-lightbox-id="img_createPoi" class="inTextLink">POI erstellen</span>, 3D-Modell erstellen und Basemaps bearbeiten hatten optionale Abschnitte und Listen, die ein Nutzer umordnen konnte. Ein Handler an jedem Steuerelement wäre Boilerplate gewesen.</p>
  <p><strong>Entscheidung.</strong> Ich habe jedes Formular an sein Datenmodell gebunden, sodass Eingabe, optionale Abschnitte und die Listenreihenfolge gemeinsam aktualisiert wurden.</p>
  <p><strong>Ergebnis.</strong> Diese drei Formulare bleiben mit ihren Modellen synchron.</p>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaSquare">
      <figure>
        <img src="/assets/img/clirioCloud/lqip/workspaceList.jpg" alt="Liste der Arbeitsbereiche in Clirio Cloud">
        <figcaption>Workspace-Liste mit Metadaten. Die Verwaltungstools, die ich hinzugefügt habe, öffnen sich von hier.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/clirioCloud/lqip/workspaceView.jpg" alt="Workspace-Verwaltungstools in Clirio Cloud">
        <figcaption>Workspace-Tools über das hinaus, was die iOS-Apps erfassen.</figcaption>
      </figure>
      <figure id="img_createPoi">
        <img src="/assets/img/clirioCloud/lqip/createPoi.jpg" alt="Formular zum Erstellen eines Point of Interest">
        <figcaption>POI erstellen, mit dem Modell synchron gehalten.</figcaption>
      </figure>
    </div>
  </figure>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
      <figure>
        <img src="/assets/img/clirioCloud/lqip/create3dModel.jpg" alt="Formular zum Erstellen eines 3D-Modells">
      </figure>
      <figure>
        <img src="/assets/img/clirioCloud/lqip/editBasemaps.jpg" alt="Formular zum Bearbeiten der Basemaps">
      </figure>
    </div>
    <figcaption>3D-Modell erstellen und Basemaps bearbeiten. Abschnitte und Listenreihenfolge folgen dem Modell.</figcaption>
  </figure>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/062fa22fe781689ed11a85d85e4b2b3e.js"></script>
</section>
<section class="sectionText">
  <h2>Iterationen der Share-UI</h2>
  <p>Clirio Scan Share ist der Weg, auf dem ein Photogrammetrie-Scan aus der Clirio-Scan-App Clirio View verlässt. Ich habe die Share-UX als Pop-up auf den Beobachtungsdetails eines Scans entworfen, und der Three.js-Webviewer war mein Schwerpunkt. Jordan Wischmann hat die UI in Figma entworfen. Timothy Thibault hat die Link-Erzeugung und das Token-Sharing implementiert und die URL zurückgegeben, die der Client anzeigt und teilt.</p>
  <p>Die Share-UI wurde zuerst für <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> mit wenigen Optionen entwickelt. Später wurde sie um Ablaufzeit, Passwortschutz und einen Embed-Iframe erweitert. 2023 wurde die UI in Zusammenarbeit mit <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> überarbeitet, als Clirio View auf <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a> migrierte. Das Pop-up legt Ablaufzeit, ein Passwort und eine optionale Regel fest, dass der Betrachter in den Arbeitsbereich eingeladen wurde und sich mit Clirio anmeldet. Der Nutzer kann den Link kopieren, das Teilen-Menü der Plattform öffnen oder einen formatierten Embed-Iframe erzeugen.</p>
  <h3>Ein Layout, das der Konfiguration folgt</h3>
  <p>Diese UX zu entwerfen war der schwierigste Teil. Private Freigaben, beschränkt auf das Workspace-Team, brauchten einen zusätzlichen Authentifizierungsfluss im Webviewer, und andere Optionen mussten verborgen bleiben, bis sie zutrafen. Die Verlängerung der Ablaufzeit und eine Passwortänderung nutzen ein dynamisches Layout. Nach jeder Interaktion zeigt eine passende Freigabe ihren Link, und jede andere Konfiguration zeigt die Schaltfläche zum Erzeugen.</p>
  <p>Nach einem Gespräch mit Tonio Stillman habe ich jeden Event-Listener im Controller gesetzt, die Funktionen privat gehalten und jede Schaltfläche einmal im Inspector zugewiesen. Das hat die Einrichtungsfehler von <code>OnClick()</code>-Handlern verringert, die im Editor verdrahtet waren.</p>
  <h3>Der Webviewer</h3>
  <p>Der Webviewer war eigenständig, deshalb habe ich das meiste davon von Grund auf mit Blazor, Three.js und Tailwind CSS gebaut. Ein Gast betrachtet den Scan aus verschiedenen Blickwinkeln, mit Metadaten, einer Maßstabslegende und Steuerelementen zum Ein- oder Ausblenden. Schwierig waren SAS-Tokens an MTL-Texturen, unterschiedliche MTL-Formate und Materialeigenschaften sowie den Viewer über Modellgrößen und Geräte hinweg dynamisch zu halten.</p>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-equalWidth">
      <figure>
        <img src="/assets/img/clirioScanShare/lqip/scanShareClientSideUi.png" alt="Pop-up mit Freigabeoptionen in Clirio View">
        <figcaption>Share-Pop-up: Ablaufzeit, Passwort und Workspace-Zugriff.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/clirioScanShare/lqip/scanShareClientSideUiEmbed.png" alt="Embed-Optionen im Share-Pop-up">
        <figcaption>Embed-Optionen, die einen formatierten Iframe erzeugen.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/lqip/clirioScanShare.jpg" class="whiteFrame" alt="Scan-Share-Webviewer mit einem Photogrammetrie-Scan">
        <figcaption>Gast-Webviewer im Browser: der Scan, Metadaten und eine Maßstabslegende.</figcaption>
      </figure>
    </div>
  </figure>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-centered">
      <figure>
        <img src="/assets/img/clirioScanShare/lqip/scanShareWalkthrough.jpg" lqip-gif class="whiteFrame" alt="Walkthrough des Share-Pop-ups">
        <figcaption>Walkthrough: Der Link oder die Schaltfläche zum Erzeugen folgt der Konfiguration.</figcaption>
      </figure>
    </div>
  </figure>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <iframe src="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" style="width: 100%" class="clirioScanShareEmbed"></iframe>
    <figcaption>Eingebettete Scan-Freigabe. Klicken und ziehen, um den Winkel zu ändern, oder dieselbe Freigabe auf ihrer <a href="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" target="_blank">Seite</a> öffnen.</figcaption>
  </figure>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/ec153ae228a8ae3f6fe28b143073b669.js"></script>
</section>
<section class="sectionText">
  <h2>Ergebnis</h2>
  <p>Nutzer der Clirio Suite verwalten Arbeitsbereiche im Browser und teilen Photogrammetrie-Scans mit Gästen, die keine App installieren.</p>
  <p>TODO(Robert): a publishable Clirio Cloud customer or usage figure, if the qualitative line is not enough.</p>
</section>
<section class="sectionText">
  <h2>Reflexion</h2>
  <p>Ich würde Webarbeit weiterhin in C# neben den Unity-Apps halten. Blazor hat diese Übergabe möglich gemacht.</p>
  <p>Ich würde ein Formular weiterhin an sein Modell binden, sodass Abschnitte und Listen sich mit der Eingabe aktualisieren.</p>
  <p>Ich würde Freigabeoptionen weiterhin nur anzeigen, wenn sie zutreffen, und jeden Listener einmal am Controller setzen.</p>
</section>
<section class="sectionText">
  <h2>Mitwirkende und Links</h2>
  <p>Ich habe die Workspace-Verwaltung, das Dashboard und den Scan-Share-Webviewer verantwortet. <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a> hat Blazor, Authentifizierung, Abonnements und die Workspace-Auflistung eingerichtet und die Link-Erzeugung sowie das Token-Sharing von Scan Share implementiert. <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> hat das Dashboard und die Share-UI entworfen. Die UI von 2023 wurde in Zusammenarbeit mit ihm überarbeitet. <a href="https://www.linkedin.com/in/toniostillman" target="_blank">Tonio Stillman</a> hat zu den Listenern im Controller beraten.</p>
  <ul>
    <li><a href="https://cloud.clir.io/" target="_blank">Clirio Cloud</a></li>
    <li><a href="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" target="_blank">Beispiel-Freigabe</a></li>
    <li><a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> und <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a></li>
  </ul>
</section>
