const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = 'elso-weboldalam';
let db;
let uzenetekCollection;
let jatekAllapotCollection;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.listen(port, '0.0.0.0', () => {
  console.log(`Az oldal fut a porton: ${port}`);
});

MongoClient.connect(mongoUrl)
  .then(client => {
    console.log('Sikeresen csatlakoztunk a MongoDB-hez!');
    db = client.db(dbName);
    uzenetekCollection = db.collection('uzenetek');
    jatekAllapotCollection = db.collection('jatek_allapot');
  })
  .catch(error => {
    console.error('MongoDB kapcsolodasi hiba:', error);
    console.log('Az oldal MongoDB nelkul fut.');
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
// TENGERIMALAC KALAND – 3D VERZIÓ (JAVÍTOTT)
// ============================================================

app.get('/tengerimalac-jatek', (req, res) => {
  const scene = req.query.scene || 'ketrec';
  const state = parseState(req.query);

  let html = getGameStyle() + getMenu() + `
    <div id="ui">
      <div class="game-title">🐹 Tengerimalac Kaland 3D</div>
      <div class="level-info">📊 ${state.level}. szint | 🏆 Győzelmi pontok: ${state.victoryPoints} | 🐹 ${state.name || 'Névtelen malac'}</div>
      ${renderFinishes(state)}
      
      <div id="description" style="font-size:19px; margin:20px 0; min-height:80px;"></div>
      <div class="choices" id="choices"></div>
      <div id="endMessage"></div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    <script>
      // Three.js setup
      let scene3d, camera, renderer, malac;

      function init3D() {
        scene3d = new THREE.Scene();
        scene3d.background = new THREE.Color(0x88ccff);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Fények
        scene3d.add(new THREE.AmbientLight(0xaaaaaa));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(8, 12, 10);
        scene3d.add(dirLight);

        // Padló
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(40, 40),
          new THREE.MeshLambertMaterial({ color: 0xdddddd })
        );
        floor.rotation.x = -Math.PI / 2;
        scene3d.add(floor);

        // Ketrec
        const cage = new THREE.Mesh(
          new THREE.BoxGeometry(6, 5, 6),
          new THREE.MeshLambertMaterial({ color: 0x555555, wireframe: true })
        );
        cage.position.set(0, 2.5, -8);
        scene3d.add(cage);

        // Tengerimalac (sárga gömb)
        malac = new THREE.Mesh(
          new THREE.SphereGeometry(0.9, 32, 32),
          new THREE.MeshLambertMaterial({ color: 0xffcc88 })
        );
        malac.position.set(0, 0.9, -8);
        scene3d.add(malac);

        camera.position.set(3, 7, 15);
        camera.lookAt(0, 1, -8);
      }

      function animate() {
        requestAnimationFrame(animate);
        if (malac) malac.rotation.y += 0.008;
        if (renderer) renderer.render(scene3d, camera);
      }

      // UI frissítés
      function updateUI(desc, choices = [], endMsg = '') {
        document.getElementById('description').innerHTML = desc;
        const chDiv = document.getElementById('choices');
        chDiv.innerHTML = '';
        choices.forEach(c => {
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.textContent = c.text;
          btn.onclick = () => location.href = c.url;
          chDiv.appendChild(btn);
        });
        document.getElementById('endMessage').innerHTML = endMsg;
      }

      window.addEventListener('resize', () => {
        if (camera && renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      });

      // Oldal betöltésekor indítás
      window.onload = function() {
        init3D();
        animate();
    `;

  // Ketrec scene
  if (scene === 'ketrec') {
    html += `
        updateUI(
          'Szia, <strong>${state.name}</strong>!<br>A gazdád nyitva hagyta a ketreced ajtaját.<br><br>Mit csinálsz most?',
          [
            {text: '🛌 Bent maradok', url: '${buildUrl('ketrec_vege', state)}'},
            {text: '🛋️ Nappaliba megyek', url: '${buildUrl('nappali', state)}'},
            {text: '🚗 Garázsba megyek', url: '${buildUrl('garazs', state)}'},
            {text: '🚽 WC-be megyek', url: '${buildUrl('wc', state)}'},
            {text: '🛗 Liftbe megyek', url: '${buildUrl('lift', state)}'}
          ]
        );
      `;
  } 
  else if (scene === 'ketrec_vege') {
    html += `updateUI('', [], '<div class="end-message vege">💥 VÉGE!<br><br>Összeverekedtél egy másik malaccal az uborkán!</div>');`;
  } 
  else if (scene === 'garazs') {
    html += `updateUI('A garázsban vagy...', [
      {text: '⚫ Megeszem a kiszóródott golyókat', url: '${buildUrl('garazs_golyo', state)}'},
      {text: '📦 Megeszem a bolti cuccot', url: '${buildUrl('garazs_malackaja', state)}'}
    ]);`;
  } 
  else {
    html += `updateUI('Ez a scene még fejlesztés alatt van...<br><br><a href="${buildUrl('ketrec', state)}" style="color:#667eea;">← Vissza a ketrecbe</a>');`;
  }

  html += `
      };
    <\/script>
  `;

  res.send(html);
});

// ============================================================
// TOBBI JATEK
// ============================================================

app.get('/tetris', (req, res) => { res.send(getStyle()+getMenu()+'<div class="container"><h1>🟦 Tetris</h1><p>A játék hamarosan elérhető!</p></div>'); });
app.get('/snake', (req, res) => { res.send(getStyle()+getMenu()+'<div class="container"><h1>🐍 Snake</h1><p>A játék hamarosan elérhető!</p></div>'); });
app.get('/labirintus', (req, res) => { res.send(getStyle()+getMenu()+'<div class="container"><h1>🎯 Labirintus</h1><p>A játék hamarosan elérhető!</p></div>'); });
app.post('/jatek-nev-mentes', async (req, res) => { res.json({ sikeres: true }); });
app.post('/jatek-mentes', async (req, res) => { res.json({ sikeres: true, ujPont: false, gyozelemPontok: 0 }); });
