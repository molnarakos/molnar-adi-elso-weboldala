const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000; // Rendernek kell a process.env.PORT!

// ============================================================
// MONGODB ATLAS KAPCSOLAT
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
    body { font-family: 'Segoe UI', sans-serif; background: #121212; color: white; }
    nav { background: #1f1f1f; padding: 15px; text-align: center; border-bottom: 2px solid #ff4757; }
    nav a { color: white; margin: 0 20px; text-decoration: none; font-weight: bold; }
    .container { max-width: 1100px; margin: 30px auto; padding: 20px; background: #1e1e1e; border-radius: 15px; }
    .btn { background: #ff4757; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
    .card { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 10px; }
  </style>`;
}

function getMenu() {
  return `<nav><a href="/">🏠 Főoldal</a><a href="/uzenetfal">💬 Üzenőfal</a><a href="/tengerimalac-jatek">🚀 JÁTÉK</a><a href="/profil">👤 Profil</a></nav>`;
}

// ============================================================
// ÚTVONALAK
// ============================================================

app.get('/', (req, res) => {
  res.send(`${getStyle()}${getMenu()}<div class="container"><h1>Üdv az oldalamon!</h1><p>Ez az én weboldalam.</p><br><a href="/tengerimalac-jatek" class="btn">Indítsd a Játékot!</a></div>`);
});

app.get('/uzenetfal', async (req, res) => {
  try {
    const uzenetek = await uzenetekCollection.find().sort({ _id: -1 }).toArray();
    let list = uzenetek.map(u => `<div class="card"><b>${u.nev}:</b> ${u.szoveg}</div>`).join('');
    res.send(`${getStyle()}${getMenu()}<div class="container"><h2>Üzenőfal</h2><form action="/api/uzenet" method="POST"><input name="nev" placeholder="Neved" style="width:100%; margin:5px 0;"><textarea name="szoveg" placeholder="Üzenet" style="width:100%; margin:5px 0;"></textarea><button class="btn">Küldés</button></form>${list}</div>`);
  } catch(e) { res.send("Hiba az üzenetek betöltésekor."); }
});

app.post('/api/uzenet', async (req, res) => {
  await uzenetekCollection.insertOne(req.body);
  res.redirect('/uzenetfal');
});

app.get('/profil', (req, res) => {
  res.send(`${getStyle()}${getMenu()}<div class="container"><h2>Profil</h2><p>Jelentkezz be a játék mentéséhez!</p></div>`);
});

// ============================================================
// TENGERIMALAC JÁTÉK (THREE.JS)
// ============================================================
app.get('/tengerimalac-jatek', (req, res) => {
  res.send(`
    ${getStyle()}
    ${getMenu()}
    <div id="ui" style="position: absolute; top: 100px; left: 20px; z-index: 10; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 10px; border: 1px solid #ff4757;">
      <h3>🐹 Guinea Pig Galaxy</h3>
      <p>💰 Pénz: $<span id="mDisp">0</span></p>
      <p>⚡ Energia: <span id="eDisp">0</span></p>
      <p id="fbi" style="color:red; display:none;">⚠️ FBI ÜLDÖZ!</p>
    </div>
    <div id="container"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
      let money = 0, energy = 0, pigs = [], hasBlock = false, isFBI = false;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
      const renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setSize(window.innerWidth, window.innerHeight - 80);
      document.getElementById('container').appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const rocket = new THREE.Group();
      rocket.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,2), new THREE.MeshStandardMaterial({color:0xff0000})));
      rocket.rotation.x = Math.PI/2; scene.add(rocket);

      const base = new THREE.Mesh(new THREE.BoxGeometry(10,1,10), new THREE.MeshStandardMaterial({color:0x0000ff}));
      base.position.set(0,-5,0); scene.add(base);

      const island = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshStandardMaterial({color:0x2ed573}));
      island.position.set(0,0,-100); scene.add(island);

      const keys = {};
      window.onkeydown=(e)=>keys[e.code]=true; window.onkeyup=(e)=>keys[e.code]=false;

      function animate() {
        requestAnimationFrame(animate);
        if(keys['KeyW']) rocket.translateY(0.8);
        if(keys['KeyA']) rocket.rotation.z += 0.05;
        if(keys['KeyD']) rocket.rotation.z -= 0.05;

        if(!hasBlock && rocket.position.distanceTo(island.position) < 8) { hasBlock = true; isFBI = true; document.getElementById('fbi').style.display='block'; }
        if(hasBlock && rocket.position.distanceTo(base.position) < 10) { hasBlock = false; isFBI = false; pigs.push(1); document.getElementById('fbi').style.display='none'; }

        energy += pigs.length * 0.01;
        if(energy >= 1) { energy -= 1; money += 10; }
        document.getElementById('mDisp').innerText = Math.floor(money);
        document.getElementById('eDisp').innerText = Math.floor(energy);

        camera.position.lerp(new THREE.Vector3(rocket.position.x, rocket.position.y+15, rocket.position.z+30), 0.1);
        camera.lookAt(rocket.position);
        renderer.render(scene, camera);
      }
      animate();
    </script>
  `);
});

// A szerver indítása
app.listen(port, () => {
  console.log("Szerver fut a porton: " + port);
});
