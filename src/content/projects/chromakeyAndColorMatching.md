---
slug: "chromakeyAndColorMatching"
name:
  en: "Chromakey & Color Matching"
  de: "Chromakey & Color Matching"
projectType:
  en: "Java App"
  de: "Java App"
year: "2018"
inDevelopment: false
roles: ["java-dev", "design"]
description:
  en: "Java compositor that keys a subject without color spill, then matches its color to the new background."
  de: "Java-Compositor, der ein Motiv ohne Color Spill freistellt und seine Farbe anschließend an den neuen Hintergrund anpasst."
links:
  - label: "Download app"
    url: "/assets/other/ChromakeyAndColorMatching.exe"
order: 11
---

<section class="sectionText">
  <h2>Snapshot</h2>
  <p>I implemented a Java compositor that keys a subject off complementary backgrounds without color spill, then matches the subject color to the new background.</p>
  <p>Student project, SIAT, 2018.</p>
  <ul>
    <li><strong>Role:</strong> Algorithm implementation and the Java application.</li>
    <li><strong>Team:</strong> Course team. Size and names are not on the page.</li>
    <li><strong>Timeline:</strong> 2018.</li>
    <li><strong>Platforms:</strong> Windows desktop.</li>
    <li><strong>Stack:</strong> Java. Color-invariant chroma key (Grundhöfer, Kurz, Thiele, and Bimber, 2010) and color transfer in lαβ (Reinhard, Adhikhmin, Gooch, and Shirley, 2001).</li>
    <li><strong>Status:</strong> Download: /assets/other/ChromakeyAndColorMatching.exe</li>
  </ul>
  <p>TODO(Robert): Chromakey teammate names, and any limitations beyond the dual-background key and the lαβ transfer already described on the page.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure class="wide">
      <img src="/assets/img/chromakeyAndColorMatching/lqip/overview.jpg" alt="An overview of the entire process, with a clear distinction between the two techniques implemented, and additional processing applied to the images.">
      <figcaption>The diagram shows how dual-background chroma key and lαβ color transfer combine, so the subject is keyed without color spill and matched to the new background.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <p>TODO(Robert): which chromakey images 1.jpg through 8.jpg are the before and after pair, if a pair should be shown besides overview.jpg.</p>
</section>
<section class="sectionText">
  <h2>Concept</h2>
  <p>This was a 2018 signal-processing exercise: one Java compositor for two image techniques. A color-invariant chroma key kept any foreground color and neutralized spill, then a color transfer matched the subject to the new background.</p>
</section>
<section class="sectionText">
  <h2>What I built</h2>
  <ul>
    <li>I implemented both algorithms and the Windows desktop Java application.</li>
    <li>Users pick the foreground and the new background, then set color-transfer intensity, brightness transfer, and matte-edge blur.</li>
    <li>Users can inspect intermediate images and save the composite.</li>
  </ul>
</section>
<section class="sectionText">
  <h2>Before and after</h2>
  <p>The key followed Grundhöfer, Kurz, Thiele, and Bimber (2010). The app expects a foreground photographed on both green and magenta. Any foreground color is the maximum of the two simple mattes. Spill is neutralized by blending the complementary plates into grayscale spill.</p>
  <p>Color transfer followed Reinhard, Adhikhmin, Gooch, and Shirley (2001). It applies the source image's per-channel mean and standard deviation in lαβ, the space the paper uses because it fits the human visual system and decorrelates natural scenes.</p>
</section>
<section class="sectionMedia">
  <div class="auto-resizable-iframe">
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/6KXxwxTnbgM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <figcaption>App demo, walkthrough of the code, and explanation of the theory behind dual-background chroma key and lαβ color transfer.</figcaption>
  </div>
</section>
<section class="sectionText">
  <h2>What it shows today</h2>
  <p>It shows design-engineering work: a visual method plus controls so the result can be judged.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <ul>
    <li><a href="/assets/other/ChromakeyAndColorMatching.exe">Download the Windows app</a></li>
    <li><a href="https://link.springer.com/article/10.1007/s00371-010-0464-8" target="_blank"><cite>Color invariant chroma keying and color spill neutralization for dynamic scenes and cameras</cite></a> (2010).</li>
    <li><a href="https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf" target="_blank"><cite>Color transfer between images</cite></a> (2001).</li>
  </ul>
</section>
