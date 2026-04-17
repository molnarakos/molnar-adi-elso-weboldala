const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3000;

// ============================================================
// MONGODB ATLAS KAPCSOLAT - ÍRD BE A JELSZAVADAT!
// ============================================================
const uri = "mongodb+srv://molnarakosandras_db_user:sTsxhR9NPpsnSTvt@cluster0.bf08wp5.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let db, uzenetekCollection, tengerimalacCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('elso-weboldalam');
    uzenetekCollection = db.collection('uzenetek');
    tengerimalacCollection = db.collection('tengerimalac_statisztika');
    console.log("✅ Sikeres Atlas csatlakozás!");
  } catch (e) {
    console.error("❌ Hiba:", e);
  }
}
connectDB();

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// ============================================================
// STÍLUS ÉS MENÜ
// ============================================================
function getStyle() {
  return `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #121212; color: white; overflow-x: hidden; }
    nav { background: #1f1f1f; padding: 15px; text-align: center; border-bottom: 2px solid #ff4757; position: sticky; top: 0; z-index: 1000; }
    nav a { color: white; margin: 0 20px; text-decoration: none; font-weight: bold; font-size: 18px; }
    nav a:hover { color: #ff4757; }
    .container { max-width: 1100px; margin: 30px auto; padding: 20px; background: #1e1e1e; border-radius: 15px; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    .btn { background: #ff4757; color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; font-weight: bold; margin-top: 10px; }
    .card { background: #2a2a2a; padding: 15px; margin: 15px 0; border-radius: 10px; border-left: 5px solid #ff4757; }
    input, textarea { width: 100%; padding: 10px; margin: 10px 0; border-radius: 5px; border: none; background: #333; color: white; }
  </style>`;
}

function getMenu() {
  return `<nav>
    <a href="/">🏠 Főoldal</a>
    <a href="/uzenetfal">💬 Üzenőfal</a>
    <a href="/tengerimalac-jatek">🚀 JÁTÉK</a>
    <a href="/profil">👤 Profil</a>
  </nav>`;
}

// ============================================================
// ÚTVONALAK
// ============================================================

app.get('/', (req, res) => {
  res.send(`${getStyle()}${getMenu()}<div class="container"><h1>Üdv az oldalamon!</h1><p>Ez a saját fejlesztésű weboldalam 9 évesen.</p><br><a href="/tengerimalac-jatek" class="btn">Indítsd a Tengerimalac Kalandot!</a></div>`);
});

app.get('/uzenetfal', async (req, res) => {
  const uzenetek = await uzenetekCollection.find().sort({ _id: -1 }).toArray();
  let list = uzenetek.map(u => `<div class="card"><b>${u.nev}:</b> ${u.szoveg}</div>`).join('');
  res.send(`${getStyle()}${getMenu()}<div class="container"><h2>Üzenőfal</h2><form action="/api/uzenet" method="POST"><input name="nev" placeholder="Neved"><textarea name="szoveg" placeholder="Üzenet"></textarea><button class="btn">Küldés</button></form>${list}</div>`);
});

app.post('/api/uzenet', async (req, res) => {
  await uzenetekCollection.insertOne(req.body);
  res.redirect('/uzenetfal');
});

app.get('/profil', (req, res) => {
  res.send(`${getStyle()}${getMenu()}<div class="container"><h2>Profil</h2><p id="pinfo">Bejelentkezés...</p><script>const u = JSON.parse(localStorage.getItem('bejelentkezve')); document.getElementById('pinfo').innerText = u ? "Szia, " + u.felhasznalonev : "Nincs bejelentkezve.";</script><button class="btn" onclick="const n = prompt('Neved?'); if(n){localStorage.setItem('bejelentkezve', JSON.stringify({felhasznalonev:n})); location.reload();}">Bejelentkezés</button></div>`);
});

// ============================================================
// TENGERIMALAC JÁTÉK (THREE.JS)
// ============================================================
app.get('/tengerimalac-jatek', (req, res) => {
  res.send(`
    ${getStyle()}
    ${getMenu()}
    <div id="ui" style="position: absolute; top: 100px; left: 20px; z-index: 10; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; border: 2px solid #ff4757;">
      <h2 style="color:#ff4757">🐹 Guinea Pig Galaxy</h2>
      <p>💰 Pénz: $<span id="mDisp">0</span></p>
      <p>⚡ Energia: <span id="eDisp">0</span></p>
      <p>🐹 Malacok: <span id="pCount">0</span></p>
      <p id="fbi" style="color:red; display:none; font-weight:bold;">⚠️ FBI ÜLDÖZ!</p>
    </div>
    <div id="container"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
      let money = 0, energy = 0, pigs = [], hasBlock = false, isFBI = false, lastReward = 0;
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
      const renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setSize(window.innerWidth, window.innerHeight - 80);
      document.getElementById('container').appendChild(renderer.domElement);

      // Világítás & Csillagok
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const starGeo = new THREE.BufferGeometry();
      const starPos = [];
      for(let i=0; i<3000; i++) { starPos.push(Math.random()*2000-1000, Math.random()*2000-1000, Math.random()*2000-1000); }
      starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.5})));

      // Rakéta
      const rocket = new THREE.Group();
      const rBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2), new THREE.MeshStandardMaterial({color: 0xff0000}));
      const rNose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1), new THREE.MeshStandardMaterial({color: 0xffffff}));
      rNose.position.y = 1.5; rocket.add(rBody, rNose);
      rocket.rotation.x = Math.PI / 2;
      scene.add(rocket);

      // Bázis
      const base = new THREE.Mesh(new THREE.BoxGeometry(15, 1, 15), new THREE.MeshStandardMaterial({color: 0x0000ff}));
      base.position.set(0, -5, 0); scene.add(base);

      // Szigetek generálása
      const islands = [];
      const config = {
        'Common': {c: 0x2ed573, d: 100, p: 1},
        'Rare': {c: 0x3742fa, d: 250, p: 5},
        '
