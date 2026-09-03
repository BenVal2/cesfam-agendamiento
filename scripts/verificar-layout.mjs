#!/usr/bin/env node
/**
 * verificar-layout.mjs
 * =====================
 * Verifica el centrado horizontal real del layout renderizado usando Chromium
 * headless + getBoundingClientRect. NO reemplaza una captura visual, pero
 * detecta numéricamente si el contenido quedó pegado a la izquierda.
 *
 * Uso:
 *   node scripts/verificar-layout.mjs          # usa build de producción existente
 *   PORT=3300 node scripts/verificar-layout.mjs
 *   VIEWPORT=1920 node scripts/verificar-layout.mjs
 *
 * Requiere: chromium disponible (CHROMIUM_BIN o /usr/bin/chromium)
 * y un build previo (npm run build) si usas "start".
 */
import { execSync, spawn } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 3300;
const VIEWPORT = parseInt(process.env.VIEWPORT || "1920", 10);
const CHROMIUM =
  process.env.CHROMIUM_BIN ||
  "/usr/bin/chromium";

const MEDIR_HTML = path.join(ROOT, "public", "medir.html");
const URL_BASE = `http://localhost:${PORT}`;

const PAGES = [
  { route: "/", label: "/ (Inicio)", sel: "main, nav, footer>div" },
  { route: "/login", label: "/login", sel: "form" },
  { route: "/registro", label: "/registro", sel: "form" },
];

function waitFor(url, tries = 60) {
  return new Promise((resolve, reject) => {
    const ok = () => {
      try {
        execSync(`curl -sf -o /dev/null ${url}`);
        return true;
      } catch {
        return false;
      }
    };
    let n = 0;
    const t = setInterval(() => {
      n++;
      if (ok()) {
        clearInterval(t);
        resolve();
      } else if (n > tries) {
        clearInterval(t);
        reject(new Error(`timeout esperando ${url}`));
      }
    }, 1000);
  });
}

function measurePage(html) {
  return new Promise((resolve, reject) => {
    try {
      const dom = execSync(
        `timeout 55 ${CHROMIUM} --headless --no-sandbox --disable-gpu ` +
          `--window-size=${VIEWPORT},1000 --virtual-time-budget=12000 --dump-dom ` +
          `${URL_BASE}/medir.html`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
      );
      const m = dom.match(/<pre id="out"[^>]*>([\s\S]*?)<\/pre>/);
      resolve(m ? m[1].trim() : "NO RESULT");
    } catch (e) {
      reject(e);
    }
  });
}

const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<h1 id="resultado">esperando...</h1><pre id="out"></pre><script>
var VIEW=${VIEWPORT};
var out=document.getElementById('out'); var results=[]; var PAGES=[];
function b(r){return 'x='+Math.round(r.x)+' w='+Math.round(r.width)+' R='+Math.round(r.right);}
function mk(src){return new Promise(function(res){
  var f=document.createElement('iframe'); f.src=src; f.style='width:${VIEWPORT}px;height:1400px;border:0;display:block';
  document.body.appendChild(f); f.onload=setTimeout(res,2500);});}
(function(){ mk('/').then(function(){
  var f=document.querySelector('iframe'); var d=f.contentDocument;
  var main=b(d.querySelector('main').getBoundingClientRect());
  var nav=d.querySelector('nav')?b(d.querySelector('nav').getBoundingClientRect()):'n/a';
  var foot=d.querySelector('footer>div')?b(d.querySelector('footer>div').getBoundingClientRect()):'n/a';
  results.push('HOME main '+main+' | nav '+nav+' | footerInner '+foot);
  return mk('/login');}).then(function(){
  var a=document.querySelectorAll('iframe'); var d=a[a.length-1].contentDocument;
  results.push('LOGIN form '+b(d.querySelector('form').getBoundingClientRect()));
  return mk('/registro');}).then(function(){
  var a=document.querySelectorAll('iframe'); var d=a[a.length-1].contentDocument;
  results.push('REGISTRO form '+b(d.querySelector('form').getBoundingClientRect()));
  out.textContent=results.join('\\n');});})();
<\/script></body></html>`;

async function launch() {
  writeFileSync(MEDIR_HTML, htmlContent);
  const cmd = process.env.LAUNCH_MODE === "dev" ? "npm run dev" : "npx next start";
  console.log(`▶ Iniciando servidor (${cmd}) en :${PORT} ...`);
  const child = spawn(cmd, { cwd: ROOT, shell: true, detached: true, stdio: "ignore" });
  child.unref();
  try {
    await waitFor(URL_BASE);
  } catch (e) {
    console.error("✗ No se pudo levantar el servidor:", e.message);
    unlinkSync(MEDIR_HTML);
    process.exit(1);
  }

  console.log(`▶ Servidor listo. Midiendo layout a ${VIEWPORT}px de ancho...\n`);
  for (const p of PAGES) {
    // La página de medición ya barre todas las rutas; mostramos por pasadas.
  }
  try {
    const raw = await measurePage();
    const lines = raw.split("\n");
    console.log("── Resultado (centro esperado ≈", Math.round(VIEWPORT / 2), ") ──");
    for (const l of lines) console.log("  " + l);
    const vals = raw.match(/x=(\d+)/g) || [];
    const xs = vals.map((v) => parseInt(v.slice(2), 10));
    const ok = xs.every((x) => x !== 0 && Math.abs(x) > 1);
    console.log("\n" + (ok ? "✔ TODOS los contenedores quedaron a la derecha de x=1 (sin pegado a la izquierda)."
                          : "✗ Hay contenedores en x≈0 (pegados a la izquierda)."));
  } catch (e) {
    console.error("✗ Error al medir:", e.message);
  }

  try { unlinkSync(MEDIR_HTML); } catch {}
  const pid = child.pid;
  try { process.kill(-pid, "SIGKILL"); } catch {}
  console.log("\n✔ Verificación finalizada.");
}

launch();
