---
slug: "futureEarth"
name:
  en: "Future Earth"
  de: "Future Earth"
projectType:
  en: "VR Game"
  de: "VR-Spiel"
year: "2020"
inDevelopment: false
roles: ["vr", "game", "pm", "design"]
teammembers: ["Kahn Dinh", "Keefe Liew", "Yashu Estela Xu", "Robert Michels"]
description:
  en: "VR adventure shipped on SideQuest with 3,000+ downloads and four class awards. I was project manager and lead developer."
  de: "VR-Abenteuer, auf SideQuest veröffentlicht, mit 3.000+ Downloads und vier Kursauszeichnungen. Ich war Projektmanager und Lead-Entwickler."
links:
  - label: "SideQuest"
    url: "https://sidequestvr.com/app/2597/future-earth"
  - label: "Development Blog"
    url: "https://404teamnotfound444314077.wordpress.com/"
heroAltLayout: true
order: 4
---

<section class="sectionText">
  <h2>Snapshot</h2>
  <p>I led Future Earth, a VR adventure about restoring a dystopian Earth, shipped on SideQuest with 3,000+ downloads, 4 stars, and four class awards.</p>
  <ul>
    <li><strong>Role:</strong> Project manager and lead developer (about 65 of roughly 80 commits), and one of the VR designers and developers.</li>
    <li><strong>Team:</strong> Team of four: Kahn Dinh, Keefe Liew, Yashu Estela Xu, and Robert Michels.</li>
    <li><strong>Timeline:</strong> 2020. Four months. SFU course IAT 445.</li>
    <li><strong>Platforms:</strong> VR on SideQuest.</li>
    <li><strong>Stack:</strong> Unity and C#.</li>
    <li><strong>Status:</strong> 3,000+ downloads and 4 stars on SideQuest. Class awards: best overall project, best interaction design, project for impact, and best VR/AR. SideQuest: https://sidequestvr.com/app/2597/future-earth. Development blog: https://404teamnotfound444314077.wordpress.com/. GitHub: https://github.com/Robert01101101/FutureEarth</li>
  </ul>
</section>
<section class="sectionMedia">
  <div class="auto-resizable-iframe">
    <div>
      <iframe src="https://www.youtube.com/embed/uQQSdkzXJdg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture;" allowfullscreen></iframe>
    </div>
  </div>
</section>
<section class="sectionMedia">
  <div class="mediaGrid">
    <figure>
      <img src="/assets/img/futureEarth/lqip/3.jpg" alt="Future Earth still">
      <figcaption>TODO(Robert): what /assets/img/futureEarth/lqip/3.jpg shows.</figcaption>
    </figure>
    <figure>
      <img src="/assets/img/futureEarth/lqip/4.jpg" alt="Future Earth still">
      <figcaption>TODO(Robert): what /assets/img/futureEarth/lqip/4.jpg shows.</figcaption>
    </figure>
    <figure>
      <img src="/assets/img/futureEarth/lqip/5.jpg" alt="Future Earth still">
      <figcaption>TODO(Robert): what /assets/img/futureEarth/lqip/5.jpg shows.</figcaption>
    </figure>
    <figure>
      <img src="/assets/img/futureEarth/lqip/6.jpg" alt="Future Earth still">
      <figcaption>TODO(Robert): what /assets/img/futureEarth/lqip/6.jpg shows.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h2>Context and problem</h2>
  <p>IAT 445 at SFU was a four-month exercise in designing and developing immersive environments. With Kahn Dinh, Keefe Liew, and Yashu Estela Xu, I made Future Earth, a VR adventure for players who were not already looking for a sustainability title. We set out to reach a broader audience through a dystopian future the player could transform for the better by growing trees, and I scoped that idea into a core list and a bonus list. The story cast the player as the first human to walk Earth in a long time, on a mission to plant and sustain 100 trees, because humanity's return hinged on that success.</p>
</section>
<section class="sectionText">
  <h2>My role and approach</h2>
  <p>I was project manager and lead developer, and one of the VR designers and developers. About 65 of the roughly 80 commits are mine. I kept design and code on one schedule. The sustainability theme had to become actions a player could perform, and I needed those actions small enough to finish in the course. After the team chose a project for impact built around sustainability, I split the concept into core features and bonus features so a small game could be played before any polish.</p>
</section>
<section class="sectionText">
  <h2>Key work</h2>
  <h3>Core and bonus</h3>
  <p><strong>Problem.</strong> The game had to appeal to players with no particular interest in sustainability, and the core still had to be small enough to finish and test inside four months.</p>
  <p><strong>Decision.</strong> I held the core to one loop. Players fight rogue robots, collect their parts, and build water-filtering technology that helps trees grow. I left everything else on the bonus list.</p>
  <p><strong>Result.</strong> That core prototype was implemented within the first three months, which left time for user testing and for some of the bonus features.</p>
  <h3>Collection, building, and story</h3>
  <p><strong>Problem.</strong> The robots only served the theme if their parts became the tool that helps the trees, and the mission needed those steps in an order the player could follow.</p>
  <p><strong>Decision.</strong> I programmed spare-part collection, item building, the UI interactions for those steps, and the story sequencing that ordered the mission.</p>
  <p><strong>Result.</strong> Collection, building, UI, and story order shipped inside the three-month core, on the path toward planting and sustaining 100 trees.</p>
  <h3>Tree growth and health</h3>
  <p><strong>Problem.</strong> Trees needed growth I could tune, and health that followed the available water supply, including a behavior for trees that die.</p>
  <p><strong>Decision.</strong> I used a coroutine instead of a Unity animation clip, so I had fine control over the growth. Scale and rotation changed through <code>Mathf.SmoothStep()</code> and <code>Mathf.Sin()</code>, and the same coroutine controlled dying trees.</p>
  <p><strong>Result.</strong> Growth and death stayed on one path, and the motion could follow the water supply.</p>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/13bb15385194385ba5d5700ee224d858.js"></script>
</section>
<section class="sectionText">
  <h2>User testing</h2>
  <p>After that core, I worked with the team to answer a round of user testing, and we implemented measures to communicate the narrative more clearly, such as a major update to the level design and an aesthetic change as the player planted more trees. I had put VFX, better models, and multiple collectible parts on the bonus list, and we used the time after the core to add some of them. Those additions were mostly aesthetic.</p>
  <p>The environment shift was the change I implemented in code. I wrote <code>SetEnvironment()</code> in <code>GameCtrl.cs</code> to achieve the emotional effect we wanted as planting progressed. The method interpolates the skybox, fog, dust, water, lighting, and post-processing between a start state and an end state. Fog holds a color, a start distance, and an end distance for both the beginning and the end. The other layers in that list blend between their own start and end values in the same pass.</p>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/1272b6f0de41f4409cf4e61fdfbbd622.js"></script>
</section>
<section class="sectionText">
  <h2>Outcome</h2>
  <p>Future Earth shipped on SideQuest with 3,000+ downloads and 4 stars. In class it won best overall project, best interaction design, project for impact, and best VR/AR.</p>
</section>
<section class="sectionText">
  <h2>Reflection</h2>
  <p>Splitting core from bonus gave the project a playable core within three months, and time after that to answer testing. I would use the same split on the next short XR build.</p>
  <p>The VR lesson was that the story had to read in the space. A clearer narrative, a revised level, and a world that changed with the trees were how the theme became something the player could see. I would start a later immersive project by deciding how the place responds when the player succeeds.</p>
  <p>TODO(Robert): Future Earth comfort and onboarding findings from VR testing, if they should be specific.</p>
  <p>Driving growth from a coroutine, and the scene from <code>SetEnvironment()</code>, kept the look of Future Earth attached to play. Tree health and death followed the water supply, and fog, light, and the sky changed as the player planted more trees. That coupling is what I want to keep in later XR work.</p>
</section>
<section class="sectionText">
  <h2>Credits and links</h2>
  <p>Future Earth was a team of four: Kahn Dinh, Keefe Liew, Yashu Estela Xu, and Robert Michels. I was project manager and lead developer. I owned the split between core and bonus features, and I programmed spare-part collection, item building, UI interactions, story sequencing, tree growth and health, and <code>SetEnvironment()</code> in <code>GameCtrl.cs</code>.</p>
  <p>TODO(Robert): what Kahn Dinh, Keefe Liew, and Yashu Estela Xu each owned on Future Earth.</p>
  <ul>
    <li><strong>SideQuest:</strong> <a href="https://sidequestvr.com/app/2597/future-earth">https://sidequestvr.com/app/2597/future-earth</a></li>
    <li><strong>Development blog:</strong> <a href="https://404teamnotfound444314077.wordpress.com/">https://404teamnotfound444314077.wordpress.com/</a></li>
    <li><strong>GitHub:</strong> <a href="https://github.com/Robert01101101/FutureEarth">https://github.com/Robert01101101/FutureEarth</a></li>
  </ul>
</section>
