const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// === MONGODB ATLAS (Írd be a jelszavadat!) ===
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
    console.log("✅ Atlas csatlakozva!");
  } catch (e) { console.error("Adatbázis hiba:", e); }
}
connectDB();

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// === STÍLUS (Visszaraktam a te animált hátteredet!) ===
function getStyle() {
  return `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @keyframes alapHatter {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
      background-size: 400% 400%;
      animation: alapHatter 15s ease infinite;
      color: white;
      overflow-x: hidden;
    }
    nav { background: rgba(0,0,0,0.8); padding: 15px; text-align: center; border-bottom: 2px solid #ff4757; }
    nav a { color: white; margin: 0 20px; text-decoration: none; font-weight: bold; }
    .container { max-width: 1000px; margin: 20px auto; padding: 20px; background: rgba(0,0,0,0.6); border-radius: 20px; }
    .btn { background: #ff4757; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; font-weight: bold; }
  </style>`;
}

function getMenu() {
  return `<nav><a href="/">🏠 Főoldal</a><a href="/uzenetfal">💬 Üzenőfal</a><a href="/tengerimalac-jatek">🚀 JÁTÉK</a></nav>`;
}

// === OLDALAK ===
app.get('/', (req, res) => {
  res.send(getStyle() + getMenu() + `<div class="container"><h1>Szia Ádi!</h1><p>Ez a profi 3D tengerimalacos oldalad.</p><br><a href="/tengerimalac-jatek" class="btn">🚀 INDÍTÁS</a></div>`);
});

app.get('/uzenetfal', async (req, res) => {
  const uzenetek = await uzenetekCollection.find().sort({ _id: -1 }).toArray();
  let list = uzenetek.map(u => `<div style="background:rgba(0,0,0,0.3); padding:10px; margin:5px; border-radius:10px;"><b>${u.nev}:</b> ${u.szoveg}</div>`).join('');
  res.send(getStyle() + getMenu() + `<div class="container"><h2>Üzenőfal</h2><form action="/api/uzenet" method="POST"><input name="nev" placeholder="Neved" style="width:100%; padding:10px; margin:5px 0;"><textarea name="szoveg" placeholder="Üzenet" style="width:100%; padding:10px; margin:5px 0;"></textarea><button class="btn">Küldés</button></form>${list}</div>`);
});

app.post('/api/uzenet', async (req, res) => {
  await uzenetekCollection.insertOne(req.body);
  res.redirect('/uzenetfal');
});

// === A 3D JÁTÉK (Szigetekkel és Fuel-lel) ===
app.get('/tengerimalac-jatek', (req, res) => {
  res.send(`
    ${getStyle()}
    ${getMenu()}
    <div id="ui" style="position: absolute; top: 100px; left: 20px; z-index: 10; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 15px; border: 2px solid #ff4757; width: 220px;">
      <h3 style="color:#ff4757; margin-bottom:10px;">🐹 Galaxy Quest</h3>
      <p>💰 Pénz: $<span id="mDisp">0</span></p>
      <p>🐹 Malacok: <span id="pCount">0</span></p>
      <p>⛽ Fuel: <span id="fDisp">100</span>%</p>
      <div style="width:100%; height:8px; background:#333; margin-top:5px; border-radius:4px; overflow:hidden;">
        <div id="fBar" style="width:100%; height:100%; background:lime; transition:0.3s;"></div>
      </div>
      <p id="fbi" style="color:red; display:none; font-weight:bold; margin-top:10px;">⚠️ FBI ÜLDÖZ!</p>
    </div>
    <div id="game-hold"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
      let money = 0, fuel = 100, pigs = [], hasBlock = false, isFBI = false, currentReward = 0;
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
      const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
      renderer.setSize(window.innerWidth, window.innerHeight - 80);
      document.getElementById('game-hold').appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1));

      // Rakéta
      const rocket = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,2), new THREE.MeshStandardMaterial({color:0xff4757}));
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5,1), new THREE.MeshStandardMaterial({color:0xffffff}));
      nose.position.y = 1.5; rocket.add(body, nose);
      rocket.rotation.x = Math.PI / 2;
      scene.add(rocket);

      // Bázis
      const base = new THREE.Mesh(new THREE.BoxGeometry(15,1,15), new THREE.MeshStandardMaterial({color:0x23a6d5}));
      base.position.set(0, -5, 0); scene.add(base);

      // SZIGETEK LÉTREHOZÁSA
      const islands = [];
      const types = [
        {n: 'Common', c: 0x2ed573, d: 150, r: 1},
        {n: 'Rare', c: 0x3742fa, d: 300, r: 5},
        {n: 'Epic', c: 0xa020f0, d: 500, r: 15},
        {n: 'Legendary', c: 0xffa502, d: 800, r: 40},
        {n: 'Mythic', c: 0xff4757, d: 1200, r: 100},
        {n: 'God', c: 0xffff00, d: 1800, r: 500},
        {n: 'OP', c: 0x00ffff, d: 2500, r: 2000}
      ];

      types.forEach(t => {
        const angle = Math.random() * Math.PI * 2;
        const group = new THREE.Group();
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(6), new THREE.MeshStandardMaterial({color: t.c}));
        const block = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshStandardMaterial({color: 0xffd700}));
        block.position.y = 8; group.add(mesh, block);
        group.position.set(Math.cos(angle)*t.d, 0, Math.sin(angle)*t.d);
        group.userData = { name: t.n, reward: t.r, active: true };
        scene.add(group); islands.push(group);
      });

      const fbi = new THREE.Mesh(new THREE.BoxGeometry(3,1,5), new THREE.MeshStandardMaterial({color: 0x000000}));
      fbi.position.set(5000,0,0); scene.add(fbi);

      const keys = {};
      window.onkeydown=(e)=>keys[e.code]=true;
      window.onkeyup=(e)=>keys[e.code]=false;

      function animate() {
        requestAnimationFrame(animate);
        
        if(keys['KeyW'] && fuel > 0) {
            rocket.translateY(1.2);
            fuel -= 0.12; // Üzemanyag fogyás!
        }
        if(keys['KeyA']) rocket.rotation.z += 0.05;
        if(keys['KeyD']) rocket.rotation.z -= 0.05;

        // Ütközés szigetekkel
        islands.forEach(isl => {
          if(isl.userData.active && rocket.position.distanceTo(isl.position) < 8) {
            isl.children[1].visible = false; isl.userData.active = false;
            hasBlock = true; isFBI = true; currentReward = isl.userData.reward;
            document.getElementById('fbi').style.display = 'block';
          }
        });

        // FBI Üldözés
        if(isFBI) {
          fbi.position.lerp(rocket.position, 0.015); fbi.lookAt(rocket.position);
          if(fbi.position.distanceTo(rocket.position) < 3) { alert("FBI ELKAPOTT!"); location.reload(); }
        }

        // Bázis (Leadás és Tankolás)
        if(rocket.position.distanceTo(base.position) < 12) {
            fuel = 100; // Tankolás!
            if(hasBlock) {
                hasBlock = false; isFBI = false;
                document.getElementById('fbi').style.display = 'none';
                for(let i=0; i<currentReward; i++) pigs.push(1);
                fbi.position.set(5000,0,0);
                // Szigetek újraélednek
                setTimeout(() => islands.forEach(i => {i.userData.active=true; i.children[1].visible=true;}), 5000);
            }
        }

        // UI
        document.getElementById('mDisp').innerText = Math.floor(money);
        document.getElementById('pCount').innerText = pigs.length;
        document.getElementById('fDisp').innerText = Math.max(0, Math.floor(fuel));
        document.getElementById('fBar').style.width = fuel + "%";
        document.getElementById('fBar').style.background = fuel < 30 ? "red" : "lime";
        
        money += pigs.length * 0.1;

        camera.position.lerp(new THREE.Vector3(rocket.position.x, rocket.position.y+20, rocket.position.z+40), 0.1);
        camera.lookAt(rocket.position);
        renderer.render(scene, camera);
      }
      animate();
    </script>
  `);
});

app.listen(port, () => console.log("Szerver fut!"));
