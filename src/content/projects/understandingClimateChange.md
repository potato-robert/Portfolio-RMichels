---
slug: "understandingClimateChange"
name:
  en: "Understanding Climate Change"
  de: "Klimawandel verstehen"
projectType:
  en: "D3.js Website"
  de: "D3.js Website"
year: "2018"
inDevelopment: false
roles: ["d3js", "front-end"]
description:
  en: "Interactive choropleth of Canadian weather on a D3.js climate site from a two-person, two-month project."
  de: "Interaktive Choropleth des kanadischen Wetters auf einer D3.js-Website zum Klima aus einem Projekt zu zweit über zwei Monate."
links:
  - label: "View Project"
    url: "http://understandingclimatechange.rmichels.com/ccImpacts.html"
order: 10
---

<section class="sectionText">
  <h2>Snapshot</h2>
  <p>I built the data cleanup and the interactive choropleth of Canadian weather for a D3.js site about climate change.</p>
  <p>Student project, SIAT, 2018.</p>
  <ul>
    <li><strong>Role:</strong> Data pipeline, choropleth map, and chart interactions.</li>
    <li><strong>Team:</strong> Team of two, over two months.</li>
    <li><strong>Timeline:</strong> 2018. Two months. First D3.js project.</li>
    <li><strong>Platforms:</strong> Web.</li>
    <li><strong>Stack:</strong> HTML, CSS, JavaScript, and D3.js.</li>
    <li><strong>Status:</strong> http://understandingclimatechange.rmichels.com/ccImpacts.html</li>
  </ul>
  <p>TODO(Robert): the Understanding Climate Change partner's name.</p>
</section>
<section class="sectionMedia">
  <div class="mediaColumn">
    <figure id="chart4">
      <img src="/assets/img/understandingClimateChange/lqip/chart4.jpg" alt="Choropleth map of Canadian provinces and territories filled from a weather color scale.">
      <figcaption>The Canadian weather chart: a choropleth of provinces and territories for temperature and precipitation. It is the view for browsing the cleaned Canadian weather set by place.</figcaption>
    </figure>
  </div>
</section>
<section class="sectionText">
  <h2>Concept</h2>
  <p>Understanding Climate Change was a 2018 D3.js site aimed at two questions: what contributes to climate change, and whether Canadian weather shows abnormal behavior. A teammate and I built it in two months as our first project in the library.</p>
  <p>The site included four color-coded line charts of global CO2 emissions and atmospheric concentration, a stacked area chart of CO2 emissions by region, a spider chart of the global temperature anomaly over time, and four line plots of Canadian mean temperature, precipitation, and their anomalies, grouped with global CO2 emissions.</p>
</section>
<section class="sectionText">
  <h2>What I built</h2>
  <p>Working assumption: my slice was the data pipeline, the choropleth, and the chart interactions. The original page only says "we."</p>
  <ul>
    <li>Data pipeline: clean outliers and bad data, merge the Canadian weather sets by hand, sort them, and calculate monthly and annual averages.</li>
    <li>Choropleth of provinces and territories for temperature and precipitation by year, month, and province.</li>
    <li>Chart interactions: tooltips, brushing, changing the representation, and animation.</li>
  </ul>
</section>
<section class="sectionText">
  <h2>Choropleth map</h2>
  <p>This section follows the working assumption above. The choropleth was the most complex chart. In <code>drawMap()</code>, each province and territory is colored from the selected measure, temperature or precipitation, for the chosen year and month. Hover highlights that province and calls <code>updateDataData()</code> to refresh the legend. The excerpt below is <code>drawMap()</code>.</p>
  <p>The map lets a visitor browse a large set of Canadian weather data and make local and federal-level observations.</p>
  <p>TODO(Robert): the one climate data finding to highlight. Do not invent a statistic.</p>
</section>
<section class="sectionMedia">
  <script src="https://gist.github.com/potato-robert/fea50c19b3bcdff1b1ee446cad3a8028.js"></script>
</section>
<section class="sectionText">
  <h2>What it shows today</h2>
  <p>Under the working assumption above, the skill is preparing the data, then designing the interaction that makes a large set readable.</p>
</section>
<section class="sectionText">
  <h2>Links</h2>
  <p><a href="http://understandingclimatechange.rmichels.com/ccImpacts.html" target="_blank">View the project</a></p>
</section>
