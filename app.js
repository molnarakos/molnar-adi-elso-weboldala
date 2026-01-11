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

app.get('/tengerimalac-jatek', async (req, res) => {
  const sessionId = req.query.session || Date.now().toString();
  
  try {
    let allapot = null;
    
    if (jatekAllapotCollection) {
      allapot = await jatekAllapotCollection.findOne({ sessionId });
      if (!allapot) {
        allapot = { sessionId, finishek: [], gyozelemPontok: 0, jatekosNev: '' };
        await jatekAllapotCollection.insertOne(allapot);
      }
    } else {
      allapot = { sessionId, finishek: [], gyozelemPontok: 0, jatekosNev: '' };
    }

    const html = `
      ${getMenu()}
      <style>
        body { font-family: Arial; background: #f0f0f0; }
        .jatek-container { max-width: 800px; margin: 20px auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .gomb { padding: 10px 20px; margin: 5px; background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px; font-size: 16px; }
        .gomb:hover { background: #45a049; }
        .vege { color: red; font-weight: bold; }
        .gratula { color: green; font-weight: bold; font-size: 20px; }
        .finish-lista { background: #fffacd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        input[type="text"] { padding: 10px; font-size: 16px; width: 300px; }
      </style>
      <div class="jatek-container">
        <h1>🐹 Tengerimalac Kaland</h1>
        ${allapot.jatekosNev ? '<p><strong>Játékos:</strong> ' + allapot.jatekosNev + '</p>' : ''}
        <div class="finish-lista">
          <strong>Feloldott Finishek:</strong> ${allapot.finishek.join(', ') || 'Még nincs'}<br>
          <strong>Győzelem Pontok:</strong> ${allapot.gyozelemPontok}/10
          ${allapot.gyozelemPontok >= 10 ? '<br><span class="gratula">🎉 KIVITTED A JÁTÉKOT! 🎉</span>' : ''}
        </div>
        <div id="jatek-tartalom">
          <p>Egy kertes ház nappalijában egy ketrecben élsz tengerimalacként.</p>
          <div id="start-section"></div>
        </div>
      </div>
      <script>
        let sessionId = localStorage.getItem('tengerimalac_session');
        if (!sessionId) {
          sessionId = '${sessionId}';
          localStorage.setItem('tengerimalac_session', sessionId);
        }
        let jatekosNev = '${allapot.jatekosNev}';
        
        const bejelentkezve = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
        const startSection = document.getElementById('start-section');
        
        if (bejelentkezve) {
          jatekosNev = bejelentkezve.felhasznalonev;
          startSection.innerHTML = '<button class="gomb" onclick="ketrec()">Játék Indítása (' + jatekosNev + ')</button>';
          fetch('/jatek-nev-mentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, jatekosNev })
          });
        } else if (jatekosNev) {
          startSection.innerHTML = '<button class="gomb" onclick="ketrec()">Játék Indítása</button>';
        } else {
          startSection.innerHTML = '<p><strong>Add meg a neved:</strong></p><form onsubmit="event.preventDefault(); startJatek();"><input type="text" id="nev-input" placeholder="A neved..." required><button type="submit" class="gomb">Játék Indítása</button></form>';
        }

        async function startJatek() {
          jatekosNev = document.getElementById('nev-input').value;
          await fetch('/jatek-nev-mentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, jatekosNev })
          });
          ketrec();
        }

        function ketrec() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>Szia ' + (jatekosNev || 'Játékos') + '! A kisfiú aki a gazdád nyitva hagyta a ketrecet etetés közben véletlenül.</p>' +
            '<button class="gomb" onclick="bentMaradsz()">Bent maradok</button>' +
            '<button class="gomb" onclick="valaszt(\\'nappali\\')">Nappaliba megyek</button>' +
            '<button class="gomb" onclick="valaszt(\\'garazs\\')">Garázsba megyek</button>' +
            '<button class="gomb" onclick="valaszt(\\'wc\\')">WC-be megyek</button>' +
            '<button class="gomb" onclick="valaszt(\\'lift\\')">Liftbe megyek</button>';
        }

        function bentMaradsz() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Összeverekedtél egy másik malaccal az uborkán!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function valaszt(hely) {
          if (hely === 'nappali') nappali();
          else if (hely === 'garazs') garazs();
          else if (hely === 'wc') wc();
          else if (hely === 'lift') lift();
          else if (hely === 'kert') kert();
          else if (hely === 'vetemenyeshaz') vetemenyeshaz();
          else if (hely === 'kek_szoba') kekSzoba();
          else if (hely === 'rozsaszin_szoba') rozsaszinSzoba();
          else if (hely === 'minel') minusEgyesEmelet();
          else if (hely === 'buszallomas') buszallomas();
          else if (hely === 'repuloter') repuloter();
          else if (hely === 'kinai') kinai();
        }

        function garazs() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>A garázsban vagy. Látsz kiszóródott golyókat és egy dolgot amit a gazda vett a boltban.</p>' +
            '<button class="gomb" onclick="golyokEsz()">Megeszel a kiszóródott golyókat</button>' +
            '<button class="gomb" onclick="boltosKajaEsz()">Megeszel a boltos kaját</button>';
        }

        function golyokEsz() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Megetted a patkánymérgét!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        async function boltosKajaEsz() {
          await mentFinish('Auchanos malackaja');
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="gratula">GRATULÁLUNK! Ez a kaja tengerimalac kaja volt ezért jóllaktál!</p>' +
            '<p>Feloldottad a finisht: <strong>Auchanos malackaja</strong></p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function lift() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>A liftben vagy. Hova mész?</p>' +
            '<button class="gomb" onclick="elsoEmelet()">1. emelet</button>' +
            '<button class="gomb" onclick="valaszt(\\'minel\\')">-1. szint</button>';
        }

        function elsoEmelet() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>Az 1. emeleten vagy. Hova mész?</p>' +
            '<button class="gomb" onclick="valaszt(\\'kek_szoba\\')">Kék szoba</button>' +
            '<button class="gomb" onclick="valaszt(\\'rozsaszin_szoba\\')">Rózsaszín szoba</button>';
        }

        function kekSzoba() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>A kék szobában vagy. Kimehetsz az erkélyre.</p>' +
            '<button class="gomb" onclick="erkely()">Erkély</button>';
        }

        function erkely() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>Az erkélyen vagy. Hogyan mész le a kertbe?</p>' +
            '<button class="gomb" onclick="papirSarkany()">Papírsárkányon</button>' +
            '<button class="gomb" onclick="letra()">Létrán</button>';
        }

        function papirSarkany() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>Sikeresen landoltál a kertben!</p>' +
            '<button class="gomb" onclick="valaszt(\\'kert\\')">Tovább</button>';
        }

        function letra() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Lent nem volt rögzítve a létra!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function minusEgyesEmelet() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>A -1. szinten vagy. Hallasz egy fura hangot és látsz illatos golyókat a földön.</p>' +
            '<button class="gomb" onclick="hangFele()">A hang felé megyek</button>' +
            '<button class="gomb" onclick="illatosGolyok()">Megeszel az illatos golyókat</button>';
        }

        function hangFele() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Egy patkány ráugrott!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function illatosGolyok() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Patkányméreg!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function wc() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>A WC-ben találkozol a Kakimanóval.</p>' +
            '<button class="gomb" onclick="kovet()">Követem</button>' +
            '<button class="gomb" onclick="tovabbMegy()">Tovább megyek</button>';
        }

        function kovet() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Beugroltál a WC lefolyóba!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function tovabbMegy() {
          garazs();
        }

        function kert() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>A kertben vagy. Mit teszel?</p>' +
            '<button class="gomb" onclick="utca()">Kimegyek az utcára</button>' +
            '<button class="gomb" onclick="kerites()">Megyek a kerítéshez</button>' +
            '<button class="gomb" onclick="valaszt(\\'vetemenyeshaz\\')">Megyek a veteményeshez</button>';
        }

        function utca() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Elütött az autó!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function kerites() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! A kutya megharapott!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function vetemenyeshaz() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>A veteményesnél vagy. Látsz egy hintát.</p>' +
            '<button class="gomb" onclick="hinta()">Felszállok a hintára</button>' +
            '<button class="gomb" onclick="tovabbMegyFugebokur()">Tovább megyek</button>';
        }

        function hinta() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Átrepültél a kínai szomszédhoz!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        async function tovabbMegyFugebokur() {
          await mentFinish('Finom Füge');
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="gratula">GRATULÁLUNK! Megtaláltad a fügebokrot!</p>' +
            '<p>Feloldottad a finisht: <strong>Finom Füge</strong></p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function nappali() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>A nappaliban találkozol a Játék Manóval.</p>' +
            '<button class="gomb" onclick="leutJatekMano()">Leüt</button>' +
            '<button class="gomb" onclick="meghallgatJatekMano()">Meghallgatom</button>';
        }

        function leutJatekMano() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Elvarázsolt!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function meghallgatJatekMano() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>Titkos átjáró a kínaiakhoz.</p>' +
            '<button class="gomb" onclick="valaszt(\\'kinai\\')">Tovább</button>';
        }

        function kinai() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="vege">VÉGE! Megettek!</p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        function rozsaszinSzoba() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>Rózsaszín szoba. Van jatekrepulo.</p>' +
            '<button class="gomb" onclick="valaszt(\\'buszallomas\\')">Buszállomásra</button>';
        }

        function buszallomas() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>Buszállomás.</p>' +
            '<button class="gomb" onclick="valaszt(\\'repuloter\\')">Repülőtér</button>';
        }

        function repuloter() {
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p>Repülőtér. Hova utazol?</p>' +
            '<button class="gomb" onclick="papuaUjGuinea()">Pápua-Új Guinea</button>' +
            '<button class="gomb" onclick="magyarorszag()">Magyarország</button>';
        }

        async function papuaUjGuinea() {
          await mentFinish('Guinea a Guineában');
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="gratula">GRATULÁLUNK! Guineaként Guineában!</p>' +
            '<p>Feloldottad: <strong>Guinea a Guineában</strong></p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        async function magyarorszag() {
          await mentFinish('minek pazaroltál erre egymilliót?');
          document.getElementById('jatek-tartalom').innerHTML = 
            '<p class="gratula">GRATULÁLUNK! Mondjuk autóval is jöhettél volna...</p>' +
            '<p>Feloldottad: <strong>minek pazaroltál erre egymilliót?</strong></p>' +
            '<button class="gomb" onclick="ujJatek()">Új Játék</button>';
        }

        async function mentFinish(finishNev) {
          try {
            const response = await fetch('/jatek-mentes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, finishNev })
            });
            const data = await response.json();
            if (data.ujPont) {
              alert('🎉 ÚJ PONT! Összes: ' + data.gyozelemPontok + '/10');
            }
          } catch (error) {
            console.error('Mentés hiba:', error);
          }
        }

        function ujJatek() {
          window.location.href = '/tengerimalac-jatek?session=' + sessionId;
        }
      </script>
    `;
    
    res.send(html);
  } catch (error) {
    res.send(getMenu() + '<p>Hiba történt!</p>');
  }
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
  try {
    if (!jatekAllapotCollection) {
      return res.json({ sikeres: true });
    }
    const { sessionId, jatekosNev } = req.body;
    await jatekAllapotCollection.updateOne(
      { sessionId },
      { $set: { jatekosNev } },
      { upsert: true }
    );
    res.json({ sikeres: true });
  } catch (error) {
    res.json({ sikeres: false });
  }
});

app.post('/jatek-mentes', async (req, res) => {
  try {
    if (!jatekAllapotCollection) {
      return res.json({ sikeres: true, ujPont: false, gyozelemPontok: 0 });
    }
    const { sessionId, finishNev } = req.body;
    let allapot = await jatekAllapotCollection.findOne({ sessionId });
    
    if (!allapot) {
      allapot = { sessionId, finishek: [], gyozelemPontok: 0, jatekosNev: '' };
    }
    
    let ujPont = false;
    if (!allapot.finishek.includes(finishNev)) {
      allapot.finishek.push(finishNev);
      
      const osszesFinish = ['Auchanos malackaja', 'Finom Füge', 'Guinea a Guineában', 'minek pazaroltál erre egymilliót?'];
      const mindMegvan = osszesFinish.every(f => allapot.finishek.includes(f));
      
      if (mindMegvan && allapot.gyozelemPontok < 10) {
        allapot.gyozelemPontok += 1;
        allapot.finishek = [];
        ujPont = true;
      }
      
      await jatekAllapotCollection.updateOne(
        { sessionId },
        { $set: allapot },
        { upsert: true }
      );
    }
    
    res.json({ sikeres: true, ujPont, gyozelemPontok: allapot.gyozelemPontok });
  } catch (error) {
    res.json({ sikeres: false });
  }
});
