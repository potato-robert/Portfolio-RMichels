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
  en: "Solo-built Flutter app for guided tours with a Gemini AI guide, in public beta on Google Play and the web."
  de: "Allein gebaute Flutter-App für geführte Touren mit einem Gemini-KI-Guide, in öffentlicher Beta bei Google Play und im Web."
links:
  - label: "Google Play Store (Beta)"
    url: "https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp"
  - label: "Web App (Beta)"
    url: "https://tourguide-firebase.web.app"
threeMockup: "phone"
order: 3
---

<section class="sectionText">
  <h2>Überblick</h2>
  <p>Ich habe Tourguide entworfen und gebaut, eine Flutter-App zum Durchstöbern, Durchführen und Herunterladen geführter Touren, mit einem KI-Guide auf Basis von Gemini.</p>
  <ul>
    <li><strong>Rolle:</strong> Alleiniger Product Engineer und Designer, vom Konzept bis zur Veröffentlichung im Play Store.</li>
    <li><strong>Team:</strong> Allein.</li>
    <li><strong>Zeitraum:</strong> Juli 2024–heute. Erster Android-Build am 10. Juli 2024.</li>
    <li><strong>Plattformen:</strong> Android und Web.</li>
    <li><strong>Stack:</strong> Flutter, Firebase, Cloud Functions, Firebase AI, Gemini mit Maps- oder Search-Grounding, Google Maps, Places, Fastlane, GitHub Actions, Figma und Material 3.</li>
    <li><strong>Status:</strong> Öffentliche Beta bei Google Play und im Web, mit 10 Testern. Google Play: https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp. Web: https://tourguide-firebase.web.app.</li>
  </ul>
</section>
<section class="sectionText mockup">
  <div>
    <h2>Kontext und Problem</h2>
    <p>Im Urlaub in Rom wollte ich eine selbstgeführte Tour, die die Route und die Informationen zu jedem Ort zusammenhält. Websites für Reisepläne konnten einen Tag vorschlagen, Wikipedia die Geschichte liefern, und Google Maps konnte eine kleine Anzahl von Stopps zu einer Route hinzufügen. Es gab kein einzelnes Produkt, um eine Tour zu durchstöbern, sie mit Wegbeschreibung zu gehen und etwas über den Ort zu lesen. Ich habe Tourguide für diesen Spaziergang gebaut und um Flutter zu lernen, indem ich die App auslieferte.</p>
  </div>
</section>
<video id="video" src="/assets/video/tourguideScreencap.mp4" style="display:none" preload="none" loop muted playsinline poster="/assets/video/frame.jpg"></video>
<section class="sectionText">
  <h2>Meine Rolle und mein Vorgehen</h2>
  <p>Ich habe Tourguide allein verantwortet, vom Konzept über das Design bis zur Veröffentlichung im Play Store. Explore durchstöbert beliebte Touren in der Nähe oder weltweit, sucht nach einem Ort und setzt ein Lesezeichen oder lädt eine Tour herunter. Tour folgt der Route mit Wegbeschreibungen und Ortsbeschreibungen, die Text-to-Speech vorlesen kann. Guide ist das Gemini-Gespräch über eine Tour. Settings enthält das Profil, das Erstellen von Touren und die übrigen Präferenzen. Ich habe die Screens in Figma entworfen und in Flutter gebaut.</p>
</section>
<section class="sectionText">
  <h2>Zentrale Arbeit</h2>
  <h3>Zuerst Android</h3>
  <p><strong>Problem.</strong> Die erste Veröffentlichung musste eine Plattform sein, die ich ausliefern konnte, während ich Flutter lernte.</p>
  <p><strong>Entscheidung.</strong> Die erste Version war Android: eine Tour anlegen, Touren durchstöbern, mit Gemini chatten und ein Profil, auf Firebase plus Places, Maps und Vertex AI. Eine Web-Version war der Plan danach.</p>
  <p><strong>Ergebnis.</strong> Dieser Build war am 10. Juli 2024 fertig.</p>
  <h3>Offener Test</h3>
  <p><strong>Problem.</strong> Der offene Test bei Google Play war mehr als das Hochladen eines Builds.</p>
  <p><strong>Entscheidung.</strong> Ich habe Meldefunktion, Kontolöschung und rechtliche Seiten eingerichtet und E-Mail sowie Meldungen über Firebase-Erweiterungen und Cloud Functions abgewickelt. Fastlane und GitHub Actions haben danach von main deployt.</p>
  <p><strong>Ergebnis.</strong> Der offene Test begann am 29. Juli 2024. Die Screens unten sind vom 4. August 2024.</p>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
      <figure>
        <img src="/assets/img/tourguide/Screenshot_1.webp" alt="Tourguide-Screenshot 1 von 6 vom 4. August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_2.webp" alt="Tourguide-Screenshot 2 von 6 vom 4. August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_3.webp" alt="Tourguide-Screenshot 3 von 6 vom 4. August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_4.webp" alt="Tourguide-Screenshot 4 von 6 vom 4. August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_5.webp" alt="Tourguide-Screenshot 5 von 6 vom 4. August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_6.webp" alt="Tourguide-Screenshot 6 von 6 vom 4. August 2024">
      </figure>
    </div>
    <figcaption>Screens vom 4. August 2024, während des offenen Tests und vor der Material-3-Umgestaltung am 19. August 2024.</figcaption>
  </figure>
</section>
<section class="sectionText">
  <h3>Material 3, Web und Sprache</h3>
  <p><strong>Problem.</strong> Während der offene Test lief, brauchte die Oberfläche ein visuelles System, und der Web-Build musste zu Android passen. Flutter deckte den Großteil der Portierung ab. Bilder, CORS und breite Bildschirme brauchten zusätzliche Aufmerksamkeit.</p>
  <p><strong>Entscheidung.</strong> Am 19. August 2024 habe ich die Styles über einen Theme-Provider geführt, sodass die Oberfläche Material 3 folgt und den dunklen Modus unterstützt. Das habe ich in <a href="https://www.figma.com/proto/DKwKzxmnYg9oQeuUSmrlN7/Tourguide_App?page-id=54496%3A24191&node-id=54852-28956&viewport=-5776%2C-250%2C2&t=4HYfco7oHsFnRHPh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=54852%3A28956" title="Interaktives Figma-Mockup" target="_blank">Figma</a> mit dem <a href="https://material-foundation.github.io/material-theme-builder/" title="Material Theme Builder" target="_blank">Material Theme Builder</a> ausgearbeitet, zusammen mit einem Durchgang an der Karte, während eine Tour läuft. Die <a href="https://tourguide-firebase.web.app" title="Tourguide-Web-App" target="_blank">Web-App</a> ging am 27. August 2024 online. Bis zum 2. Oktober 2024 habe ich Wegbeschreibungen über Cloud Functions geleitet, Layouts an mehr Bildschirmgrößen angepasst und Tippen-zum-Vorlesen per Text-to-Speech ergänzt. Das fehlende Web-Fortschritts-Event ging upstream an flutter_tts, und <a href="https://pub.dev/packages/google_maps_custom_marker" title="Paket google_maps_custom_marker auf pub.dev" target="_blank">google_maps_custom_marker</a> kam auf pub.dev.</p>
  <p><strong>Ergebnis.</strong> Android und Web teilten sich diese Material-3-Oberfläche, Tippen-zum-Vorlesen und die beiden öffentlichen Paketkorrekturen.</p>
  <h3>Explore, Gäste und Freunde</h3>
  <p><strong>Problem.</strong> Explore konnte Touren auflisten, und die Suche fehlte noch. Eine Live-Sitzung brauchte außerdem die Karte, ohne die ganze Zeit den Standort anzufordern.</p>
  <p><strong>Entscheidung.</strong> Am 2. September 2026 bekam Explore die Suche. Der Standort wird nur angefordert, wenn etwas ihn braucht. Freunde können einer Live-Sitzung beitreten und sich gegenseitig auf der Karte sehen.</p>
  <p><strong>Ergebnis.</strong> Suche, Standort auf Anfrage und Freunde auf der Karte wurden zusammen ausgeliefert.</p>
</section>
<section class="sectionText">
  <h2>Architektur und KI</h2>
  <p><strong>Firebase.</strong> Touren, das Profil und der erste Gemini-Chat liegen auf Firebase, mit Places, Maps und Vertex AI. Play-E-Mail und Meldungen laufen über Firebase-Erweiterungen und Cloud Functions. Der Kompromiss ist die Konzentration: Das Produkt und diese Store-Anforderungen teilen sich ein Backend.</p>
  <p><strong>Cloud Functions.</strong> Den Web-Build an Android anzupassen bedeutete, Wegbeschreibungen über Cloud Functions zu leiten. Der Kompromiss ist, dass Wegbeschreibungen im Web von Cloud Functions abhängen.</p>
  <p><strong>Offline-Modus.</strong> Am 30. September 2026 konnten Touren auf Android für die Offline-Nutzung gespeichert werden. Das Cover und die Wegbeschreibungen bleiben auf dem Gerät, eine Tour kann nach einem Neustart weitermachen, und wenn Wegbeschreibungen fehlen, zeichnet die App eine gerade Linie. Der Kompromiss ist die Web-App, die online bleibt.</p>
  <p><strong>Gemini-Grounding.</strong> Am 28. September 2026 wurde aus dem Chat Guide. Threads bleiben getrennt. Eine Frage kann aus einer Vorschau oder einer laufenden Tour starten, und eine Antwort kann auf eine echte Tour verweisen. Diese Fragen decken Unternehmungen, Touren in der Nähe, mehr zu einem Stopp und den Weg dorthin ab. Gemini läuft über Firebase AI, mit Maps- oder Search-Grounding, wenn es hilft. Der Kompromiss ist selektives Grounding, eingesetzt, wenn es hilft.</p>
</section>
<section class="sectionText">
  <h2>Ergebnis</h2>
  <p>Ausgeliefert wurden der Release-Pfad und Guide. Fastlane und GitHub Actions deployen von main. Der offene Test umfasste Meldefunktion, Kontolöschung und rechtliche Seiten, mit Datenschutzerklärung und Nutzungsbedingungen auf tourguide.rmichels.com. Ein fehlendes Web-Fortschritts-Event ging upstream an flutter_tts, und google_maps_custom_marker ist auf pub.dev. Guide bindet Gemini über Firebase AI ein, mit Maps- oder Search-Grounding.</p>
  <p>TODO(Robert): what Tourguide is iterating on next. The page only says iOS if people ask.</p>
  <p>iOS wartet, bis jemand danach fragt.</p>
</section>
<section class="sectionText">
  <h2>Reflexion</h2>
  <p>Das Widget-Modell von Flutter hat die plattformübergreifende Oberfläche praktikabel gemacht. StatelessWidget und StatefulWidget, zusammen mit Providern, gaben den Screens eine Struktur, die ich vom ersten Android-Build bis zu den breiteren Web-Layouts erweitern konnte.</p>
  <p>Ein Theme-Provider machte Material 3 und den dunklen Modus zu einer einzigen Implementierung für Android und das Web. Layouts an mehr Bildschirmgrößen anzupassen gehörte zu derselben Aufgabe: ein Produkt, zwei Clients.</p>
</section>
<section class="sectionText">
  <h2>Credits und Links</h2>
  <p>Ich habe Tourguide allein entworfen und gebaut. Fragen oder Feedback: <a href="mailto:contact@tourguide.rmichels.com">contact@tourguide.rmichels.com</a>.</p>
  <ul>
    <li><a href="https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp" title="Tourguide bei Google Play (Beta)" target="_blank">Google Play</a></li>
    <li><a href="https://tourguide-firebase.web.app" title="Tourguide-Web-App (Beta)" target="_blank">Web-App</a></li>
    <li><a href="https://www.figma.com/proto/DKwKzxmnYg9oQeuUSmrlN7/Tourguide_App?page-id=54496%3A24191&node-id=54852-28956&viewport=-5776%2C-250%2C2&t=4HYfco7oHsFnRHPh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=54852%3A28956" title="Interaktives Figma-Mockup" target="_blank">Figma-Prototyp</a></li>
    <li><a href="https://material-foundation.github.io/material-theme-builder/" title="Material Theme Builder" target="_blank">Material Theme Builder</a></li>
    <li><a href="https://pub.dev/packages/google_maps_custom_marker" title="Paket google_maps_custom_marker auf pub.dev" target="_blank">google_maps_custom_marker</a></li>
    <li><a href="https://tourguide.rmichels.com/privacyPolicy.html" target="_blank">Datenschutzerklärung</a></li>
    <li><a href="https://tourguide.rmichels.com/termsOfService.html" target="_blank">Nutzungsbedingungen</a></li>
  </ul>
</section>
