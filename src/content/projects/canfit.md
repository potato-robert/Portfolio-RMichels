---
slug: "canfit"
name:
  en: "Canfit"
  de: "Canfit"
projectType:
  en: "C++ Desktop Application"
  de: "C++-Desktop-Anwendung"
year: "2025"
company: "Qwadra"
inDevelopment: false
roles: ["front-end", "back-end", "cad", "3d-model"]
description:
  en: "C++ and MFC development on Canfit, Qwadra's CAD application for custom prosthetic and orthotic design. Contributions include shape modifiers, macros, networking, and desktop UI in a clinical CAD/CAM workflow."
  de: "C++- und MFC-Entwicklung an Canfit, Qwadras CAD-Anwendung für individuelle Prothesen- und Orthesen-Designs. Schwerpunkte: Formmodifikatoren, Makros, Netzwerkfunktionen und Desktop-UI im klinischen CAD/CAM-Workflow."
links:
  - label: "Qwadra"
    url: "https://qwadra.com/"
  - label: "Canfit"
    url: "https://qwadra.com/solution/canfit-design-software/"
heroAltLayout: false
order: 2
---

<section class="sectionText">
    <h2>Overview</h2>
    <p>At <a href="https://qwadra.com/" target="_blank" rel="noopener noreferrer">Qwadra Vancouver</a>, I work as a software developer on <strong>Canfit</strong>, Qwadra's computer-aided design (CAD) application for orthotics and prosthetics (O&amp;P). Practitioners use Canfit for repeatable, measurable digital rectification and design of custom devices—starting from a 3D patient or cast scan, manual measurements, or both, then applying intuitive tools and templates to reach anatomically correct modifications.</p>
    <p>According to <a href="https://qwadra.com/solution/canfit-design-software/" target="_blank" rel="noopener noreferrer">Qwadra's product overview</a>, Canfit is built to be easy to learn while staying anatomically correct, and it is compatible with existing CAD/CAM solutions on the market so labs can fit it into the equipment they already use. My day-to-day work is on the long-lived Windows desktop codebase—primarily <strong>C++</strong> with <strong>MFC</strong>—where precision, stability, and clear clinical workflows matter as much as the 3D tools themselves.</p>
  </section>
  <section class="sectionText">
    <h2>Development focus</h2>
    <h3>Shape modifiers and 3D design</h3>
    <p>Canfit's strength is O&amp;P-specific modification: buildups, reductions, alignment, and other shape changes that would be difficult or impossible in plaster alone. I contribute to <strong>shape modifiers</strong> and related geometry tooling so users can rotate, align, twist, and refine devices with controls that stay faithful to clinical intent. Overlays, reference geometry, and 3D preview support the same workflow Qwadra describes—superimposing X-rays, photos, or reference lines while previewing the device design at any time.</p>
    <h3>Macros and workflow automation</h3>
    <p>Qwadra positions macros as a way to automate O&amp;P workflows—for example saving buildups, reductions, and trimlines with overlays. I work on <strong>macros</strong> and the surrounding automation so repetitive, well-defined steps stay consistent across patients and sites without sacrificing the flexibility clinicians need.</p>
    <h3>Networking</h3>
    <p>Canfit is used in clinics and central fab environments where files and state need to move between workstations reliably. I develop and extend <strong>networking</strong> features so design data can be shared and synchronized in distributed workflows rather than trapped on a single machine.</p>
    <h3>User interface</h3>
    <p>Most of what practitioners touch runs through the desktop <strong>UI</strong>: editors, dialogs, and tool flows that must stay responsive during heavy geometry work. I implement and refine MFC-based interface pieces so complex CAD tasks remain approachable in daily O&amp;P production.</p>
  </section>
  <section class="sectionText">
    <h2>Stack and context</h2>
    <p>Canfit is a native Windows application. <strong>C++</strong> carries performance-critical geometry and core product logic; <strong>MFC</strong> provides the framework for menus, views, and much of the interactive surface clinicians use every day. That stack reflects a mature CAD product evolved with clinical feedback—not a greenfield web stack—so changes tend to be careful, testable increments inside a large codebase.</p>
    <p>This role builds on earlier full-stack and 3D product work (for example <a href="/clirioCloud">Clirio Cloud</a>) while pushing deeper into CAD-adjacent tooling and domain-specific UX for medical device design within Qwadra's broader digital O&amp;P offering.</p>
  </section>
