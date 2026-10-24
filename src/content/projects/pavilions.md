---
slug: "pavilions"
name:
  en: "Pavilions"
  de: "Pavilions"
projectType:
  en: "Spatial Design"
  de: "Raumgestaltung"
year: "2018"
inDevelopment: false
roles: ["3d-model", "cad", "design"]
description:
  en: "I modeled two Holland Park pavilions, sliced the modular model, and printed the Grasshopper one in wood-PLA."
  de: "Ich habe zwei Pavillons für den Holland Park modelliert, das modulare Modell in Schichten geschnitten und den Grasshopper-Pavillon in Holz-PLA gedruckt."
links:
  - label: "View 3D Models"
    url: "https://sketchfab.com/rmichels/collections/iat233-pavilions"
order: 13
---

<section class="sectionText">
  <h2>Snapshot</h2>
  <p>I modeled two Holland Park pavilions in Surrey in Rhino, including a Grasshopper parametric canopy, and I built the physical prototypes.</p>
  <p>Student project, SIAT, 2018.</p>
  <ul>
    <li><strong>Role:</strong> I modeled the modular pavilion and the parametric pavilion, and I built both physical models. Concept sketches were a team effort.</li>
    <li><strong>Team:</strong> Spatial design course. The Sketchfab collection slug is iat233-pavilions.</li>
    <li><strong>Timeline:</strong> 2018.</li>
    <li><strong>Platforms:</strong> Rhino models on Sketchfab, plus physical models.</li>
    <li><strong>Stack:</strong> Rhinoceros 3D, Grasshopper, Mesh+, Weaverbird, laser-cut cardboard, and an Anet A8 print in wood PLA.</li>
    <li><strong>Status:</strong> https://sketchfab.com/rmichels/collections/iat233-pavilions</li>
  </ul>
  <p>TODO(Robert): Pavilions teammate names.</p>
  <p>TODO(Robert): whether a third pavilion should be described. The page body shows the modular pavilion and the parametric pavilion only.</p>
</section>
<section class="sectionMedia">
  <figure ignorecarousel class="spacer">
    <div class="mediaColumn">
      <figure>
        <img src="/assets/img/pavilions/lqip/3_5.jpg" alt="Grasshopper node graph for the parametric pavilion">
      </figure>
    </div>
    <figcaption>The Grasshopper nodes that define the parametric canopy.</figcaption>
  </figure>
</section>
<section class="sectionText">
  <h2>Concept</h2>
  <p>In 2018, a spatial design course asked for pavilion designs at Holland Park in Surrey that explore people, objects, space, composition, and parametric design. I studied the principles with the team through paper sketches, then modeled the two designs shown here in Rhino. The cardboard cut and glue were shared. The wood-PLA print was mine.</p>
</section>
<section class="sectionText">
  <h2>What I built</h2>
  <ul>
    <li>I modeled the modular pavilion in Rhino from polysurfaces: a stage, two interlocking spaces, and beam-and-infill cubes as an abstract human figure. I sliced that model into layers and beams, and we laser-cut the cardboard and hot-glued it.</li>
    <li>I modeled the parametric pavilion in Grasshopper only: an organic form beside the trees, with root and branch shapes, a hidden sculpture, and a canopy over a path. I printed it on my Anet A8 in wood PLA, in four sections, because it did not fit in one print. Overhangs and the printer made the print harder.</li>
  </ul>
</section>
<section class="sectionMedia">
  <figure ignorecarousel class="spacer">
    <div class="mediaSquare">
      <div class="mediaColumn">
        <figure>
          <img src="/assets/img/pavilions/lqip/2_1.jpg" alt="Laser-cut cardboard model of the modular pavilion">
        </figure>
        <figure>
          <img src="/assets/img/pavilions/lqip/2_2.jpg" alt="Laser-cut cardboard model of the modular pavilion">
        </figure>
        <figure>
          <img src="/assets/img/pavilions/lqip/2_3.jpg" alt="Laser-cut cardboard model of the modular pavilion">
        </figure>
      </div>
      <div class="mediaColumn">
        <figure>
          <img src="/assets/img/pavilions/lqip/3_1.jpg" alt="Wood PLA print of the parametric pavilion">
        </figure>
        <figure>
          <img src="/assets/img/pavilions/lqip/3_2.jpg" alt="Wood PLA print of the parametric pavilion">
        </figure>
        <figure>
          <img src="/assets/img/pavilions/lqip/3_3.jpg" alt="Wood PLA print of the parametric pavilion">
        </figure>
        <figure>
          <img src="/assets/img/pavilions/lqip/3_4.jpg" alt="Wood PLA print of the parametric pavilion">
        </figure>
      </div>
    </div>
    <figcaption>Physical prototypes. Left: laser-cut cardboard modular stage. Right: four-section wood PLA parametric canopy.</figcaption>
  </figure>
  <div class="models">
    <div class="sketchfab-embed-wrapper">
      <iframe title="Pavilion 2" src="https://sketchfab.com/models/8ce32155bef54f559eb023e085b21d33/embed">
      </iframe>
      <p>
            <a href="https://sketchfab.com/3d-models/pavilion-2-8ce32155bef54f559eb023e085b21d33" target="_blank" rel="noopener noreferrer">Pavilion 2</a>
            by <a href="https://sketchfab.com/rmichels" target="_blank" rel="noopener noreferrer">rmichels</a>
            on <a href="https://sketchfab.com?utm_medium=embed&utm_source=website&utm_campaign=share-popup" target="_blank" rel="noopener noreferrer">Sketchfab</a>
        </p>
    </div>
    <div class="sketchfab-embed-wrapper">
      <iframe title="Pavilion 3" src="https://sketchfab.com/models/97df40a59e4845a1821a65b434bd2035/embed">
      </iframe>
      <p>
          <a href="https://sketchfab.com/3d-models/pavilion-3-97df40a59e4845a1821a65b434bd2035" target="_blank" rel="noopener noreferrer">Pavilion 3</a>
          by <a href="https://sketchfab.com/rmichels" target="_blank" rel="noopener noreferrer">rmichels</a>
          on <a href="https://sketchfab.com?utm_medium=embed&utm_source=website&utm_campaign=share-popup" target="_blank" rel="noopener noreferrer">Sketchfab</a>
      </p>
    </div>
  </div>
</section>
<section class="sectionText">
  <h2>Grasshopper process</h2>
  <p>I defined that canopy with two foundational curves and eight control points. The curves set where it meets the ground, and the control points set the thickness and shape of the woven structure. Mesh+ and Weaverbird turned those inputs into the form. The videos walk through each node and the reactor points.</p>
</section>
<section class="sectionMedia">
  <div class="auto-resizable-iframe">
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/9VzTCMDgkMM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <figcaption>A node-by-node walkthrough of the Grasshopper definition.</figcaption>
  </div>
  <div class="auto-resizable-iframe">
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/MHUs1-AVnpA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <figcaption>Reactor points change the thickness of the woven structure.</figcaption>
  </div>
</section>
<section class="sectionText">
  <h2>What it shows today</h2>
  <p>Parametric modeling from a few inputs is the same design engineering habit I use when a form has to respond to constraints.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <ul>
    <li><a href="https://sketchfab.com/rmichels/collections/iat233-pavilions">Sketchfab collection</a></li>
    <li><a href="https://sketchfab.com/3d-models/pavilion-2-8ce32155bef54f559eb023e085b21d33">Pavilion 2</a></li>
    <li><a href="https://sketchfab.com/3d-models/pavilion-3-97df40a59e4845a1821a65b434bd2035">Pavilion 3</a></li>
  </ul>
</section>
