export default `
.loader {
  width: 45px;
  display: inline-block;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, #fff 90%, #0000);
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
.word .sentence {
  font-size: 15px!important;
}
.hot-list .list-tab {
  border: none!important;
}
#root .word-item .left-block .top-three {
  color: rgb(253 129 37);
}
.hot-list {
  filter: invert(100%) hue-rotate(180deg);
  background: #000000;
}
.word .label {
  filter: invert(100%) hue-rotate(180deg) contrast(100%);
}

/* --- */
.adapt-login-header,
.img-button,
.open-app,
.end-model-info,
.footer-info-con + img,
.bottom-btn-con,
.extra,
.follow,
.d-icon,
.d-icon + p {
  display: none !important;
}
.video-container {
  height: 100% !important;
  width: 100% !important;
  display: block !important;
  margin-top: 0 !important;
}
.right-con {
  bottom: 120px !important;
}
`
