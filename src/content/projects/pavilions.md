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
  en: "Pavilions is the result of a spatial design exercise. Three pavilions proposed as a public space in Surrey's Holland Park, featuring abstract, modular, and parametric architecture."
  de: "Pavilions ist das Ergebnis einer räumlichen Designübung. Drei Pavillons als öffentlicher Raum in Surreys Holland Park – mit abstrakter, modularer und parametrischer Architektur."
links:
  - label: "View 3D Models"
    url: "https://sketchfab.com/rmichels/collections/iat233-pavilions"
order: 12
---

<section class="sectionText">
    <h2>The Task</h2>
    <p>These pavilions are the result of a course, which teaches design principles through spatial design exercises. The goal was to create a series of pavilion designs, that explore humans, objects, space, spatial composition, and parametric design. We had to learn and use Rhinoceros 3D to create these designs, as well as create physical prototypes.</p>
  </section>
  <div class="auto-resizable-iframe">
    <div>
      <iframe title="Pavilions project video" src="https://www.youtube.com/embed/3MXKiZ-IckA?start=15" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
  </div>
  <section class="sectionText">
    <h2>The Result</h2>
    <h3>Modular Pavilion</h3>
    <p>This pavilion is intended for use as a stage for events. It features two interlocking spaces which can be used for different purposes within the same event. The theme for the design is an abstract representation of the human shape. The pavilion was designed with a constraint of using beam + infills architecture design rules as building blocks for the design. We embraced this philosophy and created an abstract modular design of hollow cubes.</p>
    <h3>Parametric Pavilion</h3>
    <p>The parametric pavilion was designed with an organic design in mind. It is intended to be placed next to trees in Holland park and imitates the shape of tree roots and branches. It houses a hidden sculpture and acts as a canopy over an existing path. This pavilion was designed using only parametric design. This was achieved using Grasshopper and the Mesh+ and Weaverbird plugins.</p>
  </section>
  <section class="sectionMedia">
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
    <h2>Process</h2>
    <p>All of our designs shared a similar process for the conceptualization phase. We began by studying the design principles that we wanted to practice and apply. We then discussed different ideas, with the help of simple paper sketches. Once we locked in on a particular concept, we designed high-fidelity prototypes in Rhino. The particular two pavilions showcased here were modeled by myself.</p>
    <p>The modular pavilion was fairly easy to create in Rhino, as I could easily break it down into simple components that could be modeled using polysurfaces. Much more complicated was the process of assembling a physical model. For this, I sliced the model into layers of 2D support structures and connecting beams that we could -cut into cardboard. We then glued the final structure using hot glue.</p>
    <p>The parametric pavilion was our most challenging pavilion. I had to learn Rhino’s parametric Grasshopper editor to be able to create the model. The model is defined by only two foundational curves and eight control points. The foundational curves set where the pavilion touches the ground, and the control points affect the thickness and shape of the woven structure. These inputs are then processed by a generative algorithm that I defined with Grasshopper, using the Mesh+ and Weaverbird plugins. The final process stage was also challenging, as I had to 3D print the model using my own 3D printer. The model was too large to print in one go and had to be sliced into four sections. Furthermore, the complex structure with overhangs, the wood filament used, and the low quality of my fairly cheap 3D printer, added to the challenge. However, the result did a great job of representing our design concept.</p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel class="spacer">
      <div class="mediaSquare">
        <div class="mediaColumn">
          <figure>
            <img src="/assets/img/pavilions/lqip/2_1.jpg" alt="pavilions – 2 1">
          </figure>
          <figure>
            <img src="/assets/img/pavilions/lqip/2_2.jpg" alt="pavilions – 2 2">
          </figure>
          <figure>
            <img src="/assets/img/pavilions/lqip/2_3.jpg" alt="pavilions – 2 3">
          </figure>
        </div>
        <div class="mediaColumn">
          <figure>
            <img src="/assets/img/pavilions/lqip/3_1.jpg" alt="pavilions – 3 1">
          </figure>
          <figure>
            <img src="/assets/img/pavilions/lqip/3_2.jpg" alt="pavilions – 3 2">
          </figure>
          <figure>
            <img src="/assets/img/pavilions/lqip/3_3.jpg" alt="pavilions – 3 3">
          </figure>
          <figure>
            <img src="/assets/img/pavilions/lqip/3_4.jpg" alt="pavilions – 3 4">
          </figure>
        </div>
      </div>
      <figcaption>The physical models of the two pavilions. The modular pavilion (L) was created from cardboard prepared with a laser cutter. The parametric pavilion (R) was created using the Anet A8 3D printer, and wood PLA filament.</figcaption>
    </figure>
    <figure ignorecarousel class="spacer">
        <div class="mediaColumn">
          <figure>
            <img src="/assets/img/pavilions/lqip/3_5.jpg" alt="pavilions – 3 5">
          </figure>
        </div>
      <figcaption>Grasshopper parametric algorithm visualized with nodes.</figcaption>
    </figure>
    <div class="auto-resizable-iframe">
      <div>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/9VzTCMDgkMM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
      <figcaption>A brief walkthrough of the Grasshopper algorithm, showing each node's functionality.</figcaption>
    </div>
    <div class="auto-resizable-iframe">
      <div>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/MHUs1-AVnpA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
      <figcaption>To stylize the final pavilion, reactor points are used to algorithmically affect the thickness of the structure.</figcaption>
    </div>
  </section>
