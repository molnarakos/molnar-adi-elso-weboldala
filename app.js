const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3000;

// --- MONGODB ATLAS KAPCSOLAT ---
const uri = "mongodb+srv://molnarakosandras_db_user:sTsxhR9NPpsnSTvt@cluster0.bf08wp5.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db, uzenetekCollection, jatekAllapotCollection, tengerimalacCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('elso-weboldalam');
    uzenetekCollection = db.collection('uzenetek');
    jatekAllapotCollection = db.collection('jatek_allapot');
    tengerimalacCollection = db.collection('tengerimalac_jatek');
    console.log("✅ Sikeresen csatlakoztunk a MongoDB Atlas-hoz!");
  } catch (error) {
    console.error("❌ MongoDB hiba:", error);
  }
}
connectDB();

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// ============================================================
// STILUS ES MENU (A te eredeti dizájnod)
// ============================================================
function getStyle() {
  return `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a1a; color: #f0f0f0; line-height: 1.6; }
    nav { background-color: #333; padding: 1rem; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.5); text-align: center; }
    nav a { color: #fff; text-decoration: none; margin: 0 15px; font-weight: bold; transition: color 0.3s; }
    nav a:hover { color: #ff4757; }
    .container { max-width: 1000px; margin: 2rem auto; padding: 2rem; background-color: #2d2d2d; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    h1, h2 { color: #ff4757; margin-bottom: 1rem; }
    input, textarea, select { width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 8px; background: #3d3d3d; color: white; }
    .btn { background: #ff4757; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; text-decoration: none; display: inline-block; transition: transform 0.2s; }
    .btn:hover { transform: scale(1.05); background: #ff6b81; }
    .card { background: #3d3d3d; padding: 15px; margin-bottom: 15px; border-radius: 10px; border-left: 5px solid #ff4757; }
    #canvas-container { width: 100%; height: 600px; border-radius: 15px; overflow: hidden; position: relative; }
  </style>`;
}

function getMenu() {
  return `<nav>
    <a href="/">🏠 Főoldal</a>
    <a href="/uzenetfal">💬 Üzenőfal</a>
    <a href="/jatekok">🎮 Játékok</a>
    <a href="/profil">👤 Profil</a>
  </nav>`;
}

// ============================================================
// ALAP ÚTVONALAK (Főoldal, Üzenőfal, Profil)
// ============================================================

app.get('/', (req, res) => {
  res.send(`${getStyle()}${getMenu()}<div class="container"><h1>Üdvözöllek az oldalamon!</h1><p>Ez egy Node.js és MongoDB Atlas alapú weboldal, amit én fejlesztettem.</p><br><a href="/tengerimalac-jatek" class="btn">🚀 IRÁNY A TENGERIMALAC JÁTÉK!</a></div>`);
});

app.get('/uzenetfal', async (req, res) => {
  const uzenetek = await uzenetekCollection.find().sort({ datum: -1 }).toArray();
  let uzenetLista = uzenetek.map(u => `
    <div class="card">
      <strong>${u.nev}</strong> <small>${u.datum}</small>
      <p>${u.szoveg}</p>
      ${u.kep ? `<img src="${u.kep}" style="max-width:100%; border-radius:10px; margin-top:10px;">` : ''}
    </div>`).join('');
    
  res.send(`${getStyle()}${getMenu()}
    <div class="container">
      <h2>Üzenőfal</h2>
      <form action="/api/uzenet" method="POST">
        <input type="text" name="nev" placeholder="Neved" required>
        <textarea name="szoveg" placeholder="Üzeneted" required></textarea>
        <input type="text" name="kep" placeholder="Kép URL (opcionális)">
        <button type="submit" class="btn">Küldés</button>
      </form>
      <hr style="margin:20px 0; border:0; border-top:1px solid #555;">
      ${uzenetLista}
    </div>`);
});

app.post('/api/uzenet', async (req, res) => {
  const { nev, szoveg, kep } = req.body;
  await uzenetekCollection.insertOne({ nev, szoveg, kep, datum: new Date().toLocaleString() });
  res.redirect('/uzenetfal');
});

app.get('/profil', (req, res) => {
    res.send(`${getStyle()}${getMenu()}
    <div class="container" id="profil-view">
        <h2>Profilod</h2>
        <div id="profil-info">Bejelentkezés szükséges...</div>
        <script>
            const user = JSON.parse(localStorage.getItem('bejelentkezve'));
            if(user) {
                document.getElementById('profil-info').innerHTML = \`
                    <p><strong>Felhasználónév:</strong> \${user.felhasznalonev}</p>
                    <button onclick="localStorage.clear(); location.reload();" class="btn">Kijelentkezés</button>
                \`;
            } else {
                document.getElementById('profil-info').innerHTML = \`
                    <form onsubmit="event.preventDefault(); localStorage.setItem('bejelentkezve', JSON.stringify({felhasznalonev: this.nev.value})); location.reload();">
                        <input type="text" name="nev" placeholder="Felhasználónév" required>
                        <button type="submit" class="btn">Belépés</button>
                    </form>
                \`;
            }
        </script>
    </div>`);
});

// ============================================================
// TENGERIMALAC JÁTÉK (THREE.JS + MONGODB)
// ============================================================

app.get('/jatekok', (req, res) => {
    res.send(`${getStyle()}${getMenu()}<div class="container"><h2>Játékok</h2><a href="/tengerimalac-jatek" class="btn">🚀 Tengerimalac Kaland (3D)</a></div>`);
});

app.get('/tengerimalac-jatek', (req, res) => {
  res.send(`
    ${getStyle()}
    ${getMenu()}
    <div id="game-ui" style="position: absolute; top: 80px; left: 20px; z-index: 10; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 15px; border: 2px solid #ff4757; min-width: 200px;">
      <h2 style="margin:0; font-size: 18px;">🐹 Guinea Pig Galaxy</h2>
      <hr>
      <p>💰 Pénz: <b>$<span id="mDisp">0</span></b></p>
      <p>⚡ Energia: <b><span id="eDisp">0</span></b></p>
      <p>🐹 Malacok: <b><span id="pCount">0</span></b></p>
      <p id="fbi" style="color:#ff4444; font-weight:bold; display:none; animation: blink 0.5s infinite;">⚠️ FBI ÜLDÖZ!</p>
    </div>

    <div id="canvas-container"></div>

    <style>@keyframes blink { 0% {opacity:1;} 50% {opacity:0;} 100% {opacity:1;} }</style>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
      let money = 0, energy = 0, pigs = [], hasBlock = false, isFBI = false;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
      const renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setSize(window.innerWidth, window.innerHeight - 70);
      document.getElementById('canvas-container').appendChild(renderer.domElement);

      // Világítás és Csillagok
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const light = new THREE.PointLight(0xffffff, 1); light.position.set(10, 10, 10); scene.add(light);
      
      const starGeo = new THREE.BufferGeometry();
      const starPositions = [];
      for(let i=0; i<2000; i++) { starPositions.push(Math.random()*1000-500, Math.random()*1000-500, Math.random()*1000-500); }
      starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.5})));

      // Rakéta Modell
      const rocket = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 2), new THREE.MeshStandardMaterial({color: 0xff4757}));
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1), new THREE.MeshStandardMaterial({color: 0xffffff}));
      nose.position.y = 1.5; rocket.add(body, nose);
      rocket.rotation.x = Math.PI / 2;
      scene.add(rocket);

      // Bázis
      const base = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 12), new THREE.MeshStandardMaterial({color: 0x4757ff}));
      base.position.set(0, -5, 0); scene.add(base);

      // Szigetek generálása
      const islands = [];
      const types = ['Common', 'Rare', 'Legendary', 'OP'];
      function createIsland(x, z, type) {
          const group = new THREE.Group();
          const geo = new THREE.SphereGeometry(4, 32, 32);
          const mat = new THREE.MeshStandardMaterial({color: 0x2ed573});
          const isl = new THREE.Mesh(geo, mat);
          const block = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5), new THREE.MeshStandardMaterial({color: 0xffa502}));
          block.position.y = 5;
          group.add(isl, block); group.position.set(x, 0, z);
          group.userData = { type, hasBlock: true };
          scene.add(group); islands.push(group);
      }
      createIsland(0, -100, 'Common');
      createIsland(150, -250, 'Legendary');
      createIsland(-200, -400, 'OP');

      // FBI
      const fbiShip = new THREE.Mesh(new THREE.BoxGeometry(3,1,5), new THREE.MeshStandardMaterial({color: 0x000000}));
      fbiShip.position.set(1000, 1000, 1000); scene.add(fbiShip);

      // Irányítás
      const keys = {};
      window.onkeydown = (e) => keys[e.code] = true;
      window.onkeyup = (e) => keys[e.code] = false;

      let currentSpeed = 0;

      function animate() {
        requestAnimationFrame(animate);
        
        if(keys['KeyW']) currentSpeed = Math.min(currentSpeed + 0.01, 1.2);
        else currentSpeed *= 0.96;
        if(keys['KeyA']) rocket.rotation.z += 0.05;
        if(keys['KeyD']) rocket.rotation.z -= 0.05;
        rocket.translateY(currentSpeed);

        // Ütközés és FBI üldözés
        islands.forEach(isl => {
            if(isl.userData.hasBlock && rocket.position.distanceTo(isl.position) < 6) {
                isl.children[1].visible = false; isl.userData.hasBlock = false;
                hasBlock = true; isFBI = true;
                document.getElementById('fbi').style.display = 'block';
            }
        });

        if(isFBI) {
            fbiShip.position.lerp(rocket.position, 0.012);
            fbiShip.lookAt(rocket.position);
            if(fbiShip.position.distanceTo(rocket.position) < 2) {
                alert("AZ FBI ELKAPOTT! Elvesztetted a Lucky Blockot!");
                location.reload();
            }
        }

        // Leadás a bázison
        if(hasBlock && rocket.position.distanceTo(base.position) < 8) {
            hasBlock = false; isFBI = false;
            document.getElementById('fbi').style.display = 'none';
            fbiShip.position.set(1000,1000,1000);
            pigs.push({id: Date.now()});
            document.getElementById('pCount').innerText = pigs.length;
            // Újraélesztjük a blokkot a szigeten egy idő után
            setTimeout(() => islands.forEach(i => {i.userData.hasBlock = true; i.children[1].visible = true;}), 5000);
        }

        // Gazdaság
        energy += pigs.length * 0.02;
        if(energy >= 10) { energy -= 10; money += 100; }
        
        document.getElementById('mDisp').innerText = Math.floor(money);
        document.getElementById('eDisp').innerText = Math.floor(energy);

        if(money >= 1000000000) {
            alert("GRATULÁLOK! Megszerezted az 1 Milliárd dollárt! Irány a Tengerimalac Isten!");
            money = 0; // Vagy rebirth
        }

        camera.position.lerp(new THREE.Vector3(rocket.position.x, rocket.position.y+15, rocket.position.z+30), 0.1);
        camera.lookAt(rocket.position);
        renderer.render(scene, camera);
      }
      animate();
    </script>
  `);
});

// --- API A MENTÉSHEZ ---
app.post('/api/save-game', async (req, res) => {
    const { username, money, energy, pigs } = req.body;
    await tengerimalacCollection.updateOne({ username }, { $set: { money, energy, pigs } }, { upsert: true });
    res.json({ siker: true });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Az oldal fut a http://localhost:${port} címen`);
});
