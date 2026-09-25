/* 星空与孔明灯效果改编自 keshangkao，来源及许可说明见 ATTRIBUTION.md。 */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const enterButton = document.getElementById("enterButton");
  const form = document.getElementById("wishForm");
  const wishInput = document.getElementById("wishInput");
  const signatureInput = document.getElementById("signatureInput");
  const wishCount = document.getElementById("wishCount");
  const formMessage = document.getElementById("formMessage");
  const sendButton = document.getElementById("sendButton");
  const resultOverlay = document.getElementById("resultOverlay");
  const cardImage = document.getElementById("cardImage");
  const downloadButton = document.getElementById("downloadButton");
  const saveHint = document.getElementById("saveHint");
  const againButton = document.getElementById("againButton");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  const art = new Image();
  art.src = "./assets/moon-festival.webp";
  let sendingTimer = 0;

  function setState(state) {
    app.dataset.state = state;
    const resultOpen = state === "result";
    resultOverlay.setAttribute("aria-hidden", String(!resultOpen));
    document.body.classList.toggle("result-open", resultOpen);
  }

  enterButton.addEventListener("click", () => {
    setState("compose");
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });

  wishInput.addEventListener("input", () => {
    wishCount.textContent = `${Array.from(wishInput.value).length} / 40`;
    if (formMessage.textContent) formMessage.textContent = "";
  });

  for (const field of [wishInput, signatureInput]) {
    field.addEventListener("focus", () => {
      window.setTimeout(() => field.scrollIntoView({ block: "center", behavior: "smooth" }), 260);
    });
  }

  if (isWeChat) {
    downloadButton.hidden = true;
    saveHint.textContent = "长按图片保存，再发送给想念的人";
  } else if (!/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    saveHint.textContent = "保存图片，发给想念的人";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (app.dataset.state === "sending") return;
    const wish = wishInput.value.replace(/\s+/g, " ").trim();
    const signature = signatureInput.value.replace(/\s+/g, " ").trim();
    if (!wish) {
      formMessage.textContent = "先写一句祝福，再让它乘着月光出发。";
      wishInput.focus();
      return;
    }
    if (Array.from(wish).length > 40) {
      formMessage.textContent = "祝福请控制在 40 字以内。";
      wishInput.focus();
      return;
    }
    setState("sending");
    sendButton.disabled = true;
    sendButton.querySelector("span").textContent = "月光正在送信…";
    if (!reducedMotion.matches) flyLantern(wish);
    const delay = reducedMotion.matches ? 120 : 2250;
    window.clearTimeout(sendingTimer);
    sendingTimer = window.setTimeout(async () => {
      try {
        const png = await createCard(wish, signature);
        cardImage.src = png;
        downloadButton.href = png;
        setState("result");
        againButton.focus({ preventScroll: true });
      } catch (error) {
        formMessage.textContent = "图片生成失败，请再试一次。";
        setState("compose");
      } finally {
        sendButton.disabled = false;
        sendButton.querySelector("span").textContent = "寄出这份祝福";
      }
    }, delay);
  });

  againButton.addEventListener("click", () => {
    window.clearTimeout(sendingTimer);
    document.querySelectorAll(".lantern").forEach((lantern) => lantern.remove());
    form.reset();
    wishCount.textContent = "0 / 40";
    formMessage.textContent = "";
    cardImage.removeAttribute("src");
    setState("compose");
    wishInput.focus({ preventScroll: true });
  });

  function flyLantern(wish) {
    const lantern = document.createElement("div");
    lantern.className = "lantern";
    const body = document.createElement("div");
    body.className = "lantern-body";
    for (const className of ["lantern-head", "lantern-case", "lantern-flame"]) {
      const part = document.createElement("div");
      part.className = className;
      body.appendChild(part);
    }
    const label = document.createElement("span");
    label.className = "lantern-txt";
    const shortWish = Array.from(wish).slice(0, 6).join("");
    label.textContent = shortWish;
    body.appendChild(label);
    lantern.appendChild(body);
    document.body.appendChild(lantern);
    lantern.addEventListener("animationend", () => lantern.remove(), { once: true });
    window.setTimeout(() => lantern.remove(), 3000);
  }

  async function createCard(wish, signature) {
    await waitForArt();
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    // Cover cropping keeps the on-screen moon and exported moon in the same position.
    const scale = Math.max(canvas.width / art.naturalWidth, canvas.height / art.naturalHeight);
    const width = art.naturalWidth * scale;
    const height = art.naturalHeight * scale;
    ctx.drawImage(art, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);

    const shade = ctx.createLinearGradient(0, 700, 0, 1600);
    shade.addColorStop(0, "rgba(42,8,12,0)");
    shade.addColorStop(.24, "rgba(47,9,14,.68)");
    shade.addColorStop(1, "rgba(37,7,12,.97)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 700, 900, 900);

    ctx.strokeStyle = "rgba(255,216,148,.84)";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 828, 1528);
    ctx.strokeStyle = "rgba(255,216,148,.48)";
    ctx.strokeRect(49, 49, 802, 1502);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe2a7";
    ctx.font = '26px Georgia, serif';
    ctx.fillText("M O O N   L E T T E R", 450, 107);
    ctx.font = '62px "Songti SC", "Noto Serif CJK SC", "SimSun", serif';
    ctx.fillText("把月光寄给你", 450, 936);
    ctx.beginPath();
    ctx.moveTo(362, 974);
    ctx.lineTo(538, 974);
    ctx.strokeStyle = "rgba(255,216,148,.85)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const lines = wrapText(ctx, wish, 700, 49);
    ctx.fillStyle = "#fff0d5";
    ctx.font = '49px "Songti SC", "Noto Serif CJK SC", "SimSun", serif';
    const lineHeight = 78;
    const firstY = 1072 + Math.max(0, 3 - lines.length) * 27;
    lines.forEach((line, index) => ctx.fillText(line, 450, firstY + index * lineHeight));

    ctx.fillStyle = "#ffd99b";
    ctx.font = '30px "Songti SC", "Noto Serif CJK SC", "SimSun", serif';
    ctx.fillText(signature ? `—— ${signature}` : "—— 一个惦记你的人", 450, 1440);
    ctx.fillStyle = "rgba(255,236,204,.82)";
    ctx.font = '26px "Songti SC", "Noto Serif CJK SC", "SimSun", serif';
    ctx.fillText("中 秋 · 愿 所 念 皆 有 回 响", 450, 1523);
    return canvas.toDataURL("image/png");
  }

  function waitForArt() {
    if (art.complete && art.naturalWidth) return Promise.resolve();
    return new Promise((resolve, reject) => {
      art.addEventListener("load", resolve, { once: true });
      art.addEventListener("error", () => reject(new Error("Artwork unavailable")), { once: true });
    });
  }

  function wrapText(ctx, text, maxWidth, fontSize) {
    ctx.font = `${fontSize}px "Songti SC", "Noto Serif CJK SC", "SimSun", serif`;
    const lines = [];
    let line = "";
    for (const char of Array.from(text)) {
      if (ctx.measureText(line + char).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line += char;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Lightweight star and osmanthus layer, adapted from the original canvas effect.
  const sky = document.getElementById("sky");
  const skyCtx = sky.getContext("2d");
  if (skyCtx) {
    let width = 0;
    let height = 0;
    let stars = [];
    let petals = [];
    let frame = 0;
    let last = 0;
    const random = (min, max) => min + Math.random() * (max - min);

    function resizeSky() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      sky.width = Math.round(width * dpr);
      sky.height = Math.round(height * dpr);
      skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: 44 }, () => ({ x: random(0, width), y: random(0, height * .67), r: random(.25, 1.1), phase: random(0, 6.28), speed: random(.4, 1.3) }));
      petals = Array.from({ length: 7 }, () => ({ x: random(0, width), y: random(0, height), r: random(1.5, 3.2), speed: random(.14, .38), phase: random(0, 6.28) }));
      drawSky(0);
    }

    function drawSky(time) {
      skyCtx.clearRect(0, 0, width, height);
      for (const star of stars) {
        skyCtx.globalAlpha = .25 + .38 * (1 + Math.sin(star.phase + time * .0007 * star.speed)) / 2;
        skyCtx.fillStyle = "#ffe9b5";
        skyCtx.beginPath();
        skyCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        skyCtx.fill();
      }
      for (const petal of petals) {
        const x = petal.x + Math.sin(petal.phase + time * .0003) * 12;
        const y = (petal.y + time * petal.speed * .018) % (height + 12);
        skyCtx.globalAlpha = .52;
        skyCtx.fillStyle = "#f5c46e";
        skyCtx.beginPath();
        skyCtx.ellipse(x, y, petal.r, petal.r * .6, time * .0003, 0, Math.PI * 2);
        skyCtx.fill();
      }
      skyCtx.globalAlpha = 1;
    }

    function animateSky(time) {
      if (!document.hidden && time - last > 33) {
        drawSky(time);
        last = time;
      }
      frame = requestAnimationFrame(animateSky);
    }

    resizeSky();
    window.addEventListener("resize", resizeSky, { passive: true });
    if (!reducedMotion.matches) frame = requestAnimationFrame(animateSky);
    reducedMotion.addEventListener("change", () => {
      cancelAnimationFrame(frame);
      drawSky(0);
      if (!reducedMotion.matches) frame = requestAnimationFrame(animateSky);
    });
  }
})();
