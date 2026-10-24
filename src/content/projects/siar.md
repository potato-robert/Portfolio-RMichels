---
slug: "siar"
name:
  en: "Semester in Alternate Realities"
  de: "Semester in Alternate Realities"
projectType:
  en: "VR Game"
  de: "VR-Spiel"
year: "2019"
inDevelopment: false
roles: ["vr", "game", "pm", "design"]
description:
  en: "I was the sole Unity developer on FIT4U, a live VR privacy performance, and I co-built Rising Waters."
  de: "Ich war der einzige Unity-Entwickler bei FIT4U, einer Live-VR-Performance zum Thema Privatsphäre, und habe Rising Waters mitgebaut."
order: 7
---

<section class="sectionText">
  <h2>Snapshot</h2>
  <p>I was the sole Unity developer on FIT4U, a live VR privacy performance, and I co-built Rising Waters, a walkthrough of a flooded Richmond.</p>
  <p>Student project, SIAT, 2019.</p>
  <ul>
    <li><strong>Role:</strong> FIT4U: sole C# and Unity developer, operator of the live backend, and a minor role in the concept. Rising Waters: concept, Unity walkthrough movement, and most of the Blender models. Rising Waters code was split with Vlad Ryzhov.</li>
    <li><strong>Team:</strong> Semester in Alternate Realities class at SFU. Professors Bernhard Riecke and Patrick Pennefather. Rising Waters development was split with Vlad Ryzhov.</li>
    <li><strong>Timeline:</strong> 2019, Semester in Alternate Realities, SFU.</li>
    <li><strong>Platforms:</strong> FIT4U on Oculus Rift. Rising Waters on Oculus Go.</li>
    <li><strong>Stack:</strong> Unity, C#, Blender, and the Hermite Spline Controller package.</li>
    <li><strong>Status:</strong> Course page: http://ispace.iat.sfu.ca/riecke/teaching/siar. A standalone FIT4U build was published to itch.io.</li>
  </ul>
  <p>TODO(Robert): SIAR teammate names besides Vlad Ryzhov.</p>
</section>
<section class="sectionMedia">
  <div class="auto-resizable-iframe">
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/SX7YzMAc1OE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <figcaption>Showcase footage of FIT4U: the fitness session broke into a personalized breach.</figcaption>
  </div>
</section>
<section class="sectionText">
  <h2>Concept</h2>
  <p>FIT4U was an Oculus Rift performance in a class on VR for positive impact. It opened as a calm fitness session, then staged a dramatized breach from data the visitor entered and public data found beforehand, with a choice to delete that data or return to a room of targeted ads. Rising Waters was a 3DOF Oculus Go walkthrough of a flooded Richmond: warming screens, then a surveying drone through suburban areas and under the SkyTrain to a rooftop radio.</p>
</section>
<section class="sectionText">
  <h2>What I built</h2>
  <ul>
    <li>FIT4U: the Unity build, and a live backend that fed public information into an operator UI the visitor could not see.</li>
    <li>Rising Waters: pause and unpause along a track with the <a href="https://wiki.unity3d.com/index.php/Hermite_Spline_Controller#Description" target="_blank">Hermite Spline Controller</a> (<code>GetHermiteInternal()</code> and <code>GetSquad()</code>), and most of the Blender models (buildings, the SkyTrain, and Richmond banners).</li>
  </ul>
</section>
<section class="sectionText">
  <h2>FIT4U</h2>
  <p>A smaller team developed the idea, and the class completed it. A teammate played the yoga instructor, and the showcase build was operated by hand.</p>
  <p>I proved a multi-camera setup: player cameras rendered to the headset, and a second UI camera rendered to an operator screen, so I could enter data during the session. I added a temporary user database, UI that stored inputs, and a coroutine that sequenced the breach.</p>
  <p><code>Ads.cs</code> filled the room with generic and targeted ads if the visitor kept their data.</p>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/ecd16b13e1952fa3818c55f6d93eb5c5.js"></script>
</section>
<section class="sectionText">
  <h2>What it shows today</h2>
  <p>It shows I can build live Unity XR: a headset view and an operator view.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <p>I thank Bernhard Riecke and Patrick Pennefather.</p>
  <p><a href="http://ispace.iat.sfu.ca/riecke/teaching/siar" target="_blank" title="iSpace Lab: Semester in Alternate Realities">Course page</a>.</p>
</section>
