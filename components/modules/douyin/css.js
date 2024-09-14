export default `
.loader {
  width: 60px;
  display: inline-block;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, #eee 90%, #0000);
  background: var(--_g) 0% 50%, var(--_g) 50% 50%, var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: l3 0.6s infinite linear;
}
@keyframes l3 {
  20% {
    background-position: 0% 0%, 50% 50%, 100% 50%;
  }
  40% {
    background-position: 0% 100%, 50% 0%, 100% 50%;
  }
  60% {
    background-position: 0% 50%, 50% 100%, 100% 0%;
  }
  80% {
    background-position: 0% 50%, 50% 50%, 100% 100%;
  }
}
html,
body {
  background: white;
}
.body-content > .header,
.body-content > .hot-title .banner-block {
  display: none !important;
}
#video-info-wrap {
  zoom: 2.6;
  position: absolute;
  left: 0;
  bottom: 20px;
}
xg-inner-controls {
  zoom: 2.6;
}
.hot-list {
  filter: invert(100%) hue-rotate(180deg);
  background: #000000;
}
.word .label {
  filter: invert(100%) hue-rotate(180deg) contrast(100%);
}
#sliderVideo {
  display: flex;
}
#sliderVideo .playerContainer {
  flex-shrink: 1;
}
.ZTBYOIeC.CG9pTqjv .UsWJJZhB.Kk4V1N2A.playerContainer {
  width: calc(100% - 60vw);
}
#videoSideCard {
  zoom: 2.6;
}
xg-start {
  zoom: 3;
}
.ZTBYOIeC.CG9pTqjv .JOT0FK4T.I1t22JqH.videoSideCard {
  width: 60vw;
}
[id^='login-full-panel'],
.QSoEc32i,
.pGZF8lyn,
div#searchSideCard,
.comment-input-container {
  display: none !important;
}
.LinkSeatsLayout,
.LinkSeatsLayout + a {
  display: none !important;
}
/* --- */
.adapt-login-header,
.img-button,
.open-app,
.end-model-info {
  display: none !important;
}
.video-container {
  height: 100% !important;
  width: 100% !important;
  display: block !important;
  margin-top: 0 !important;
}
.footer-info-con + img {
  display: none !important;
}
.extra,
.d-icon,
.d-icon + p {
  display: none !important;
}
.right-con {
  bottom: 120px !important;
}
`
