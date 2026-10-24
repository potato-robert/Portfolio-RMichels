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
  <h2>Snapshot</h2>
  <p>I designed and built Tourguide, a Flutter app for browsing, running, and downloading guided tours, with an AI guide grounded in Gemini.</p>
  <ul>
    <li><strong>Role:</strong> Solo product engineer and designer, from concept through the Play Store release.</li>
    <li><strong>Team:</strong> Solo.</li>
    <li><strong>Timeline:</strong> July 2024–present. First Android build on 10 July 2024.</li>
    <li><strong>Platforms:</strong> Android and web.</li>
    <li><strong>Stack:</strong> Flutter, Firebase, Cloud Functions, Firebase AI, Gemini with Maps or Search grounding, Google Maps, Places, Fastlane, GitHub Actions, Figma, and Material 3.</li>
    <li><strong>Status:</strong> Public beta on Google Play and the web, with 10 testers. Google Play: https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp. Web: https://tourguide-firebase.web.app.</li>
  </ul>
</section>
<section class="sectionText mockup">
  <div>
    <h2>Context and problem</h2>
    <p>On a vacation in Rome I wanted a self-guided tour that held the route and the information about each place together. Itinerary sites could suggest a day, Wikipedia could supply the history, and Google Maps could add a small number of stops to a route. There was no single product for browsing a tour, walking it with directions, and reading about the place. I built Tourguide for that walk, and to learn Flutter by shipping it.</p>
  </div>
</section>
<video id="video" src="/assets/video/tourguideScreencap.mp4" style="display:none" preload="none" loop muted playsinline poster="/assets/video/frame.jpg"></video>
<section class="sectionText">
  <h2>My role and approach</h2>
  <p>I owned Tourguide alone, from the concept through design and the Play Store release. Explore browses popular tours nearby or around the world, searches for a place, and bookmarks or downloads a tour. Tour follows the route with directions and place descriptions, which text-to-speech can read aloud. Guide is the Gemini conversation about a tour. Settings holds the profile, creating tours, and the other preferences. I designed the screens in Figma and built them in Flutter.</p>
</section>
<section class="sectionText">
  <h2>Key work</h2>
  <h3>Android first</h3>
  <p><strong>Problem.</strong> The first release had to be one platform I could ship while I learned Flutter.</p>
  <p><strong>Decision.</strong> The first version was Android: create a tour, browse tours, chat with Gemini, and a profile, on Firebase plus Places, Maps, and Vertex AI. A web version was the plan after that.</p>
  <p><strong>Result.</strong> That build was ready on 10 July 2024.</p>
  <h3>Open testing</h3>
  <p><strong>Problem.</strong> Open testing on Google Play was more than uploading a build.</p>
  <p><strong>Decision.</strong> I put reporting, account deletion, and legal pages in place, and I handled email and reports through Firebase extensions and Cloud Functions. Fastlane and GitHub Actions then deployed from main.</p>
  <p><strong>Result.</strong> Open testing started on 29 July 2024. The screens below are from 4 August 2024.</p>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
      <figure>
        <img src="/assets/img/tourguide/Screenshot_1.webp" alt="Tourguide screenshot 1 of 6 from 4 August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_2.webp" alt="Tourguide screenshot 2 of 6 from 4 August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_3.webp" alt="Tourguide screenshot 3 of 6 from 4 August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_4.webp" alt="Tourguide screenshot 4 of 6 from 4 August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_5.webp" alt="Tourguide screenshot 5 of 6 from 4 August 2024">
      </figure>
      <figure>
        <img src="/assets/img/tourguide/Screenshot_6.webp" alt="Tourguide screenshot 6 of 6 from 4 August 2024">
      </figure>
    </div>
    <figcaption>Screens from 4 August 2024, during open testing and before the Material 3 restyle on 19 August 2024.</figcaption>
  </figure>
</section>
<section class="sectionText">
  <h3>Material 3, web, and speech</h3>
  <p><strong>Problem.</strong> With open testing underway, the UI needed a visual system, and the web build had to match Android. Flutter covered most of the port. Images, CORS, and wide screens needed extra attention.</p>
  <p><strong>Decision.</strong> On 19 August 2024 I moved styles through a theme provider so the UI follows Material 3 and supports dark mode. I worked that out in <a href="https://www.figma.com/proto/DKwKzxmnYg9oQeuUSmrlN7/Tourguide_App?page-id=54496%3A24191&node-id=54852-28956&viewport=-5776%2C-250%2C2&t=4HYfco7oHsFnRHPh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=54852%3A28956" title="Interactive Figma Mockup" target="_blank">Figma</a> with the <a href="https://material-foundation.github.io/material-theme-builder/" title="Material Theme Builder" target="_blank">Material Theme Builder</a>, along with a pass on the map while a tour is running. The <a href="https://tourguide-firebase.web.app" title="Tourguide Web App" target="_blank">web app</a> went live on 27 August 2024. By 2 October 2024 I routed directions through Cloud Functions, adapted layouts to more screen sizes, and added tap-to-read text-to-speech. The missing web progress event went upstream to flutter_tts, and <a href="https://pub.dev/packages/google_maps_custom_marker" title="google_maps_custom_marker package on pub.dev" target="_blank">google_maps_custom_marker</a> went up on pub.dev.</p>
  <p><strong>Result.</strong> Android and web shared that Material 3 UI, tap-to-read speech, and the two public package fixes.</p>
  <h3>Explore, guests, and friends</h3>
  <p><strong>Problem.</strong> Explore could list tours, and search was still missing. A live session also needed the map without requesting location the whole time.</p>
  <p><strong>Decision.</strong> On 2 September 2026 Explore picked up search. Location is requested only when something needs it. Friends can join a live session and see each other on the map.</p>
  <p><strong>Result.</strong> Search, location on request, and friends on the map shipped together.</p>
</section>
<section class="sectionText">
  <h2>Architecture and AI</h2>
  <p><strong>Firebase.</strong> Tours, the profile, and the first Gemini chat sit on Firebase, with Places, Maps, and Vertex AI. Play email and reports go through Firebase extensions and Cloud Functions. The trade-off is concentration: the product and those store requirements share one backend.</p>
  <p><strong>Cloud Functions.</strong> Getting the web build to match Android meant routing directions through Cloud Functions. The trade-off is that web directions depend on Cloud Functions.</p>
  <p><strong>Offline mode.</strong> On 30 September 2026, tours on Android could be saved for offline use. The cover and directions stay on the device, a tour can pick up after a restart, and if directions are missing it draws a straight line. The trade-off is the web app, which stays online.</p>
  <p><strong>Gemini grounding.</strong> On 28 September 2026 the chat became Guide. Threads stay separate. A question can start from a preview or a running tour, and a reply can point at a real tour. Those questions cover things to do, nearby tours, more about a stop, and how to get there. Gemini runs through Firebase AI, with Maps or Search grounding when it helps. The trade-off is selective grounding, used when it helps.</p>
</section>
<section class="sectionText">
  <h2>Outcome</h2>
  <p>What shipped is the release path and Guide. Fastlane and GitHub Actions deploy from main. Open testing included reporting, account deletion, and legal pages, with the privacy policy and terms on tourguide.rmichels.com. A missing web progress event went upstream to flutter_tts, and google_maps_custom_marker is on pub.dev. Guide integrates Gemini through Firebase AI, with Maps or Search grounding.</p>
  <p>TODO(Robert): what Tourguide is iterating on next. The page only says iOS if people ask.</p>
  <p>iOS waits until people ask for it.</p>
</section>
<section class="sectionText">
  <h2>Reflection</h2>
  <p>Flutter's widget model is what made the cross-platform UI practical. StatelessWidget and StatefulWidget, together with Providers, gave the screens a structure I could extend from the first Android build through the wider web layouts.</p>
  <p>One theme provider made Material 3 and dark mode a single implementation for Android and the web. Fitting layouts to more screen sizes was part of that same job: one product, two clients.</p>
</section>
<section class="sectionText">
  <h2>Credits and links</h2>
  <p>I designed and built Tourguide solo. Questions or feedback: <a href="mailto:contact@tourguide.rmichels.com">contact@tourguide.rmichels.com</a>.</p>
  <ul>
    <li><a href="https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp" title="Tourguide on Google Play (Beta)" target="_blank">Google Play</a></li>
    <li><a href="https://tourguide-firebase.web.app" title="Tourguide Web App (Beta)" target="_blank">Web app</a></li>
    <li><a href="https://www.figma.com/proto/DKwKzxmnYg9oQeuUSmrlN7/Tourguide_App?page-id=54496%3A24191&node-id=54852-28956&viewport=-5776%2C-250%2C2&t=4HYfco7oHsFnRHPh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=54852%3A28956" title="Interactive Figma Mockup" target="_blank">Figma prototype</a></li>
    <li><a href="https://material-foundation.github.io/material-theme-builder/" title="Material Theme Builder" target="_blank">Material Theme Builder</a></li>
    <li><a href="https://pub.dev/packages/google_maps_custom_marker" title="google_maps_custom_marker package on pub.dev" target="_blank">google_maps_custom_marker</a></li>
    <li><a href="https://tourguide.rmichels.com/privacyPolicy.html" target="_blank">Privacy Policy</a></li>
    <li><a href="https://tourguide.rmichels.com/termsOfService.html" target="_blank">Terms of Service</a></li>
  </ul>
</section>
