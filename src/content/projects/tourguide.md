---
slug: "tourguide"
name:
  en: "Tourguide"
  de: "Tourguide"
projectType:
  en: "Flutter App"
  de: "Flutter App"
year: "2024"
inDevelopment: false
roles: ["android", "design"]
description:
  en: "A crossplatform Flutter app that helps users explore tours with navigation, information on places, and chat with an AI tourguide. Available in beta on Google Play and as a web app."
  de: "Eine plattformübergreifende Flutter-App, die Nutzern hilft, Touren mit Navigation, Informationen zu Orten und Chat mit einem KI-Reiseführer zu erkunden. Als Beta im Google Play Store und als Web-App verfügbar."
links:
  - label: "Google Play Store (Beta)"
    url: "https://play.google.com/store/apps/details?id=com.robertmichelsdigitalmedia.tourguideapp"
  - label: "Web App (Beta)"
    url: "https://tourguide-firebase.web.app"
  - label: "Interactive Figma Mockup"
    url: "https://www.figma.com/proto/DKwKzxmnYg9oQeuUSmrlN7/Tourguide_App"
  - label: "Github Repository"
    url: "https://github.com/potato-robert/tourguide_app"
threeMockup: "phone"
order: 3
---

<section class="sectionText">
    <h2>Overview</h2>
    <p></p>
    <p>I had my eye on the Flutter framework, and this seemed like the perfect opportunity to learn the Dart language and how to build a crossplatform app with Flutter.</p>
  </section>
  <video id="video" src="/assets/video/tourguideScreencap.mp4" style="display:none" preload="none" autoplay="true" loop="true" muted="true" poster="/assets/video/frame.jpg"></video>
  <section class="sectionText">
    <h2>Development History</h2>
    <h3>Web Improvements, tts, and more - October 2, 2024</h3>
    <p></p>
    <p></p>
    <p><a href="https://pub.dev/packages/google_maps_custom_marker" title="google_maps_custom_marker package on pub.dev" target="_blank">google_maps_custom_marker</a> package, based off utility code I had written. This package helps dynamically create markers with various customizable shapes, with the option for labels.</p>
    <h3>Update and release of Web App - August 27, 2024</h3>
    <p><a href="https://tourguide-firebase.web.app" title="Tourguide Web App" target="_blank">tourguide-firebase.web.app</a></p>
    <h3>Update - August 19, 2024</h3>
    <p></p>
    <p>Regarding style improvements, I reworked all hardcoded style references to use the current theme and created a theme provider and cleaned up theme building logic. With these changes, the UI now adheres more stringently to Material 3 Design styles, and supports dark mode. To help with that process, I first used the <a href="https://material-foundation.github.io/material-theme-builder/" title="Material Theme Builder" target="_blank">Material Theme Builder</a>, and then built an <a href="https://www.figma.com/proto/DKwKzxmnYg9oQeuUSmrlN7/Tourguide_App?page-id=54496%3A24191&node-id=54852-28956&viewport=-5776%2C-250%2C2&t=4HYfco7oHsFnRHPh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=54852%3A28956" title="Interactive Figma Mockup" target="_blank">interactive mockup in Figma</a>, using the very helpful Figma Material 3 Design Kit template and Material Theme Builder plugin.</p>
    <p></p>
    <h3>Update - July 29, 2024</h3>
    <p></p>
    <p>The last few weeks have been a great learning experience, as I got to really dig into the backend side of things, setting up email notifications and a system for myself to manage community reports. I discovered the great library of Firebase extensions like Trigger Email from Firestore and Delete User Data, which have come in handy. To extend their functionality, I also wrote some cloud functions to help with processes like unsubscribing from emails through a link in the email.</p>
    <p></p>
    <h3>Getting Started - July 10, 2024</h3>
    <p>The tourguide app is currently in closed testing on the Google Play store. I plan to also host it as a webapp, and possibly an iOS app if I see demand for the app. You can <a href="mailto:hi@rmichels.com?subject=Request%20access%20to%20join%20Tourguide%20Closed%20Testing&amp;body=Please%20add%20me%20to%20the%20Closed%20Testing%20of%20tourguide.%0AEmail%20to%20add%3A%20%5BInsert%20Your%20Email%20used%20on%20your%20Android%20Phone%5D">request</a></p>
    <p></p>
  </section>
  <section class="sectionMedia">
    <figure ignorecarousel>
      <div class="mediaRow mediaRow-equalWidth mediaRow-equalHeight">
        <figure>
          <img src="/assets/img/tourguide/Screenshot_1.jpg" alt="tourguide – Screenshot 1"> 
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_2.jpg" alt="tourguide – Screenshot 2">
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_3.jpg" alt="tourguide – Screenshot 3"> 
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_4.jpg" alt="tourguide – Screenshot 4">
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_5.jpg" alt="tourguide – Screenshot 5"> 
        </figure>
        <figure>
          <img src="/assets/img/tourguide/Screenshot_6.jpg" alt="tourguide – Screenshot 6">
        </figure>
