---
slug: "chromakeyAndColorMatching"
name:
  en: "Chromakey & Color Matching"
  de: "Chromakey & Color Matching"
format: desktop-app
year: "2018"
context: coursework
inDevelopment: false
stack: ["java"]
description:
  en: "A digital image compositing process. Automatically creates high-quality composites. Advantages include the ability to deal with any foreground color, preventing color spill and color grading the subject to match the background."
  de: "Ein digitales Bild-Compositing-Verfahren. Erstellt automatisch hochwertige Composites. Vorteile: beliebige Vordergrundfarben, Unterdrückung von Color Spill und Farbanpassung des Motivs an den Hintergrund."
links:
  - label: "Download app"
    url: "/assets/other/ChromakeyAndColorMatching.exe"
order: 10
---

<section class="sectionText">
    <h2>The Task</h2>
    <p>The goal of this project was to practice computational signal processing techniques for digital media. We researched experimental image processing techniques and decided to combine two techniques that we believed would complement each other well. The first technique is an advanced chroma key, which neutralizes color spill and supports all possible foreground colors. The second technique transfers color characteristics from one image to another. The idea was that by combining these two techniques, we would create a very effective process that creates high-quality image composites, where the subject doesn’t noticeably differ from the background.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn"><div class="mediaRow">
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/1.jpg" alt="chromakey And Color Matching – 1">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/2.jpg" alt="chromakey And Color Matching – 2">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/3.jpg" alt="chromakey And Color Matching – 3">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/4.jpg" alt="chromakey And Color Matching – 4">
      </figure>
    </div>
    <div class="mediaRow">
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/5.jpg" alt="chromakey And Color Matching – 5">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/6.jpg" alt="chromakey And Color Matching – 6">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/7.jpg" alt="chromakey And Color Matching – 7">
      </figure>
      <figure>
        <img src="/assets/img/chromakeyAndColorMatching/lqip/8.jpg" alt="chromakey And Color Matching – 8">
      </figure>
    </div></div>
  </section>
  <section class="sectionText">
    <h2>The Result</h2>
    <p>Our interface allows users to select a foreground image that includes both a green and magenta background and create a matte. At the same time, the user is also able to select the background image in which the foreground image will appear on top. The color transfer of the background image will affect the foreground image and apply its characteristics at a set value. Once set, the user is able to control the intensity of the color transfer, brightness transfer, and the blurring of the foreground matte edges to help create a more believable composite image. The user is also able to view all of the process images created to form the final output image in order to view the progression. Lastly, the user is able to save the image they have created with a save button on the bottom of the main screen.</p>
    <p>The first step in this process is based on the paper <cite>Color invariant chroma keying and color spill neutralization for dynamic scenes and cameras</cite> (Grundhöfer, Kurz, Thiele, & Bimber, 2010). This technique cleverly uses two complementary background colors, such as green and magenta, to be able to A) feature any colors in the foreground, and B) automatically suppress color spill. A) is achieved by deriving the maximum of the two mattes resulting from a simple chromakey with each background color. B) is achieved by blending the two images with the complementary background colors, so that the light spilling onto the subject is neutralized into a grayscale tone, rather than green or magenta.</p>
    <p>The second step in the process is not specifically intended for composites but proved to be very useful. The technique described in <cite>Color transfer between images</cite> (Reinhard, Adhikhmin, Gooch, & Shirley, 2001) analyzes a source image’s color characteristics by calculating the mean and standard deviation of each color channel. These characteristics are then applied to the color distribution of the target image. For this technique to work, the images need to be converted into the lαβ color space, which heavily considers the human visual system and minimizes correlation between channels for most natural scenes.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure class="wide">
        <img src="/assets/img/chromakeyAndColorMatching/lqip/overview.jpg" alt="An overview of the entire process, with a clear distinction between the two techniques implemented, and additional processing applied to the images.">
        <figcaption>An overview of the entire process, with a clear distinction between the two techniques implemented, and additional processing applied to the images.</figcaption>
      </figure>
    </div>
    <div class="auto-resizable-iframe">
      <div>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/6KXxwxTnbgM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
      <figcaption>App demo, walkthrough of the code, and explanation of the theory behind the technique.</figcaption>
    </div>
  </section>
  <section class="sectionText">
    <h2>References</h2>
    <div class="references">
    <p>Grundhöfer, A., Kurz, D., Thiele, S., &amp; Bimber, O. (2010). <a href="https://link.springer.com/article/10.1007/s00371-010-0464-8" target="_blank" title="Springer Link: Color invariant chroma keying and color spill neutralization for dynamic scenes and cameras"><cite>Color invariant chroma keying and color spill neutralization for dynamic scenes and cameras.</cite></a> The Visual Computer, 26(9), 1167-1176. doi:10.1007/s00371-010-0464-8</p>
    <p>Reinhard, E., Adhikhmin, M., Gooch, B., &amp; Shirley, P. (2001). <a href="https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf" target="_blank" title="IEEE PDF: Color transfer between images"><cite>Color transfer between images.</cite></a> IEEE Computer Graphics and Applications, 21(4), 34-41. doi:10.1109/38.946629</p>
    </div>
  </section>
