---
slug: "clirioScanShare"
name:
  en: "Clirio Scan Share"
  de: "Clirio Scan Share"
projectType:
  en: "Unity App Feature + Website"
  de: "Unity App Feature + Website"
year: "2023"
company: "Clirio"
inDevelopment: false
roles: ["blazor", "back-end", "front-end"]
description:
  en: "Scan Share is a feature of the Clirio product suite, for sharing photogrammetry scans quickly, and displaying them in a webviewer."
  de: "Scan Share ist eine Funktion der Clirio-Produktreihe zum schnellen Teilen von Photogrammetrie-Scans und deren Anzeige in einem Webviewer."
links:
  - label: "Sample Share"
    url: "https://clirioview-viw-dev.azurewebsites.net/guest/f-aVQEv0LytBKHa8vARMx-Nl"
  - label: "Clirio View Desktop"
    url: "https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP"
order: 2
---

<section class="sectionText">
    <h2>Übersicht</h2>
    <p>Mit der Clirio Scan Share-Funktion können Nutzer einen mit der Clirio Scan-App erfassten Photogrammetrie-Scan schnell teilen. Die Funktion besteht aus Freigabeoptionen in der in Unity entwickelten Clirio View-App und einem in Blazor und Three.js entwickelten Webviewer, über den geteilte Scans betrachtet werden können. Durch Drücken der Freigabe-Schaltfläche in einer der Clirio View-Apps öffnet sich ein Pop-up zur Konfiguration der Freigabe. Der Nutzer kann Ablaufzeit und Passwortschutz festlegen und verlangen, dass der Betrachter in den Arbeitsbereich eingeladen wurde – in diesem Fall muss sich der Empfänger mit seinem Clirio-Konto anmelden, um den Scan anzuzeigen.</p> 
    <p>Sobald der Nutzer mit den ausgewählten Optionen zufrieden ist, kann er den Link erstellen und ihn entweder in die Zwischenablage kopieren oder die plattformeigene Freigabefunktion nutzen. Unter iOS öffnet sich der Freigabedialog mit kompatiblen Apps wie Messengern, unter Windows die Mail-App. Es gibt auch eine Option, ein formatiertes eingebettetes Iframe-Element für die Freigabe zu konfigurieren und zu generieren.</p>
    <p>Der Webviewer soll so leichtgewichtig und zugänglich wie möglich sein. Der Scan kann aus verschiedenen Blickwinkeln betrachtet werden; Metadaten und eine Maßstabslegende werden angezeigt, und Schaltflächen erlauben das Ein- und Ausblenden von Elementen.</p>
  </section>
  <figure ignorecarousel>
    <iframe src="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" style="width: 100%" class="clirioScanShareEmbed"></iframe>
    <figcaption>Ein interaktives Beispiel für eine eingebettete Scan-Freigabe. Klicken und ziehen, um das Modell aus verschiedenen Blickwinkeln zu betrachten. Dieselbe Freigabe ist auch auf einer eigenen <a href="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" target="_blank">Seite</a> erreichbar.</figcaption>
  </figure>
  <section class="sectionText">
    <h2>Entwicklung</h2>
    <p>Für die Entwicklung dieser Funktion gab es zwei Bereiche: die clientseitige Share-UI und -Logik sowie den Webviewer.</p>
    <h3>Share-UI und Logik</h3>
    <p>Entwickelt mit C# in Unity als Pop-up, erreichbar über die Beobachtungsdetails eines beliebigen Scans in der Clirio View-App. Die UI wurde in Figma in Zusammenarbeit mit <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> entworfen.</p>
    <h3>Webviewer</h3>
    <p>Entwickelt mit Blazor und Three.js. Das Backend-Token-Sharing implementierte <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>.</p>
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
    <h2>Share-UI und Logik</h2>
    <p>Die Share-UI durchlief mehrere Iterationen. Ursprünglich für <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> mit wenigen Optionen entwickelt, wurde die Funktion später um Ablaufzeit, Passwortschutz und Embed-Funktionen erweitert. 2023 wurde die UI in Zusammenarbeit mit <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> überarbeitet, als die Clirio View-App auf <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a> migriert wurde.</p>
    <p>Die Backend-API zur Link-Generierung implementierte <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>. Das zurückgegebene Ergebnis enthält eine URL, die der Client dem Nutzer anzeigen und in die nativen Freigabeoptionen jeder Plattform einbinden kann.</p>
    <p>Die größte Herausforderung war die UX-Gestaltung, da es viele Optionen für den Nutzer gab. Dazu gehörte die Möglichkeit, Freigaben privat zu machen und das Teilen intern auf Teams in Arbeitsbereichen zu beschränken – was einen zusätzlichen Authentifizierungsfluss im Webviewer erforderte. Die Vielzahl an Optionen erschwerte auch ein kompaktes UI. Ich nutzte dynamisches Design und Layouts, damit versteckte Optionen wie Ablaufverlängerung oder Passwortänderung elegant ein- oder ausgeblendet werden konnten. Die Logik-Entwicklung war vergleichsweise unkompliziert; die größere Herausforderung war zu definieren, wie die Funktion überhaupt arbeiten soll. Nach jeder Nutzerinteraktion aktualisiert sich die UI entsprechend der Freigabekonfiguration und aller anderen Zustände. Gibt es eine passende bestehende Freigabe, wird der vorhandene Link angezeigt, andernfalls die Schaltfläche zum Erzeugen einer neuen Freigabe.</p>
    <p>Eine interessante Änderung meiner Controller-Herangehensweise testete ich erstmals in diesem Feature – nach einer Diskussion mit meinem Teamkollegen <a href="https://www.linkedin.com/in/toniostillman" target="_blank">Tonio Stillman</a>. Zuvor verdrahtete ich <code>OnClick()</code>-Events direkt im Unity-Inspector. Hier setzte ich stattdessen alle Event-Listener im Controller selbst, hielt die Listener-Funktionen privat und vereinfachte die Inspector-Einrichtung so, dass jede Schaltfläche nur einmal dem Controller zugewiesen wird und keine weiteren Referenzen nötig sind. Das macht die Einrichtung im Editor weniger fehleranfällig und wartbarer, da weniger Code-Verständnis erforderlich ist.</p>
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
    <h2>Webviewer</h2>
    <p>Die Implementierung des Webviewers war die komplexere Aufgabe, da er eigenständig ist und die meiste Funktionalität von Grund auf neu entstehen musste. Der Viewer wurde in C# mit Blazor und JavaScript mit Three.js geschrieben und nutzt Tailwind CSS für das Styling. Ich hatte zuvor mit Three.js gearbeitet und ein Großteil meiner Arbeit drehte sich um die korrekte Einrichtung des Viewers.</p>
    <p></p>
    <p>Zu den Herausforderungen bei Three.js gehörten das Laden der in der MTL-Datei definierten Texturdateien mit korrekten SAS-Tokens, die Unterstützung verschiedener MTL-Formate und Materialeigenschaften sowie ein dynamischer Viewer, der unterschiedliche Modellgrößen und -formen auf vielen Geräten unterstützt.</p>
  </section>
  <section class="sectionMedia">
    <div class="divText">
      <h2>Code-Beispiel</h2>
      <p></p>
    </div>
    <script src="https://gist.github.com/potato-robert/ec153ae228a8ae3f6fe28b143073b669.js"></script>
  </section>
