const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// === MONGODB ATLAS CSATLAKOZÁS ===
const uri = "mongodb+srv://molnarakosandras_db_user:sTsxhR9NPpsnSTvt@cluster0.bf08wp5.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let db, uzenetekCollection, jatekAllapotCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('elso-weboldalam');
    uzenetekCollection = db.collection('uzenetek');
    jatekAllapotCollection = db.collection('jatek_allapot'); // Itt tároljuk a profilok adatait!
    console.log("✅ Sikeresen csatlakoztunk a MongoDB Atlas-hoz!");
  } catch (e) { console.error("Hiba:", e); }
}
connectDB();

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// === STÍLUS ÉS MENÜ (A TE EREDETI KÓDOD) ===
function getStyle() {
  return `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @keyframes alapHatter { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
      background-size: 400% 400%;
      animation: alapHatter 15s ease infinite;
      color: white; min-height: 100vh;
    }
    nav { background: rgba(0,0,0,0.8); padding: 15px; text-align: center; border-bottom: 2px solid #ff4757; }
    nav a { color: white; margin: 0 15px; text-decoration: none; font-weight: bold; }
    .container { max-width: 900px; margin: 30px auto; padding: 25px; background: rgba(0,0,0,0.6); border-radius: 20px; backdrop-filter: blur(10px); text-align: center; }
    .btn { background: #ff4757; color: white; padding: 12px 25px; border: none; border-radius: 10px; cursor: pointer; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px; }
    input { padding: 10px; border-radius: 5px; width: 80%; margin: 10px; border: none; }
  </style>`;
}

function getMenu() {
  return `<nav><a href="/">🏠 Főoldal</a><a href="/uzenetfal">💬 Üzenőfal</a><a href="/tengerimalac-jatek">🚀 JÁTÉK</a><a href="/profil">👤 Profil</a></nav>`;
}

// === PROFIL RENDSZER (A TE KÓDOD ALAPJÁN) ===
app.get('/profil', (req, res) => {
  res.send(`${getStyle()}${getMenu()}
    <div class="container">
      <h2>👤 Profilod</h2>
      <div id="profil-info">Ellenőrzés...</div>
      <div id="login-box" style="display:none;">
        <input type="text" id="p-name" placeholder="Írd be a neved...">
        <button onclick="saveProfile()" class="btn">Belépés</button>
      </div>
      <script>
        const u = localStorage.getItem('bejelentkezve');
        if(u) {
          document.getElementById('profil-info').innerHTML = "Bejelentkezve mint: <b>" + u + "</b><br><br><button onclick='localStorage.removeItem(\"bejelentkezve\"); location.reload();' class='btn'>Kijelentkezés</button>";
        } else {
          document.getElementById('login-box').style.display = "block";
          document.getElementById('profil-info').innerText = "Nem vagy bejelentkezve.";
        }
        function saveProfile() {
          const n = document.getElementById('p-name').value;
          if(n) { localStorage.setItem('bejelentkezve', n); location.reload(); }
        }
      </script>
    </div>`);
});

// === 3D JÁTÉK (Szigetek, Fuel, Mentés) ===
app.get('/tengerimalac-jatek', (req, res) => {
  res.send(`
    ${getStyle()}
    ${getMenu()}
    <div id="ui" style="position: absolute; top: 100px; left: 20px; z-index: 10; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 15px; border: 2px solid #ff4757; width: 230px;">
      <h3 id="uName" style="color:#ff4757;">...</h3>
      <p>💰 Pénz: $<span id="mDisp">0</span></p>
      <p>🐹 Malacok: <span id="pCount">0</span></p>
      <p>⛽ Fuel: <span id="fDisp">100</span>%</p>
      <div style="width:100%; height:10px; background:#333; border-radius:5px; margin-top:5px; overflow:hidden;">
        <div id="fBar" style="width:100%; height:100%; background:lime;"></div>
      </div>
    </div>
    <div id="game-canvas"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
      const me = localStorage.getItem('bejelentkezve');
      if(!me) { alert("Jelentkezz be a Profilnál!"); window.location.href="/profil"; }
      document.getElementById('uName').innerText = me;

      let money = 0, fuel = 100, pigs = 0, hasBlock = false, reward = 0;

      // Betöltés Atlasból
      fetch('/api/load/' + me).then(r => r.json()).then(d => {
        money = d.money || 0; pigs = d.pigs || 0;
      });

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
      const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
      renderer.setSize(window.innerWidth, window.innerHeight - 80);
      document.getElementById('game-canvas').appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1));
      const rocket = new THREE.Group();
      rocket.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,2), new THREE.MeshStandardMaterial({color:0xff4757})));
      rocket.rotation.x = Math.PI/2; scene.add(rocket);

      const base = new THREE.Mesh(new THREE.BoxGeometry(12,1,12), new THREE.MeshStandardMaterial({color:0x23a6d5}));
      base.position.set(0,-5,0); scene.add(base);

      // SZIGETEK (Common, God, stb.)
      const islands = [];
      const data = [{n:'God', c:0xffff00, d:1200, r:100}, {n:'Rare', c:0x3742fa, d:400, r:10}, {n:'Common', c:0x2ed573, d:150, r:1}];
      data.forEach(d => {
        const group = new THREE.Group();
        group.add(new THREE.Mesh(new THREE.SphereGeometry(6), new THREE.MeshStandardMaterial({color:d.c})));
        const b = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshStandardMaterial({color:0xffd700}));
        b.position.y = 8; group.add(b);
        group.position.set(Math.random()*d.d - d.d/2, 0, -d.d);
        group.userData = { reward: d.r, active: true };
        scene.add(group); islands.push(group);
      });

      const keys = {};
      window.onkeydown=e=>keys[e.code]=true; window.onkeyup=e=>keys[e.code]=false;

      function animate() {
        requestAnimationFrame(animate);
        if(keys['KeyW'] && fuel > 0) { rocket.translateY(1.0); fuel -= 0.15; }
        if(keys['KeyA']) rocket.rotation.z += 0.05;
        if(keys['KeyD']) rocket.rotation.z -= 0.05;

        islands.forEach(i => {
          if(i.userData.active && rocket.position.distanceTo(i.position) < 8) {
            i.userData.active = false; i.children[1].visible = false;
            hasBlock = true; reward = i.userData.reward;
          }
        });

        if(rocket.position.distanceTo(base.position) < 10) {
          fuel = 100;
          if(hasBlock) { 
            hasBlock = false; pigs += reward; 
            fetch('/api/save', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:me, money, pigs})});
          }
        }
        
        money += pigs * 0.05;
        document.getElementById('mDisp').innerText = Math.floor(money);
        document.getElementById('pCount').innerText = pigs;
        document.getElementById('fDisp').innerText = Math.floor(fuel);
        document.getElementById('fBar').style.width = fuel + "%";

        camera.position.lerp(new THREE.Vector3(rocket.position.x, rocket.position.y+15, rocket.position.z+30), 0.1);
        camera.lookAt(rocket.position);
        renderer.render(scene, camera);
      }
      animate();
    </script>
  `);
});

// === ATLAS API ===
app.get('/api/load/:user', async (req, res) => {
  const p = await jatekAllapotCollection.findOne({ username: req.params.user });
  res.json(p || { money: 0, pigs: 0 });
});

app.post('/api/save', async (req, res) => {
  const { username, money, pigs } = req.body;
  await jatekAllapotCollection.updateOne({ username }, { $set: { money, pigs } }, { upsert: true });
  res.json({ ok: true });
});

// === ÜZENŐFAL (A TE KÓDOD) ===
app.get('/uzenetfal', async (req, res) => {
  const uzenetek = await uzenetekCollection.find().sort({ _id: -1 }).toArray();
  let list = uzenetek.map(u => `<div style="background:rgba(255,255,255,0.1); padding:10px; margin:5px; border-radius:10px;"><b>${u.nev}:</b> ${u.szoveg}</div>`).join('');
  res.send(getStyle() + getMenu() + `<div class="container"><h2>Üzenőfal</h2><form action="/api/uzenet" method="POST"><input name="nev" placeholder="Neved"><textarea name="szoveg" placeholder="Üzenet" style="width:80%; height:60px;"></textarea><button class="btn">Küldés</button></form>${list}</div>`);
});

app.post('/api/uzenet', async (req, res) => {
  await uzenetekCollection.insertOne(req.body);
  res.redirect('/uzenetfal');
});

app.get('/', (req, res) => {
  res.send(getStyle() + getMenu() + `<div class="container"><h1>Szia Ádi!</h1><p>Visszahoztuk a profilokat és az Atlas mentést!</p></div>`);
});

app.listen(port, () => console.log("Szerver elindult!"));
