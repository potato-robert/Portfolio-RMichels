---
slug: "portfolio"
name:
  en: "Portfolio Website"
  de: "Portfolio Website"
projectType:
  en: "Static Website"
  de: "Statische Website"
year: "2020"
inDevelopment: false
roles: ["front-end", "back-end", "threejs", "design"]
description:
  en: "Bilingual site live at rmichels.com, from Figma through an Astro migration. I designed and built it solo."
  de: "Zweisprachige Website live auf rmichels.com, von Figma über die Astro-Migration. Ich habe sie allein entworfen und gebaut."
links:
  - label: "GitHub"
    url: "https://github.com/potato-robert/Portfolio-RMichels"
heroAltLayout: false
order: 6
---

<section class="sectionText">
  <h2>Snapshot</h2>
  <p>I designed and built this portfolio as a bilingual static site, from Figma through an Astro migration, 3D, and continuous deployment.</p>
  <ul>
    <li><strong>Role:</strong> Solo designer and developer.</li>
    <li><strong>Team:</strong> Solo.</li>
    <li><strong>Timeline:</strong> 2020–present. Development began in 2020 on a LAMP stack and later moved to Astro.</li>
    <li><strong>Platforms:</strong> Web (https://rmichels.com).</li>
    <li><strong>Stack:</strong> Figma, Astro, TypeScript islands, Sass, Three.js, and markdown content collections. The earlier site was LAMP. The portrait pipeline is RealityCapture and Blender. GitHub Actions builds and deploys the site. The site sets no cookies and uses cookieless analytics with an opt-out.</li>
    <li><strong>Status:</strong> Live at https://rmichels.com. Source: https://github.com/potato-robert/Portfolio-RMichels</li>
  </ul>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/portfolio/modelProcess.webp" alt="Screenshot from Blender, where I cleaned up the photogrammetry capture of myself, which was created with RealityCapture.">
      <figcaption class="center">I cleaned this photogrammetry capture of myself in Blender after creating it in RealityCapture. The screenshot is the portrait pipeline for the 3D on this site.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h2>Context and problem</h2>
  <p>This site is for employers and partners who want a direct view of my skills, experience, and interests. A job application makes that audience specific: the link should open the projects that match the role, which is what the homepage filter is for. The site has a second purpose. I practice full-stack and static-site development on the same pages I use to show the work, I share that work with design and developer communities, and I try technologies and ideas I am interested in.</p>
</section>
<section class="sectionText">
  <h2>My role and approach</h2>
  <p>I am the only designer and the only developer. Development began in 2020, and I have kept design and implementation as one job since then. Before I built the site, I browsed the web for portfolios, saved a collection of links, and turned that collection into a moodboard. I designed the pages in Figma from that moodboard. The embed below is that file, and it remains the design record.</p>
  <p>I connect that design to the engineering by owning the content model, the homepage filter for job links, and the deploy. The same build serves English and German.</p>
</section>
<div class="auto-resizable-iframe">
  <div>
    <iframe
      height="450"
      width="800"
      src="https://www.figma.com/embed?embed_host=astra&url=https://www.figma.com/file/xPdNmMgz0wm4pf0wcf1j8C/Portfolio?type=design&node-id=1%3A951&t=QGxHsmY0wqgq1XLX-1"
      allowfullscreen
    >
    </iframe>
  </div>
</div>
<section class="sectionText">
  <h2>Key work</h2>
  <h3>From LAMP to a static build</h3>
  <p><strong>Problem.</strong> The first version ran on a LAMP stack, with the portfolio data in a database. I needed faster loads and a simpler way to deploy.</p>
  <p><strong>Decision.</strong> I migrated the site to Astro and build it as static files. Sass handles the styles. Client behavior, including Three.js, lives in TypeScript islands.</p>
  <p><strong>Result.</strong> The site now gets the faster loads and simpler deployment the migration was for. The diagram below is the historical entity-relationship diagram of the pre-Astro database. I kept it so the LAMP model stays visible.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/portfolio/erDiagram.webp" alt="Historical ER diagram of the portfolio database (pre-Astro LAMP stack).">
      <figcaption class="center">This entity-relationship diagram is the portfolio database from the LAMP site, before Astro. I leave it here as the record of that earlier model.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h3>Markdown case studies and job links</h3>
  <p><strong>Problem.</strong> Case studies had to stay organized and under version control, and a job application needed a link to the projects that match the role.</p>
  <p><strong>Decision.</strong> Project metadata lives in markdown content collections, so each case study is a file in the repository. The homepage filter still supports a custom link for applications. VR work opens at <a href="https://rmichels.com/?filter=vr">https://rmichels.com/?filter=vr</a> and shows only VR projects.</p>
  <p><strong>Result.</strong> Adding or revising a case study is a content change I can commit, and I can send a filtered homepage when I apply.</p>
  <h3>A photogrammetry portrait</h3>
  <p><strong>Problem.</strong> The 3D on the site needed a portrait of me, built from a capture I made and then cleaned.</p>
  <p><strong>Decision.</strong> I captured myself with photogrammetry in RealityCapture, then cleaned the model in Blender.</p>
  <p><strong>Result.</strong> RealityCapture and Blender are the portrait pipeline. The screenshot at the top of this page is that Blender cleanup.</p>
</section>
<section class="sectionText">
  <h2>How it's built</h2>
  <p>Visitors see the Astro pages and the portrait. Routing, tests, and privacy are what keep the site workable, on the static build, with Three.js islands as the client layer.</p>
  <h3>Bilingual routes</h3>
  <p>The portfolio is bilingual. I serve English at <code>/</code> and German at <code>/de/</code> from this same Astro site. A reader switches language by route. GitHub Actions deploys that one site, with the language split handled as routing.</p>
  <h3>Tests and deployment</h3>
  <p>Content tests and unit tests live with the project. GitHub Actions builds the site and deploys it. When I change a case study, a style, or a client island, that loop publishes the update, so the repository and the live site stay aligned.</p>
  <h3>No cookies</h3>
  <p>The site sets no cookies. I use cookieless analytics, and a visitor can opt out on the privacy policy.</p>
</section>
<section class="sectionText">
  <h2>Outcome</h2>
  <p>The portfolio is live at <a href="https://rmichels.com">https://rmichels.com</a>, and the source is <a href="https://github.com/potato-robert/Portfolio-RMichels">https://github.com/potato-robert/Portfolio-RMichels</a>. English and German are both on that site. The homepage filter is still the link I use for applications, and GitHub Actions builds and deploys the repository. Employers and partners can read the work, open a role-specific view such as the VR filter, and see a site I design and ship from the Figma file through the static deploy.</p>
</section>
<section class="sectionText">
  <h2>Reflection</h2>
  <p>The move off LAMP is the decision I would repeat. A static Astro build gives this content site faster loads and simpler deployment, and that trade still fits.</p>
  <p>Design and engineering stay one practice. The moodboard, the Figma file, the markdown case studies, and the RealityCapture-to-Blender portrait are one line of work. I show how I build by doing it on the pages people are reading.</p>
  <p>I will keep adding work in that shape. A case study enters as markdown, a job link can filter by role, content tests and unit tests stay with GitHub Actions, and the site continues to set no cookies.</p>
</section>
<section class="sectionText">
  <h2>Credits and links</h2>
  <p>I designed and built this portfolio alone. The Figma embed above is the design file. The Blender screenshot and the entity-relationship diagram are the process images.</p>
  <ul>
    <li>Live site: <a href="https://rmichels.com">https://rmichels.com</a></li>
    <li>Source: <a href="https://github.com/potato-robert/Portfolio-RMichels">https://github.com/potato-robert/Portfolio-RMichels</a></li>
    <li>Design file: <a href="https://www.figma.com/file/xPdNmMgz0wm4pf0wcf1j8C/Portfolio">https://www.figma.com/file/xPdNmMgz0wm4pf0wcf1j8C/Portfolio</a></li>
    <li>VR filter example: <a href="https://rmichels.com/?filter=vr">https://rmichels.com/?filter=vr</a></li>
  </ul>
</section>
