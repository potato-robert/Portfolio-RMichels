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
  en: "Semester in Alternate Realities (SIAR) is a program in which interdisciplinary teams tackle real-world problems using xR technologies. With the design challenge of \"VR4good\", we set out to create transformative experiences with a positive impact."
  de: "Semester in Alternate Realities (SIAR) ist ein Programm, in dem interdisziplinäre Teams reale Probleme mit xR-Technologien angehen. Mit der Design-Herausforderung „VR4good“ entwickelten wir transformative Erlebnisse mit positivem gesellschaftlichem Impact."
order: 11
---

<section class="sectionText">
    <h2>About the program</h2>
    <p>Semester in Alternate Realities (SIAR) was unlike any other course I took during my time at SFU. A team of two instructors set out with a small class to create extended reality (xR) projects that aim for a positive impact. While it was a great opportunity to learn VR design and development, the course stood out for its interdisciplinary and collaborative nature. Key takeaways from the course were soft skills such as agile project development, team-building, project pitching, and presenting, as well as hard skills, such as Unity VR development. If you want to find out more, check out this <a href="http://ispace.iat.sfu.ca/riecke/teaching/siar" target="_blank" title="iSpace Lab: Semester in Alternate Realities">info page</a>. Finally, I’d like to thank our professors Bernhard Riecke and Patrick Pennefather for this great experience.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaGrid">
        <figure>
          <img src="/assets/img/siar/lqip/1.jpg" alt="Marshmallow challenge team-building exercise">
        </figure>
        <figure>
          <img src="/assets/img/siar/lqip/2.jpg" alt="Interdisciplinary collaboration in conceptual discussions">
        </figure>
    </div>
    <figcaption>(L) The marshmallow challenge was one of the team-building exercises we did. (R) Interdisciplinary collaboration featured a lot of conceptual discussions.</figcaption>
  </section>
  <section class="sectionText">
    <h2>Rising Waters</h2>
    <p>A VR project for the Oculus Go, that tackles the topic of climate change. Set in the future, the user gets to explore the city of Richmond, B.C., in the aftermath of a flood caused by rising sea levels.</p>
    <p>Rising Waters is a mostly passive experience for the Oculus Go headset. Due to the limiting 3DOF tracking of the Oculus Go combined with the sparse input interface, we created a simple walkthrough experience that follows a predefined track. Users can pause and unpause their walkthrough, and look around to explore the environment. At first, users are confronted with dozens of screens around them, which show clips related to global warming and its impacts. Then, they are dropped into a hypothetical future Richmond, which has been flooded due to rising sea levels. The user sees the world around them from the perspective of a surveying drone that has been deployed to collect probes and scan for human signals. This mission to collect data takes the user through Richmond suburban areas, under the SkyTrain, and finally onto a rooftop where an old radio is still giving off signals. Our hope is that the experience raises awareness for the problem of climate change, and deepens the understanding of what the potential local impact could be.</p>
    <p>My roles in the development of Rising Waters included concept design, <a  href="#RisingWatersDev">C# and Unity development</a>, as well as 3D modeling the majority of 3D assets. In Blender, I modeled buildings, as well as local features such as the SkyTrain and Richmond banners, and completed them with textures sourced from online.</p>
  </section>
  <div class="auto-resizable-iframe">
      <div>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/mFMDWg2QdYU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
      <figcaption>Rising Waters project introduction, walkthrough & technical overview.</figcaption>
    </div>
  </section>
  <section class="sectionText">
    <h2>FIT4U</h2>
    <p>A VR project for the Oculus Rift, that masquerades as a meditative fitness experience. After collecting a bit of personal information, we confront users with a dramatized hacking encounter, which is personalized to the user’s personal data.</p>
    <p>This project idea was initially developed in a smaller team but later completed and polished by the entire class, in an exercise of hivemind collaboration. While there is a standalone version published to Itch.io, our final prototype requires manual operation. The process begins by signing up attendees to our showcase into time slots. A teammate and I would then begin searching the web for publicly available data of the user, typically by searching for their social media. Once the user arrives for their appointment, our teammate who plays a yoga instructor, would guide them into an isolated room and walk them into the experience in a very relaxing manner. Once in VR, users filled out a short form and then began a series of breathing and stretching exercises. Not before long, this is interrupted by the hacking event. The room around the user begins to flicker and collapses, to reveal that they’re in a virtual room, which displays the user’s personal data all around them. This dataset is comprised of the data they entered, as well as any publicly available information we could find. Inspired by the Matrix, we then provide them with two options: delete all of their data, or keep it. Depending on their choice, the experience either ends immediately, or they’re transported back into the fitness room, which is then overrun by personalized ads. The goal is that the experience helps users better understand what data they have made public and reflect whether they are comfortable with their approach to privacy.</p>
    <p>With the development of FIT4U I played a minor role in the concept design and a major role in the <a  href="#Fit4uDev">C# and Unity development</a>. I was also responsible for operating the backend of the live performance version, where I would forage the web for public information available about participants, and feed it into a separate UI not visible to the user. This posed quite a challenge to set up correctly in terms of rendering to the correct screen.</p>
  </section>
  <div class="auto-resizable-iframe">
      <div>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/SX7YzMAc1OE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
      <figcaption>FIT4U project overview & showcase footage.</figcaption>
    </div>
  </section>
  <section class="sectionText">
    <h2>The Code</h2>
    <h3 id="RisingWatersDev">Rising Waters</h3>
    <p>The C# and Unity development work of Rising Waters was split between Vlad Ryzhov and me. My responsibilities included the walkthrough movement and control. As this was one of my first Unity projects, this made for a thorough introduction to Vectors and Quaternions in the Unity API. A very helpful package that I used was the <a href="https://wiki.unity3d.com/index.php/Hermite_Spline_Controller#Description" target="_blank">Hermite Spline Controller</a>, which made it easy to interpolate a GameObject's position and orientation smoothly through an easily defined path. In the example below, I use the package's <code>GetHermiteInternal()</code> and <code>GetSquad()</code> methods to position and orientate the player along the predefined walkthrough path, as well as pause when arriving at any of the waypoint nodes that the path is comprised of.</p>
  </section>
  <section class="sectionMedia">
    <script src="https://gist.github.com/potato-robert/f5dc0de4f8c45b8b3bbd7080885e684e.js"></script>
  </section>
  <section class="sectionText">
    <h3 id="Fit4uDev">FIT4U</h3>
    <p>As the only C# and Unity developer working on FIT4U, I had a lot of responsibilities. One of my first completed features was a proof of concept, where I created a setup with multiple cameras, with player cameras rendering to the HMD, and a separate UI camera rendering to a computer screen not visible to the player. This allowed us to enter user data while the experience is running. After that, I implemented the user database (which is temporary), and a number of different UI systems that would store user data based on the user inputs. The final step involved writing code to link up the individual screens and sequence the data breach, which is implemented with a Coroutine. The example below is an excerpt from <code>Ads.cs</code>, a script that starts crowding the walls around the user with generic and targeted ads if they choose not to delete their data in the end. The excerpt starts with a check of what data matches available ads, defining an array of ad images accordingly, shuffling it, and then starting a coroutine which gradually begins filling the entire room with ads.</p>
  </section>
  <section class="sectionMedia">
    <script src="https://gist.github.com/potato-robert/ecd16b13e1952fa3818c55f6d93eb5c5.js"></script>
  </section>
