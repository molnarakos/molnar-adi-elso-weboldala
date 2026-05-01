const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3000;
const dbName = 'elso-weboldalam';
let db;
let uzenetekCollection;
let jatekAllapotCollection;

const uri = process.env.MONGODB_URI || "mongodb+srv://molnarakosandras_db_user:<sTsxhR9NPpsnSTvt>@cluster0.bf08wp5.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    db = client.db(dbName);
    uzenetekCollection = db.collection('uzenetek');
    jatekAllapotCollection = db.collection('jatek_allapot');
  } catch (error) {
    console.error('MongoDB kapcsolodasi hiba:', error);
    console.log('Az oldal MongoDB nelkul fut.');
  }
}
connectDB();

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.listen(port, '0.0.0.0', () => {
  console.log(`Az oldal fut a porton: ${port}`);
});
// ============================================================
// STILUS ES MENU
// ============================================================
function getStyle() {
  return `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @keyframes alapHatter { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes gradiensAnim { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes hullamAnim { 0%{background-position:0% 0%} 100%{background-position:100% 100%} }
    @keyframes buborekFel { 0%{transform:translateY(110vh) scale(0.3);opacity:0} 10%{opacity:0.8} 85%{opacity:0.6} 100%{transform:translateY(-10vh) scale(1.1);opacity:0} }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(-45deg, #667eea, #764ba2, #f64f59, #43c6ac, #667eea);
      background-size: 400% 400%;
      animation: alapHatter 12s ease infinite;
      min-height: 100vh; padding: 20px;
    }
    body.hatter-gradiens {
      background: linear-gradient(-45deg, #667eea, #764ba2, #f64f59, #43c6ac, #f9ca24, #6ab04c, #667eea) !important;
      background-size: 600% 600% !important;
      animation: gradiensAnim 10s ease infinite !important;
    }
    body.hatter-hullam { background: #001a4d !important; animation: none !important; }
    body.hatter-csillag { background: #0a0a2e !important; animation: none !important; }
    body.hatter-buborek { background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460) !important; animation: none !important; }
    body.hatter-kep { background-size: cover !important; background-position: center !important; background-attachment: fixed !important; animation: none !important; }
    body.hatter-video { background: #000 !important; animation: none !important; }
    #hatter-video-el { display:none; position:fixed; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:0; opacity:0.75; }
    #csillag-canvas { display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; }
    #buborek-container { display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; overflow:hidden; }
    .buborek { position:absolute; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); animation: buborekFel linear infinite; }
    nav { background: rgba(255,255,255,0.95); padding: 15px; border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); margin-bottom: 30px; text-align: center; position: relative; z-index: 10; }
    nav a { color: #667eea; margin: 10px 15px; text-decoration: none; font-weight: bold; font-size: 18px; padding: 10px 20px; border-radius: 10px; transition: all 0.3s; display: inline-block; }
    nav a:hover { background: #667eea; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); position: relative; z-index: 5; }
    h1 { color: #667eea; font-size: 48px; margin-bottom: 20px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
    p { color: #555; font-size: 18px; line-height: 1.8; margin: 15px 0; }
    .game-button { display: inline-block; font-size: 22px; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 15px; margin: 15px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102,126,234,0.4); }
    .game-button:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(102,126,234,0.6); }
    .emoji { font-size: 40px; display: block; margin-bottom: 10px; }
  </style>`;
}
function getMenu() {
  return `<nav>
    <a href="/">&#127968; Fooldal</a>
    <a href="/rolam">&#128100; Rolam</a>
    <a href="/a_weboldalrol">&#8505;&#65039; A weboldalrol</a>
    <a href="/jatekok">&#127918; Jatekok</a>
    <a href="/uzenofal">&#128172; Uzenofal</a>
    <span id="auth-menu"><a href="/bejelentkezes">&#128272; Bejelentkezes</a></span>
  </nav>
  <canvas id="csillag-canvas"></canvas>
  <div id="buborek-container"></div>
  <canvas id="hullam-canvas" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;"></canvas>
  <video id="hatter-video-el" autoplay muted loop playsinline></video>
  <script>
  (function() {
    const user = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
    if (user) {
      const pk = user.profilkep
        ? '<img src="' + user.profilkep + '" style="width:30px;height:30px;border-radius:50%;vertical-align:middle;margin-right:5px;object-fit:cover;">'
        : '<span style="display:inline-block;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-align:center;line-height:30px;font-weight:bold;margin-right:5px;vertical-align:middle;">' + user.felhasznalonev.charAt(0).toUpperCase() + '</span>';
      document.getElementById('auth-menu').innerHTML =
        '<a href="/profil" style="text-decoration:none;">' + pk +
        '<span style="color:#667eea;font-weight:bold;margin-right:10px;">' + user.felhasznalonev + '</span></a>' +
        '<a href="/kijelentkezes">&#128682; Kilepes</a>';
    }
    function indítCsillagok() {
      const canvas = document.getElementById('csillag-canvas');
      canvas.style.display = 'block';
      const ctx = canvas.getContext('2d');
      function resz() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      resz();
      window.addEventListener('resize', resz);
      const cs = [];
      for (let i = 0; i < 220; i++) cs.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*2+0.3, v:Math.random()*0.4+0.1, t:Math.random()*Math.PI*2 });
      function rajz() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        cs.forEach(c => {
          c.t += 0.04;
          ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,'+(0.4+0.6*Math.abs(Math.sin(c.t)))+')'; ctx.fill();
          c.y -= c.v; if(c.y < 0){c.y = canvas.height; c.x = Math.random()*canvas.width;}
        });
        requestAnimationFrame(rajz);
      }
      rajz();
    }
    function indítBuborékok() {
      const cont = document.getElementById('buborek-container');
      cont.style.display = 'block';
      for (let i = 0; i < 28; i++) {
        const b = document.createElement('div');
        b.className = 'buborek';
        const m = Math.random()*90+15;
        b.style.cssText = 'width:'+m+'px;height:'+m+'px;left:'+Math.random()*100+'%;bottom:-100px;animation-duration:'+(Math.random()*12+6)+'s;animation-delay:'+(Math.random()*10)+'s;';
        cont.appendChild(b);
      }
    }
    function indítHullam() {
      const canvas = document.getElementById('hullam-canvas');
      canvas.style.display = 'block';
      const ctx = canvas.getContext('2d');
      function resz() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      resz(); window.addEventListener('resize', resz);
      let t = 0;
      function rajz() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        // Sky gradient
        const sky = ctx.createLinearGradient(0,0,0,canvas.height);
        sky.addColorStop(0,'#001a4d'); sky.addColorStop(0.6,'#003080'); sky.addColorStop(1,'#0052d4');
        ctx.fillStyle = sky; ctx.fillRect(0,0,canvas.width,canvas.height);
        // Moon
        ctx.beginPath(); ctx.arc(canvas.width*0.8, 80, 40, 0, Math.PI*2);
        ctx.fillStyle='rgba(255,255,220,0.9)'; ctx.fill();
        // Multiple wave layers
        const waves = [
          {amp:30, freq:0.008, speed:0.03, y:0.55, color:'rgba(0,80,180,0.7)'},
          {amp:22, freq:0.012, speed:0.05, y:0.62, color:'rgba(0,100,200,0.65)'},
          {amp:18, freq:0.016, speed:0.07, y:0.68, color:'rgba(20,130,220,0.6)'},
          {amp:14, freq:0.020, speed:0.09, y:0.74, color:'rgba(40,160,240,0.55)'},
        ];
        waves.forEach(w => {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          for (let x=0; x<=canvas.width; x+=3) {
            const y = canvas.height*w.y + Math.sin(x*w.freq + t*w.speed*50) * w.amp + Math.sin(x*w.freq*1.7 + t*w.speed*30) * (w.amp*0.4);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();
          ctx.fillStyle = w.color; ctx.fill();
        });
        // Foam sparkles on top wave
        for(let i=0;i<8;i++){
          const x = (Math.sin(t*0.8+i*1.3)*0.5+0.5)*canvas.width;
          const y = canvas.height*0.55 + Math.sin(x*0.008+t*1.5)*30;
          ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
          ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fill();
        }
        t++;
        requestAnimationFrame(rajz);
      }
      rajz();
    }
    function alkalmazHatter(u) {
      if (!u || !u.hatterTipus) return;
      const t = u.hatterTipus;
      document.body.classList.remove('hatter-gradiens','hatter-csillag','hatter-buborek','hatter-hullam','hatter-kep','hatter-video');
      if (t === 'gradiens') document.body.classList.add('hatter-gradiens');
      else if (t === 'csillag') { document.body.classList.add('hatter-csillag'); indítCsillagok(); }
      else if (t === 'buborek') { document.body.classList.add('hatter-buborek'); indítBuborékok(); }
      else if (t === 'hullam') { document.body.classList.add('hatter-hullam'); indítHullam(); }
      else if (t === 'kep' && u.hatterAdat) { document.body.classList.add('hatter-kep'); document.body.style.backgroundImage = 'url('+u.hatterAdat+')'; }
      else if (t === 'video' && u.hatterAdat) {
        document.body.classList.add('hatter-video');
        const v = document.getElementById('hatter-video-el'); v.style.display='block'; v.src = u.hatterAdat;
      }
    }
    if (user) alkalmazHatter(user);
  })();
  </script>`;
}
// ============================================================
// OLDALAK
// ============================================================
app.get('/', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>&#127775; Udvozollek a weboldalamon!</h1><p style="text-align:center;font-size:20px;">Hasznald a menut fent, hogy felfedezd az oldalaimat!</p></div>');
});
app.get('/rolam', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>&#128102; Rolam</h1><p>&#127874; <strong>En egy 8 eves gyerek vagyok</strong>, es a kedvenc hobbim a <strong>programozas</strong>!</p><p>&#128187; Imadok szamitogepezni es uj dolgokat tanulni.</p></div>');
});
app.get('/a_weboldalrol', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>&#8505;&#65039; A weboldalrol</h1><p>&#128295; Ezt a weboldalt <strong>apukammal</strong> (meg az AI-al) csinaltak.</p></div>');
});
app.get('/jatekok', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>&#127918; Jatekok</h1><p style="text-align:center;">Valassz egy jatekot!</p><div style="text-align:center;margin-top:30px;">' +
    '<a href="/tengerimalac-jatek" class="game-button"><span class="emoji">&#128057;</span>Tengerimalac Kaland</a>' +
    '<a href="/lucky-block-rocket" class="game-button"><span class="emoji">&#128640;</span>Lucky Block Rocket</a>' +
    '<a href="/tetris" class="game-button"><span class="emoji">&#129706;</span>Tetris</a>' +
    '<a href="/snake" class="game-button"><span class="emoji">&#128013;</span>Snake</a>' +
    '<a href="/labirintus" class="game-button"><span class="emoji">&#127919;</span>Labirintus</a></div></div>');
});
// ============================================================
// PROFIL OLDAL
// ============================================================
app.get('/profil', (req, res) => {
  res.send(getStyle() + getMenu() + `
  <style>
    .profil-container { max-width:700px; margin:0 auto; background:white; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(0,0,0,0.3); position:relative; z-index:5; }
    .profil-avatar { width:120px; height:120px; border-radius:50%; object-fit:cover; border:4px solid #667eea; display:block; margin:0 auto 10px; }
    .profil-avatar-default { width:120px; height:120px; border-radius:50%; background:linear-gradient(135deg,#667eea,#764ba2); color:white; font-size:50px; font-weight:bold; display:flex; align-items:center; justify-content:center; margin:0 auto 10px; }
    .profil-nev { text-align:center; font-size:26px; font-weight:bold; color:#667eea; margin-bottom:30px; }
    .szekció { background:#f8f9ff; border-radius:15px; padding:25px; margin:20px 0; border:2px solid #e8edff; }
    .szekció h2 { color:#667eea; font-size:20px; margin-bottom:15px; }
    .hatter-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:15px; }
    .hatter-option { border:3px solid #ddd; border-radius:12px; padding:15px; text-align:center; cursor:pointer; transition:all 0.3s; font-size:14px; font-weight:bold; }
    .hatter-option:hover { border-color:#667eea; transform:scale(1.03); }
    .hatter-option.aktiv { border-color:#667eea; background:#f0f0ff; box-shadow:0 0 0 3px rgba(102,126,234,0.3); }
    .hatter-elonezet { width:100%; height:60px; border-radius:8px; margin-bottom:8px; }
    .feltoltes-zone { border:2px dashed #667eea; border-radius:12px; padding:20px; text-align:center; cursor:pointer; transition:all 0.3s; color:#667eea; font-weight:bold; margin-bottom:10px; }
    .feltoltes-zone:hover { background:#f0f0ff; }
    .mentes-btn { width:100%; padding:15px; background:linear-gradient(135deg,#667eea,#764ba2); color:white; border:none; border-radius:12px; font-size:18px; font-weight:bold; cursor:pointer; margin-top:10px; transition:all 0.3s; }
    .mentes-btn:hover { transform:translateY(-2px); box-shadow:0 5px 15px rgba(102,126,234,0.5); }
    .eredmeny { text-align:center; padding:15px; border-radius:10px; margin-top:15px; font-weight:bold; font-size:16px; display:none; }
    .siker { background:#d4edda; color:#155724; }
    .hiba { background:#f8d7da; color:#721c24; }
    @keyframes gradiensAnim2 { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes hullamAnim2 { 0%{background-position:0% 0%} 100%{background-position:100% 100%} }
  </style>
  <div class="profil-container" id="profilOldal" style="display:none;">
    <div id="avatarContainer"></div>
    <div class="profil-nev" id="profilNev"></div>
    <div class="szekció">
      <h2>&#128444;&#65039; Profilkep modositasa</h2>
      <div class="feltoltes-zone" onclick="document.getElementById('ujProfilkep').click()">
        &#128247; Kattints ide uj profilkep feltoltesehez (JPG, PNG, GIF &ndash; max 2MB)
      </div>
      <input type="file" id="ujProfilkep" accept="image/*" style="display:none;" onchange="profilkepElonezet(event)">
      <div id="pkPreviewDiv" style="text-align:center;margin-top:10px;display:none;">
        <img id="pkPreview" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #667eea;">
        <br><button class="mentes-btn" style="width:auto;padding:10px 25px;margin-top:10px;" onclick="mentProfilkep()">&#9989; Profilkep mentese</button>
      </div>
      <div id="pkEredmeny" class="eredmeny"></div>
    </div>
    <div class="szekció">
      <h2>&#127912; Hatter beallitasa</h2>
      <p style="color:#666;margin-bottom:15px;font-size:15px;">Valassz elore keszitett animaciot:</p>
      <div class="hatter-grid">
        <div class="hatter-option" id="opt-gradiens" onclick="valasztHatter('gradiens')">
          <div class="hatter-elonezet" style="background:linear-gradient(-45deg,#667eea,#764ba2,#f64f59,#43c6ac);background-size:300% 300%;animation:gradiensAnim2 3s ease infinite;"></div>
          &#127752; Szinvaltos gradiens
        </div>
        <div class="hatter-option" id="opt-csillag" onclick="valasztHatter('csillag')">
          <div class="hatter-elonezet" style="background:#0a0a2e;background-image:radial-gradient(white 1px,transparent 1px),radial-gradient(white 1px,transparent 1px);background-size:30px 30px;background-position:0 0,15px 15px;"></div>
          &#10024; Csillagos eg
        </div>
        <div class="hatter-option" id="opt-buborek" onclick="valasztHatter('buborek')">
          <div class="hatter-elonezet" style="background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);position:relative;overflow:hidden;">
            <div style="position:absolute;border-radius:50%;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.4);width:20px;height:20px;top:10px;left:20px;"></div>
            <div style="position:absolute;border-radius:50%;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.4);width:35px;height:35px;top:5px;left:55%;"></div>
            <div style="position:absolute;border-radius:50%;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.4);width:15px;height:15px;top:25px;left:42%;"></div>
          </div>
          &#129671; Uszo buborekok
        </div>
        <div class="hatter-option" id="opt-hullam" onclick="valasztHatter('hullam')">
          <div class="hatter-elonezet" style="background:linear-gradient(135deg,#0052d4,#4364f7,#6fb1fc);background-size:200% 200%;animation:hullamAnim2 2s ease infinite alternate;"></div>
          &#127754; Hullamo tenger
        </div>
      </div>
      <p style="color:#666;margin-bottom:10px;font-size:15px;margin-top:15px;">Vagy toltsd fel a sajatod:</p>
      <div class="hatter-grid">
        <div class="feltoltes-zone" onclick="document.getElementById('hatterKepFile').click()">
          &#128444;&#65039; Kep feltoltese<br><small style="color:#999;">(JPG, PNG, GIF &ndash; max 5MB)</small>
        </div>
        <div class="feltoltes-zone" onclick="document.getElementById('hatterVideoFile').click()">
          &#127909; Video feltoltese<br><small style="color:#999;">(MP4, WebM &ndash; max 20MB)</small>
        </div>
      </div>
      <input type="file" id="hatterKepFile" accept="image/*" style="display:none;" onchange="feltoltHatterkep(event)">
      <input type="file" id="hatterVideoFile" accept="video/mp4,video/webm" style="display:none;" onchange="feltoltHattervideo(event)">
      <div id="hatterElonezet" style="display:none;margin-top:15px;text-align:center;">
        <p style="color:#667eea;font-weight:bold;">Feltoltott fajl elonezet:</p>
        <img id="hatterKepPreview" style="max-width:100%;max-height:150px;border-radius:10px;display:none;">
        <video id="hatterVideoPreview" style="max-width:100%;max-height:150px;border-radius:10px;display:none;" autoplay muted loop></video>
      </div>
      <button class="mentes-btn" onclick="mentHatter(this)">&#127912; Hatter mentese</button>
      <div id="hatterEredmeny" class="eredmeny"></div>
    </div>
  </div>
  <div class="container" id="nemBejelentkezve" style="display:none;">
    <h1>&#128272; Be kell jelentkezni!</h1>
    <p style="text-align:center;">A profil megtekinteshez jelentkezz be!</p>
    <div style="text-align:center;margin-top:20px;">
      <a href="/bejelentkezes" class="game-button">&#128272; Bejelentkezes</a>
    </div>
  </div>
  <script>
  const user = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
  let kivalasztottHatter = null;
  let kivalasztottHatterAdat = null;
  if (!user) {
    document.getElementById('nemBejelentkezve').style.display = 'block';
  } else {
    document.getElementById('profilOldal').style.display = 'block';
    document.getElementById('profilNev').textContent = user.felhasznalonev;
    const avatarDiv = document.getElementById('avatarContainer');
    if (user.profilkep) {
      avatarDiv.innerHTML = '<img src="' + user.profilkep + '" class="profil-avatar">';
    } else {
      avatarDiv.innerHTML = '<div class="profil-avatar-default">' + user.felhasznalonev.charAt(0).toUpperCase() + '</div>';
    }
    if (user.hatterTipus && ['gradiens','csillag','buborek','hullam'].includes(user.hatterTipus)) {
      const el = document.getElementById('opt-' + user.hatterTipus);
      if (el) el.classList.add('aktiv');
      kivalasztottHatter = user.hatterTipus;
    }
  }
  function valasztHatter(tipus) {
    document.querySelectorAll('.hatter-option').forEach(el => el.classList.remove('aktiv'));
    document.getElementById('opt-' + tipus).classList.add('aktiv');
    kivalasztottHatter = tipus;
    kivalasztottHatterAdat = null;
    document.getElementById('hatterElonezet').style.display = 'none';
  }
  function feltoltHatterkep(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { alert('Max 5MB!'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
      kivalasztottHatter = 'kep';
      kivalasztottHatterAdat = e.target.result;
      document.querySelectorAll('.hatter-option').forEach(el => el.classList.remove('aktiv'));
      document.getElementById('hatterElonezet').style.display = 'block';
      document.getElementById('hatterKepPreview').src = e.target.result;
      document.getElementById('hatterKepPreview').style.display = 'block';
      document.getElementById('hatterVideoPreview').style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
  function feltoltHattervideo(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 20*1024*1024) { alert('Max 20MB!'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
      kivalasztottHatter = 'video';
      kivalasztottHatterAdat = e.target.result;
      document.querySelectorAll('.hatter-option').forEach(el => el.classList.remove('aktiv'));
      document.getElementById('hatterElonezet').style.display = 'block';
      document.getElementById('hatterVideoPreview').src = e.target.result;
      document.getElementById('hatterVideoPreview').style.display = 'block';
      document.getElementById('hatterKepPreview').style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
  async function mentHatter(btn) {
    if (!kivalasztottHatter) { alert('Valassz egy hattert!'); return; }
    btn.textContent = 'Mentes...';
    btn.disabled = true;
    try {
      const resp = await fetch('/api/profil-mentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ felhasznalonev: user.felhasznalonev, hatterTipus: kivalasztottHatter, hatterAdat: kivalasztottHatterAdat })
      });
      const result = await resp.json();
      const div = document.getElementById('hatterEredmeny');
      if (result.siker) {
        const ujUser = { ...user, hatterTipus: kivalasztottHatter, hatterAdat: kivalasztottHatterAdat };
        localStorage.setItem('bejelentkezve', JSON.stringify(ujUser));
        div.className = 'eredmeny siker';
        div.textContent = 'Hatter elmentve! Az egesz weboldalon ez lesz a hattered.';
        div.style.display = 'block';
        setTimeout(() => window.location.reload(), 1500);
      } else {
        div.className = 'eredmeny hiba';
        div.textContent = 'Hiba: ' + result.uzenet;
        div.style.display = 'block';
      }
    } catch(e) { alert('Hiba!'); }
    btn.textContent = 'Hatter mentese';
    btn.disabled = false;
  }
  function profilkepElonezet(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { alert('Max 2MB!'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('pkPreview').src = e.target.result;
      document.getElementById('pkPreviewDiv').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
  async function mentProfilkep() {
    const ujKep = document.getElementById('pkPreview').src;
    try {
      const resp = await fetch('/api/profilkep-mentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ felhasznalonev: user.felhasznalonev, profilkep: ujKep })
      });
      const result = await resp.json();
      const div = document.getElementById('pkEredmeny');
      if (result.siker) {
        const ujUser = { ...user, profilkep: ujKep };
        localStorage.setItem('bejelentkezve', JSON.stringify(ujUser));
        div.className = 'eredmeny siker';
        div.textContent = 'Profilkep elmentve!';
        div.style.display = 'block';
        setTimeout(() => window.location.reload(), 1500);
      } else {
        div.className = 'eredmeny hiba';
        div.textContent = 'Hiba: ' + result.uzenet;
        div.style.display = 'block';
      }
    } catch(e) { alert('Hiba!'); }
  }
  </script>
  `);
});
// ============================================================
// API – PROFIL MENTES
// ============================================================
app.post('/api/profil-mentes', async (req, res) => {
  try {
    if (!db) return res.json({ siker: false, uzenet: 'MongoDB nincs csatlakozva!' });
    const { felhasznalonev, hatterTipus, hatterAdat } = req.body;
    await db.collection('users').updateOne(
      { felhasznalonev },
      { $set: { hatterTipus: hatterTipus || null, hatterAdat: hatterAdat || null } }
    );
    res.json({ siker: true });
  } catch (e) {
    res.json({ siker: false, uzenet: 'Szerver hiba!' });
  }
});
app.post('/api/profilkep-mentes', async (req, res) => {
  try {
    if (!db) return res.json({ siker: false, uzenet: 'MongoDB nincs csatlakozva!' });
    const { felhasznalonev, profilkep } = req.body;
    await db.collection('users').updateOne(
      { felhasznalonev },
      { $set: { profilkep: profilkep || null } }
    );
    res.json({ siker: true });
  } catch (e) {
    res.json({ siker: false, uzenet: 'Szerver hiba!' });
  }
});
// ============================================================
// BEJELENTKEZES / REGISZTRACIO
// ============================================================
app.get('/bejelentkezes', (req, res) => {
  res.send(getMenu() + getStyle() + `<style>.login-container{max-width:400px;margin:50px auto;background:white;padding:40px;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.2);position:relative;z-index:10;}.login-form input{width:100%;padding:12px;margin:10px 0;border:2px solid #667eea;border-radius:8px;font-size:16px}.login-btn{width:100%;padding:15px;background:#667eea;color:white;border:none;border-radius:8px;font-size:18px;font-weight:bold;cursor:pointer;margin-top:10px}.login-btn:hover{background:#5568d3}.switch-link{text-align:center;margin-top:20px;color:#667eea}.switch-link a{color:#667eea;font-weight:bold;text-decoration:underline}</style><div class="login-container"><h1 style="color:#667eea;text-align:center;">&#128272; Bejelentkezes</h1><form class="login-form" action="/api/login" method="POST"><input type="text" name="felhasznalonev" placeholder="Felhasznalonev" required><input type="password" name="jelszo" placeholder="Jelszo" required><button type="submit" class="login-btn">Belepes</button></form><div class="switch-link">Nincs meg fiokod? <a href="/regisztracio">Regisztralj itt!</a></div></div>`);
});
app.get('/regisztracio', (req, res) => {
  res.send(getMenu() + getStyle() + `<style>.reg-container{max-width:500px;margin:50px auto;background:white;padding:40px;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.2);position:relative;z-index:10;}.reg-form input{width:100%;padding:12px;margin:10px 0;border:2px solid #667eea;border-radius:8px;font-size:16px}.file-input-wrapper{margin:20px 0;padding:20px;border:2px dashed #667eea;border-radius:8px;text-align:center;cursor:pointer}.preview-container{margin:20px 0;text-align:center}.preview-img{width:150px;height:150px;border-radius:50%;object-fit:cover;border:3px solid #667eea;display:none}.default-avatar{width:150px;height:150px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-size:60px;font-weight:bold;margin:0 auto}.reg-btn{width:100%;padding:15px;background:#667eea;color:white;border:none;border-radius:8px;font-size:18px;font-weight:bold;cursor:pointer;margin-top:10px}.reg-btn:hover{background:#5568d3}.error-msg{color:red;text-align:center;margin:10px 0;display:none}</style><div class="reg-container"><h1 style="color:#667eea;text-align:center;">&#128221; Regisztracio</h1><form class="reg-form" id="regForm" onsubmit="return handleRegister(event)"><input type="text" id="felhasznalonev" placeholder="Felhasznalonev" required minlength="3"><input type="password" id="jelszo" placeholder="Jelszo" required minlength="4"><div class="file-input-wrapper" onclick="document.getElementById('profilkep').click()">&#128247; Profilkep (max 500 KB)</div><input type="file" id="profilkep" accept="image/png,image/jpeg" style="display:none;" onchange="previewImage(event)"><div class="preview-container"><p><strong>Elonezet:</strong></p><img id="preview" class="preview-img"><div id="defaultAvatar" class="default-avatar">?</div></div><div class="error-msg" id="errorMsg"></div><button type="submit" class="reg-btn">Regisztracio</button></form></div><script>let profilkepData=null;document.getElementById('felhasznalonev').addEventListener('input',function(e){const nev=e.target.value;if(nev&&!profilkepData)document.getElementById('defaultAvatar').textContent=nev.charAt(0).toUpperCase()});function previewImage(event){const file=event.target.files[0];if(!file)return;if(file.size>512000){document.getElementById('errorMsg').textContent='Tul nagy!';document.getElementById('errorMsg').style.display='block';event.target.value='';return}document.getElementById('errorMsg').style.display='none';const reader=new FileReader();reader.onload=function(e){profilkepData=e.target.result;document.getElementById('preview').src=profilkepData;document.getElementById('preview').style.display='block';document.getElementById('defaultAvatar').style.display='none'};reader.readAsDataURL(file)}async function handleRegister(event){event.preventDefault();const felhasznalonev=document.getElementById('felhasznalonev').value;const jelszo=document.getElementById('jelszo').value;try{const response=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({felhasznalonev,jelszo,profilkep:profilkepData})});const result=await response.json();if(result.siker){alert('Sikeres regisztracio!');window.location.href='/bejelentkezes'}else{document.getElementById('errorMsg').textContent='Hiba: '+result.uzenet;document.getElementById('errorMsg').style.display='block'}}catch(error){document.getElementById('errorMsg').textContent='Hiba!';document.getElementById('errorMsg').style.display='block'}return false}</script>`);
});
app.get('/uzenofal', async (req, res) => {
  let uzenetek = [];
  try {
    if (uzenetekCollection) {
      uzenetek = await uzenetekCollection.find().sort({ datum: -1 }).toArray();
    }
  } catch (error) {
    console.error('MongoDB hiba:', error);
  }
  let uzenetLista = '';
  uzenetek.forEach((uzenet) => {
    if (!uzenet.felhasznalonev || !uzenet.szoveg) return;
    const pk = uzenet.profilkep
      ? `<img src="${uzenet.profilkep}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;margin-right:15px;vertical-align:middle;">`
      : `<span style="display:inline-block;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-align:center;line-height:50px;font-weight:bold;font-size:24px;margin-right:15px;vertical-align:middle;">${uzenet.felhasznalonev.charAt(0).toUpperCase()}</span>`;
    uzenetLista += `<div style="background:#f0f0f0;padding:20px;margin:15px 0;border-radius:10px;border-left:4px solid #667eea;display:flex;align-items:start;">${pk}<div style="flex:1;"><strong style="color:#667eea;font-size:18px;">${uzenet.felhasznalonev}</strong><p style="margin:5px 0;color:#333;">${uzenet.szoveg}</p><small style="color:#999;">${new Date(uzenet.datum).toLocaleString('hu-HU')}</small></div></div>`;
  });
  res.send(getStyle() + getMenu() + `<div class="container"><h1>&#128172; Uzenofal</h1><h2 style="color:#667eea;">Uzenetek (${uzenetek.length} db):</h2><div id="uzenet-form-container"></div><div>${uzenetLista || '<p style="text-align:center;color:#999;">Meg nincs uzenet.</p>'}</div></div><script>(function(){const userData=JSON.parse(localStorage.getItem('bejelentkezve')||'null');const container=document.getElementById('uzenet-form-container');if(userData){container.innerHTML='<h2 style="color:#667eea;margin-top:30px;">Uj uzenet:</h2><form action="/uj-uzenet" method="POST" style="margin-top:20px;"><input type="hidden" name="felhasznalonev" value="'+userData.felhasznalonev+'"><input type="hidden" name="profilkep" value="'+(userData.profilkep||'')+'"><input type="text" name="uzenet" required placeholder="Ird ide..." style="width:70%;padding:15px;font-size:16px;border:2px solid #667eea;border-radius:10px;margin-right:10px;"><button type="submit" style="padding:15px 30px;background:#667eea;color:white;border:none;border-radius:10px;font-size:16px;cursor:pointer;font-weight:bold;">Kuldes</button></form>'}else{container.innerHTML='<div style="background:#fffacd;padding:20px;border-radius:10px;text-align:center;margin:20px 0;"><p style="font-size:18px;color:#666;"><strong>Jelentkezz be</strong> hogy uzenetet irj!</p><a href="/bejelentkezes" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#667eea;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Bejelentkezes</a></div>'}})();</script>`);
});
app.post('/uj-uzenet', async (req, res) => {
  try {
    if (!uzenetekCollection) return res.send('MongoDB nincs csatlakozva!');
    await uzenetekCollection.insertOne({
      felhasznalonev: req.body.felhasznalonev,
      profilkep: req.body.profilkep || null,
      szoveg: req.body.uzenet,
      datum: new Date()
    });
    res.redirect('/uzenofal');
  } catch (error) {
    res.send('Hiba!');
  }
});
app.post('/api/register', async (req, res) => {
  try {
    if (!db) return res.json({ siker: false, uzenet: 'MongoDB nincs csatlakozva!' });
    const { felhasznalonev, jelszo, profilkep } = req.body;
    const letezik = await db.collection('users').findOne({ felhasznalonev });
    if (letezik) return res.json({ siker: false, uzenet: 'Ez a felhasznalonev mar foglalt!' });
    await db.collection('users').insertOne({ felhasznalonev, jelszo, profilkep: profilkep || null, letrehozva: new Date() });
    res.json({ siker: true });
  } catch (error) {
    res.json({ siker: false, uzenet: 'Szerver hiba!' });
  }
});
app.post('/api/login', async (req, res) => {
  try {
    if (!db) return res.send(getMenu() + getStyle() + '<div class="container"><h1 style="color:red;">MongoDB nincs csatlakozva!</h1></div>');
    const { felhasznalonev, jelszo } = req.body;
    const f = await db.collection('users').findOne({ felhasznalonev, jelszo });
    if (!f) return res.send(getMenu() + getStyle() + '<div class="container"><h1 style="color:red;">Sikertelen bejelentkezes!</h1><p>Hibas adatok.</p><a href="/bejelentkezes" style="color:#667eea;font-weight:bold;">Probald ujra</a></div>');
    const userData = {
      felhasznalonev: f.felhasznalonev,
      profilkep: f.profilkep || null,
      hatterTipus: f.hatterTipus || null,
      hatterAdat: f.hatterAdat || null
    };
    res.send(getMenu() + getStyle() + `<div class="container"><h1 style="color:green;">Sikeres bejelentkezes!</h1><p>Udvozollek, <strong>${f.felhasznalonev}</strong>!</p></div><script>localStorage.setItem('bejelentkezve',JSON.stringify(${JSON.stringify(userData)}));setTimeout(()=>{window.location.href='/'},1500)</script>`);
  } catch (error) {
    res.send(getMenu() + getStyle() + '<div class="container"><h1 style="color:red;">Hiba!</h1></div>');
  }
});
app.get('/kijelentkezes', (req, res) => {
  res.send(getMenu() + getStyle() + '<div class="container"><h1 style="color:#667eea;">Kijelentkezes...</h1></div><script>localStorage.removeItem("bejelentkezve");setTimeout(()=>{window.location.href="/"},1000)</script>');
});
// ============================================================
// TENGERIMALAC KALAND
// ============================================================
function getGameStyle() {
  return `<style>
    .game-container { max-width:750px; margin:0 auto; background:white; padding:40px; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.3); position:relative; z-index:5; }
    .game-title { color:#667eea; font-size:36px; margin-bottom:10px; text-align:center; }
    .game-scene { background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%); border-radius:15px; padding:25px; margin:20px 0; font-size:18px; line-height:1.8; color:#333; border-left:5px solid #667eea; }
    .game-scene .emoji-big { font-size:50px; display:block; text-align:center; margin-bottom:10px; }
    .game-choices { display:flex; flex-wrap:wrap; gap:12px; margin-top:20px; justify-content:center; }
    .game-choice { display:inline-block; padding:14px 22px; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; text-decoration:none; border-radius:12px; font-size:16px; font-weight:bold; transition:all 0.3s; box-shadow:0 4px 12px rgba(102,126,234,0.4); cursor:pointer; }
    .game-choice:hover { transform:translateY(-3px); box-shadow:0 8px 20px rgba(102,126,234,0.6); }
    .game-end-bad { background:linear-gradient(135deg,#ff6b6b,#ee5a24); color:white; border-radius:15px; padding:25px; text-align:center; font-size:22px; font-weight:bold; margin:20px 0; }
    .game-end-good { background:linear-gradient(135deg,#55efc4,#00b894); color:white; border-radius:15px; padding:25px; text-align:center; font-size:22px; font-weight:bold; margin:20px 0; }
    .finish-badge { background:gold; color:#333; border-radius:10px; padding:10px 20px; font-size:18px; margin:10px 0; display:inline-block; }
    .level-info { background:rgba(102,126,234,0.1); border-radius:10px; padding:10px 20px; margin-bottom:15px; text-align:center; font-size:16px; color:#667eea; font-weight:bold; }
    .finishes-bar { background:#f0f0f0; border-radius:10px; padding:15px; margin:15px 0; }
    .finish-item { display:inline-block; margin:4px; padding:6px 12px; border-radius:8px; font-size:14px; }
    .finish-done { background:#55efc4; color:#00695c; }
    .finish-todo { background:#ddd; color:#999; }
    .win-screen { background:linear-gradient(135deg,#f9ca24,#f0932b); color:white; border-radius:20px; padding:40px; text-align:center; }
    .win-screen h2 { font-size:40px; margin-bottom:10px; }
  </style>`;
}
const FINISHES = ['Auchanos malackaja', 'Finom Fuge', 'Guinea a Guineaban', 'minek pazaroltál erre egymilliót?'];
const TOTAL_LEVELS = 10;
function parseState(query) {
  const level = parseInt(query.level) || 1;
  const victoryPoints = parseInt(query.vp) || 0;
  let finishes = [];
  try { finishes = JSON.parse(decodeURIComponent(query.f || '[]')); } catch(e) { finishes = []; }
  const name = decodeURIComponent(query.name || '');
  return { level, victoryPoints, finishes, name };
}
function buildUrl(scene, state, extra) {
  const params = new URLSearchParams({ scene, level: state.level, vp: state.victoryPoints, f: encodeURIComponent(JSON.stringify(state.finishes)), name: encodeURIComponent(state.name), ...extra });
  return '/tengerimalac-jatek?' + params.toString();
}
function addFinish(state, finish) {
  if (!state.finishes.includes(finish)) return { ...state, finishes: [...state.finishes, finish] };
  return state;
}
function allFinishesUnlocked(state) { return FINISHES.every(f => state.finishes.includes(f)); }
function renderFinishes(state) {
  return `<div class="finishes-bar">&#127942; Finishek: ` +
    FINISHES.map(f => `<span class="finish-item ${state.finishes.includes(f)?'finish-done':'finish-todo'}">${state.finishes.includes(f)?'✅':'🔒'} ${f}</span>`).join('') + `</div>`;
}
function renderGame(state, emoji, szoveg, valasztasok) {
  const info = `<div class="level-info">📊 ${state.level}. szint | 🏆 Győzelmi pontok: ${state.victoryPoints} | 🐹 Malac neve: <strong>${state.name||'???'}</strong></div>`;
  const choices = valasztasok.map(v=>`<a class="game-choice" href="${v.url}">${v.label}</a>`).join('');
  return getGameStyle()+getMenu()+getStyle()+`<div class="game-container"><h1 class="game-title">🐹 Tengerimalac Kaland</h1>${info}${renderFinishes(state)}<div class="game-scene"><span class="emoji-big">${emoji}</span><p>${szoveg}</p></div><div class="game-choices">${choices}</div></div>`;
}
function renderEnd(state, type, szoveg, extra) {
  const info = `<div class="level-info">📊 ${state.level}. szint | 🏆 Győzelmi pontok: ${state.victoryPoints} | 🐹 Malac neve: <strong>${state.name||'???'}</strong></div>`;
  const endDiv = type==='bad'
    ? `<div class="game-end-bad">💀 VÉGE!<br><br>${szoveg}</div>`
    : `<div class="game-end-good">🎉 GRATULÁLUNK!<br><br>${szoveg}${extra?'<br><br><span class="finish-badge">🏅 Feloldva: '+extra+'</span>':''}</div>`;
  return getGameStyle()+getMenu()+getStyle()+`<div class="game-container"><h1 class="game-title">🐹 Tengerimalac Kaland</h1>${info}${renderFinishes(state)}${endDiv}<div class="game-choices"><a class="game-choice" href="${buildUrl('ketrec',state)}">🔄 Újra próbálom</a><a class="game-choice" href="/jatekok">🎮 Vissza a játékokhoz</a></div></div>`;
}
function renderWin(state) {
  return getGameStyle()+getMenu()+getStyle()+`<div class="game-container"><div class="win-screen"><h2>🏆 KIVITTED A JÁTÉKOT! 🏆</h2><p style="font-size:24px;">Minden szinten megszerezted az összes finisht!</p><p style="font-size:20px;margin-top:15px;">Győzelmi pontjaid: <strong>${state.victoryPoints}</strong></p><p style="font-size:60px;">🐹🎉🥳</p></div><div class="game-choices" style="margin-top:20px;"><a class="game-choice" href="/jatekok">🎮 Vissza a játékokhoz</a></div></div>`;
}
app.get('/tengerimalac-jatek', (req, res) => {
  const scene = req.query.scene || 'start';
  const state = parseState(req.query);
  if (scene==='start') return res.send(getGameStyle()+getMenu()+getStyle()+`<div class="game-container"><h1 class="game-title">🐹 Tengerimalac Kaland</h1><div class="game-scene"><span class="emoji-big">🐹</span><p>Egy kertes ház nappalijában egy ketrecben élsz tengerimalacként.<br><br>Add meg a neved!</p></div><form method="GET" action="/tengerimalac-jatek" style="text-align:center;margin-top:20px;"><input type="hidden" name="scene" value="ketrec"><input type="hidden" name="level" value="1"><input type="hidden" name="vp" value="0"><input type="hidden" name="f" value="${encodeURIComponent('[]')}"><input type="text" name="name" placeholder="A malac neve..." required style="padding:14px;font-size:18px;border:2px solid #667eea;border-radius:10px;width:280px;margin-right:10px;"><button type="submit" class="game-choice" style="border:none;">✅ Ez vagyok én!</button></form></div>`);
  if (scene==='ketrec') return res.send(renderGame(state,'🐹🏠',`Szia, <strong>${state.name||'Névtelen malac'}</strong>! A gazdád nyitva hagyta a ketreced ajtaját. Mit csinálsz?`,[{label:'🛌 Bent maradok',url:buildUrl('ketrec_vege',state)},{label:'🛋️ Nappaliba megyek',url:buildUrl('nappali',state)},{label:'🚗 Garázsba megyek',url:buildUrl('garazs',state)},{label:'🚽 WC-be megyek',url:buildUrl('wc',state)},{label:'🛗 Liftbe megyek',url:buildUrl('lift',state)}]));
  if (scene==='ketrec_vege') return res.send(renderEnd(state,'bad','összeverekedtél egy másik malaccal az uborkán!'));
  if (scene==='nappali') return res.send(renderGame(state,'🧝',`A nappaliban találkozol a <strong>Játék Manóval</strong>!`,[{label:'👊 Félek és leütöm!',url:buildUrl('nappali_leutes',state)},{label:'👂 Meghallgatom',url:buildUrl('nappali_meghallgat',state)}]));
  if (scene==='nappali_leutes') return res.send(renderEnd(state,'bad','leütötted Játék Manót – ezért elvarázsolt!'));
  if (scene==='nappali_meghallgat') return res.send(renderGame(state,'🚪✨',`A Játék Manó megmutat egy <strong>titkos átjárót</strong>. Ezen muszáj átmenned.`,[{label:'🚪 Átmegyek',url:buildUrl('kinai_nappali',state)}]));
  if (scene==='kinai_nappali') return res.send(renderEnd(state,'bad','átjutottál a kínaiékhoz – és ők megettek!'));
  if (scene==='garazs') return res.send(renderGame(state,'🚗🔧',`A garázsban <strong>kiszóródott golyókat</strong> látsz és egy ismeretlen dobozt a gazdádtól.`,[{label:'⚫ Megeszem a golyókat',url:buildUrl('garazs_golyo',state)},{label:'📦 Megeszem a boltban vett dolgot',url:buildUrl('garazs_malackaja',state)}]));
  if (scene==='garazs_golyo') return res.send(renderEnd(state,'bad','megetted a patkánymérget!'));
  if (scene==='garazs_malackaja') {
    const s2 = addFinish(state,'Auchanos malackaja');
    if (allFinishesUnlocked(s2)) { const ns={...s2,victoryPoints:s2.victoryPoints+1,level:s2.level+1,finishes:[]}; if(ns.level>TOTAL_LEVELS) return res.send(renderWin(ns)); return res.send(renderEnd(s2,'good','tengerimalac kaja volt, jóllaktál! 🎊 +1 győzelmi pont! Következő szint: '+ns.level,'Auchanos malackaja')); }
    return res.send(renderEnd(s2,'good','tengerimalac kaja volt, jóllaktál!','Auchanos malackaja'));
  }
  if (scene==='wc') return res.send(renderGame(state,'🚽🧟',`A WC-ben találkozol a <strong>Kakimanóval</strong>! "Kövesd a Kakimanót!"`,[{label:'🚽 Követem',url:buildUrl('wc_kovetes',state)},{label:'🚶 Tovább megyek',url:buildUrl('garazs',state)}]));
  if (scene==='wc_kovetes') return res.send(renderEnd(state,'bad','beugrottál a WC-lefolyóba!'));
  if (scene==='lift') return res.send(renderGame(state,'🛗',`Melyik szintre mész?`,[{label:'⬆️ 1. emelet',url:buildUrl('emelet1',state)},{label:'⬇️ -1. szint (pince)',url:buildUrl('pince',state)}]));
  if (scene==='pince') return res.send(renderGame(state,'🌑😨',`A pincében <strong>fura hangot</strong> hallasz és <strong>illatos golyókat</strong> látsz.`,[{label:'👂 A hang felé megyek',url:buildUrl('pince_hang',state)},{label:'🍬 Megeszem a golyókat',url:buildUrl('pince_golyo',state)}]));
  if (scene==='pince_hang') return res.send(renderEnd(state,'bad','nem hallottad, hogy FURA hang? Rád ugrott egy patkány!'));
  if (scene==='pince_golyo') return res.send(renderEnd(state,'bad','patkányméreg! Gondolkozz mielőtt cselekedsz!'));
  if (scene==='emelet1') return res.send(renderGame(state,'🏠1️⃣',`Az 1. emeleten két szoba van.`,[{label:'🔵 Kék szoba',url:buildUrl('kek_szoba',state)},{label:'🩷 Rózsaszín szoba',url:buildUrl('rozsaszin_szoba',state)}]));
  if (scene==='kek_szoba') return res.send(renderGame(state,'🔵🛏️',`A kék szobából kimehetsz az <strong>erkélyre</strong>.`,[{label:'🏠 Kimegyek az erkélyre',url:buildUrl('erkely',state)}]));
  if (scene==='erkely') return res.send(renderGame(state,'🌿🏡',`Az erkélyről le kell jutnod a kertbe. Hogyan?`,[{label:'🪁 Papírsárkányon',url:buildUrl('kert',state)},{label:'🪜 A létrán',url:buildUrl('erkely_latra',state)}]));
  if (scene==='erkely_latra') return res.send(renderEnd(state,'bad','lent nem volt rögzítve a létra! Legközelebb nézd meg hova lépsz…'));
  if (scene==='kert') return res.send(renderGame(state,'🌳🌻',`Sikeresen landoltál a kertben! Merre mész?`,[{label:'🚗 Kimegyek az utcára',url:buildUrl('kert_utca',state)},{label:'🌿 Megyek a kerítéshez',url:buildUrl('kert_kerites',state)},{label:'🥬 Megyek a veteményeshez',url:buildUrl('vetemeny',state)}]));
  if (scene==='kert_utca') return res.send(renderEnd(state,'bad','elütött az autó!'));
  if (scene==='kert_kerites') return res.send(renderEnd(state,'bad','a kutya megharapott!'));
  if (scene==='vetemeny') return res.send(renderGame(state,'🥦🌱',`A veteményesnél egy <strong>hinta</strong> is áll.`,[{label:'🎠 Felszállok a hintára',url:buildUrl('hinta',state)},{label:'🚶 Tovább megyek',url:buildUrl('fuge',state)}]));
  if (scene==='hinta') return res.send(renderEnd(state,'bad','átrepültél a gazdád kínai szomszédjához, ahol megettek!'));
  if (scene==='fuge') {
    const s2 = addFinish(state,'Finom Fuge');
    if (allFinishesUnlocked(s2)) { const ns={...s2,victoryPoints:s2.victoryPoints+1,level:s2.level+1,finishes:[]}; if(ns.level>TOTAL_LEVELS) return res.send(renderWin(ns)); return res.send(renderEnd(s2,'good','megtaláltad a fügebokrot és megetted az összes fügét! 🎊 +1 győzelmi pont!','Finom Fuge')); }
    return res.send(renderEnd(s2,'good','megtaláltad a fügebokrot és megetted az összes fügét!','Finom Fuge'));
  }
  if (scene==='rozsaszin_szoba') return res.send(renderGame(state,'🩷✈️',`A rózsaszín szobában van egy <strong>játékrepülő</strong>!`,[{label:'🚌 Megyek a buszállomásra',url:buildUrl('buszallomas',state)}]));
  if (scene==='buszallomas') return res.send(renderGame(state,'✈️🌍',`A repülőtérről hova repülsz?`,[{label:'🌏 Pápua-Új Guinea',url:buildUrl('papua',state)},{label:'🇭🇺 Magyarország',url:buildUrl('magyarorszag',state)},{label:'🌐 Más ország',url:buildUrl('mas_orszag',state)}]));
  if (scene==='papua') {
    const s2 = addFinish(state,'Guinea a Guineaban');
    if (allFinishesUnlocked(s2)) { const ns={...s2,victoryPoints:s2.victoryPoints+1,level:s2.level+1,finishes:[]}; if(ns.level>TOTAL_LEVELS) return res.send(renderWin(ns)); return res.send(renderEnd(s2,'good','Guineaként elmentél Guineába! 🎊 +1 győzelmi pont!','Guinea a Guineaban')); }
    return res.send(renderEnd(s2,'good','Guineaként elmentél Guineába!','Guinea a Guineaban'));
  }
  if (scene==='magyarorszag') {
    const s2 = addFinish(state,'minek pazaroltál erre egymilliót?');
    if (allFinishesUnlocked(s2)) { const ns={...s2,victoryPoints:s2.victoryPoints+1,level:s2.level+1,finishes:[]}; if(ns.level>TOTAL_LEVELS) return res.send(renderWin(ns)); return res.send(renderEnd(s2,'good','mondjuk ide autóval is el tudtál volna jönni… 🎊 +1 győzelmi pont!','minek pazaroltál erre egymilliót?')); }
    return res.send(renderEnd(s2,'good','mondjuk ide autóval is el tudtál volna jönni…','minek pazaroltál erre egymilliót?'));
  }
  if (scene==='mas_orszag') return res.send(renderGame(state,'🌐✈️',`Egy ismeretlen országba repülsz... semmi érdekes.`,[{label:'✈️ Visszamegyek',url:buildUrl('buszallomas',state)}]));
  if (scene==='win') return res.send(renderWin(state));
  res.redirect('/tengerimalac-jatek');
});

// ============================================================
// LUCKY BLOCK ROCKET JATEK
// ============================================================
const luckyBlockGameHTML = '<!DOCTYPE html>\n<html lang="hu">\n<head>\n<meta charset="UTF-8">\n<title>🚀 Lucky Block Rocket</title>\n<style>\n*{margin:0;padding:0;box-sizing:border-box;}\nbody{background:#000;overflow:hidden;font-family:\'Courier New\',monospace;}\ncanvas{display:block;}\n\n#crosshair{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;pointer-events:none;z-index:50;}\n#crosshair::before,#crosshair::after{content:\'\';position:absolute;background:rgba(255,255,255,0.7);}\n#crosshair::before{width:2px;height:14px;left:6px;top:0;}\n#crosshair::after{width:14px;height:2px;top:6px;left:0;}\n\n#hud{position:fixed;bottom:16px;left:16px;background:rgba(0,0,0,0.82);border:1px solid #0fc;border-radius:8px;padding:10px 13px;color:#0fc;font-size:11px;line-height:2.1;text-shadow:0 0 5px #0fc;pointer-events:none;min-width:195px;}\n.lbl{color:#555;font-size:10px;}.val{color:#fff;font-weight:bold;}\n.bar{display:inline-block;width:95px;height:8px;background:#111;border:1px solid #2a2a2a;border-radius:3px;vertical-align:middle;overflow:hidden;}\n.bar span{display:block;height:100%;border-radius:3px;transition:width .12s;}\n#fb{background:linear-gradient(90deg,#f60,#fc0);}\n#eb{background:linear-gradient(90deg,#0cf,#0fc);}\n#sb{background:linear-gradient(90deg,#c0f,#f0c);}\n\n#interact-hint{position:fixed;bottom:72px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);border:1px solid #fc0;border-radius:6px;padding:5px 14px;color:#fc0;font-size:12px;display:none;pointer-events:none;z-index:50;text-shadow:0 0 7px #fc0;}\n\n#mode-bar{position:fixed;top:12px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.82);border:1px solid #666;border-radius:16px;padding:4px 16px;color:#ccc;font-size:11px;pointer-events:none;z-index:50;}\n\n#msg{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.93);border:2px solid #fc0;border-radius:10px;padding:13px 26px;color:#fc0;font-size:15px;font-weight:bold;text-align:center;display:none;z-index:100;pointer-events:none;max-width:480px;text-shadow:0 0 10px #fc0;}\n\n#fbi-hud{position:fixed;top:56px;left:50%;transform:translateX(-50%);border:3px solid #f00;border-radius:8px;padding:6px 16px;color:#f00;font-size:16px;font-weight:bold;display:none;z-index:99;text-shadow:0 0 12px #f00;pointer-events:none;animation:fpulse .45s infinite;background:rgba(255,0,0,0.07);}\n@keyframes fpulse{0%,100%{border-color:#f00;color:#f00}50%{border-color:#f80;color:#f80}}\n\n#caught-screen{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);display:none;z-index:300;flex-direction:column;align-items:center;justify-content:center;}\n.ct{color:#f00;font-size:30px;font-weight:bold;text-shadow:0 0 18px #f00;animation:fpulse .5s infinite;}\n.cs{color:#faa;font-size:13px;margin-top:10px;text-align:center;max-width:400px;}\n.cb{margin-top:18px;padding:8px 26px;background:rgba(255,0,0,0.12);border:2px solid #f00;color:#f00;font-size:14px;border-radius:7px;cursor:pointer;font-family:\'Courier New\',monospace;}\n.cb:hover{background:rgba(255,0,0,0.28);}\n\n#event-banner{position:fixed;top:100px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,rgba(200,0,100,.9),rgba(100,0,200,.9));border:2px solid #f4c;border-radius:8px;padding:6px 18px;color:#fff;font-size:12px;font-weight:bold;display:none;z-index:100;pointer-events:none;animation:pulse 1s infinite;white-space:nowrap;}\n@keyframes pulse{0%,100%{opacity:1}50%{opacity:.65}}\n\n#inv-panel{position:fixed;bottom:16px;right:16px;background:rgba(0,0,0,0.82);border:1px solid #a4f;border-radius:8px;padding:9px 12px;color:#c8f;font-size:11px;min-width:155px;max-height:200px;overflow-y:auto;pointer-events:none;text-shadow:0 0 4px #a4f;}\n#inv-panel h3{color:#c8f;margin-bottom:3px;font-size:12px;}\n#pig-list-ui{font-size:10px;line-height:1.6;}\n\n#money-el{position:fixed;top:12px;right:16px;background:rgba(0,0,0,0.82);border:1px solid #4f8;border-radius:6px;padding:4px 11px;color:#4f8;font-size:13px;font-weight:bold;pointer-events:none;text-shadow:0 0 6px #4f8;}\n\n#ctrl{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);border:1px solid #333;border-radius:7px;padding:4px 13px;color:#555;font-size:10px;pointer-events:none;}\n</style>\n</head>\n<body>\n<div id="crosshair"></div>\n<div id="mode-bar">🚶 GYALOGOS</div>\n<div id="money-el">💰 $0</div>\n<div id="hud">\n  <div><span class="lbl">🛢️ FUEL  </span><span class="bar"><span id="fb" style="width:100%"></span></span> <span class="val" id="fv">100</span></div>\n  <div><span class="lbl">⚡ ENERGY</span><span class="bar"><span id="eb" style="width:0%"></span></span> <span class="val" id="ev">0</span></div>\n  <div><span class="lbl">💨 SPEED </span><span class="bar"><span id="sb" style="width:0%"></span></span> <span class="val" id="sv">1.0x</span></div>\n  <div><span class="lbl">📦 BLOKK </span><span class="val" id="lbcount">0</span></div>\n</div>\n<div id="interact-hint">E – ?</div>\n<div id="inv-panel"><h3>🐹 Malacok</h3><div id="pig-list-ui">–</div><div style="color:#555;font-size:10px;margin-top:2px;">prod: <span id="pigprod">0</span>/s</div></div>\n<div id="msg"></div>\n<div id="fbi-hud">🚨 TENGERIMALAC VÉDELMI HATÓSÁG 🚨</div>\n<div id="caught-screen">\n  <div class="ct">🐾 ELKAPTAK!</div>\n  <div class="cs">A Tengerimalac Védelmi Hatóság elkobozta az összes Lucky Blokkodat!</div>\n  <button class="cb" onclick="G.dismissCaught()">Rendben</button>\n</div>\n<div id="event-banner"></div>\n<div id="ctrl">WASD: Mozgás | QE: Fordulás | SPACE: Fel/Ugrás | SHIFT: Le | F: Interact</div>\n\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>\n// ══════════════════════════════════════════════════════════\n// DATA\n// ══════════════════════════════════════════════════════════\nconst TIERS=[\n  {name:\'Common\',    color:0x888888,emissive:0x1a1a1a,dist:80, lbCount:4, fbiSpd:.04},\n  {name:\'Uncommon\',  color:0x44bb44,emissive:0x112211,dist:130,lbCount:5, fbiSpd:.055},\n  {name:\'Rare\',      color:0x4488ff,emissive:0x111a33,dist:190,lbCount:6, fbiSpd:.07},\n  {name:\'Epic\',      color:0xaa44ff,emissive:0x220044,dist:255,lbCount:7, fbiSpd:.085},\n  {name:\'Legendary\', color:0xff8800,emissive:0x331100,dist:335,lbCount:8, fbiSpd:.10},\n  {name:\'Mythic\',    color:0xff2200,emissive:0x330000,dist:425,lbCount:9, fbiSpd:.12},\n  {name:\'God\',       color:0xffdd00,emissive:0x332200,dist:530,lbCount:10,fbiSpd:.14},\n  {name:\'Secret\',    color:0x00ffff,emissive:0x003333,dist:650,lbCount:12,fbiSpd:.17},\n  {name:\'OP\',        color:0xff00ff,emissive:0x220022,dist:810,lbCount:15,fbiSpd:.22},\n];\n\nconst PIGS=[\n  {id:0, name:\'Alap\',      color:\'#aaaaaa\',emoji:\'🐹\',prodBase:1,    hexCol:0xaaaaaa},\n  {id:1, name:\'Tech\',      color:\'#44aaff\',emoji:\'🤖\',prodBase:3,    hexCol:0x44aaff},\n  {id:2, name:\'Void\',      color:\'#9933ff\',emoji:\'🌑\',prodBase:7,    hexCol:0x9933ff},\n  {id:3, name:\'Toxic\',     color:\'#88ff00\',emoji:\'☢️\',prodBase:15,   hexCol:0x88ff00},\n  {id:4, name:\'Underwater\',color:\'#00ccff\',emoji:\'🌊\',prodBase:30,   hexCol:0x00ccff},\n  {id:5, name:\'Rainbow\',   color:\'#ff88ff\',emoji:\'🌈\',prodBase:60,   hexCol:0xff88ff},\n  {id:6, name:\'Fire&Ice\',  color:\'#ff6600\',emoji:\'🔥\',prodBase:120,  hexCol:0xff6600},\n  {id:7, name:\'Gold\',      color:\'#ffcc00\',emoji:\'⭐\',prodBase:250,  hexCol:0xffcc00},\n  {id:8, name:\'Diamond\',   color:\'#88ffff\',emoji:\'💎\',prodBase:500,  hexCol:0x88ffff},\n  {id:9, name:\'Aura\',      color:\'#ffaaff\',emoji:\'✨\',prodBase:1000, hexCol:0xffaaff},\n  {id:10,name:\'Glitch\',    color:\'#ff00aa\',emoji:\'👾\',prodBase:2000, hexCol:0xff00aa},\n  {id:11,name:\'Twist\',     color:\'#ff8800\',emoji:\'🌀\',prodBase:4000, hexCol:0xff8800},\n  {id:12,name:\'ADMIN\',     color:\'#ff0000\',emoji:\'👑\',prodBase:10000,hexCol:0xff0000},\n];\n\n// Events: one per pig type\nconst EVENTS=[\n  {pigId:0, name:\'Alap Invázió\',       desc:\'Alap malacok özönlöttek el a bázist!\',      bonusMult:5},\n  {pigId:1, name:\'Tech Surge\',          desc:\'Tech malacok feltörtek a rendszerbe!\',       bonusMult:5},\n  {pigId:2, name:\'Void Rift\',           desc:\'Void malacok nyíltak a semmiből!\',           bonusMult:5},\n  {pigId:3, name:\'Toxic Spill\',         desc:\'Toxic malacok szivárognak a bázisba!\',       bonusMult:5},\n  {pigId:4, name:\'Underwater Flood\',    desc:\'Underwater malacok elárasztják a területet!\',bonusMult:5},\n  {pigId:5, name:\'Rainbow Storm\',       desc:\'Rainbow malacok hullanak az égből!\',         bonusMult:5},\n  {pigId:6, name:\'Fire & Ice Clash\',    desc:\'Fire&Ice malacok csatáznak a bázis körül!\', bonusMult:5},\n  {pigId:7, name:\'Gold Rush\',           desc:\'Arany malacok tűntek fel a szigeteken!\',     bonusMult:5},\n  {pigId:8, name:\'Diamond Mine\',        desc:\'Gyémánt malacok kristályosodnak ki!\',        bonusMult:5},\n  {pigId:9, name:\'Aura Eclipse\',        desc:\'Aura malacok lebegnek a horizonton!\',        bonusMult:5},\n  {pigId:10,name:\'Glitch Overflow\',     desc:\'Glitch malacok bugolnak mindenhol!\',         bonusMult:5},\n  {pigId:11,name:\'Twist Vortex\',        desc:\'Twist malacok örvénylenek a bázis felett!\',  bonusMult:5},\n  {pigId:12,name:\'⚠️ ADMIN BREACH\',    desc:\'ADMIN malacok törtek be a szerverbe!!!\',     bonusMult:5},\n];\n\nlet activeEvent=null; // {pigId, bonusMult, timeLeft}\n\nfunction rollPig(tierIdx){\n  const r=Math.random();\n  // Ultra rares\n  if(r<.0004) return PIGS[12];\n  if(r<.0015) return PIGS[11];\n  if(r<.005)  return PIGS[10];\n  if(r<.012)  return PIGS[9];\n  const mi=Math.min(tierIdx,8);\n  // If event active, boost that pig type\n  const weights=[];\n  for(let i=0;i<=mi;i++){\n    let w=Math.pow(.42,i);\n    if(activeEvent && i===activeEvent.pigId && i<=mi) w*=activeEvent.bonusMult;\n    weights.push(w);\n  }\n  const tot=weights.reduce((a,b)=>a+b,0);\n  let rr=Math.random()*tot;\n  for(let i=0;i<=mi;i++){rr-=weights[i];if(rr<=0)return PIGS[i];}\n  return PIGS[0];\n}\n\n// ══════════════════════════════════════════════════════════\n// GAME\n// ══════════════════════════════════════════════════════════\nlet G;\nwindow.onload=()=>{ G=new Game(); };\n\nclass Game{\nconstructor(){\n  this.scene=new THREE.Scene();\n  this.camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,4000);\n  this.renderer=new THREE.WebGLRenderer({antialias:true});\n  this.renderer.setSize(innerWidth,innerHeight);\n  this.renderer.shadowMap.enabled=true;\n  document.body.appendChild(this.renderer.domElement);\n\n  // State\n  this.mode=\'walk\';\n  this.inBase=false;\n  this.fuel=100;this.maxFuel=100;\n  this.energy=0;this.maxEnergy=2000;\n  this.speedMult=1;this.maxSpeed=5;\n  this.money=0;\n  this.guineaPigs=[];\n  this.lbHeld=[];\n  this.fbiActive=false;\n  this.caught=false;\n  this.foodBonus=1;\n\n  // Person state\n  this.personPos=new THREE.Vector3(0,3.7,8);\n  this.personVel=new THREE.Vector3();\n  this.personYaw=Math.PI; // face into base\n  this.personPitch=0;\n  this.onGround=false;\n\n  // Rocket state\n  this.rocketPos=new THREE.Vector3(0,12,5);\n  this.rocketVel=new THREE.Vector3();\n  this.rocketYaw=0;\n  this._fuelOut=false;\n  this._ft=0;\n\n  this.keys={};\n  this.islands=[];this.lbMeshes=[];this.fbiCars=[];\n  this.pig3dList=[];\n  this.beltOffset=0;\n  this.oceanT=0;\n\n  // Camera in scene directly\n  this.scene.add(this.camera);\n\n  this.build();\n  this.setupInput();\n  window.addEventListener(\'resize\',()=>{this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);});\n\n  this.lastT=performance.now();\n  this.animate();\n  this.scheduleEvent();\n}\n\nmk(geo,mat){return new THREE.Mesh(geo,new THREE.MeshPhongMaterial(mat));}\n\nbuild(){\n  // Sky\n  this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(3500,16,16),new THREE.MeshBasicMaterial({color:0x000a1a,side:THREE.BackSide})));\n  // Stars\n  const sv=[];for(let i=0;i<5000;i++){const t=Math.random()*Math.PI*2,p=Math.acos(Math.random()*2-1),r=2600+Math.random()*300;sv.push(r*Math.sin(p)*Math.cos(t),r*Math.sin(p)*Math.sin(t),r*Math.cos(p));}\n  const sg=new THREE.BufferGeometry();sg.setAttribute(\'position\',new THREE.Float32BufferAttribute(sv,3));\n  this.stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.8}));this.scene.add(this.stars);\n  // Lights\n  this.scene.add(new THREE.AmbientLight(0x334455,.6));\n  const sun=new THREE.DirectionalLight(0xffeedd,1.0);sun.position.set(200,500,100);sun.castShadow=true;this.scene.add(sun);\n  // Ocean\n  this.ocean=this.mk(new THREE.PlaneGeometry(6000,6000,40,40),{color:0x003366,emissive:0x001122,shininess:50,transparent:true,opacity:.88});\n  this.ocean.rotation.x=-Math.PI/2;this.scene.add(this.ocean);\n\n  this.buildBase();\n  this.buildIslands();\n  this.buildRocketMesh();\n  this.buildPerson();\n  this.buildFBI();\n}\n\n// ── BASE ──────────────────────────────────────────────────\nbuildBase(){\n  const g=new THREE.Group();\n  const W=24,H=18,D=22;\n  this.baseW=W;this.baseH=H;this.baseD=D;\n  this.baseY=0; // group at y=0, floor at y=2\n\n  // Platform\n  g.add(this.mk(new THREE.CylinderGeometry(24,27,4,12),{color:0x2a3a4a,emissive:0x0a1322}));\n\n  // Exterior box\n  const ext=this.mk(new THREE.BoxGeometry(W,H,D),{color:0x1e2e3e,emissive:0x080e18});\n  ext.position.set(0,2+H/2,0);g.add(ext);\n\n  // Interior (back-face so visible inside)\n  const intMat=new THREE.MeshPhongMaterial({color:0x1a2d3a,emissive:0x060e14,side:THREE.BackSide});\n  const interior=new THREE.Mesh(new THREE.BoxGeometry(W-.2,H-.2,D-.2),intMat);\n  interior.position.set(0,2+H/2,0);g.add(interior);\n\n  // Floor inside\n  const floorIn=this.mk(new THREE.PlaneGeometry(W-.5,D-.5),{color:0x1a3040,emissive:0x081018});\n  floorIn.rotation.x=-Math.PI/2;floorIn.position.set(0,2.05,0);g.add(floorIn);\n\n  // Door frame (south wall gap visual)\n  const doorGlow=new THREE.Mesh(new THREE.PlaneGeometry(4,5),new THREE.MeshBasicMaterial({color:0x001122,transparent:true,opacity:.5}));\n  doorGlow.position.set(0,4.5,D/2-.01);g.add(doorGlow);\n\n  // Interior lights\n  [{x:0,y:2+H*.8,z:0,c:0x4488ff,i:1.4,d:30},{x:7,y:2+3,z:-4,c:0x00ffcc,i:.7,d:18},{x:-7,y:2+3,z:-4,c:0x00ffcc,i:.7,d:18},{x:0,y:2+3,z:5,c:0xffaa44,i:.5,d:15}].forEach(l=>{\n    const pl=new THREE.PointLight(l.c,l.i,l.d);pl.position.set(l.x,l.y,l.z);g.add(pl);\n  });\n\n  // Windows\n  const wm=new THREE.MeshBasicMaterial({color:0x44aaff,transparent:true,opacity:.65});\n  for(let i=0;i<3;i++){\n    const w=new THREE.Mesh(new THREE.PlaneGeometry(2.5,2),wm);w.position.set((i-1)*7,2+H*.5,D/2+.05);g.add(w);\n  }\n\n  // ── TREADMILL (center of base) ─────────────────────────\n  const tmG=new THREE.Group();\n  // Frame\n  const tmFrame=this.mk(new THREE.BoxGeometry(16,1.2,5),{color:0x334455,emissive:0x0d1d2a});\n  tmG.add(tmFrame);\n  // Belt\n  const beltM=new THREE.MeshBasicMaterial({color:0x445566});\n  this.beltMesh=new THREE.Mesh(new THREE.BoxGeometry(16,.25,4.6),beltM);\n  this.beltMesh.position.y=.73;tmG.add(this.beltMesh);\n  // Side rails\n  [-2.6,2.6].forEach(sz=>{\n    const rail=this.mk(new THREE.BoxGeometry(16,.8,.25),{color:0x556677});rail.position.set(0,.6,sz);tmG.add(rail);\n    // End posts\n    [-7.8,7.8].forEach(sx=>{const post=this.mk(new THREE.BoxGeometry(.25,2,.25),{color:0x556677});post.position.set(sx,.6,sz);tmG.add(post);});\n  });\n  // Belt stripe meshes (animated)\n  this.beltStripes=[];\n  for(let i=0;i<9;i++){\n    const s=new THREE.Mesh(new THREE.BoxGeometry(.22,.27,4.6),new THREE.MeshBasicMaterial({color:0x66aacc}));\n    s.position.set(-8+i*2,.74,0);tmG.add(s);this.beltStripes.push(s);\n  }\n  // Belt light strip\n  const blight=new THREE.PointLight(0x00aaff,.5,12);blight.position.set(0,2,0);tmG.add(blight);\n  tmG.position.set(0,2.6,0);\n  g.add(tmG);\n  this.tmGroup=tmG;\n\n  // Guinea pig mesh group (3D pigs on belt)\n  this.pigMeshGroup=new THREE.Group();\n  this.pigMeshGroup.position.set(0,2.6+.85,0);\n  g.add(this.pigMeshGroup);\n\n  // ── FUEL MACHINE (left side) ───────────────────────────\n  const fmG=new THREE.Group();\n  fmG.add(this.mk(new THREE.BoxGeometry(3.5,6,3),{color:0x2a1500,emissive:0x100800}));\n  // Screen\n  const fmScr=new THREE.Mesh(new THREE.PlaneGeometry(2.5,2),new THREE.MeshBasicMaterial({color:0xff8800}));\n  fmScr.position.set(0,.8,1.51);fmG.add(fmScr);\n  // Gauge\n  const fmGauge=this.mk(new THREE.CylinderGeometry(.4,.4,.5,12),{color:0x332200});\n  fmGauge.rotation.z=Math.PI/2;fmGauge.position.set(0,2.2,1.2);fmG.add(fmGauge);\n  // Pipe\n  const fmPipe=this.mk(new THREE.CylinderGeometry(.25,.25,5,8),{color:0x331100,emissive:0x110500});\n  fmPipe.rotation.z=Math.PI/3;fmPipe.position.set(2.2,1.5,0);fmG.add(fmPipe);\n  const fmLight=new THREE.PointLight(0xff8800,.9,10);fmLight.position.set(0,1.5,2);fmG.add(fmLight);\n  // Label plate\n  const fmLabel=new THREE.Mesh(new THREE.PlaneGeometry(3,.5),new THREE.MeshBasicMaterial({color:0xff6600}));\n  fmLabel.position.set(0,2.8,1.52);fmG.add(fmLabel);\n  fmG.position.set(-9,2+3.2,-7);g.add(fmG);\n  this.fuelMachinePos=new THREE.Vector3(-9,5.2,-7); // world pos\n\n  // ── SPEED MACHINE (right side) ─────────────────────────\n  const smG=new THREE.Group();\n  smG.add(this.mk(new THREE.BoxGeometry(3.5,6,3),{color:0x001a28,emissive:0x000810}));\n  const smScr=new THREE.Mesh(new THREE.PlaneGeometry(2.5,2),new THREE.MeshBasicMaterial({color:0x00ccff}));\n  smScr.position.set(0,.8,1.51);smG.add(smScr);\n  const smGauge=this.mk(new THREE.CylinderGeometry(.4,.4,.5,12),{color:0x002244});\n  smGauge.rotation.z=Math.PI/2;smGauge.position.set(0,2.2,1.2);smG.add(smGauge);\n  const smPipe=this.mk(new THREE.CylinderGeometry(.25,.25,5,8),{color:0x002244,emissive:0x001122});\n  smPipe.rotation.z=-Math.PI/3;smPipe.position.set(-2.2,1.5,0);smG.add(smPipe);\n  const smLight=new THREE.PointLight(0x00ccff,.9,10);smLight.position.set(0,1.5,2);smG.add(smLight);\n  const smLabel=new THREE.Mesh(new THREE.PlaneGeometry(3,.5),new THREE.MeshBasicMaterial({color:0x0088ff}));\n  smLabel.position.set(0,2.8,1.52);smG.add(smLabel);\n  smG.position.set(9,2+3.2,-7);g.add(smG);\n  this.speedMachinePos=new THREE.Vector3(9,5.2,-7);\n\n  // ── SELL TERMINAL (back center) ────────────────────────\n  const tG=new THREE.Group();\n  tG.add(this.mk(new THREE.BoxGeometry(2.5,4,1.5),{color:0x0a2a0a,emissive:0x041004}));\n  const tScr=new THREE.Mesh(new THREE.PlaneGeometry(2,1.5),new THREE.MeshBasicMaterial({color:0x00ff88}));\n  tScr.position.set(0,.5,.76);tG.add(tScr);\n  const tLight=new THREE.PointLight(0x00ff88,.7,8);tLight.position.set(0,1,1.5);tG.add(tLight);\n  tG.position.set(0,2+2,-9.5);g.add(tG);\n  this.terminalPos=new THREE.Vector3(0,4,-9.5);\n\n  // ── UNBOX TABLE (right back) ───────────────────────────\n  const uG=new THREE.Group();\n  const uTop=this.mk(new THREE.BoxGeometry(5,.3,3),{color:0x3a2a1a,emissive:0x100a06});uG.add(uTop);\n  [[-2,-1.3,-1],[2,-1.3,-1],[-2,-1.3,1],[2,-1.3,1]].forEach(([x,y,z])=>{\n    const leg=this.mk(new THREE.BoxGeometry(.2,2.5,.2),{color:0x2a1a0a});leg.position.set(x,y,z);uG.add(leg);\n  });\n  // Table glow\n  const uGlow=new THREE.Mesh(new THREE.PlaneGeometry(4.5,.05),new THREE.MeshBasicMaterial({color:0xffcc00,transparent:true,opacity:.6}));\n  uGlow.position.set(0,.16,0);uG.add(uGlow);\n  const uLight=new THREE.PointLight(0xffcc00,.6,7);uLight.position.set(0,1,0);uG.add(uLight);\n  uG.position.set(9,2+1.3,6);g.add(uG);\n  this.tablePos=new THREE.Vector3(9,3.3,6);\n\n  // ── FOOD SHOP (left back) ──────────────────────────────\n  const shG=new THREE.Group();\n  shG.add(this.mk(new THREE.BoxGeometry(3.5,5,2.5),{color:0x1a2a0a,emissive:0x080e04}));\n  const shSign=new THREE.Mesh(new THREE.PlaneGeometry(3,.6),new THREE.MeshBasicMaterial({color:0x88ff44}));\n  shSign.position.set(0,2,1.26);shG.add(shSign);\n  const shLight=new THREE.PointLight(0x88ff44,.6,8);shLight.position.set(0,2,2);shG.add(shLight);\n  shG.position.set(-9,2+2.5,6);g.add(shG);\n  this.shopPos=new THREE.Vector3(-9,4.5,6);\n\n  // Rooftop glow\n  const topGlow=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,8),new THREE.MeshBasicMaterial({color:0x00ffcc}));\n  topGlow.position.set(0,2+H+2,0);g.add(topGlow);this.baseGlow=topGlow;\n  const topLight=new THREE.PointLight(0x00ffcc,1.2,80);topLight.position.set(0,2+H+2,0);g.add(topLight);\n\n  this.scene.add(g);\n  this.baseGroup=g;\n}\n\n// ── ISLANDS ───────────────────────────────────────────────\nbuildIslands(){\n  TIERS.forEach((tier,tidx)=>{\n    const cnt=tidx<3?4:tidx<6?3:2;\n    for(let i=0;i<cnt;i++){\n      const angle=(i/cnt)*Math.PI*2+tidx*.38;\n      const dist=tier.dist+(Math.random()-.5)*28;\n      const x=Math.cos(angle)*dist,z=Math.sin(angle)*dist;\n      const ig=new THREE.Group();\n      const sz=14+tidx*2.5;\n      ig.add(this.mk(new THREE.CylinderGeometry(sz,sz+5,5,8),{color:tier.color,emissive:tier.emissive,shininess:25}));\n      for(let t=0;t<3+tidx;t++){\n        const tr=new THREE.Group();\n        tr.add(this.mk(new THREE.CylinderGeometry(.5,.7,3,6),{color:0x5a3a1a}));\n        const top=this.mk(new THREE.ConeGeometry(2,5,6),{color:0x1a5a1a,emissive:0x0a2a0a});top.position.y=4;tr.add(top);\n        const a2=Math.random()*Math.PI*2,r2=Math.random()*sz*.8;tr.position.set(Math.cos(a2)*r2,4,Math.sin(a2)*r2);ig.add(tr);\n      }\n      const ring=new THREE.Mesh(new THREE.TorusGeometry(sz+1,.4,8,32),new THREE.MeshBasicMaterial({color:tier.color,transparent:true,opacity:.4}));\n      ring.rotation.x=Math.PI/2;ring.position.y=3;ig.add(ring);\n      ig.position.set(x,0,z);this.scene.add(ig);\n      for(let j=0;j<tier.lbCount;j++){\n        const lb=this.buildLBMesh(tier);\n        const a2=(j/tier.lbCount)*Math.PI*2;\n        const r2=(.3+Math.random()*.65)*sz;\n        lb.position.set(x+Math.cos(a2)*r2,6,z+Math.sin(a2)*r2);\n        lb.userData={tierIdx:tidx,tierName:tier.name,collected:false};\n        this.scene.add(lb);this.lbMeshes.push(lb);\n      }\n      this.islands.push({tier,tidx,pos:new THREE.Vector3(x,0,z)});\n    }\n  });\n}\n\nbuildLBMesh(tier){\n  const g=new THREE.Group();\n  g.add(this.mk(new THREE.BoxGeometry(2.5,2.5,2.5),{color:tier.color,emissive:tier.emissive,shininess:90}));\n  const orb=new THREE.Mesh(new THREE.SphereGeometry(.4,8,8),new THREE.MeshBasicMaterial({color:0xffffff}));orb.position.y=1.8;g.add(orb);\n  g.add(new THREE.PointLight(tier.color,.8,12));\n  return g;\n}\n\n// ── ROCKET ────────────────────────────────────────────────\nbuildRocketMesh(){\n  const g=new THREE.Group();\n  g.add(this.mk(new THREE.CylinderGeometry(.9,1.1,6,10),{color:0xddeeff,emissive:0x111122,shininess:120}));\n  const nose=this.mk(new THREE.ConeGeometry(.9,3,10),{color:0xff4400,emissive:0x220000,shininess:60});nose.position.y=4.5;g.add(nose);\n  for(let i=0;i<4;i++){const fin=this.mk(new THREE.BoxGeometry(.2,2.5,1.4),{color:0xff4400,emissive:0x220000});const a=(i/4)*Math.PI*2;fin.position.set(Math.cos(a)*1.2,-2.5,Math.sin(a)*1.2);g.add(fin);}\n  this.thruster=new THREE.Mesh(new THREE.ConeGeometry(.7,2.2,8),new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:.85}));\n  this.thruster.rotation.x=Math.PI;this.thruster.position.y=-4.2;g.add(this.thruster);\n  this.rocketLight=new THREE.PointLight(0xff6600,2,25);this.rocketLight.position.y=-3.8;g.add(this.rocketLight);\n  const cock=new THREE.Mesh(new THREE.SphereGeometry(.6,8,8),new THREE.MeshBasicMaterial({color:0x224488,transparent:true,opacity:.55}));cock.position.y=2;g.add(cock);\n  this.rocketMesh=g;this.scene.add(g);\n  this.rocketMesh.position.copy(this.rocketPos);\n}\n\n// ── PERSON ────────────────────────────────────────────────\nbuildPerson(){\n  const g=new THREE.Group();\n  const skin=new THREE.MeshPhongMaterial({color:0xffcc99,emissive:0x221100});\n  const suit=new THREE.MeshPhongMaterial({color:0x1a4488,emissive:0x060e22});\n  const suitDark=new THREE.MeshPhongMaterial({color:0x123066,emissive:0x040a1a});\n  const visorM=new THREE.MeshBasicMaterial({color:0x55aaff,transparent:true,opacity:0.65});\n  const bootM=new THREE.MeshPhongMaterial({color:0x222222,emissive:0x080808});\n  const helmetM=new THREE.MeshPhongMaterial({color:0xddddff,emissive:0x080814,shininess:80});\n\n  // TORSO\n  const torso=new THREE.Mesh(new THREE.BoxGeometry(.5,.65,.3),suit);\n  torso.position.y=.9; g.add(torso);\n  // Chest stripe\n  const stripe=new THREE.Mesh(new THREE.BoxGeometry(.08,.5,.31),new THREE.MeshBasicMaterial({color:0x00aaff}));\n  stripe.position.set(0,.9,.005); g.add(stripe);\n\n  // HEAD / HELMET\n  const helmet=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.42),helmetM);\n  helmet.position.y=1.48; g.add(helmet);\n  // Visor\n  const visor=new THREE.Mesh(new THREE.BoxGeometry(.3,.2,.06),visorM);\n  visor.position.set(0,1.5,.22); g.add(visor);\n  // Helmet top detail\n  const htop=new THREE.Mesh(new THREE.BoxGeometry(.38,.1,.38),helmetM);\n  htop.position.y=1.72; g.add(htop);\n\n  // HIPS\n  const hips=new THREE.Mesh(new THREE.BoxGeometry(.46,.2,.28),suitDark);\n  hips.position.y=.55; g.add(hips);\n\n  // LEGS\n  this.legL=new THREE.Mesh(new THREE.BoxGeometry(.2,.55,.22),suit);\n  this.legL.position.set(.14,.17,0); g.add(this.legL);\n  this.legR=new THREE.Mesh(new THREE.BoxGeometry(.2,.55,.22),suit);\n  this.legR.position.set(-.14,.17,0); g.add(this.legR);\n  // Knee pads\n  const kpM=new THREE.MeshPhongMaterial({color:0x0a2244});\n  const kpL=new THREE.Mesh(new THREE.BoxGeometry(.22,.15,.24),kpM); kpL.position.set(.14,.28,0); g.add(kpL);\n  const kpR=new THREE.Mesh(new THREE.BoxGeometry(.22,.15,.24),kpM); kpR.position.set(-.14,.28,0); g.add(kpR);\n  // Boots\n  const bootL=new THREE.Mesh(new THREE.BoxGeometry(.22,.18,.28),bootM); bootL.position.set(.14,-.1,.03); g.add(bootL);\n  const bootR=new THREE.Mesh(new THREE.BoxGeometry(.22,.18,.28),bootM); bootR.position.set(-.14,-.1,.03); g.add(bootR);\n\n  // UPPER ARMS\n  this.armL=new THREE.Mesh(new THREE.BoxGeometry(.18,.42,.2),suit);\n  this.armL.position.set(.37,.9,0); g.add(this.armL);\n  this.armR=new THREE.Mesh(new THREE.BoxGeometry(.18,.42,.2),suit);\n  this.armR.position.set(-.37,.9,0); g.add(this.armR);\n  // Gloves\n  const gloveM=new THREE.MeshPhongMaterial({color:0x333333});\n  const gloveL=new THREE.Mesh(new THREE.BoxGeometry(.17,.15,.18),gloveM); gloveL.position.set(.37,.62,0); g.add(gloveL);\n  const gloveR=new THREE.Mesh(new THREE.BoxGeometry(.17,.15,.18),gloveM); gloveR.position.set(-.37,.62,0); g.add(gloveR);\n  // Shoulder pads\n  const spM=new THREE.MeshPhongMaterial({color:0x2255aa,emissive:0x081828});\n  const spL=new THREE.Mesh(new THREE.BoxGeometry(.26,.15,.26),spM); spL.position.set(.36,1.14,0); g.add(spL);\n  const spR=new THREE.Mesh(new THREE.BoxGeometry(.26,.15,.26),spM); spR.position.set(-.36,1.14,0); g.add(spR);\n\n  // Backpack\n  const bp=new THREE.Mesh(new THREE.BoxGeometry(.38,.5,.18),suitDark);\n  bp.position.set(0,.9,-.2); g.add(bp);\n  const bpLight=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.05),new THREE.MeshBasicMaterial({color:0x00ffcc}));\n  bpLight.position.set(.1,.95,-.3); g.add(bpLight);\n\n  g.position.copy(this.personPos);\n  this.personMesh=g; this.scene.add(g);\n}\n\n// ── FBI ───────────────────────────────────────────────────\nbuildFBI(){\n  for(let i=0;i<4;i++){\n    const g=new THREE.Group();\n    g.add(this.mk(new THREE.BoxGeometry(3,1.5,5),{color:0x111133,emissive:0x00002a}));\n    const roof=this.mk(new THREE.BoxGeometry(2.5,1,3.5),{color:0x0a0a2a});roof.position.y=1.2;g.add(roof);\n    const bar=new THREE.Mesh(new THREE.BoxGeometry(2.4,.4,1),new THREE.MeshBasicMaterial({color:0xff0000}));bar.position.y=1.8;g.add(bar);\n    g.position.set(0,-300,0);g.visible=false;\n    this.scene.add(g);this.fbiCars.push(g);\n  }\n}\n\n// ── INPUT ─────────────────────────────────────────────────\nsetupInput(){\n  window.addEventListener(\'keydown\',e=>{\n    this.keys[e.code]=true;\n    if(e.code===\'KeyF\'||e.code===\'KeyE\') this.interact();\n  });\n  window.addEventListener(\'keyup\',e=>this.keys[e.code]=false);\n}\n\n// ── FLOOR HEIGHT ──────────────────────────────────────────\ngetFloorY(x,z){\n  // Inside base building\n  if(Math.abs(x)<11.5 && Math.abs(z)<10.5) return 2.0;\n  // Platform\n  if(Math.sqrt(x*x+z*z)<24) return 2.0;\n  // Islands\n  for(const isl of this.islands){\n    const dx=x-isl.pos.x,dz=z-isl.pos.z;\n    if(Math.sqrt(dx*dx+dz*dz)<14+isl.tidx*2.5) return 2.5;\n  }\n  return -999;\n}\nisInBase(pos){ return Math.abs(pos.x)<11.5 && pos.y>1.5 && Math.abs(pos.z)<10.5; }\n\n// ── PIG 3D MESHES ─────────────────────────────────────────\nrebuildPigMeshes(){\n  while(this.pigMeshGroup.children.length) this.pigMeshGroup.remove(this.pigMeshGroup.children[0]);\n  this.pig3dList=[];\n  const MAX=8;\n  const vis=this.guineaPigs.slice(0,MAX);\n  for(let i=0;i<vis.length;i++){\n    const pig=vis[i];\n    const pg=new THREE.Group();\n    const c=pig.hexCol||0xaaaaaa;\n    const bm=new THREE.MeshPhongMaterial({color:c,emissive:c&0x333333});\n    // body\n    const body=new THREE.Mesh(new THREE.BoxGeometry(.42,.28,.58),bm);pg.add(body);\n    // head\n    const hd=new THREE.Mesh(new THREE.BoxGeometry(.26,.24,.3),bm);hd.position.set(0,.06,.38);pg.add(hd);\n    // eyes\n    const em=new THREE.MeshBasicMaterial({color:0x111111});\n    const el=new THREE.Mesh(new THREE.SphereGeometry(.04,6,6),em);el.position.set(.08,.06,.52);pg.add(el);\n    const er=new THREE.Mesh(new THREE.SphereGeometry(.04,6,6),em);er.position.set(-.08,.06,.52);pg.add(er);\n    // nose\n    const nose=new THREE.Mesh(new THREE.SphereGeometry(.05,6,6),new THREE.MeshBasicMaterial({color:0xff9999}));nose.position.set(0,-.02,.53);pg.add(nose);\n    // legs\n    const legs=[];\n    const lm=new THREE.MeshPhongMaterial({color:c});\n    [[.14,-.14,.16],[-.14,-.14,.16],[.14,-.14,-.16],[-.14,-.14,-.16]].forEach(([lx,ly,lz])=>{\n      const leg=new THREE.Mesh(new THREE.BoxGeometry(.08,.2,.08),lm);leg.position.set(lx,ly,lz);pg.add(leg);legs.push(leg);\n    });\n    // ears\n    const ea=new THREE.Mesh(new THREE.SphereGeometry(.07,6,6),new THREE.MeshPhongMaterial({color:c}));ea.position.set(.1,.17,.3);pg.add(ea);\n    const eb2=new THREE.Mesh(new THREE.SphereGeometry(.07,6,6),new THREE.MeshPhongMaterial({color:c}));eb2.position.set(-.1,.17,.3);pg.add(eb2);\n    // Place on belt\n    const bx=-6.5+(i/(Math.max(vis.length-1,1)))*13;\n    pg.position.set(bx,0,0);\n    this.pigMeshGroup.add(pg);\n    this.pig3dList.push({mesh:pg,legs,t:Math.random()*10,dir:1,bx});\n  }\n}\n\nanimatePigs(dt){\n  // Animate belt stripes\n  this.beltOffset=(this.beltOffset+dt*2)%2;\n  for(let i=0;i<this.beltStripes.length;i++){\n    let nx=-8+(i*2+this.beltOffset*2)%16;\n    this.beltStripes[i].position.x=nx;\n  }\n  // Animate pig 3D meshes\n  for(const p of this.pig3dList){\n    p.t+=dt*5;\n    p.bx+=p.dir*1.8*dt;\n    if(p.bx>6.5){p.bx=6.5;p.dir=-1;p.mesh.scale.z=-1;}\n    if(p.bx<-6.5){p.bx=-6.5;p.dir=1;p.mesh.scale.z=1;}\n    p.mesh.position.x=p.bx;\n    p.mesh.position.y=Math.abs(Math.sin(p.t*.6))*.04; // slight bounce\n    for(let l=0;l<p.legs.length;l++) p.legs[l].rotation.x=Math.sin(p.t+l*1.6)*.45;\n  }\n}\n\n// ── INTERACTION ───────────────────────────────────────────\ninteract(){\n  if(this.caught) return;\n  if(this.mode===\'walk\'){\n    // Board rocket\n    if(this.rocketPos.distanceTo(this.personPos)<5){ this.boardRocket(); return; }\n    // Pick up nearby LB (on foot, near islands)\n    let cl=null,cd=4;\n    for(const lb of this.lbMeshes){\n      if(lb.userData.collected) continue;\n      const d=this.personPos.distanceTo(lb.position);\n      if(d<cd){cd=d;cl=lb;}\n    }\n    if(cl){ this.pickupLB(cl); return; }\n    // Base interactions\n    if(this.inBase){\n      const p=this.personPos;\n      if(p.distanceTo(this.tablePos)<4   && this.lbHeld.length>0){ this.unboxAll(); return; }\n      if(p.distanceTo(this.fuelMachinePos)<5){ this.cvtFuel(); return; }\n      if(p.distanceTo(this.speedMachinePos)<5){ this.cvtSpeed(); return; }\n      if(p.distanceTo(this.terminalPos)<4){ this.sellE(); return; }\n      if(p.distanceTo(this.shopPos)<4)   { this.buyFood(); return; }\n      if(this.lbHeld.length>0) this.showMsg(\'🗺️ Menj az Unbox asztalhoz!\',1500,\'#fc0\');\n    }\n  } else {\n    this.exitRocket();\n  }\n}\n\npickupLB(lb){\n  lb.userData.collected=true;lb.visible=false;\n  this.lbHeld.push({tierIdx:lb.userData.tierIdx,tierName:lb.userData.tierName});\n  if(!this.fbiActive) this.startFBI();\n  this.showMsg(`📦 ${lb.userData.tierName} Lucky Blokk! (${this.lbHeld.length} db)`,2000,\'#fc0\');\n}\n\nboardRocket(){\n  this.mode=\'rocket\';\n  this.personMesh.visible=false;\n  document.getElementById(\'mode-bar\').textContent=\'🚀 RAKÉTÁBAN – F: Kiszállás\';\n  this.showMsg(\'🚀 Beültél a rakétába!\',1500,\'#0fc\');\n}\nexitRocket(){\n  this.mode=\'walk\';\n  this.personPos.copy(this.rocketPos);\n  this.personPos.x+=2.5;\n  this.personPos.y=Math.max(this.personPos.y,this.getFloorY(this.personPos.x,this.personPos.z)+1.7);\n  this.personVel.set(0,0,0);\n  this.personMesh.visible=true;\n  document.getElementById(\'mode-bar\').textContent=\'🚶 GYALOGOS\';\n  this.showMsg(\'🚶 Kiszálltál\',1200,\'#ccc\');\n}\n\n// ── FBI ───────────────────────────────────────────────────\nstartFBI(){\n  this.fbiActive=true;\n  document.getElementById(\'fbi-hud\').style.display=\'block\';\n  this.fbiCars.forEach((f,i)=>{f.visible=true;f.position.set(this.rocketPos.x+(i%2?1:-1)*25,this.rocketPos.y,this.rocketPos.z+45);});\n}\nstopFBI(){\n  this.fbiActive=false;\n  document.getElementById(\'fbi-hud\').style.display=\'none\';\n  this.fbiCars.forEach(f=>{f.visible=false;f.position.set(0,-300,0);});\n}\ntriggerCaught(){\n  if(this.caught) return;\n  this.caught=true;this.stopFBI();this.lbHeld=[];\n  document.getElementById(\'caught-screen\').style.display=\'flex\';\n  this.rocketVel.set(0,0,0);\n  this.updateLBUI();\n}\ndismissCaught(){\n  this.caught=false;\n  document.getElementById(\'caught-screen\').style.display=\'none\';\n  if(this.mode===\'rocket\'){this.rocketPos.set(0,12,5);this.rocketVel.set(0,0,0);}\n  else{this.personPos.set(2,3.7,8);this.personVel.set(0,0,0);}\n}\n\n// ── GAME ACTIONS ──────────────────────────────────────────\nunboxAll(){\n  if(!this.lbHeld.length){this.showMsg(\'📦 Nincs Lucky Blokk!\',2000,\'#f88\');return;}\n  const newP=[];\n  for(const lb of this.lbHeld){\n    const pig=rollPig(lb.tierIdx);\n    const prod=pig.prodBase*Math.pow(2,lb.tierIdx);\n    newP.push({...pig,prod,id:Math.random(),bx:(Math.random()-.5)*12,dir:Math.random()>.5?1:-1,t:Math.random()*10});\n    this.guineaPigs.push(newP[newP.length-1]);\n  }\n  this.lbHeld=[];this.stopFBI();\n  const sum={};newP.forEach(p=>{sum[p.name]=(sum[p.name]||0)+1;});\n  const txt=Object.entries(sum).map(([k,v])=>`${v}x ${k}`).join(\', \');\n  this.showMsg(`🎉 ${newP.length} malac: ${txt}`,4000,\'#0fc\');\n  this.rebuildPigMeshes();this.updatePigUI();this.updateLBUI();\n}\ncvtFuel(){\n  const can=Math.min(Math.floor(this.energy/10),Math.floor(this.maxFuel-this.fuel));\n  if(can<=0){this.showMsg(\'⚡ Nincs elég energy!\',2000,\'#f88\');return;}\n  this.energy-=can*10;this.fuel=Math.min(this.maxFuel,this.fuel+can);\n  this.showMsg(`🛢️ +${can} Fuel konvertálva`,2000,\'#fa4\');\n}\ncvtSpeed(){\n  if(this.energy<50){this.showMsg(\'⚡ Kell 50 energy!\',2000,\'#f88\');return;}\n  if(this.speedMult>=this.maxSpeed){this.showMsg(\'💨 Max sebesség!\',2000,\'#f88\');return;}\n  this.energy-=50;this.speedMult=Math.min(this.maxSpeed,this.speedMult+.25);\n  this.showMsg(`💨 Sebesség: ${this.speedMult.toFixed(2)}x`,2000,\'#c8f\');\n}\nsellE(){\n  if(this.energy<10){this.showMsg(\'⚡ Nincs elég!\',2000,\'#f88\');return;}\n  const s=Math.floor(this.energy/10);this.energy-=s*10;this.money+=s;\n  this.showMsg(`💰 +$${s}`,2000,\'#4f8\');\n}\nbuyFood(){\n  if(this.money<50){this.showMsg(\'💰 Kell $50!\',2000,\'#f88\');return;}\n  this.money-=50;this.foodBonus*=1.2;\n  this.showMsg(`🥕 +20% produkció! (összesen +${((this.foodBonus-1)*100).toFixed(0)}%)`,3000,\'#fa4\');\n}\n\n// ── EVENTS ────────────────────────────────────────────────\nscheduleEvent(){ setTimeout(()=>this.triggerEvent(),30000+Math.random()*50000); }\ntriggerEvent(){\n  if(activeEvent){this.scheduleEvent();return;}\n  // Pick a random event\n  const ev=EVENTS[Math.floor(Math.random()*EVENTS.length)];\n  const pig=PIGS[ev.pigId];\n  activeEvent={pigId:ev.pigId,bonusMult:ev.bonusMult,timeLeft:40};\n  const banner=document.getElementById(\'event-banner\');\n  banner.style.display=\'block\';\n\n  // Spawn 3 event-themed lucky blocks near base\n  const evTierIdx=Math.min(ev.pigId,8);\n  for(let i=0;i<3;i++){\n    const lb=this.buildLBMesh(TIERS[evTierIdx]);\n    const angle=((i/3)*Math.PI*2);\n    lb.position.set(Math.cos(angle)*18,8,Math.sin(angle)*18);\n    lb.userData={tierIdx:evTierIdx,tierName:`${pig.emoji}${TIERS[evTierIdx].name}`,collected:false};\n    this.scene.add(lb);this.lbMeshes.push(lb);\n    this.evLBs=(this.evLBs||[]);this.evLBs.push(lb);\n  }\n\n  let t=40;\n  const iv=setInterval(()=>{\n    t--;activeEvent.timeLeft=t;\n    banner.innerHTML=`${pig.emoji} <b>${ev.name}</b> – ${ev.desc} <b>${t}mp</b> | ${pig.name} esély +${(ev.bonusMult-1)*100}%!`;\n    if(t<=0){\n      clearInterval(iv);activeEvent=null;banner.style.display=\'none\';\n      // Remove uncollected event LBs\n      (this.evLBs||[]).forEach(lb=>{if(!lb.userData.collected){this.scene.remove(lb);lb.userData.collected=true;}});\n      this.evLBs=[];\n      this.scheduleEvent();\n    }\n  },1000);\n  banner.innerHTML=`${pig.emoji} <b>${ev.name}</b> – ${ev.desc} <b>${t}mp</b> | ${pig.name} esély +${(ev.bonusMult-1)*100}%!`;\n}\n\n// ── SHOW MSG ──────────────────────────────────────────────\nshowMsg(txt,dur,color){\n  const el=document.getElementById(\'msg\');el.textContent=txt;el.style.color=color;el.style.borderColor=color;el.style.display=\'block\';\n  clearTimeout(this._mt);this._mt=setTimeout(()=>el.style.display=\'none\',dur);\n}\n\n// ── INTERACT HINT ─────────────────────────────────────────\nupdateHint(){\n  const hint=document.getElementById(\'interact-hint\');\n  if(this.mode===\'rocket\'){hint.style.display=\'block\';hint.textContent=\'F – Kiszállás\';return;}\n  const p=this.personPos;\n  if(this.rocketPos.distanceTo(p)<5){hint.style.display=\'block\';hint.textContent=\'F – Beülés a rakétába\';return;}\n  for(const lb of this.lbMeshes){if(!lb.userData.collected&&p.distanceTo(lb.position)<4){hint.style.display=\'block\';hint.textContent=`F – ${lb.userData.tierName} Lucky Blokk felvesz`;return;}}\n  if(this.inBase){\n    if(p.distanceTo(this.tablePos)<4&&this.lbHeld.length>0){hint.style.display=\'block\';hint.textContent=\'F – Lucky Blokkok kinyitása\';return;}\n    if(p.distanceTo(this.fuelMachinePos)<5){hint.style.display=\'block\';hint.textContent=\'F – Fuel Machine (Energy→Fuel)\';return;}\n    if(p.distanceTo(this.speedMachinePos)<5){hint.style.display=\'block\';hint.textContent=\'F – Speed Machine (Energy→Speed)\';return;}\n    if(p.distanceTo(this.terminalPos)<4){hint.style.display=\'block\';hint.textContent=\'F – Energy eladása\';return;}\n    if(p.distanceTo(this.shopPos)<4){hint.style.display=\'block\';hint.textContent=\'F – Kaja vásárlás ($50)\';return;}\n  }\n  hint.style.display=\'none\';\n}\n\n// ── UI ────────────────────────────────────────────────────\nupdatePigUI(){\n  const el=document.getElementById(\'pig-list-ui\');\n  if(!this.guineaPigs.length){el.innerHTML=\'Még nincs\';return;}\n  const sum={};\n  this.guineaPigs.forEach(p=>{if(!sum[p.name])sum[p.name]={c:0,prod:0,color:p.color,emoji:p.emoji};sum[p.name].c++;sum[p.name].prod+=p.prod;});\n  el.innerHTML=Object.entries(sum).map(([k,v])=>`<span style="color:${v.color}">${v.emoji}${v.c}x ${k} <span style="color:#555">(${(v.prod*this.foodBonus).toFixed(0)}/s)</span></span><br>`).join(\'\');\n  const tot=this.guineaPigs.reduce((s,p)=>s+p.prod,0)*this.foodBonus;\n  document.getElementById(\'pigprod\').textContent=tot.toFixed(1);\n}\nupdateLBUI(){document.getElementById(\'lbcount\').textContent=this.lbHeld.length;}\nupdateHUD(){\n  document.getElementById(\'fb\').style.width=(this.fuel/this.maxFuel*100)+\'%\';\n  document.getElementById(\'fv\').textContent=Math.floor(this.fuel);\n  document.getElementById(\'eb\').style.width=(Math.min(this.energy/this.maxEnergy,1)*100)+\'%\';\n  document.getElementById(\'ev\').textContent=Math.floor(this.energy);\n  document.getElementById(\'sb\').style.width=((this.speedMult-1)/(this.maxSpeed-1)*100)+\'%\';\n  document.getElementById(\'sv\').textContent=this.speedMult.toFixed(2)+\'x\';\n  document.getElementById(\'money-el\').textContent=\'💰 $\'+Math.floor(this.money);\n  this.updateLBUI();\n}\n\n// ── MAIN LOOP ─────────────────────────────────────────────\nanimate(){\n  requestAnimationFrame(()=>this.animate());\n  const now=performance.now();const dt=Math.min((now-this.lastT)/1000,.05);this.lastT=now;\n  this.update(dt);this.renderer.render(this.scene,this.camera);\n}\n\nupdate(dt){\n  if(this.caught) return;\n\n  // Ocean waves\n  this.oceanT+=dt;\n  const op=this.ocean.geometry.attributes.position;\n  for(let i=0;i<op.count;i++){const x=op.getX(i),z=op.getZ(i);op.setY(i,Math.sin(x*.04+this.oceanT)*.9+Math.cos(z*.035+this.oceanT*.8)*.6);}\n  op.needsUpdate=true;\n\n  if(this.mode===\'walk\') this.updateWalk(dt);\n  else this.updateRocket(dt);\n\n  // LB spin + auto-pickup in rocket\n  for(const lb of this.lbMeshes){\n    if(lb.userData.collected) continue;\n    lb.rotation.y+=dt*1.8;\n    if(this.mode===\'rocket\'&&this.rocketPos.distanceTo(lb.position)<13){\n      lb.userData.collected=true;lb.visible=false;\n      this.lbHeld.push({tierIdx:lb.userData.tierIdx,tierName:lb.userData.tierName});\n      if(!this.fbiActive) this.startFBI();\n      this.showMsg(`📦 ${lb.userData.tierName}! (${this.lbHeld.length} db)`,2000,\'#fc0\');\n    }\n  }\n\n  // FBI chase (rocket mode)\n  if(this.fbiActive&&this.mode===\'rocket\'){\n    const tier=this.lbHeld.length>0?TIERS[this.lbHeld[0].tierIdx]:TIERS[0];\n    let gotcha=false;\n    this.fbiCars.forEach((f,i)=>{\n      if(!f.visible) return;\n      const off=new THREE.Vector3(Math.cos(i*1.57+this.oceanT*.4)*22,0,Math.sin(i*1.57+this.oceanT*.4)*22);\n      f.position.lerp(this.rocketPos.clone().add(off),dt*tier.fbiSpd*60);\n      f.position.y=this.rocketPos.y-4;f.lookAt(this.rocketPos);\n      f.children[2].material.color.setHex(Math.floor(Date.now()/220)%2===0?0xff0000:0x0044ff);\n      if(f.position.distanceTo(this.rocketPos)<9) gotcha=true;\n    });\n    if(gotcha) this.triggerCaught();\n  }\n\n  // Energy production\n  if(this.guineaPigs.length){\n    const tot=this.guineaPigs.reduce((s,p)=>s+p.prod,0)*this.foodBonus;\n    this.energy=Math.min(this.maxEnergy,this.energy+tot*dt);\n  }\n\n  // Base glow\n  this.baseGlow.material.color.setHSL((Date.now()/2500)%1,1,.6);\n  this.stars.position.copy(this.camera.position);\n\n  // Pig animation on belt\n  this.animatePigs(dt);\n\n  // Rocket mesh\n  this.rocketMesh.position.copy(this.rocketPos);\n  this.rocketMesh.rotation.y=this.rocketYaw;\n\n  this.updateHUD();\n  this.updateHint();\n}\n\n// ── WALK ──────────────────────────────────────────────────\nupdateWalk(dt){\n  const spd=8;\n  // Turn with Q/E or ArrowLeft/Right\n  if(this.keys[\'KeyQ\']||this.keys[\'ArrowLeft\'])  this.personYaw+=dt*2.2;\n  if(this.keys[\'KeyE\']||this.keys[\'ArrowRight\']) this.personYaw-=dt*2.2;\n  // Look up/down with R/V (optional)\n  if(this.keys[\'KeyR\']) this.personPitch=Math.min(1.2,this.personPitch+dt*1.5);\n  if(this.keys[\'KeyV\']) this.personPitch=Math.max(-1.2,this.personPitch-dt*1.5);\n\n  const fwd=new THREE.Vector3(-Math.sin(this.personYaw),0,-Math.cos(this.personYaw));\n  const rgt=new THREE.Vector3(Math.cos(this.personYaw),0,-Math.sin(this.personYaw));\n  const move=new THREE.Vector3();\n  if(this.keys[\'KeyW\']||this.keys[\'ArrowUp\'])   move.add(fwd);\n  if(this.keys[\'KeyS\']||this.keys[\'ArrowDown\']) move.sub(fwd);\n  if(this.keys[\'KeyA\'])                          move.sub(rgt);\n  if(this.keys[\'KeyD\'])                          move.add(rgt);\n  if(move.lengthSq()>.001) move.normalize().multiplyScalar(spd);\n  this.personVel.x=move.x;this.personVel.z=move.z;\n\n  // Gravity & jump\n  this.personVel.y-=25*dt;\n  if(this.keys[\'Space\']&&this.onGround){this.personVel.y=10;this.onGround=false;}\n\n  this.personPos.addScaledVector(this.personVel,dt);\n\n  // Floor collision\n  const fy=this.getFloorY(this.personPos.x,this.personPos.z);\n  const standY=fy+1.7;\n  if(fy>-500){\n    if(this.personPos.y<=standY){this.personPos.y=standY;this.personVel.y=0;this.onGround=true;}\n    else this.onGround=false;\n  } else {\n    // No floor = over ocean, push back to last safe pos\n    this.personPos.copy(this._lastSafePos||new THREE.Vector3(0,3.7,8));\n    this.personVel.set(0,0,0);this.onGround=true;\n    this.showMsg(\'🌊 Nem lehet oda menni!\',1200,\'#44aaff\');\n  }\n  if(this.onGround) this._lastSafePos=this.personPos.clone();\n\n  // Clamp to playable area\n  this.personPos.x=Math.max(-2400,Math.min(2400,this.personPos.x));\n  this.personPos.z=Math.max(-2400,Math.min(2400,this.personPos.z));\n\n  this.inBase=this.isInBase(this.personPos);\n  if(this.inBase) this.fuel=Math.min(this.maxFuel,this.fuel+2*dt);\n\n  // Person mesh - positioned so feet touch floor\n  this.personMesh.position.set(this.personPos.x, this.personPos.y-1.7, this.personPos.z);\n  this.personMesh.rotation.y=this.personYaw;\n  // Walk animation - legs/arms swing from hip\n  const wl=move.length(); const wt=Date.now()*.007;\n  if(this.legL){ this.legL.rotation.x=wl>0?Math.sin(wt)*.6:0; this.legR.rotation.x=wl>0?-Math.sin(wt)*.6:0; }\n  if(this.armL){ this.armL.rotation.x=wl>0?-Math.sin(wt)*.45:0; this.armR.rotation.x=wl>0?Math.sin(wt)*.45:0; }\n\n  // Mode label\n  document.getElementById(\'mode-bar\').textContent=this.inBase?\'🏠 BÁZIS BELSEJE – F: Interact\':\'🚶 GYALOGOS – F: Interact\';\n\n  // Camera: 3rd person behind player\n  const camDist=5,camH=2.2;\n  const behindX=this.personPos.x+Math.sin(this.personYaw)*camDist;\n  const behindZ=this.personPos.z+Math.cos(this.personYaw)*camDist;\n  this.camera.position.lerp(new THREE.Vector3(behindX,this.personPos.y+camH,behindZ),dt*10);\n  this.camera.lookAt(this.personPos.x,this.personPos.y+0.8,this.personPos.z);\n}\n\n// ── ROCKET ────────────────────────────────────────────────\nupdateRocket(dt){\n  const spd=28*this.speedMult;\n  const acc=new THREE.Vector3();\n  if(this.keys[\'KeyQ\']||this.keys[\'ArrowLeft\'])  this.rocketYaw+=dt*2.2;\n  if(this.keys[\'KeyE\']||this.keys[\'ArrowRight\']) this.rocketYaw-=dt*2.2;\n  if(this.fuel>0){\n    if(this.keys[\'KeyW\']||this.keys[\'ArrowUp\'])  {acc.x-=Math.sin(this.rocketYaw)*spd;acc.z-=Math.cos(this.rocketYaw)*spd;}\n    if(this.keys[\'KeyS\']||this.keys[\'ArrowDown\']) {acc.x+=Math.sin(this.rocketYaw)*spd*.6;acc.z+=Math.cos(this.rocketYaw)*spd*.6;}\n    if(this.keys[\'Space\'])   acc.y+=spd;\n    if(this.keys[\'ShiftLeft\']||this.keys[\'ShiftRight\']||this.keys[\'KeyC\']) acc.y-=spd;\n  }\n\n  const mov=acc.lengthSq()>0;\n  if(mov&&this.fuel>0){this._ft+=dt;if(this._ft>.08){this.fuel=Math.max(0,this.fuel-.22*this.speedMult);this._ft=0;}}\n\n  this.rocketVel.add(acc.clone().multiplyScalar(dt));\n  this.rocketVel.multiplyScalar(.87);\n  this.rocketPos.addScaledVector(this.rocketVel,dt);\n  this.rocketPos.y=Math.max(4,this.rocketPos.y);\n  this.rocketPos.x=Math.max(-2500,Math.min(2500,this.rocketPos.x));\n  this.rocketPos.z=Math.max(-2500,Math.min(2500,this.rocketPos.z));\n\n  this.rocketMesh.rotation.z=this.rocketVel.x*.035;\n  this.rocketMesh.rotation.x=-this.rocketVel.z*.035;\n  this.thruster.material.opacity=mov&&this.fuel>0?(.5+Math.random()*.5):0;\n  this.rocketLight.intensity=mov&&this.fuel>0?(2+Math.random()*2):0;\n\n  // Fuel empty\n  if(this.fuel<=0&&!this._fuelOut){\n    this._fuelOut=true;\n    this.rocketPos.set(0,12,5);this.rocketVel.set(0,0,0);\n    this.showMsg(\'⛽ Elfogy a fuel! Visszateleportálva!\',3000,\'#f44\');\n  }\n  if(this.fuel>0) this._fuelOut=false;\n\n  // Fuel regen near base\n  if(this.rocketPos.length()<35) this.fuel=Math.min(this.maxFuel,this.fuel+2.5*dt);\n\n  // Camera: 3rd person behind rocket\n  const cd=16,ch=7;\n  const rbX=this.rocketPos.x+Math.sin(this.rocketYaw)*cd;\n  const rbZ=this.rocketPos.z+Math.cos(this.rocketYaw)*cd;\n  this.camera.position.lerp(new THREE.Vector3(rbX,this.rocketPos.y+ch,rbZ),dt*5);\n  this.camera.lookAt(this.rocketPos.x,this.rocketPos.y+2,this.rocketPos.z);\n}\n}\n</script>\n</body>\n</html>\n';
app.get('/lucky-block-rocket', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(luckyBlockGameHTML);
});

// ============================================================
// TOBBI JATEK
// ============================================================
app.get('/tetris', (req, res) => { res.send(getStyle()+getMenu()+'<div class="container"><h1>🟦 Tetris</h1><p>A játék hamarosan elérhető!</p></div>'); });
app.get('/snake', (req, res) => { res.send(getStyle()+getMenu()+'<div class="container"><h1>🐍 Snake</h1><p>A játék hamarosan elérhető!</p></div>'); });
app.get('/labirintus', (req, res) => { res.send(getStyle()+getMenu()+'<div class="container"><h1>🎯 Labirintus</h1><p>A játék hamarosan elérhető!</p></div>'); });
app.post('/jatek-nev-mentes', async (req, res) => { res.json({ sikeres: true }); });
app.post('/jatek-mentes', async (req, res) => { res.json({ sikeres: true, ujPont: false, gyozelemPontok: 0 }); });
