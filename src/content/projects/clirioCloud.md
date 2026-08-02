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
  en: "A web-based collection of tools for managing workspaces in Clirio View. Includes a user dashboard, workspace and observation creation tools, and interactive Bing maps."
  de: "Eine webbasierte Sammlung von Tools zur Verwaltung von Arbeitsbereichen in Clirio View. Enthält ein Benutzer-Dashboard, Tools zur Erstellung von Arbeitsbereichen und Beobachtungen sowie interaktive Bing-Karten."
links:
  - label: "Clirio Cloud"
    url: "https://cloud.clir.io/"
heroAltLayout: false
order: 4
---

<section class="sectionText">
    <h2>Overview</h2>
    <p>Clirio Cloud is a collection of tools that have been growing over time. These tools are provided to users of the Clirio Suite on a website developed with Blazor. Clirio builds solutions that help users inspect, document, and collaborate in 3D and XR on geospatial workspaces.</p>
    <p>One of the main goals of Clirio Cloud is to complement the upload and organizational capabilities of the iOS Clirio apps, which serve as the primary capture platform. While a user can easily capture and upload 3D photogrammetry scans with Clirio's iOS apps, they might also want to upload other 3D models, for which Clirio Cloud provides an interface. Other workspace tools are upload and management of custom basemaps, upload of boreholes, guest invitations, point of interest creation, and workspace deletion.</p>
    <p>Furthermore, Clirio Cloud provides an analytics dashboard to users, as well as an easy way to access the Clirio knowledge base and training videos. Finally, there also are subscription and account management tools.</p>
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
