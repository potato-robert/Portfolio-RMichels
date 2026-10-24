---
slug: "clirioScanViews"
name:
  en: "Clirio View"
  de: "Clirio View"
projectType:
  en: "Unity App"
  de: "Unity App"
year: "2024"
company: "Clirio"
inDevelopment: false
roles: ["vr", "front-end"]
description:
  en: "Shipped Clirio View scan views across six platforms. I owned the UX and most of the scan-view logic."
  de: "Die Scan-Ansichten von Clirio View wurden auf sechs Plattformen ausgeliefert. Ich verantwortete die UX und den Großteil der Scan-Ansichts-Logik."
links:
  - label: "Clirio View Desktop"
    url: "https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP"
heroAltLayout: false
threeMockup: "hololens"
order: 1
---

<section class="sectionText">
  <h2>Snapshot</h2>
  <p>I designed and built most of the scan views in Clirio View, so people can load, measure, compare, and inspect photogrammetry scans on a map and in XR.</p>
  <ul>
    <li><strong>Role:</strong> Mixed Reality Software Developer. I owned the UX and most of the scan-view logic from prototype to release.</li>
    <li><strong>Team:</strong> Robert Michels, with contributions from Tonio Stillman, Timothy Thibault, Jordan Wischmann, and Erdem Gunay. Some behavior carried over from Ada Viewer.</li>
    <li><strong>Timeline:</strong> May 2021–March 2024.</li>
    <li><strong>Platforms:</strong> HoloLens, Quest 2, Apple Vision Pro, iPhone AR, Android AR, Windows UWP.</li>
    <li><strong>Stack:</strong> Unity, C#, .NET, MRTK2, and MRTK3.</li>
    <li><strong>Status:</strong> Shipped on HoloLens, Quest 2, Apple Vision Pro, iPhone and Android AR, and Windows UWP. Clirio View Desktop: https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP</li>
  </ul>
</section>
<section class="sectionMedia">
  <div class="auto-resizable-iframe">
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/hdPXCnyH6us?playlist=hdPXCnyH6us&loop=1&autoplay=1&cc_load_policy=1&mute=1&modestbranding=1&rel=0" title="YouTube video player" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
    <figcaption>Quest walkthrough of the scan views in Clirio View. A scan opens on the map, then scan view measures it and compares it to another scan.</figcaption>
  </div>
</section>
<section class="sectionText">
  <h2>Context and problem</h2>
  <p>Clirio View was where people inspected photogrammetry scans after capturing them on LiDAR-enabled iOS devices. The views supported analysis and monitoring of construction sites: comparison showed what changed, and measure showed scale. Other 3D models uploaded on <a href="/clirioCloud">Clirio Cloud</a> opened in the same views.</p>
</section>
<section class="sectionText">
  <h2>My role and approach</h2>
  <p>I designed the UX and UI first, then prototyped in Unity and refined each feature until it shipped. I set up most of the logic and views on Clirio View, and some behavior carried over from Ada Viewer.</p>
</section>
<section class="sectionText">
  <h2>Key work</h2>
  <h3>Scan view with no map</h3>
  <p><strong>Problem.</strong> The first requirement was a scan with no map: AR on HoloLens 2, and a non-AR 3D view on iOS.</p>
  <p><strong>Decision.</strong> I designed that view as the core and set up most of its logic before map tools existed.</p>
  <p><strong>Result.</strong> Headset and iOS inspection shared a view the later tools could extend.</p>
  <h3>Measure and comparison</h3>
  <p><strong>Problem.</strong> Site monitoring needed a way to see change and a way to read scale. The plain scan view did neither.</p>
  <p><strong>Decision.</strong> I designed comparison and measure and set up most of the logic for them.</p>
  <p><strong>Result.</strong> From scan view, a person could measure the site and check one scan against another.</p>
  <h3>On the map and in XR</h3>
  <p><strong>Problem.</strong> After measure shipped, a located scan, XR scale, and per-platform comparison were still outstanding.</p>
  <p><strong>Decision.</strong> I designed on-map viewing, including a mode that keeps the scan visible as part of the map, and I set up most of that logic. In XR the scan scales to 1 m³, to 1:1, or by free hand manipulation. Comparison grew to three modes: side-by-side, swipe, and overlay. Swipe comparison on iOS crops the viewports. Overlay comparison in XR fades transparency.</p>
  <p><strong>Result.</strong> On-map viewing, XR scale, and the three comparison modes shipped.</p>
</section>
<section class="sectionText mockup hololens">
  <figcaption>HoloLens 2 scan view: the first headset requirement, AR with no map.</figcaption>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
      <figure>
        <img src="/assets/img/clirioScanViews/lqip/bridgeMapView.jpg" class="whiteFrame" alt="Desktop on-map view of a photogrammetry scan">
        <figcaption>Desktop on-map view. The scan sits on the map so a construction site can be read in context.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/clirioScanViews/lqip/bridgeScanView.jpg" class="whiteFrame" alt="Desktop scan view of a photogrammetry scan">
        <figcaption>Desktop scan view. Measure and comparison sit in this close 3D inspection view.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/clirioScanViews/lqip/scanComparison.jpg" lqip-webp class="whiteFrame" alt="Desktop scan view in comparison mode">
        <figcaption>Desktop comparison mode. Comparing scans is how site monitoring looks for change.</figcaption>
      </figure>
    </div>
  </figure>
</section>
<section class="sectionText">
  <h2>Cross-platform challenges</h2>
  <p>These views shipped from one codebase to six platforms: HoloLens, Quest 2, Apple Vision Pro, iPhone AR, Android AR, and Windows UWP. Each platform brought its own input. The views answered hand tracking, controllers, touch, and mouse. In XR that was free hand manipulation. On iOS and desktop it was touch or mouse. The engineering work was to keep one scan-view behavior as the flows, features, and states grew.</p>
  <h3>MRTK2, then MRTK3</h3>
  <p>Complexity ballooned in the final <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> versions. MRTK2 had poor cross-platform support, so iOS and the headsets used different prefabs, UI, and logic. I set up most of the view logic inside that split. The migration to <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a> combined view logic and prefabs, which greatly reduced complexity.</p>
  <p>TODO(Robert): a quantified Clirio View simplification. The page says the move to MRTK3 greatly reduced complexity and combined view logic and prefabs, and it does not give a count or percentage.</p>
  <h3>Formats, materials, and units</h3>
  <p>File formats were the other source of complexity. Scans and other 3D models came from different sources, with different features, material properties, texture reference formats, coordinates, and unit systems. I developed and tested for those differences. Models uploaded on Clirio Cloud went through that same work as scans captured on iOS.</p>
  <h3>Shared state</h3>
  <p>When two modes did the same job, I unified the behavior once there was time to refactor. Saving the initial state and the reset behavior became one path across platforms and modes. The logic for entering and leaving AR in scan view was combined with the logic for doing the same in map view, so both views shared one way in and one way out.</p>
</section>
<section class="sectionText">
  <h2>Outcome</h2>
  <p>Shipped on HoloLens, Quest 2, Apple Vision Pro, iPhone and Android AR, and Windows UWP. <a href="https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP" target="_blank">Clirio View Desktop</a> is on the Microsoft Store. These views shipped for construction-site monitoring.</p>
</section>
<section class="sectionText">
  <h2>Reflection</h2>
  <p>Three habits from this work are what I would repeat. I would still design the UX and UI before prototyping. I would still collapse two copies of the same behavior into one path. I would still share view logic and prefabs.</p>
</section>
<section class="sectionText">
  <h2>Credits and links</h2>
  <p>Contributions came from <a href="https://www.linkedin.com/in/toniostillman" target="_blank">Tonio Stillman</a>, <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>, <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a>, and <a href="https://www.linkedin.com/in/merdemgunay" target="_blank">Erdem Gunay</a>. I am not assigning a feature to any one of them here.</p>
  <ul>
    <li><a href="https://apps.microsoft.com/store/detail/clirio-view-desktop/9NB14S8DFWFP" target="_blank">Clirio View Desktop</a> on the Microsoft Store.</li>
    <li>Other 3D models are uploaded on <a href="/clirioCloud">Clirio Cloud</a>.</li>
    <li>Mixed reality tooling: <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> and <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a>.</li>
  </ul>
</section>
