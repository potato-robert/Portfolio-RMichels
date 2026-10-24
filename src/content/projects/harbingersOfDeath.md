---
slug: "harbingersOfDeath"
name:
  en: "Harbingers Of Death"
  de: "Harbingers Of Death"
projectType:
  en: "LAMP Website"
  de: "LAMP Website"
year: "2018"
inDevelopment: false
roles: ["back-end", "front-end"]
description:
  en: "Satire presenting 1889 death omens as real. I built the PHP routing, schema, and accessible form UI."
  de: "Satire, die Todesomen von 1889 als real darstellt. Ich habe das PHP-Routing, das Schema und die barrierefreie Formular-UI gebaut."
links:
  - label: "View Website"
    url: "http://harbingersofdeath.rmichels.com"
order: 12
---

<section class="sectionText">
  <h2>Snapshot</h2>
  <p>I built the PHP routing and models, the database schema, and the accessible form UI for Harbingers of Death, a satire that presents 1889 death omens as if they were real.</p>
  <p>Student project, SIAT, 2018.</p>
  <ul>
    <li><strong>Role:</strong> Full-stack: PHP routing and models, schema, and the accessible form UI.</li>
    <li><strong>Team:</strong> Course team. Names are not on the page.</li>
    <li><strong>Timeline:</strong> 2018.</li>
    <li><strong>Platforms:</strong> Web.</li>
    <li><strong>Stack:</strong> LAMP, PHP, MySQL, JavaScript, and ARIA.</li>
    <li><strong>Status:</strong> http://harbingersofdeath.rmichels.com</li>
  </ul>
  <p>TODO(Robert): Harbingers of Death teammate names.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/harbingersOfDeath/lqip/screen-home.jpg" alt="Homepage of Harbingers of Death.">
      <figcaption class="center">The homepage, where visitors start browsing the omens.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h2>Concept</h2>
  <p>Harbingers of Death presents omens from an 1889 article as if they were real, as a satire of present-day conspiracy talk. Each omen says who is affected, what triggers it, and the scenario. Visitors filter by who is at fault, who will die, and aspect of life, or they search by text, and members record which omens they have met and who the omen points to.</p>
</section>
<section class="sectionText">
  <h2>What I built</h2>
  <ul>
    <li>I separated the omen page's display from its data: <code>index.php</code> constructed an <code>Omen</code> through <code>OmenCollection.php</code> and passed it to <code>omen.php</code>.</li>
    <li>I designed the database and wrote its queries.</li>
    <li>I built the floating labels as separate label and input nodes.</li>
  </ul>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/6af2a14f9fd4d08094ef29c3dc8bcd6b.js"></script>
</section>
<section class="sectionText">
  <h2>Data model and accessibility</h2>
  <p>The schema has six tables. <code>user</code> stores user information. <code>user_omen</code> stores which omens a member has met. <code>omen</code> stores each omen. <code>aspect</code>, <code>death</code>, and <code>fault</code> are the taxonomy tables that tag omens. Only <code>user</code> and <code>user_omen</code> change through the site. The omen and taxonomy tables stay static.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/harbingersOfDeath/lqip/db.jpg" alt="Entity-relationship diagram of the database.">
      <figcaption class="center">Entity-relationship diagram of the schema: user, user_omen, omen, aspect, death, and fault. Only user and user_omen change through the site; the other tables are the static taxonomy.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <p>Floating labels look like placeholder text until someone types, then they shrink and sit above the input. I kept the label and the input as separate nodes so the form stays ARIA-friendly.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure>
      <img src="/assets/img/harbingersOfDeath/lqip/animated-form.jpg" lqip-gif alt="Text field with a label that shrinks and moves above the input.">
      <figcaption class="center">The label moves above the field as someone types, and the label and the input stay separate nodes.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/27652e3e6cb30ac861fd8be6895d80df.js"></script>
</section>
<section class="sectionText">
  <h2>What it shows today</h2>
  <p>The route, the schema, and the accessible form are the kind of full-stack web work I still do. Today I would keep views separate from data, and I would keep labels and inputs as separate nodes so the form stays accessible.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <ul>
    <li>View website: http://harbingersofdeath.rmichels.com</li>
  </ul>
</section>
