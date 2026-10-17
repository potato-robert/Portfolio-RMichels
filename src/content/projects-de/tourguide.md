---
slug: "tourguide"
name:
  en: "Tourguide"
  de: "Tourguide"
projectType:
  en: "Flutter App"
  de: "Flutter App"
year: "2024"
inDevelopment: false
roles: ["android", "design"]
description:
  en: "A cross-platform Flutter app that helps tourists navigate and learn about places along digitally guided tours. Available for Android and as a web app."
  de: "Eine plattformübergreifende Flutter-App, die Touristen hilft, sich auf digital geführten Touren zu orientieren und mehr über Orte zu erfahren. Verfügbar für Android und als Web-App."
links:
  - label: "Google Play Store (Beta)"
    url: "https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp"
  - label: "Web App (Beta)"
    url: "https://tourguide-firebase.web.app"
threeMockup: "phone"
order: 1
---

<section class="sectionText mockup">
    <div>
      <h2>Übersicht</h2>
      <p>Während eines Urlaubs in Rom fiel mir auf, dass es an Angeboten für selbstgeführte Touren fehlte, die Navigation und Informationen zu Orten verbinden. Es gibt Websites mit Tagesplänen, Wikipedia, um Geschichte und mehr zu erfahren, und Google Maps erlaubt es, eine kleine Anzahl von Orten in eine Route zu legen, aber es gab keine zusammenhängende Plattform, die alles vereint.</p>
      <p>Ich wollte das Flutter-Framework schon länger ausprobieren, und dies schien die perfekte Gelegenheit, damit eine plattformübergreifende App zu bauen.</p>
      <p>Tourguide ist als Beta im <a href="https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp" title="Tourguide im Google Play Store (Beta)" target="_blank">Google Play Store</a> und als <a href="https://tourguide-firebase.web.app" title="Tourguide Web-App (Beta)" target="_blank">Web-App</a> verfügbar.</p>
      <h3>Entdecken</h3>
      <p>Stöbere in beliebten Touren in deiner Nähe und weltweit, oder suche nach einem Ort. Setze Lesezeichen oder lade Touren herunter, um sie offline zu laufen.</p>
      <h3>Tour</h3>
      <p>Starte eine Tour und folge der Route mit Wegbeschreibungen und Ortsbeschreibungen, die per Sprachausgabe vorgelesen werden können.</p>
      <h3>Guide</h3>
      <p>Frag den KI-Guide nach Unternehmungen und Touren in der Nähe. Während einer Tour kannst du zu jedem Stopp mehr erfahren und wie du dorthin kommst. Unterstützt von Gemini über Firebase AI.</p>
      <h3>Einstellungen</h3>
      <p>Verwalte App- und Profileinstellungen, erstelle Touren und weitere Einstellungen.</p>
    </div>
  </section>
  <video id="video" src="/assets/video/tourguideScreencap.mp4" style="display:none" preload="none" loop muted playsinline poster="/assets/video/frame.jpg"></video>
  <section class="sectionText">
    <h2>Entwicklung</h2>
    <h3>Offline-Touren - 30. September 2026</h3>
    <p>Touren lassen sich auf Android jetzt für offline speichern. Titelbild und Wegbeschreibung bleiben auf dem Gerät, eine Tour kann nach einem Neustart weitermachen, und fehlt die Wegbeschreibung, wird einfach eine Luftlinie gezeichnet. Die Web-App bleibt online.</p>
    <h3>Guide - 28. September 2026</h3>
    <p>Aus dem Chat wurde Guide: getrennte Unterhaltungen, Fragen aus der Vorschau oder während einer Tour, und Antworten, die auf echte Touren verweisen können. Gemini läuft über Firebase AI, mit Maps- oder Such-Grounding, wenn es hilft.</p>
    <h3>Entdecken, Gäste und Freunde - 2. September 2026</h3>
    <p>Entdecken hat eine Suche bekommen, und der Standort wird erst abgefragt, wenn eine Funktion ihn wirklich braucht. Freunde können einer Live-Sitzung beitreten und sich auf der Karte sehen.</p>
    <h3>Web und TTS - 2. Oktober 2024</h3>
    <p>Den Web-Build an Android heranzubringen hieß, Wegbeschreibungen über Cloud Functions zu holen und die Layouts an mehr Bildschirmgrößen anzupassen. Gleichzeitig kam Tippen-zum-Vorlesen dazu. Das fehlende Web-Fortschritts-Event ging an flutter_tts, und <a href="https://pub.dev/packages/google_maps_custom_marker" title="google_maps_custom_marker package on pub.dev" target="_blank">google_maps_custom_marker</a> landete auf pub.dev.</p>
    <h3>Web-App - 27. August 2024</h3>
    <p>Die <a href="https://tourguide-firebase.web.app" title="Tourguide Web App" target="_blank">Web-App</a> ging online. Flutter hat den Großteil der Portierung getragen. Bilder, CORS und breite Bildschirme brauchten extra Aufmerksamkeit.</p>
    <h3>Material 3 - 19. August 2024</h3>
    <p>Mit dem offenen Test rückte das Aussehen in den Vordergrund. Die Stile laufen über einen Theme-Provider, die Oberfläche folgt Material 3 und unterstützt den dunklen Modus. Ausgearbeitet in <a href="https://www.figma.com/proto/DKwKzxmnYg9oQeuUSmrlN7/Tourguide_App?page-id=54496%3A24191&node-id=54852-28956&viewport=-5776%2C-250%2C2&t=4HYfco7oHsFnRHPh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=54852%3A28956" title="Interactive Figma Mockup" target="_blank">Figma</a> mit dem <a href="https://material-foundation.github.io/material-theme-builder/" title="Material Theme Builder" target="_blank">Material Theme Builder</a>, zusammen mit einem Durchgang an der Karte während laufender Touren.</p>
    <h3>Play-Beta und CI/CD - 29. Juli 2024</h3>
    <p>Der offene Test bei Google Play war mehr als ein Upload. Melden, Kontolöschung und rechtliche Seiten mussten stehen, E-Mail und Meldungen über Firebase-Erweiterungen und Cloud Functions. Danach haben Fastlane und GitHub Actions die Deploys von main übernommen.</p>
    <h3>Erster Build - 10. Juli 2024</h3>
    <p>Die erste Version war Android: Touren anlegen, sie durchstöbern, mit Gemini chatten und ein Profil, auf Firebase plus Places, Maps und Vertex AI. Eine Web-Version sollte danach kommen. iOS nur, wenn jemand danach fragt.</p>
    <p>Fragen oder Feedback: <a href="mailto:contact@tourguide.rmichels.com">contact@tourguide.rmichels.com</a>. Rechtliches: <a href="https://tourguide.rmichels.com/privacyPolicy.html" target="_blank">Datenschutzerklärung</a> und <a href="https://tourguide.rmichels.com/termsOfService.html" target="_blank">Nutzungsbedingungen</a>.</p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
        <figure>
          <img src="/assets/img/tourguide/Screenshot_1.webp" alt="tourguide – Screenshot 1">
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_2.webp" alt="tourguide – Screenshot 2">
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_3.webp" alt="tourguide – Screenshot 3">
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_4.webp" alt="tourguide – Screenshot 4">
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_5.webp" alt="tourguide – Screenshot 5">
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_6.webp" alt="tourguide – Screenshot 6">
        </figure>
      </div>
      <figcaption>Screenshots vom 04.08.2024</figcaption>
    </figure>
  </section>
  <section class="sectionText">
    <h2>Was ich bisher gelernt habe</h2>
    <p>Flutter hat mir viel Freude gemacht. Zuvor arbeitete ich bei <a href="https://clir.io/">Clirio</a>, wo ich komplexe Oberflächen mit C# in Unity gebaut habe — ein Setup, das für komplexe UIs wenig geeignet ist, erst recht nicht, wenn die Apps VR, MR, Touchscreens auf iOS und Android sowie Desktop unterstützen und die Oberfläche für jede Plattform angepasst werden muss. Im Vergleich dazu macht Flutter komplexe Oberflächen über viele Geräte hinweg leicht, mit einer intuitiven Architektur aus Stateless- und StatefulWidgets, Providern und vielen Paketen für wiederkehrende Aufgaben.</p>
  </section>
