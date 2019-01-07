import App from './app';
new App(JSON.parse(document.currentScript.getAttribute("data")) || {});