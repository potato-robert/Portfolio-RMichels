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
    <h2>Overview</h2>
    <p>Clirio Cloud is a collection of tools that have been growing over time. These tools are provided to users of the Clirio Suite on a website developed with Blazor. Clirio builds solutions that help users inspect, document, and collaborate in 3D and XR on geospatial workspaces.</p>
    <p>One of the main goals of Clirio Cloud is to complement the upload and organizational capabilities of the iOS Clirio apps, which serve as the primary capture platform. While a user can easily capture and upload 3D photogrammetry scans with Clirio's iOS apps, they might also want to upload other 3D models, for which Clirio Cloud provides an interface. Other workspace tools are upload and management of custom basemaps, upload of boreholes, guest invitations, point of interest creation, and workspace deletion.</p>
    <p>Furthermore, Clirio Cloud provides an analytics dashboard to users, as well as an easy way to access the Clirio knowledge base and training videos. Finally, there also are subscription and account management tools.</p>
    <p>Beyond workspace management, the same Blazor and Three.js stack powers Scan Share: a lightweight webviewer and guest links that let users share photogrammetry scans captured in Clirio View. Share options in the Unity app configure expiry, password protection, workspace invitations, and embeddable iframes; recipients open the scan in the browser without installing an app.</p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaSquare">
        <figure>
          <img src="/assets/img/clirioCloud/lqip/dashboard.jpg" alt="Dashboard">
          <figcaption>Dashboard</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/clirioCloud/lqip/workspaceList.jpg" alt="Workspace List">
          <figcaption>Workspace List</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/clirioCloud/lqip/workspaceView.jpg" alt="Workspace Management Tools">
          <figcaption>Workspace Management Tools</figcaption>
        </figure>
        <figure id="img_createPoi">
          <img src="/assets/img/clirioCloud/lqip/createPoi.jpg" alt="Workspace Management Example: Create POI">
          <figcaption>Workspace Management Example: Create POI</figcaption>
        </figure>
      </div>
    </figure>
  </section>
  <section class="sectionText">
    <h2>Development</h2>
    <p>The website was initially set up by <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a> using Blazor, to try using a web framework that has C# as its programming language, which would be an advantage considering we also used C# for Unity development. After setting up authentication, subscription management, and workspace listing with metadata, development was mostly handed off to me.</p>
    <p></p>
    <p>After adding all of the workspace management features such as 3D model upload and user invitations, I started working on another set of stories revolving around the dashboard. I partnered up with <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a>, who designed mockups, which I then implemented.</p>
    <p></p>
    <h3>Learning</h3>
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
      <figcaption>Some examples of data model binding to forms in Blazor. Expanding/collapsing optional sections of the form, and rearranging elements in a list, is made easy with Blazor since user inputs result in direct feedback without the need to write boilerplate code.</figcaption>
    </figure>
  </section>
  <section class="sectionMedia">
    <div class="divText">
      <h2>Code Sample</h2>
      <p>An example of data binding between the form and data model for the <span data-lightbox-id="img_createPoi" class="inTextLink">Create POI</span> page.</p>
    </div>
    <script src="https://gist.github.com/potato-robert/062fa22fe781689ed11a85d85e4b2b3e.js"></script>
  </section>
  <section class="sectionText">
    <h2>Scan Share</h2>
    <p>Scan Share lets users quickly share a photogrammetry scan captured with the Clirio Scan app. The feature combines share options in the Clirio View app (Unity) with a webviewer (Blazor and Three.js) where shared scans can be viewed. Pressing the share button in Clirio View opens a pop-up to configure the share: expiry, password protection, optional requirement that the viewer was invited to the workspace (Clirio login), copy-to-clipboard or native share sheets, and generation of a formatted embed iframe.</p>
    <p>The webviewer is intended to be as lightweight and accessible as possible. The scan can be viewed from different angles, metadata and a scale legend are displayed, and controls hide or show elements.</p>
  </section>
  <figure ignorecarousel>
    <iframe src="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" style="width: 100%" class="clirioScanShareEmbed"></iframe>
    <figcaption>An interactive example of an embedded scan share. Click and drag to look at the model from different angles. The same share can also be opened on its <a href="https://clirioview-viw-prd.azurewebsites.net/guest/MEVdEANk9_Zhr6tlm4ibd1Vn" target="_blank">page</a>.</figcaption>
  </figure>
  <section class="sectionText">
    <h3>Share UI and webviewer</h3>
    <p>The client-side share UI was developed with C# in Unity as a pop-up from the observation details of any scan; UI was designed in Figma with <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a>. The webviewer and Three.js front end were my focus; backend token sharing was implemented by <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>.</p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaRow mediaRow-equalWidth">
        <figure>
          <img src="/assets/img/clirioScanShare/lqip/scanShareClientSideUi.png" alt="Share UI">
          <figcaption>Share UI</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/clirioScanShare/lqip/scanShareClientSideUiEmbed.png" alt="Embed UI">
          <figcaption>Embed UI</figcaption>
        </figure>
        <figure>
          <img src="/assets/img/lqip/clirioScanShare.jpg" class="whiteFrame" alt="Webviewer">
          <figcaption>Webviewer</figcaption>
        </figure>
      </div>
    </figure>
  </section>
  <section class="sectionText">
    <h3>Share UI iterations</h3>
    <p>The share UI has gone through multiple iterations. Initially developed for <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/" target="_blank">MRTK2</a> with few options, the feature was later expanded to include expiry, password protection, and embed functionalities. In 2023, the UI was refreshed in collaboration with <a href="https://www.linkedin.com/in/jordan-wischmann-32a4b380/" target="_blank">Jordan Wischmann</a> as the Clirio View app migrated to <a href="https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk3-overview/" target="_blank">MRTK3</a>.</p>
    <p>The backend API for link generation was implemented by <a href="https://www.linkedin.com/in/timthibault/" target="_blank">Timothy Thibault</a>. The returned result includes a URL for the client to display to the user and to include in native share options for each platform.</p>
    <p>The biggest challenge for me was designing the UX, as there were many options for the user—including private shares restricted to workspace teams, which required an additional authentication flow in the webviewer. I used dynamic layouts so hidden options such as expiry renewal or password change could be shown or hidden cleanly. After every user interaction, the UI refreshes to match the share configuration; if a share matches the configuration, that link is shown, otherwise the generate share button appears.</p>
    <p>An approach I first tested on this feature, after a discussion with <a href="https://www.linkedin.com/in/toniostillman" target="_blank">Tonio Stillman</a>, was to set all event listeners in the controller itself, keep listener functions private, and assign each button once in the inspector—reducing setup errors compared to wiring many <code>OnClick()</code> handlers in the editor.</p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaRow mediaRow-centered">
        <figure>
          <img src="/assets/img/clirioScanShare/lqip/scanShareWalkthrough.jpg" lqip-gif class="whiteFrame" alt="Share UX Walkthrough">
          <figcaption>Share UX Walkthrough</figcaption>
        </figure>
      </div>
    </figure>
  </section>
  <section class="sectionText">
    <h3>Three.js webviewer</h3>
    <p>Implementing the webviewer was the more complex story, as it was standalone and most functionality needed to be created from scratch. The viewer uses Blazor, Three.js, and Tailwind CSS. Challenges included loading texture files from MTL with correct SAS tokens, supporting varied MTL formats and material properties, and keeping the viewer dynamic across model sizes and devices.</p>
  </section>
  <section class="sectionMedia">
    <div class="divText">
      <h2>Code Sample</h2>
      <p>Scan Share webviewer setup (Three.js).</p>
    </div>
    <script src="https://gist.github.com/potato-robert/ec153ae228a8ae3f6fe28b143073b669.js"></script>
  </section>
