const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = 'elso-weboldalam';
let db;
let uzenetekCollection;
let jatekAllapotCollection;

app.use(express.urlencoded({ extended: true, limit: '10tb' }));
app.use(express.json({ limit: '10tb' }));

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
    console.error('MongoDB kapcsolódási hiba:', error);
    console.log('Az oldal MongoDB nélkül fut.');
  });

function getStyle() {
  return `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
    nav { background: rgba(255, 255, 255, 0.95); padding: 15px; border-radius: 15px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); margin-bottom: 30px; text-align: center; }
    nav a { color: #667eea; margin: 10px 15px; text-decoration: none; font-weight: bold; font-size: 18px; padding: 10px 20px; border-radius: 10px; transition: all 0.3s; display: inline-block; }
    nav a:hover { background: #667eea; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
    h1 { color: #667eea; font-size: 48px; margin-bottom: 20px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
    p { color: #555; font-size: 18px; line-height: 1.8; margin: 15px 0; }
    .game-button { display: inline-block; font-size: 22px; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 15px; margin: 15px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .game-button:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6); }
    .emoji { font-size: 40px; display: block; margin-bottom: 10px; }
  </style>`;
}

function getMenu() {
  return `<nav>
    <a href="/">🏠 Főoldal</a>
    <a href="/rolam">👤 Rólam</a>
    <a href="/a_weboldalrol">ℹ️ A weboldalról</a>
    <a href="/jatekok">🎮 Játékok</a>
    <a href="/uzenofal">💬 Üzenőfal</a>
    <span id="auth-menu"><a href="/bejelentkezes">🔐 Bejelentkezés</a></span>
  </nav>
  <script>
    const bejelentkezve = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
    if (bejelentkezve) {
      const profilkepHTML = bejelentkezve.profilkep 
        ? '<img src="' + bejelentkezve.profilkep + '" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px; object-fit: cover;">'
        : '<span style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; line-height: 30px; font-weight: bold; margin-right: 5px; vertical-align: middle;">' + bejelentkezve.felhasznalonev.charAt(0).toUpperCase() + '</span>';
      document.getElementById('auth-menu').innerHTML = profilkepHTML + '<span style="color: #667eea; font-weight: bold; margin-right: 10px;">' + bejelentkezve.felhasznalonev + '</span>' + '<a href="/kijelentkezes">🚪 Kilépés</a>';
    }
  </script>`;
}

app.get('/', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>🌟 Üdvözöllek a weboldalamon!</h1><p style="text-align: center; font-size: 20px;">Használd a menüt fent, hogy felfedezd az oldalaimat!</p></div>');
});

app.get('/rolam', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>👦 Rólam</h1><p>🎂 <strong>Én egy 8 éves gyerek vagyok</strong>, és a kedvenc hobbim a <strong>programozás</strong>!</p><p>💻 Imádok számítógépezni és új dolgokat tanulni.</p></div>');
});

app.get('/a_weboldalrol', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>ℹ️ A weboldalról</h1><p>🛠️ Ezt a weboldalt <strong>apukámmal</strong> (meg az AI-al) csináltam.</p></div>');
});

app.get('/jatekok', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>🎮 Játékok</h1><p style="text-align: center;">Válassz egy játékot!</p><div style="text-align: center; margin-top: 30px;">' +
    '<a href="/tengerimalac-jatek" class="game-button"><span class="emoji">🐹</span>Tengerimalac Kaland</a>' +
    '<a href="/tetris" class="game-button"><span class="emoji">🟦</span>Tetris</a>' +
    '<a href="/snake" class="game-button"><span class="emoji">🐍</span>Snake</a>' +
    '<a href="/labirintus" class="game-button"><span class="emoji">🎯</span>Labirintus</a></div></div>');
});

app.get('/bejelentkezes', (req, res) => {
  res.send(getMenu() + getStyle() + `<style>.login-container{max-width:400px;margin:50px auto;background:white;padding:40px;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.2)}.login-form input{width:100%;padding:12px;margin:10px 0;border:2px solid #667eea;border-radius:8px;font-size:16px}.login-btn{width:100%;padding:15px;background:#667eea;color:white;border:none;border-radius:8px;font-size:18px;font-weight:bold;cursor:pointer;margin-top:10px}.login-btn:hover{background:#5568d3}.switch-link{text-align:center;margin-top:20px;color:#667eea}.switch-link a{color:#667eea;font-weight:bold;text-decoration:underline}</style><div class="login-container"><h1 style="color:#667eea;text-align:center;">🔐 Bejelentkezés</h1><form class="login-form" action="/api/login" method="POST"><input type="text" name="felhasznalonev" placeholder="Felhasználónév" required><input type="password" name="jelszo" placeholder="Jelszó" required><button type="submit" class="login-btn">Belépés</button></form><div class="switch-link">Nincs még fiókod? <a href="/regisztracio">Regisztrálj itt!</a></div></div>`);
});

app.get('/regisztracio', (req, res) => {
  res.send(getMenu() + getStyle() + `<style>.reg-container{max-width:500px;margin:50px auto;background:white;padding:40px;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.2)}.reg-form input{width:100%;padding:12px;margin:10px 0;border:2px solid #667eea;border-radius:8px;font-size:16px}.file-input-wrapper{margin:20px 0;padding:20px;border:2px dashed #667eea;border-radius:8px;text-align:center;cursor:pointer}.preview-container{margin:20px 0;text-align:center}.preview-img{width:150px;height:150px;border-radius:50%;object-fit:cover;border:3px solid #667eea;display:none}.default-avatar{width:150px;height:150px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-size:60px;font-weight:bold;margin:0 auto}.reg-btn{width:100%;padding:15px;background:#667eea;color:white;border:none;border-radius:8px;font-size:18px;font-weight:bold;cursor:pointer;margin-top:10px}.reg-btn:hover{background:#5568d3}.error-msg{color:red;text-align:center;margin:10px 0;display:none}</style><div class="reg-container"><h1 style="color:#667eea;text-align:center;">📝 Regisztráció</h1><form class="reg-form" id="regForm" onsubmit="return handleRegister(event)"><input type="text" id="felhasznalonev" placeholder="Felhasználónév" required minlength="3"><input type="password" id="jelszo" placeholder="Jelszó" required minlength="4"><div class="file-input-wrapper" onclick="document.getElementById('profilkep').click()">📷 Profilkép (max 500 KB)</div><input type="file" id="profilkep" accept="image/png,image/jpeg" style="display:none;" onchange="previewImage(event)"><div class="preview-container"><p><strong>Előnézet:</strong></p><img id="preview" class="preview-img"><div id="defaultAvatar" class="default-avatar">?</div></div><div class="error-msg" id="errorMsg"></div><button type="submit" class="reg-btn">Regisztráció</button></form></div><script>let profilkepData=null;document.getElementById('felhasznalonev').addEventListener('input',function(e){const nev=e.target.value;if(nev&&!profilkepData)document.getElementById('defaultAvatar').textContent=nev.charAt(0).toUpperCase()});function previewImage(event){const file=event.target.files[0];if(!file)return;if(file.size>512000){document.getElementById('errorMsg').textContent='⚠️ Túl nagy!';document.getElementById('errorMsg').style.display='block';event.target.value='';return}document.getElementById('errorMsg').style.display='none';const reader=new FileReader();reader.onload=function(e){profilkepData=e.target.result;document.getElementById('preview').src=profilkepData;document.getElementById('preview').style.display='block';document.getElementById('defaultAvatar').style.display='none'};reader.readAsDataURL(file)}async function handleRegister(event){event.preventDefault();const felhasznalonev=document.getElementById('felhasznalonev').value;const jelszo=document.getElementById('jelszo').value;try{const response=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({felhasznalonev,jelszo,profilkep:profilkepData})});const result=await response.json();if(result.siker){alert('✅ Sikeres regisztráció!');window.location.href='/bejelentkezes'}else{document.getElementById('errorMsg').textContent='❌ '+result.uzenet;document.getElementById('errorMsg').style.display='block'}}catch(error){document.getElementById('errorMsg').textContent='❌ Hiba!';document.getElementById('errorMsg').style.display='block'}return false}</script>`);
});

app.get('/uzenofal', async (req, res) => {
  try {
    if (!uzenetekCollection) {
      throw new Error('Nincs MongoDB kapcsolat');
    }
    const uzenetek = await uzenetekCollection.find().sort({ datum: -1 }).toArray();
    let uzenetLista = '';
    uzenetek.forEach((uzenet) => {
      if (!uzenet.felhasznalonev || !uzenet.szoveg) return;
      const profilkepHTML = uzenet.profilkep 
        ? `<img src="${uzenet.profilkep}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;margin-right:15px;vertical-align:middle;">`
        : `<span style="display:inline-block;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-align:center;line-height:50px;font-weight:bold;font-size:24px;margin-right:15px;vertical-align:middle;">${uzenet.felhasznalonev.charAt(0).toUpperCase()}</span>`;
      uzenetLista += `<div style="background:#f0f0f0;padding:20px;margin:15px 0;border-radius:10px;border-left:4px solid #667eea;display:flex;align-items:start;">${profilkepHTML}<div style="flex:1;"><strong style="color:#667eea;font-size:18px;">${uzenet.felhasznalonev}</strong><p style="margin:5px 0;color:#333;">${uzenet.szoveg}</p><small style="color:#999;">${new Date(uzenet.datum).toLocaleString('hu-HU')}</small></div></div>`;
    });
    res.send(getStyle() + getMenu() + `<div class="container"><h1>💬 Üzenőfal</h1><h2 style="color:#667eea;">Üzenetek (${uzenetek.length} db):</h2><div id="uzenet-form-container"></div><div>${uzenetLista || '<p style="text-align:center;color:#999;">Még nincs üzenet.</p>'}</div></div><script>(function(){const userData=JSON.parse(localStorage.getItem('bejelentkezve')||'null');const container=document.getElementById('uzenet-form-container');if(userData){container.innerHTML='<h2 style="color:#667eea;margin-top:30px;">Új üzenet:</h2><form action="/uj-uzenet" method="POST" style="margin-top:20px;"><input type="hidden" name="felhasznalonev" value="'+userData.felhasznalonev+'"><input type="hidden" name="profilkep" value="'+(userData.profilkep||'')+'"><input type="text" name="uzenet" required placeholder="Írd ide..." style="width:70%;padding:15px;font-size:16px;border:2px solid #667eea;border-radius:10px;margin-right:10px;"><button type="submit" style="padding:15px 30px;background:#667eea;color:white;border:none;border-radius:10px;font-size:16px;cursor:pointer;font-weight:bold;">Küldés</button></form>'}else{container.innerHTML='<div style="background:#fffacd;padding:20px;border-radius:10px;text-align:center;margin:20px 0;"><p style="font-size:18px;color:#666;">💡 <strong>Jelentkezz be</strong> hogy üzenetet írj!</p><a href="/bejelentkezes" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#667eea;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Bejelentkezés</a></div>'}})();</script>`);
  } catch (error) {
    res.send(getStyle() + getMenu() + '<div class="container"><h1>❌ Hiba!</h1><p>MongoDB kapcsolat probléma.</p></div>');
  }
});

app.post('/uj-uzenet', async (req, res) => {
  try {
    if (!uzenetekCollection) {
      return res.send('MongoDB nincs csatlakozva!');
    }
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
    if (!db) {
      return res.json({ siker: false, uzenet: 'MongoDB nincs csatlakozva!' });
    }
    const { felhasznalonev, jelszo, profilkep } = req.body;
    const letezik = await db.collection('users').findOne({ felhasznalonev });
    if (letezik) {
      return res.json({ siker: false, uzenet: 'Ez a felhasználónév már foglalt!' });
    }
    await db.collection('users').insertOne({
      felhasznalonev,
      jelszo,
      profilkep: profilkep || null,
      letrehozva: new Date()
    });
    res.json({ siker: true });
  } catch (error) {
    res.json({ siker: false, uzenet: 'Szerver hiba!' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    if (!db) {
      return res.send(getMenu() + getStyle() + '<div class="container"><h1 style="color:red;">❌ MongoDB nincs csatlakozva!</h1></div>');
    }
    const { felhasznalonev, jelszo } = req.body;
    const felhasznalo = await db.collection('users').findOne({ felhasznalonev, jelszo });
    if (!felhasznalo) {
      return res.send(getMenu() + getStyle() + '<div class="container"><h1 style="color:red;">❌ Sikertelen bejelentkezés!</h1><p>Hibás adatok.</p><a href="/bejelentkezes" style="color:#667eea;font-weight:bold;">← Próbáld újra</a></div>');
    }
    res.send(getMenu() + getStyle() + `<div class="container"><h1 style="color:green;">✅ Sikeres bejelentkezés!</h1><p>Üdvözöllek, <strong>${felhasznalo.felhasznalonev}</strong>!</p></div><script>localStorage.setItem('bejelentkezve',JSON.stringify({felhasznalonev:'${felhasznalo.felhasznalonev}',profilkep:${felhasznalo.profilkep ? `'${felhasznalo.profilkep}'` : 'null'}}));setTimeout(()=>{window.location.href='/'},1500)</script>`);
  } catch (error) {
    res.send(getMenu() + getStyle() + '<div class="container"><h1 style="color:red;">❌ Hiba!</h1></div>');
  }
});

app.get('/kijelentkezes', (req, res) => {
  res.send(getMenu() + getStyle() + '<div class="container"><h1 style="color:#667eea;">👋 Kijelentkezés...</h1></div><script>localStorage.removeItem("bejelentkezve");setTimeout(()=>{window.location.href="/"},1000)</script>');
});

// ============================================================
// TENGERIMALAC KALAND - Szöveges kalandjáték
// ============================================================

function getGameStyle() {
  return `<style>
    .game-container { max-width: 750px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .game-title { color: #667eea; font-size: 36px; margin-bottom: 10px; text-align: center; }
    .game-scene { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 15px; padding: 25px; margin: 20px 0; font-size: 18px; line-height: 1.8; color: #333; border-left: 5px solid #667eea; }
    .game-scene .emoji-big { font-size: 50px; display: block; text-align: center; margin-bottom: 10px; }
    .game-choices { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; justify-content: center; }
    .game-choice { display: inline-block; padding: 14px 22px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: bold; transition: all 0.3s; box-shadow: 0 4px 12px rgba(102,126,234,0.4); cursor: pointer; }
    .game-choice:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(102,126,234,0.6); }
    .game-end-bad { background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; border-radius: 15px; padding: 25px; text-align: center; font-size: 22px; font-weight: bold; margin: 20px 0; }
    .game-end-good { background: linear-gradient(135deg, #55efc4, #00b894); color: white; border-radius: 15px; padding: 25px; text-align: center; font-size: 22px; font-weight: bold; margin: 20px 0; }
    .finish-badge { background: gold; color: #333; border-radius: 10px; padding: 10px 20px; font-size: 18px; margin: 10px 0; display: inline-block; }
    .level-info { background: rgba(102,126,234,0.1); border-radius: 10px; padding: 10px 20px; margin-bottom: 15px; text-align: center; font-size: 16px; color: #667eea; font-weight: bold; }
    .finishes-bar { background: #f0f0f0; border-radius: 10px; padding: 15px; margin: 15px 0; }
    .finish-item { display: inline-block; margin: 4px; padding: 6px 12px; border-radius: 8px; font-size: 14px; }
    .finish-done { background: #55efc4; color: #00695c; }
    .finish-todo { background: #ddd; color: #999; }
    .win-screen { background: linear-gradient(135deg, #f9ca24, #f0932b); color: white; border-radius: 20px; padding: 40px; text-align: center; }
    .win-screen h2 { font-size: 40px; margin-bottom: 10px; }
  </style>`;
}

// Finishek definíciója
const FINISHES = ['Auchanos malackaja', 'Finom Füge', 'Guinea a Guineában', 'minek pazaroltál erre egymilliót?'];
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
  const params = new URLSearchParams({
    scene,
    level: state.level,
    vp: state.victoryPoints,
    f: encodeURIComponent(JSON.stringify(state.finishes)),
    name: encodeURIComponent(state.name),
    ...extra
  });
  return '/tengerimalac-jatek?' + params.toString();
}

function addFinish(state, finish) {
  if (!state.finishes.includes(finish)) {
    return { ...state, finishes: [...state.finishes, finish] };
  }
  return state;
}

function allFinishesUnlocked(state) {
  return FINISHES.every(f => state.finishes.includes(f));
}

function renderFinishes(state) {
  return `<div class="finishes-bar">🏆 Finishek: ` +
    FINISHES.map(f => `<span class="finish-item ${state.finishes.includes(f) ? 'finish-done' : 'finish-todo'}">${state.finishes.includes(f) ? '✅' : '🔒'} ${f}</span>`).join('') +
    `</div>`;
}

function renderGame(state, emojiStr, szoveg, valasztasok) {
  const levelStr = `<div class="level-info">📊 ${state.level}. szint | 🏆 Győzelmi pontok: ${state.victoryPoints} | 🐹 Malac neve: <strong>${state.name || '???'}</strong></div>`;
  const finishBar = renderFinishes(state);
  const choices = valasztasok.map(v =>
    `<a class="game-choice" href="${v.url}">${v.label}</a>`
  ).join('');
  return getGameStyle() + getMenu() + getStyle() +
    `<div class="game-container">
      <h1 class="game-title">🐹 Tengerimalac Kaland</h1>
      ${levelStr}${finishBar}
      <div class="game-scene">
        <span class="emoji-big">${emojiStr}</span>
        <p>${szoveg}</p>
      </div>
      <div class="game-choices">${choices}</div>
    </div>`;
}

function renderEnd(state, type, szoveg, extra) {
  const levelStr = `<div class="level-info">📊 ${state.level}. szint | 🏆 Győzelmi pontok: ${state.victoryPoints} | 🐹 Malac neve: <strong>${state.name || '???'}</strong></div>`;
  const finishBar = renderFinishes(state);
  const endDiv = type === 'bad'
    ? `<div class="game-end-bad">💀 VÉGE!<br><br>${szoveg}</div>`
    : `<div class="game-end-good">🎉 GRATULÁLUNK!<br><br>${szoveg}${extra ? '<br><br><span class="finish-badge">🏅 Feloldva: ' + extra + '</span>' : ''}</div>`;
  const ujraUrl = buildUrl('ketrec', { ...state }, {});
  return getGameStyle() + getMenu() + getStyle() +
    `<div class="game-container">
      <h1 class="game-title">🐹 Tengerimalac Kaland</h1>
      ${levelStr}${finishBar}
      ${endDiv}
      <div class="game-choices">
        <a class="game-choice" href="${ujraUrl}">🔄 Újra próbálom</a>
        <a class="game-choice" href="/jatekok">🎮 Vissza a játékokhoz</a>
      </div>
    </div>`;
}

function renderWin(state) {
  return getGameStyle() + getMenu() + getStyle() +
    `<div class="game-container">
      <div class="win-screen">
        <h2>🏆 KIVITTED A JÁTÉKOT! 🏆</h2>
        <p style="font-size:24px;">Minden szinten megszerezted az összes finisht!</p>
        <p style="font-size:20px;margin-top:15px;">Győzelmi pontjaid: <strong>${state.victoryPoints}</strong></p>
        <p style="font-size:60px;">🐹🎉🥳</p>
      </div>
      <div class="game-choices" style="margin-top:20px;">
        <a class="game-choice" href="/jatekok">🎮 Vissza a játékokhoz</a>
      </div>
    </div>`;
}

app.get('/tengerimalac-jatek', (req, res) => {
  const query = req.query;
  const scene = query.scene || 'start';
  const state = parseState(query);

  // ---- START: Névadás ----
  if (scene === 'start') {
    return res.send(getGameStyle() + getMenu() + getStyle() +
      `<div class="game-container">
        <h1 class="game-title">🐹 Tengerimalac Kaland</h1>
        <div class="game-scene">
          <span class="emoji-big">🐹</span>
          <p>Egy kertes ház nappalijában egy ketrecben élsz tengerimalacként.<br><br>
          Add meg a neved!</p>
        </div>
        <form method="GET" action="/tengerimalac-jatek" style="text-align:center;margin-top:20px;">
          <input type="hidden" name="scene" value="ketrec">
          <input type="hidden" name="level" value="1">
          <input type="hidden" name="vp" value="0">
          <input type="hidden" name="f" value="${encodeURIComponent('[]')}">
          <input type="text" name="name" placeholder="A malac neve..." required
            style="padding:14px;font-size:18px;border:2px solid #667eea;border-radius:10px;width:280px;margin-right:10px;">
          <button type="submit" class="game-choice" style="border:none;">✅ Ez vagyok én!</button>
        </form>
      </div>`
    );
  }

  // ---- KETREC ----
  if (scene === 'ketrec') {
    const malacNev = state.name || 'Névtelen malac';
    return res.send(renderGame(state, '🐹🏠',
      `Szia, <strong>${malacNev}</strong>! Éppen a ketrecedben vagy, amikor a kisfiú – a gazdád – etetés közben véletlenül nyitva hagyja a ketreced ajtaját.<br><br>
      Mit csinálsz?`,
      [
        { label: '🛌 Bent maradok a ketrecben', url: buildUrl('ketrec_vege', state) },
        { label: '🛋️ Megyek a nappaliba', url: buildUrl('nappali', state) },
        { label: '🚗 Megyek a garázsba', url: buildUrl('garázs', state) },
        { label: '🚽 Megyek a WC-be', url: buildUrl('wc', state) },
        { label: '🛗 Megyek a liftbe', url: buildUrl('lift', state) },
      ]
    ));
  }

  if (scene === 'ketrec_vege') {
    return res.send(renderEnd(state, 'bad', 'összeverekedtél egy másik malaccal az uborkán!'));
  }

  // ---- NAPPALI ----
  if (scene === 'nappali') {
    return res.send(renderGame(state, '🧝',
      `A nappaliban találkozol a <strong>Játék Manóval</strong>! Ijesztőnek tűnik...<br><br>Mit csinálsz?`,
      [
        { label: '👊 Félek és leütöm!', url: buildUrl('nappali_leutes', state) },
        { label: '👂 Meghallgatom', url: buildUrl('nappali_meghallgat', state) },
      ]
    ));
  }

  if (scene === 'nappali_leutes') {
    return res.send(renderEnd(state, 'bad', 'leütötted Játék Manót – ezért elvarázsolt!'));
  }

  if (scene === 'nappali_meghallgat') {
    return res.send(renderGame(state, '🚪✨',
      `A Játék Manó megmutat neked egy <strong>titkos átjárót</strong>! Ezen muszáj átmenned.<br><br>Átmész az átjárón...`,
      [
        { label: '🚪 Átmegyek az átjárón', url: buildUrl('kinai_szomszed_nappali', state) },
      ]
    ));
  }

  if (scene === 'kinai_szomszed_nappali') {
    return res.send(renderEnd(state, 'bad', 'átjutottál a kínaiékhoz – és ők megettek!'));
  }

  // ---- GARÁZS ----
  if (scene === 'garázs') {
    return res.send(renderGame(state, '🚗🔧',
      `A garázsban körülnézel. A földön <strong>kiszóródott golyókat</strong> látsz, és van egy doboz amit a gazdád vett a boltban – fogalmad sincs mi van benne.`,
      [
        { label: '⚫ Megeszem a golyókat', url: buildUrl('garázs_golyo', state) },
        { label: '📦 Megeszem a boltban vett dolgot', url: buildUrl('garázs_malackaja', state) },
      ]
    ));
  }

  if (scene === 'garázs_golyo') {
    return res.send(renderEnd(state, 'bad', 'megetted a patkánymérget!'));
  }

  if (scene === 'garázs_malackaja') {
    const ujState = addFinish(state, 'Auchanos malackaja');
    if (allFinishesUnlocked(ujState)) {
      const newState = { ...ujState, victoryPoints: ujState.victoryPoints + 1, level: ujState.level + 1, finishes: [] };
      if (newState.level > TOTAL_LEVELS) return res.redirect(buildUrl('win', { ...newState }));
      return res.send(renderEnd(ujState, 'good',
        'ez a kaja tengerimalac kaja volt, ezért jóllaktál! 🎊<br>Minden finisht feloldottál! +1 győzelmi pont! Következő szint: ' + newState.level,
        'Auchanos malackaja'));
    }
    return res.send(renderEnd(ujState, 'good', 'ez a kaja tengerimalac kaja volt, ezért jóllaktál!', 'Auchanos malackaja'));
  }

  // ---- WC ----
  if (scene === 'wc') {
    return res.send(renderGame(state, '🚽🧟',
      `A WC-ben találkozol a <strong>Kakimanóval</strong>! Azt mondja: "Kövesd a Kakimanót!"<br><br>Mit csinálsz?`,
      [
        { label: '🚽 Követem a Kakimanót', url: buildUrl('wc_kovetes', state) },
        { label: '🚶 Tovább megyek inkább', url: buildUrl('garázs', state) },
      ]
    ));
  }

  if (scene === 'wc_kovetes') {
    return res.send(renderEnd(state, 'bad', 'beugrottál a WC-lefolyóba!'));
  }

  // ---- LIFT ----
  if (scene === 'lift') {
    return res.send(renderGame(state, '🛗',
      `BeSzállsz a liftbe. Melyik szintre mész?`,
      [
        { label: '⬆️ 1. emelet', url: buildUrl('elso_emelet', state) },
        { label: '⬇️ -1. szint (pince)', url: buildUrl('pince', state) },
      ]
    ));
  }

  // ---- PINCE ----
  if (scene === 'pince') {
    return res.send(renderGame(state, '🌑😨',
      `A pincében <strong>fura hangot</strong> hallasz, és a földön <strong>illatos golyókat</strong> látsz.<br><br>Mit csinálsz?`,
      [
        { label: '👂 A hang felé megyek', url: buildUrl('pince_hang', state) },
        { label: '🍬 Megeszem az illatos golyókat', url: buildUrl('pince_golyo', state) },
      ]
    ));
  }

  if (scene === 'pince_hang') {
    return res.send(renderEnd(state, 'bad', 'nem hallottad, hogy FURA hang? Rád ugrott egy patkány és megharapott!'));
  }

  if (scene === 'pince_golyo') {
    return res.send(renderEnd(state, 'bad', 'patkányméreg! Gondolkozz mielőtt cselekedsz!'));
  }

  // ---- 1. EMELET ----
  if (scene === 'elso_emelet') {
    return res.send(renderGame(state, '🏠1️⃣',
      `Az 1. emeleten két szoba ajtaja vár rád.<br><br>Melyikbe mész?`,
      [
        { label: '🔵 Kék szoba', url: buildUrl('kek_szoba', state) },
        { label: '🩷 Rózsaszín szoba', url: buildUrl('rozsaszin_szoba', state) },
      ]
    ));
  }

  // ---- KÉK SZOBA ----
  if (scene === 'kek_szoba') {
    return res.send(renderGame(state, '🔵🛏️',
      `A kék szobában vagy. Az ablak nyitva van, és innen ki tudsz jutni az <strong>erkélyre</strong>.`,
      [
        { label: '🏠 Kimegyek az erkélyre', url: buildUrl('erkely', state) },
      ]
    ));
  }

  if (scene === 'erkely') {
    return res.send(renderGame(state, '🌿🏡',
      `Az erkélyről le kell jutnod a kertbe. Hogyan?`,
      [
        { label: '🪁 Papírsárkányon megyek le', url: buildUrl('kert', state) },
        { label: '🪜 A létrán megyek le', url: buildUrl('erkely_latra', state) },
      ]
    ));
  }

  if (scene === 'erkely_latra') {
    return res.send(renderEnd(state, 'bad', 'lent nem volt rögzítve a létra! Legközelebb nézd meg hova lépsz…'));
  }

  // ---- KERT ----
  if (scene === 'kert') {
    return res.send(renderGame(state, '🌳🌻',
      `Sikeresen landoltál a kertben! Körülnézel – merre mész?`,
      [
        { label: '🚗 Kimegyek az utcára', url: buildUrl('kert_utca', state) },
        { label: '🌿 Megyek a kerítéshez', url: buildUrl('kert_kerítés', state) },
        { label: '🥬 Megyek a veteményeshez', url: buildUrl('veteményes', state) },
      ]
    ));
  }

  if (scene === 'kert_utca') {
    return res.send(renderEnd(state, 'bad', 'elütött az autó!'));
  }

  if (scene === 'kert_kerítés') {
    return res.send(renderEnd(state, 'bad', 'a kutya megharapott!'));
  }

  if (scene === 'veteményes') {
    return res.send(renderGame(state, '🥦🌱',
      `A veteményesnél egy <strong>hinta</strong> is áll. Mit csinálsz?`,
      [
        { label: '🎠 Felszállok a hintára', url: buildUrl('hinta_repules', state) },
        { label: '🚶 Tovább megyek a hinta mellett', url: buildUrl('fuge', state) },
      ]
    ));
  }

  if (scene === 'hinta_repules') {
    return res.send(renderEnd(state, 'bad', 'átrepültél a gazdád kínai szomszédjához, ahol megettek!'));
  }

  if (scene === 'fuge') {
    const ujState = addFinish(state, 'Finom Füge');
    if (allFinishesUnlocked(ujState)) {
      const newState = { ...ujState, victoryPoints: ujState.victoryPoints + 1, level: ujState.level + 1, finishes: [] };
      if (newState.level > TOTAL_LEVELS) return res.redirect(buildUrl('win', { ...newState }));
      return res.send(renderEnd(ujState, 'good',
        'megtaláltad a fügebokrot és megetted az összes fügét! 🎊 Minden finisht feloldottál! +1 győzelmi pont!',
        'Finom Füge'));
    }
    return res.send(renderEnd(ujState, 'good', 'megtaláltad a fügebokrot és megetted az összes fügét!', 'Finom Füge'));
  }

  // ---- RÓZSASZÍN SZOBA ----
  if (scene === 'rozsaszin_szoba') {
    return res.send(renderGame(state, '🩷✈️',
      `A rózsaszín szobában van egy <strong>játékrepülő</strong>! Felszállsz rá és elrepülsz a <strong>buszállomásra</strong>.`,
      [
        { label: '🚌 Megyek a buszállomásra', url: buildUrl('buszallomas', state) },
      ]
    ));
  }

  if (scene === 'buszallomas') {
    return res.send(renderGame(state, '✈️🌍',
      `A buszállomásról eljutsz a <strong>repülőtérre</strong>! Hova repülsz?`,
      [
        { label: '🌏 Pápua-Új Guinea', url: buildUrl('papua', state) },
        { label: '🇭🇺 Magyarország', url: buildUrl('magyarorszag', state) },
        { label: '🌐 Más ország...', url: buildUrl('mas_orszag', state) },
      ]
    ));
  }

  if (scene === 'papua') {
    const ujState = addFinish(state, 'Guinea a Guineában');
    if (allFinishesUnlocked(ujState)) {
      const newState = { ...ujState, victoryPoints: ujState.victoryPoints + 1, level: ujState.level + 1, finishes: [] };
      if (newState.level > TOTAL_LEVELS) return res.redirect(buildUrl('win', { ...newState }));
      return res.send(renderEnd(ujState, 'good',
        'Guineaként elmentél Guineába! 🎊 Minden finisht feloldottál! +1 győzelmi pont!',
        'Guinea a Guineában'));
    }
    return res.send(renderEnd(ujState, 'good', 'Guineaként elmentél Guineába!', 'Guinea a Guineában'));
  }

  if (scene === 'magyarorszag') {
    const ujState = addFinish(state, 'minek pazaroltál erre egymilliót?');
    if (allFinishesUnlocked(ujState)) {
      const newState = { ...ujState, victoryPoints: ujState.victoryPoints + 1, level: ujState.level + 1, finishes: [] };
      if (newState.level > TOTAL_LEVELS) return res.redirect(buildUrl('win', { ...newState }));
      return res.send(renderEnd(ujState, 'good',
        'mondjuk ide autóval is el tudtál volna jönni… 🎊 Minden finisht feloldottál! +1 győzelmi pont!',
        'minek pazaroltál erre egymilliót?'));
    }
    return res.send(renderEnd(ujState, 'good', 'mondjuk ide autóval is el tudtál volna jönni…', 'minek pazaroltál erre egymilliót?'));
  }

  if (scene === 'mas_orszag') {
    return res.send(renderGame(state, '🌐✈️',
      `Egy ismeretlen országba repülsz... de itt nem találsz semmi érdekeset. Visszarepülsz.`,
      [
        { label: '✈️ Visszamegyek a repülőtérre', url: buildUrl('buszallomas', state) },
      ]
    ));
  }

  // ---- WIN ----
  if (scene === 'win') {
    return res.send(renderWin(state));
  }

  // Ismeretlen scene → visszaküld a starthoz
  res.redirect('/tengerimalac-jatek');
});

app.get('/tetris', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>🟦 Tetris</h1><p>A játék hamarosan elérhető!</p></div>');
});

app.get('/snake', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>🐍 Snake</h1><p>A játék hamarosan elérhető!</p></div>');
});

app.get('/labirintus', (req, res) => {
  res.send(getStyle() + getMenu() + '<div class="container"><h1>🎯 Labirintus</h1><p>A játék hamarosan elérhető!</p></div>');
});

app.post('/jatek-nev-mentes', async (req, res) => {
  res.json({ sikeres: true });
});

app.post('/jatek-mentes', async (req, res) => {
  res.json({ sikeres: true, ujPont: false, gyozelemPontok: 0 });
});
