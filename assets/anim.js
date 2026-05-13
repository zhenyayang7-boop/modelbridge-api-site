/* ModelBridge — page animations
   - Scroll-triggered reveal via IntersectionObserver
   - Hero terminal typewriter
   - Subtle 3D tilt on model cards (pointer-fine devices only)
*/
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Scroll reveal ----------
  const targets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && targets.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Terminal typewriter ----------
  const term = document.getElementById("term-body");
  if (term && !reduceMotion) {
    const lines = [
      { prompt: "$", text: "curl https://api.modelbridgeapi.com/v1/chat/completions \\" },
      { prompt: " ", text: "  -H \"Authorization: Bearer mb_••••••\" \\" },
      { prompt: " ", text: "  -d '{\"model\":\"deepseek-chat\",\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}'" },
      { prompt: "", text: "" },
      { prompt: "→", text: "{ \"id\": \"chatcmpl-7b2\", \"model\": \"deepseek-chat\"," },
      { prompt: " ", text: "  \"choices\": [{ \"message\": { \"content\": \"Hello! How can I help?\" }}]," },
      { prompt: " ", text: "  \"usage\": { \"total_tokens\": 18 }}" },
    ];

    let lineIdx = 0;
    let charIdx = 0;
    let current = null;

    function nextLine() {
      if (lineIdx >= lines.length) {
        // Loop after pause
        setTimeout(() => {
          term.innerHTML = "";
          lineIdx = 0;
          charIdx = 0;
          nextLine();
        }, 6000);
        return;
      }
      const data = lines[lineIdx];
      current = document.createElement("span");
      current.className = "ln";
      if (data.prompt) {
        const p = document.createElement("span");
        p.className = "prompt";
        p.textContent = data.prompt;
        current.appendChild(p);
      }
      const txt = document.createElement("span");
      current.appendChild(txt);
      const cur = document.createElement("span");
      cur.className = "cursor";
      term.appendChild(current);
      term.appendChild(cur);

      function typeChar() {
        if (charIdx < data.text.length) {
          txt.textContent += data.text.charAt(charIdx++);
          setTimeout(typeChar, 18 + Math.random() * 24);
        } else {
          term.removeChild(cur);
          lineIdx++;
          charIdx = 0;
          setTimeout(nextLine, 220);
        }
      }
      typeChar();
    }
    nextLine();
  }

  // ---------- 3D tilt on cards ----------
  const tiltCards = document.querySelectorAll("[data-tilt]");
  if (tiltCards.length && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    tiltCards.forEach((card) => {
      let raf = 0;
      card.style.transformStyle = "preserve-3d";

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * 6;
        const ry = (x - 0.5) * 6;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `translateY(-4px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      });

      card.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        card.style.transform = "";
      });
    });
  }
})();
