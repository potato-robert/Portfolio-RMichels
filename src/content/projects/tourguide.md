---
slug: "tourguide"
name:
  en: "Tourguide"
  de: "Tourguide"
format: cross-platform-app
year: "2024"
ongoing: true
context: personal
inDevelopment: false
stack: ["flutter", "firebase", "dart", "ai-development", "gcp"]
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
      <h2>Overview</h2>
      <p>While on vacation in Rome, I noticed a lack of services for self-guided tours that combine navigation and information about places. There are websites with suggested daily itineraries, wikipedia to learn about the history and more, and Google Maps supports adding a small number of places into a route, but there was no cohesive platform combining everything.</p>
      <p>I had been wanting to try out the Flutter framework, and this seemed like the perfect opportunity to build a cross-platform app with it.</p>
      <p>Tourguide is in beta on <a href="https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp" title="Tourguide on Google Play (Beta)" target="_blank">Google Play</a> and as a <a href="https://tourguide-firebase.web.app" title="Tourguide Web App (Beta)" target="_blank">web app</a>.</p>
      <h3>Explore</h3>
      <p>Browse popular tours near you, around the world, or search for a place. Bookmark or download tours to run offline.</p>
      <h3>Tour</h3>
      <p>Run a tour and follow its route with directions and place descriptions which can be read out loud with text-to-speech.</p>
      <h3>Guide</h3>
      <p>Ask the AI guide about things to do and nearby tours. When running a tour, ask about more information on each stop and how to get there. Powered by Gemini through Firebase AI.</p>
      <h3>Settings</h3>
      <p>Manage app and profile settings, create tours, and other settings.</p>
    </div>
  </section>
  <video id="video" src="/assets/video/tourguideScreencap.mp4" style="display:none" preload="none" loop muted playsinline poster="/assets/video/frame.jpg"></video>
  <section class="sectionText">
    <h2>Development History</h2>
    <h3>Offline tours - September 30, 2026</h3>
    <p>Tours on Android can now be saved for offline use. The cover and directions stay on the device, a tour can pick up after a restart, and if directions are missing it just draws a straight line. The web app stays online.</p>
    <h3>Guide - September 28, 2026</h3>
    <p>The chat became Guide: separate threads, questions from a preview or a running tour, and replies that can point at real tours. Gemini runs through Firebase AI, with Maps or Search grounding when it helps.</p>
    <h3>Explore, guests, and friends - September 2, 2026</h3>
    <p>Explore picked up search, and location is only requested when something actually needs it. Friends can join a live session and see each other on the map.</p>
    <h3>Web and TTS - October 2, 2024</h3>
    <p>Getting the web build to match Android meant routing directions through Cloud Functions and adapting layouts to more screen sizes. Tap-to-read text-to-speech came in at the same time. The missing web progress event went upstream to flutter_tts, and <a href="https://pub.dev/packages/google_maps_custom_marker" title="google_maps_custom_marker package on pub.dev" target="_blank">google_maps_custom_marker</a> went up on pub.dev.</p>
    <h3>Web app - August 27, 2024</h3>
    <p>The <a href="https://tourguide-firebase.web.app" title="Tourguide Web App" target="_blank">web app</a> went live. Flutter covered most of the port. Images, CORS, and wide screens were the parts that needed extra attention.</p>
    <h3>Material 3 - August 19, 2024</h3>
    <p>With open testing underway, the focus shifted to how the app looked. Styles now go through a theme provider, so the UI follows Material 3 and supports dark mode. That was worked out in <a href="https://www.figma.com/proto/DKwKzxmnYg9oQeuUSmrlN7/Tourguide_App?page-id=54496%3A24191&node-id=54852-28956&viewport=-5776%2C-250%2C2&t=4HYfco7oHsFnRHPh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=54852%3A28956" title="Interactive Figma Mockup" target="_blank">Figma</a> with the <a href="https://material-foundation.github.io/material-theme-builder/" title="Material Theme Builder" target="_blank">Material Theme Builder</a>, along with a pass on the map while a tour is running.</p>
    <h3>Play beta and CI/CD - July 29, 2024</h3>
    <p>Open testing on Google Play was more than uploading a build. Reporting, account deletion, and legal pages had to be in place, with email and reports handled through Firebase extensions and Cloud Functions. After that, Fastlane and GitHub Actions took over deploys from main.</p>
    <h3>First build - July 10, 2024</h3>
    <p>The first version was Android: create a tour, browse them, chat with Gemini, and a profile, on Firebase plus Places, Maps, and Vertex AI. A web version was the plan after that. iOS only if people asked for it.</p>
    <p>Questions or feedback: <a href="mailto:contact@tourguide.rmichels.com">contact@tourguide.rmichels.com</a>. Legal information: <a href="https://tourguide.rmichels.com/privacyPolicy.html" target="_blank">Privacy Policy</a> and <a href="https://tourguide.rmichels.com/termsOfService.html" target="_blank">Terms of Service</a>.</p>
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
      <figcaption>Screenshots from 2024/08/04</figcaption>
    </figure>
  </section>
  <section class="sectionText">
    <h2>What I've learned so far</h2>
    <p>Flutter has been a delight to work with. I was previously working at <a href="https://clir.io/">Clirio</a>, where I was creating complex UIs with C# in Unity, a setup that's not really ideal for creating complex UIs, even less so with Clirio's apps supporting VR, MR, touchscreens on iOS and Android, as well as Desktop, and catering UI for each of those platforms. In comparison to the challenges this posed, Flutter makes it a breeze to implement complex UIs across many devices, while also working with an intuitive architecture of Stateless- and StatefulWidgets, Providers, and a large amount of packages to help speed up common tasks.</p>
  </section>
