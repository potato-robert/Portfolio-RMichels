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
  <h2>Snapshot</h2>
  <p>I built out Clirio Cloud, the Blazor site where Clirio Suite users manage geospatial workspaces and share photogrammetry scans in the browser.</p>
  <ul>
    <li><strong>Role:</strong> Mixed Reality Software Developer. After the initial setup, I was the primary developer of workspace management, the dashboard, and the Clirio Scan Share webviewer.</li>
    <li><strong>Team:</strong> Robert Michels. Timothy Thibault set up Blazor, authentication, subscriptions, and workspace listing, and he implemented Scan Share link generation and token sharing. Jordan Wischmann designed the dashboard mockups and the share UI. Tonio Stillman advised the Unity controller event-listener pattern.</li>
    <li><strong>Timeline:</strong> May 2021–March 2024.</li>
    <li><strong>Platforms:</strong> HoloLens, Quest 2, Apple Vision Pro, iPhone AR, Android AR, Windows UWP.</li>
    <li><strong>Stack:</strong> Blazor, C#, Three.js, Tailwind CSS, Azure, and Bing maps.</li>
    <li><strong>Status:</strong> Live at https://cloud.clir.io/. Sample share: https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn</li>
  </ul>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <img src="/assets/img/clirioCloud/lqip/dashboard.jpg" alt="Clirio Cloud analytics dashboard">
    <figcaption>Analytics dashboard I implemented from Jordan Wischmann's mockups.</figcaption>
  </figure>
</section>
<section class="sectionText">
  <h2>Context and problem</h2>
  <p>Clirio Suite users capture and upload photogrammetry scans in the iOS apps, the primary capture platform. Clirio Cloud is the browser for the rest of a geospatial workspace: other 3D models, custom basemaps, boreholes, guest invitations, points of interest, and workspace deletion. The same site holds an analytics dashboard, the knowledge base and training videos, and subscription and account tools.</p>
</section>
<section class="sectionText">
  <h2>My role and approach</h2>
  <p>From May 2021 to March 2024 I was a Mixed Reality Software Developer. Timothy Thibault set up Blazor to try a C# web framework, since the Unity apps used C#, and he set up authentication, subscriptions, and workspace listing with metadata. After that handoff I owned workspace management and the dashboard. Jordan Wischmann designed the dashboard mockups, and I implemented them.</p>
</section>
<section class="sectionText">
  <h2>Key work</h2>
  <h3>Workspace tools</h3>
  <p><strong>Problem.</strong> The iOS apps handled capture. The rest of a workspace had no browser tools.</p>
  <p><strong>Decision.</strong> I built those tools on the workspace list already on the site.</p>
  <p><strong>Result.</strong> Users could manage the workspace in the browser, including models from outside the capture apps.</p>
  <h3>Dashboard</h3>
  <p><strong>Problem.</strong> The management tools did not include an analytics dashboard.</p>
  <p><strong>Decision.</strong> I partnered with Jordan Wischmann. He designed the dashboard mockups, and I implemented them in Blazor.</p>
  <p><strong>Result.</strong> That analytics dashboard shipped.</p>
  <h3>Forms bound to the model</h3>
  <p><strong>Problem.</strong> <span data-lightbox-id="img_createPoi" class="inTextLink">Create POI</span>, create 3D model, and edit basemaps had optional sections and lists a user might reorder. A handler on every control would have been boilerplate.</p>
  <p><strong>Decision.</strong> I bound each form to its data model, so input, optional sections, and list order updated together.</p>
  <p><strong>Result.</strong> Those three forms stay in sync with their models.</p>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaSquare">
      <figure>
        <img src="/assets/img/clirioCloud/lqip/workspaceList.jpg" alt="List of Clirio Cloud workspaces">
        <figcaption>Workspace list with metadata. The management tools I added open from here.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/clirioCloud/lqip/workspaceView.jpg" alt="Workspace management tools in Clirio Cloud">
        <figcaption>Workspace tools beyond what the iOS apps capture.</figcaption>
      </figure>
      <figure id="img_createPoi">
        <img src="/assets/img/clirioCloud/lqip/createPoi.jpg" alt="Create point of interest form">
        <figcaption>Create POI, kept in sync with its model.</figcaption>
      </figure>
    </div>
  </figure>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
      <figure>
        <img src="/assets/img/clirioCloud/lqip/create3dModel.jpg" alt="Create 3D model form">
      </figure>
      <figure>
        <img src="/assets/img/clirioCloud/lqip/editBasemaps.jpg" alt="Edit basemaps form">
      </figure>
    </div>
    <figcaption>Create 3D model and edit basemaps. Sections and list order follow the model.</figcaption>
  </figure>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/062fa22fe781689ed11a85d85e4b2b3e.js"></script>
</section>
<section class="sectionText">
  <h2>Share UI iterations</h2>
  <p>Clirio Scan Share is how a photogrammetry scan from the Clirio Scan app leaves Clirio View. I designed the share UX as a pop-up on a scan's observation details, and the Three.js webviewer was my focus. Jordan Wischmann designed the UI in Figma. Timothy Thibault implemented link generation and token sharing, returning the URL the client shows and shares.</p>
  <p>The share UI was first developed for <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> with few options. It was later expanded with expiry, password protection, and an embed iframe. In 2023 the UI was refreshed in collaboration with <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> as Clirio View migrated to <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a>. The pop-up sets expiry, a password, and an optional rule that the viewer was invited to the workspace and signs in with Clirio. The user can copy the link, open the platform share sheet, or generate a formatted embed iframe.</p>
  <h3>A layout that follows the configuration</h3>
  <p>Designing that UX was the hardest part. Private shares, limited to the workspace team, needed an extra authentication flow in the webviewer, and other options had to stay hidden until they applied. Expiry renewal and a password change use a dynamic layout. After each interaction, a matching share shows its link, and any other configuration shows the generate button.</p>
  <p>After a discussion with Tonio Stillman, I set every event listener in the controller, kept the functions private, and assigned each button once in the inspector. That cut the setup errors of <code>OnClick()</code> handlers wired in the editor.</p>
  <h3>The webviewer</h3>
  <p>The webviewer stood alone, so I built most of it from scratch with Blazor, Three.js, and Tailwind CSS. A guest looks at the scan from different angles, with metadata, a scale legend, and show or hide controls. The hard parts were SAS tokens on MTL textures, varied MTL formats and material properties, and keeping the viewer dynamic across model sizes and devices.</p>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-equalWidth">
      <figure>
        <img src="/assets/img/clirioScanShare/lqip/scanShareClientSideUi.png" alt="Share options pop-up in Clirio View">
        <figcaption>Share pop-up: expiry, password, and workspace access.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/clirioScanShare/lqip/scanShareClientSideUiEmbed.png" alt="Embed options in the share pop-up">
        <figcaption>Embed options that generate a formatted iframe.</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/lqip/clirioScanShare.jpg" class="whiteFrame" alt="Scan Share webviewer with a photogrammetry scan">
        <figcaption>Guest webviewer in the browser: the scan, metadata, and a scale legend.</figcaption>
      </figure>
    </div>
  </figure>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <div class="mediaRow mediaRow-centered">
      <figure>
        <img src="/assets/img/clirioScanShare/lqip/scanShareWalkthrough.jpg" lqip-gif class="whiteFrame" alt="Walkthrough of the share pop-up">
        <figcaption>Walkthrough: the link or the generate button follows the configuration.</figcaption>
      </figure>
    </div>
  </figure>
</section>
<section class="sectionMedia">
  <figure ignorecarousel>
    <iframe src="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" style="width: 100%" class="clirioScanShareEmbed"></iframe>
    <figcaption>Embedded scan share. Click and drag to change the angle, or open the same share on its <a href="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" target="_blank">page</a>.</figcaption>
  </figure>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/ec153ae228a8ae3f6fe28b143073b669.js"></script>
</section>
<section class="sectionText">
  <h2>Outcome</h2>
  <p>Clirio Suite users manage workspaces in the browser and share photogrammetry scans with guests who do not install an app.</p>
  <p>TODO(Robert): a publishable Clirio Cloud customer or usage figure, if the qualitative line is not enough.</p>
</section>
<section class="sectionText">
  <h2>Reflection</h2>
  <p>I would still keep web work in C# beside the Unity apps. Blazor made that handoff possible.</p>
  <p>I would still bind a form to its model, so sections and lists update with the input.</p>
  <p>I would still show share options only when they apply, with each listener set once on the controller.</p>
</section>
<section class="sectionText">
  <h2>Credits and links</h2>
  <p>I owned workspace management, the dashboard, and the Scan Share webviewer. <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a> set up Blazor, authentication, subscriptions, and workspace listing, and he implemented Scan Share link generation and token sharing. <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> designed the dashboard and the share UI. The 2023 UI was refreshed in collaboration with him. <a href="https://www.linkedin.com/in/toniostillman" target="_blank">Tonio Stillman</a> advised the controller listeners.</p>
  <ul>
    <li><a href="https://cloud.clir.io/" target="_blank">Clirio Cloud</a></li>
    <li><a href="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" target="_blank">Sample share</a></li>
    <li><a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> and <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a></li>
  </ul>
</section>
