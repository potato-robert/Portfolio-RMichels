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
  en: "A website that uses D3.js to visually analyze climate change data. Data visualizations include line charts and stacked area charts of global climate change data, as well as a detailed choropleth map and other visualizations of Canadian weather data."
  de: "Eine Website, die D3.js nutzt, um Klimawandeldaten visuell zu analysieren. Visualisierungen umfassen Linien- und Stacked-Area-Charts globaler Klimadaten sowie eine detaillierte Choropleth-Karte und weitere Darstellungen kanadischer Wetterdaten."
links:
  - label: "View Project"
    url: "http://understandingclimatechange.rmichels.com/ccImpacts.html"
order: 13
---

<section class="sectionText">
    <h2>The Task</h2>
    <p>As an exercise of interactive data visualization techniques, we planned to comprehensively visualize climate change data. Our goal was to condense complex datasets into simple charts that communicate the mechanics, origins, and local impact of climate change in Canada. To entice users, we would develop simple interactions such as pop-up tooltips, as well as complex interactions such as brushing, changing representations, and animation.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart1.jpg" alt="understanding Climate Change – chart1">
      </figure>
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart2.jpg" alt="understanding Climate Change – chart2">
      </figure>
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart3.jpg" alt="understanding Climate Change – chart3">
      </figure>
    </div>
  </section>
  <section class="sectionText">
    <h2>The Result</h2>
    <h3>Understanding Climate Change</h3>
    <p>Features four color-coded line charts of global CO2 emissions and atmospheric concentration, as well as a stacked area chart of CO2 emissions by region.</p>
    <h3>Understanding Climate Change Impact</h3>
    <p>With the choropleth map of Canada and its provinces and territories, users can explore Canadian weather data, including temperature and precipitation, by year, month and province. There is also a spider chart of the global temperature anomaly over time. Both charts can be dynamically queried and animated.</p>
    <h3>Climate Change Impact Summary</h3>
    <p>The climate change summary charts aim to show a correlation, or lack thereof, of CO2 emissions and weather anomalies. There are four line plots of mean Canadian weather temperature, precipitation, and their anomalies, grouped with a line plot of global CO2 emissions. </p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure id="chart4">
        <img src="/assets/img/understandingClimateChange/lqip/chart4.jpg" alt="understanding Climate Change – chart4">
      </figure>
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart5.jpg" alt="understanding Climate Change – chart5">
      </figure>
    </div>
  </section>
  <section class="sectionText">
    <h2>Process</h2>
    <p>We developed the project in a team of two, over the course of two months, and it was our first experience with D3.js. Early on, we defined two central questions that we would attempt to answer with the project:</p>
    <ol>
      <li>What are the contributing factors to climate change?</li>
      <li>Since climate impacts weather, are there indications of Canadian weather behaving abnormally?</li>
    </ol>
    <p>After defining these questions, we set out to find relevant data. Most data needed to be cleaned for outliers and bad data. The most complex dataset was that of Canadian weather data, as we needed to manually merge multiple large datasets, clean and sort the data, and calculate monthly and annual averages.</p>
    <p>The final phase of project development involved developing the D3.js driven visualizations and assembling the final website, which also doubles as a project report. Most charts, including the line charts and stacked area chart, were fairly straightforward to implement. By far the most complex chart was the choropleth map of Canadian weather data. While the visual mapping of data to geography and color was challenging, the outcome was worth it. The resulting map provides an enticing and interactive way to quickly browse through a large dataset of Canadian weather data, and make local as well as federal-level observations.</p>
  </section>
  <section class="sectionMedia">
    <div class="mediaColumn">
      <figure>
        <img src="/assets/img/understandingClimateChange/lqip/chart6.jpg" alt="understanding Climate Change – chart6">
      </figure>
    </div>
  </section>
  <section class="sectionText">
    <h2>The Code</h2>
    <p>The project is developed with HTML, CSS and JS, where we employ the data-driven visualization library <a href="https://d3js.org/" target="_blank">D3.js</a>. Implementing all the visualizations was very challenging, as D3 was new to us. Particularly the use of the chain syntax was cumbersome in the beginning. The general workflow consists of loading data, selecting DOM elements and inserting SVG elements with certain attributes mapped to the data. In the excerpt below, the <a  href="#chart4">Canadian Weather Data Chart</a> is rendered in <code>drawMap()</code>, with the color of each province mapped to temperature or percipitation data depending on the user's inputs. The excerpt also includes mouse hover interactions for the individual provinces starting at line 58, where the province is visually highlighted and data in the legend is updated by calling <code>updateDataData()</code>, which isn't show in the example.</p>
  </section>
  <section class="sectionMedia">
    <script src="https://gist.github.com/potato-robert/fea50c19b3bcdff1b1ee446cad3a8028.js"></script>
  </section>
