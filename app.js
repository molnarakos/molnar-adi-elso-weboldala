const express = require('express');
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const app = express();

const port = 3000;
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = 'elso-weboldalam';
let db;
let uzenetekCollection;
let jatekAllapotCollection;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

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
  return `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
        background-attachment: fixed;
      }
      body.custom-bg {
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
      }
      nav {
        background: rgba(255, 255, 255, 0.95);
        padding: 15px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
        text-align: center;
      }
      nav a {
        color: #667eea;
        margin: 10px 15px;
        text-decoration: none;
        font-weight: bold;
        font-size: 18px;
        padding: 10px 20px;
        border-radius: 10px;
        transition: all 0.3s;
        display: inline-block;
      }
      nav a:hover {
        background: #667eea;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      .container {
        max-width: 900px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      h1 {
        color: #667eea;
        font-size: 48px;
        margin-bottom: 20px;
        text-align: center;
      }
      p {
        color: #555;
        font-size: 18px;
        line-height: 1.8;
        margin: 15px 0;
      }
      .game-button {
        display: inline-block;
        font-size: 22px;
        padding: 15px 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 15px;
        margin: 15px;
        transition: all 0.3s;
      }
      .game-button:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
      }
      #profile-panel {
        display: none;
        position: fixed;
        right: 0;
        top: 0;
        width: 450px;
        height: 100vh;
        background: white;
        box-shadow: -5px 0 30px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        overflow-y: auto;
        animation: slideInRight 0.3s ease;
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      #profile-panel.active {
        display: block;
      }
      .profile-panel-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .profile-panel-header h2 {
        margin: 0;
        font-size: 24px;
      }
      .profile-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
      }
      .profile-content {
        padding: 30px;
      }
      .profile-section {
        margin-bottom: 30px;
      }
      .profile-section h3 {
        color: #667eea;
        margin-bottom: 15px;
      }
      .profile-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin: 0 auto 15px;
        border: 4px solid #667eea;
        object-fit: cover;
        display: block;
      }
      .profile-avatar-default {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin: 0 auto 15px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 60px;
        font-weight: bold;
        border: 4px solid #667eea;
      }
      .file-input-wrapper {
        padding: 15px;
        border: 2px dashed #667eea;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        margin: 10px 0;
        transition: all 0.3s;
      }
      .file-input-wrapper:hover {
        background: #f0f0f0;
        border-color: #764ba2;
      }
      .file-input-wrapper input {
        display: none;
      }
      .save-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 10px;
      }
      .save-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }
      .overlay {
        display: none;
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1999;
      }
      .overlay.active {
        display: block;
      }
      .uzenet-media {
        margin: 10px 0;
      }
      .uzenet-img, .uzenet-video {
        max-width: 100%;
        max-height: 300px;
        border-radius: 8px;
      }
      .profile-link {
        cursor: pointer !important;
        display: flex !important;
        align-items: center;
        gap: 8px;
      }
      .profile-link:hover {
        background: #667eea !important;
        color: white !important;
      }
      .profile-pic-nav {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #667eea;
        cursor: pointer;
      }
    </style>
  `;
}

function getMenu() {
  return `
    <nav>
      <a href="/">🏠 Főoldal</a>
      <a href="/rolam">👤 Rólam</a>
      <a href="/a_weboldalrol">ℹ️ A weboldalról</a>
      <a href="/jatekok">🎮 Játékok</a>
      <a href="/uzenofal">💬 Üzenőfal</a>
      <span id="auth-menu">
        <a href="/bejelentkezes">🔐 Bejelentkezés</a>
      </span>
    </nav>
    <div id="profile-overlay" class="overlay"></div>
    <div id="profile-panel">
      <div class="profile-panel-header">
        <h2>👤 Profilom</h2>
        <button class="profile-close-btn" onclick="closeProfilePanel()">×</button>
      </div>
      <div class="profile-content">
        <div class="profile-section">
          <h3>Profilkép</h3>
          <div id="profile-avatar-container"></div>
          <div class="file-input-wrapper" onclick="document.getElementById('panel-profilkep').click()">
            📷 Profilkép megváltoztatása
          </div>
          <input type="file" id="panel-profilkep" accept="image/png,image/jpeg,image/gif" onchange="changeProfilePic(event)">
        </div>
        <div class="profile-section">
          <h3>Háttér</h3>
          <div class="file-input-wrapper" onclick="document.getElementById('panel-hatter').click()">
            🎨 Háttérkép feltöltése
          </div>
          <input type="file" id="panel-hatter" accept="image/png,image/jpeg,image/gif" onchange="changeBackground(event)">
        </div>
        <button class="save-btn" onclick="saveProfileChanges()">💾 Mentés</button>
      </div>
    </div>
    <script>
      let profileData = { profilkep: null, hatter: null };
      
      (function() {
        const bejelentkezve = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
        if (bejelentkezve) {
          profileData = {
            felhasznalonev: bejelentkezve.felhasznalonev,
            profilkep: bejelentkezve.profilkep || null,
            hatter: bejelentkezve.hatter || null
          };
          
          if (bejelentkezve.hatter) {
            document.body.style.backgroundImage = 'url(' + bejelentkezve.hatter + ')';
            document.body.classList.add('custom-bg');
          }
          
          const profilkepHTML = bejelentkezve.profilkep 
            ? '<img src="' + bejelentkezve.profilkep + '" class="profile-pic-nav" onclick="openProfilePanel()" alt="Profilkép">'
            : '<span style="display: inline-block; width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; line-height: 35px; font-weight: bold; cursor: pointer; font-size: 18px;" onclick="openProfilePanel()">' + bejelentkezve.felhasznalonev.charAt(0).toUpperCase() + '</span>';
          
          document.getElementById('auth-menu').innerHTML = 
            '<a class="profile-link" onclick="openProfilePanel()" style="margin: 10px 15px; padding: 10px 20px;">' + profilkepHTML + 
            '<span style="color: #667eea; font-weight: bold; text-decoration: none;">' + bejelentkezve.felhasznalonev + '</span></a>' +
            '<a href="/kijelentkezes">🚪 Kilépés</a>';
        }
      })();
      
      window.openProfilePanel = function() {
        const userData = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
        if (!userData) return;
        
        const avatarContainer = document.getElementById('profile-avatar-container');
        if (profileData.profilkep && profileData.profilkep !== userData.profilkep) {
          avatarContainer.innerHTML = '<img src="' + profileData.profilkep + '" class="profile-avatar" alt="Profilkép">';
        } else if (userData.profilkep) {
          avatarContainer.innerHTML = '<img src="' + userData.profilkep + '" class="profile-avatar" alt="Profilkép">';
        } else {
          avatarContainer.innerHTML = '<div class="profile-avatar-default">' + userData.felhasznalonev.charAt(0).toUpperCase() + '</div>';
        }
        
        document.getElementById('profile-panel').classList.add('active');
        document.getElementById('profile-overlay').classList.add('active');
      };
      
      window.closeProfilePanel = function() {
        document.getElementById('profile-panel').classList.remove('active');
        document.getElementById('profile-overlay').classList.remove('active');
      };
      
      document.getElementById('profile-overlay').addEventListener('click', closeProfilePanel);
      
      window.changeProfilePic = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 512000) {
          alert('⚠️ A kép túl nagy! Maximum 500 KB lehet.');
          event.target.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
          profileData.profilkep = e.target.result;
          document.getElementById('profile-avatar-container').innerHTML = '<img src="' + profileData.profilkep + '" class="profile-avatar" alt="Profilkép">';
        };
        reader.readAsDataURL(file);
      };
      
      window.changeBackground = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2000000) {
          alert('⚠️ A kép túl nagy! Maximum 2 MB lehet.');
          event.target.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
          profileData.hatter = e.target.result;
          document.body.style.backgroundImage = 'url(' + profileData.hatter + ')';
          document.body.classList.add('custom-bg');
        };
        reader.readAsDataURL(file);
      };
      
      window.saveProfileChanges = async function() {
        const userData = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
        if (!userData) return;
        
        try {
          const response = await fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              felhasznalonev: userData.felhasznalonev,
              profilkep: profileData.profilkep || userData.profilkep,
              hatter: profileData.hatter || userData.hatter
            })
          });
          
          const result = await response.json();
          if (result.siker) {
            localStorage.setItem('bejelentkezve', JSON.stringify({
              felhasznalonev: userData.felhasznalonev,
              profilkep: profileData.profilkep || userData.profilkep,
              hatter: profileData.hatter || userData.hatter
            }));
            alert('✅ Profilod sikeresen frissítve!');
            location.reload();
          } else {
            alert('❌ Hiba a mentés közben!');
          }
        } catch (error) {
          alert('❌ Szerver hiba!');
        }
      };
    </script>
  `;
}
function getChatbotWidget() {
  return `
    <style>
      #chatbot-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6);
        font-size: 30px;
        color: white;
        z-index: 1000;
        transition: all 0.3s;
      }
      #chatbot-toggle:hover {
        transform: scale(1.1);
      }
      #chatbot-container {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 500px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        display: none;
        flex-direction: column;
        z-index: 1000;
        border: 2px solid #00d4ff;
      }
      #chatbot-container.active {
        display: flex;
      }
      #chatbot-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 15px;
        border-radius: 18px 18px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #chatbot-header h3 {
        color: white;
        margin: 0;
        font-size: 18px;
      }
      #chatbot-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
      }
      #chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .chat-message {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 15px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .chat-message.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        align-self: flex-end;
      }
      .chat-message.bot {
        background: #2a2a40;
        color: #00d4ff;
        align-self: flex-start;
        border: 1px solid #00d4ff;
      }
      #chatbot-input-container {
        padding: 15px;
        background: #16213e;
        border-radius: 0 0 18px 18px;
        display: flex;
        gap: 10px;
      }
      #chatbot-input {
        flex: 1;
        padding: 12px;
        border: 2px solid #00d4ff;
        border-radius: 10px;
        background: #1a1a2e;
        color: white;
        font-size: 14px;
      }
      #chatbot-input:focus {
        outline: none;
        border-color: #667eea;
      }
      #chatbot-send {
        padding: 12px 20px;
        background: linear-gradient(135deg, #00d4ff 0%, #667eea 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
      }
      #chatbot-send:hover {
        transform: scale(1.05);
      }
    </style>
    
    <button id="chatbot-toggle">🤖</button>
    
    <div id="chatbot-container">
      <div id="chatbot-header">
        <h3>💬 Claude AI</h3>
        <button id="chatbot-close">×</button>
      </div>
      <div id="chatbot-messages">
        <div class="chat-message bot">
          Szia! 👋 Claude vagyok, az AI asszisztensed! Miben segíthetek?
        </div>
      </div>
      <div id="chatbot-input-container">
        <input type="text" id="chatbot-input" placeholder="Írj egy üzenetet...">
        <button id="chatbot-send">Küld</button>
      </div>
    </div>
    
    <script>
      (function() {
        const toggle = document.getElementById('chatbot-toggle');
        const container = document.getElementById('chatbot-container');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        const messages = document.getElementById('chatbot-messages');
        
        toggle.addEventListener('click', () => {
          container.classList.toggle('active');
        });
        
        close.addEventListener('click', () => {
          container.classList.remove('active');
        });
        
        function addMessage(text, isUser) {
          const msg = document.createElement('div');
          msg.className = 'chat-message ' + (isUser ? 'user' : 'bot');
          msg.textContent = text;
          messages.appendChild(msg);
          messages.scrollTop = messages.scrollHeight;
        }
        
        function getBotResponse(userMessage) {
          const lower = userMessage.toLowerCase();
          
          if (lower.includes('szia') || lower.includes('hello') || lower.includes('helló')) {
            return 'Szia! 😊 Miben segíthetek ma?';
          } else if (lower.includes('hogy vagy')) {
            return 'Nagyon jól vagyok, köszönöm! 🤖 És te?';
          } else if (lower.includes('ki vagy')) {
            return 'Claude vagyok, egy AI asszisztens! Az Anthropic készített. 🧠';
          } else if (lower.includes('segít')) {
            return 'Persze! Segíthetek programozásban, kérdésekre válaszolni, vagy csak beszélgetni! 💬';
          } else if (lower.includes('kösz') || lower.includes('köszön')) {
            return 'Szívesen! 😊 Bármikor!';
          } else if (lower.includes('viszlát') || lower.includes('bye')) {
            return 'Viszlát! Jó napot! 👋';
          } else if (lower.includes('játék') || lower.includes('game')) {
            return 'Próbáld ki a Tengerimalac Kaland játékot! 🐹 Vagy a többi játékot a Játékok menüben! 🎮';
          } else {
            const responses = [
              'Érdekes kérdés! 🤔 Mondj többet!',
              'Értem! 💡 Folytasd!',
              'Nagyon jó! 🚀 Mit gondolsz erről?',
              'Figyelek! 👂 Mondj még!',
              'Jó kérdés! 💭'
            ];
            return responses[Math.floor(Math.random() * responses.length)];
          }
        }
        
        function handleSend() {
          const text = input.value.trim();
          if (!text) return;
          
          addMessage(text, true);
          input.value = '';
          
          setTimeout(() => {
            const response = getBotResponse(text);
            addMessage(response, false);
          }, 500);
        }
        
        send.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') handleSend();
        });
      })();
    </script>
  `;
}

app.get('/', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>🌟 Üdvözöllek a weboldalamon!</h1><p style="text-align: center; font-size: 20px;">Használd a menüt fent, hogy felfedezd az oldalaimat!</p></div>');
});

app.get('/rolam', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>👦 Rólam</h1><p>🎂 <strong>Én egy 8 éves gyerek vagyok</strong>, és a kedvenc hobbim a <strong>programozás</strong>!</p><p>💻 Imádok számítógépezni és új dolgokat tanulni. Ez a weboldal az első projektem, amit apukámmal együtt csináltunk.</p><p>🎮 Készítettem játékokat is, próbáld ki őket a Játékok menüpontban!</p><p>😊 Nagyon örülök, hogy meglátogattad a weboldalt! Remélem tetszik!</p></div>');
});

app.get('/a_weboldalrol', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>ℹ️ A weboldalról</h1><p>🛠️ Ezt a weboldalt <strong>apukámmal</strong> csináltam.</p><p>⏰ <strong>NAGYON</strong> sokat dolgoztunk rajta, úgyhogy remélem, tetszik!</p><p>💡 Használtunk <strong>Node.js</strong>-t, <strong>MongoDB</strong>-t és sok-sok HTML, CSS meg JavaScript kódot.</p><p>🚀 Ez az első weboldalam, de remélem még sok mást is fogok csinálni!</p></div>');
});

app.get('/jatekok', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>🎮 Játékok</h1><p style="text-align: center;">Válassz egy játékot és jó szórakozást!</p><div style="text-align: center; margin-top: 30px;"><a href="/tengerimalac-jatek" class="game-button">🐹 Tengerimalac Kaland</a><a href="/tetris" class="game-button">🟦 Tetris</a><a href="/snake" class="game-button">🐍 Snake</a><a href="/labirintus" class="game-button">🎯 Labirintus</a></div></div>');
});

app.get('/bejelentkezes', (req, res) => {
  const html = `${getMenu()}${getStyle()}${getChatbotWidget()}<style>.login-container { max-width: 400px; margin: 50px auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); } .login-form input { width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #667eea; border-radius: 8px; font-size: 16px; } .login-btn { width: 100%; padding: 15px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 10px; } .login-btn:hover { background: #5568d3; } .switch-link { text-align: center; margin-top: 20px; color: #667eea; } .switch-link a { color: #667eea; font-weight: bold; text-decoration: underline; }</style><div class="login-container"><h1 style="color: #667eea; text-align: center;">🔐 Bejelentkezés</h1><form class="login-form" action="/api/login" method="POST"><input type="text" name="felhasznalonev" placeholder="Felhasználónév" required><input type="password" name="jelszo" placeholder="Jelszó" required><button type="submit" class="login-btn">Belépés</button></form><div class="switch-link">Nincs még fiókod? <a href="/regisztracio">Regisztrálj itt!</a></div></div>`;
  res.send(html);
});

app.get('/regisztracio', (req, res) => {
  const html = `${getMenu()}${getStyle()}${getChatbotWidget()}<style>.reg-container { max-width: 500px; margin: 50px auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); } .reg-form input { width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #667eea; border-radius: 8px; font-size: 16px; } .file-input-wrapper { margin: 20px 0; padding: 20px; border: 2px dashed #667eea; border-radius: 8px; text-align: center; cursor: pointer; } .preview-img { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea; display: none; margin: 20px auto; } .default-avatar { width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 60px; font-weight: bold; margin: 20px auto; } .reg-btn { width: 100%; padding: 15px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 10px; } .reg-btn:hover { background: #5568d3; } .error-msg { color: red; text-align: center; margin: 10px 0; display: none; }</style><div class="reg-container"><h1 style="color: #667eea; text-align: center;">📝 Regisztráció</h1><form class="reg-form" id="regForm" onsubmit="return handleRegister(event)"><input type="text" id="felhasznalonev" name="felhasznalonev" placeholder="Felhasználónév" required minlength="3"><input type="password" id="jelszo" name="jelszo" placeholder="Jelszó" required minlength="4"><div class="file-input-wrapper" onclick="document.getElementById('profilkep').click()">📷 Kattints ide profilkép feltöltéséhez<br><small>(opcionális, max 500 KB)</small></div><input type="file" id="profilkep" accept="image/png,image/jpeg,image/gif" style="display: none;" onchange="previewImage(event)"><p style="text-align: center; margin: 20px 0; color: #667eea; font-weight: bold;">Így fog kinézni:</p><img id="preview" class="preview-img" alt="Előnézet"><div id="defaultAvatar" class="default-avatar">?</div><div class="error-msg" id="errorMsg"></div><button type="submit" class="reg-btn">Regisztráció</button></form><div style="text-align: center; margin-top: 20px; color: #667eea;"><p>Van már fiókod? <a href="/bejelentkezes" style="color: #667eea; font-weight: bold; text-decoration: underline;">Jelentkezz be itt!</a></p></div></div><script>let profilkepData = null; document.getElementById('felhasznalonev').addEventListener('input', function(e) { const nev = e.target.value; if (nev && !profilkepData) { document.getElementById('defaultAvatar').textContent = nev.charAt(0).toUpperCase(); } }); function previewImage(event) { const file = event.target.files[0]; if (!file) return; if (file.size > 512000) { document.getElementById('errorMsg').textContent = '⚠️ A kép túl nagy! Maximum 500 KB lehet.'; document.getElementById('errorMsg').style.display = 'block'; event.target.value = ''; return; } document.getElementById('errorMsg').style.display = 'none'; const reader = new FileReader(); reader.onload = function(e) { profilkepData = e.target.result; document.getElementById('preview').src = profilkepData; document.getElementById('preview').style.display = 'block'; document.getElementById('defaultAvatar').style.display = 'none'; }; reader.readAsDataURL(file); } async function handleRegister(event) { event.preventDefault(); const felhasznalonev = document.getElementById('felhasznalonev').value; const jelszo = document.getElementById('jelszo').value; const data = { felhasznalonev, jelszo, profilkep: profilkepData }; try { const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (result.siker) { alert('✅ Sikeres regisztráció! Most bejelentkezhetsz.'); window.location.href = '/bejelentkezes'; } else { document.getElementById('errorMsg').textContent = '❌ ' + result.uzenet; document.getElementById('errorMsg').style.display = 'block'; } } catch (error) { document.getElementById('errorMsg').textContent = '❌ Hiba történt!'; document.getElementById('errorMsg').style.display = 'block'; } return false; }</script>`;
  res.send(html);
});

app.post('/api/register', async (req, res) => {
  try {
    const { felhasznalonev, jelszo, profilkep } = req.body;
    const letezik = await db.collection('users').findOne({ felhasznalonev });
    
    if (letezik) {
      return res.json({ siker: false, uzenet: 'Ez a felhasználónév már foglalt!' });
    }
    
    const ujFelhasznalo = {
      felhasznalonev,
      jelszo,
      profilkep: profilkep || null,
      hatter: null,
      letrehozva: new Date()
    };
    
    await db.collection('users').insertOne(ujFelhasznalo);
    console.log('Új felhasználó regisztrálva:', felhasznalonev);
    res.json({ siker: true });
  } catch (error) {
    console.error('Regisztrációs hiba:', error);
    res.json({ siker: false, uzenet: 'Szerver hiba történt!' });
  }
});

app.post('/api/update-profile', async (req, res) => {
  try {
    const { felhasznalonev, profilkep, hatter } = req.body;
    await db.collection('users').updateOne(
      { felhasznalonev },
      { $set: { profilkep: profilkep || null, hatter: hatter || null } }
    );
    res.json({ siker: true });
  } catch (error) {
    console.error('Profil frissítési hiba:', error);
    res.json({ siker: false });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { felhasznalonev, jelszo } = req.body;
    const felhasznalo = await db.collection('users').findOne({ felhasznalonev, jelszo });
    
    if (!felhasznalo) {
      return res.send(getMenu() + getStyle() + getChatbotWidget() + '<div class="container"><h1 style="color: red;">❌ Sikertelen bejelentkezés!</h1><p>Hibás felhasználónév vagy jelszó.</p><a href="/bejelentkezes" style="color: #667eea; font-weight: bold;">← Próbáld újra</a></div>');
    }
    
    res.send(`${getMenu()}${getStyle()}${getChatbotWidget()}<div class="container"><h1 style="color: green;">✅ Sikeres bejelentkezés!</h1><p>Üdvözöllek, <strong>${felhasznalo.felhasznalonev}</strong>!</p><p>Átirányítás...</p></div><script>localStorage.setItem('bejelentkezve', JSON.stringify({ felhasznalonev: '${felhasznalo.felhasznalonev}', profilkep: ${felhasznalo.profilkep ? `'${felhasznalo.profilkep.replace(/'/g, "\\'")}'` : 'null'}, hatter: ${felhasznalo.hatter ? `'${felhasznalo.hatter.replace(/'/g, "\\'")}'` : 'null'} })); setTimeout(() => { window.location.href = '/'; }, 1500);</script>`);
  } catch (error) {
    console.error('Bejelentkezési hiba:', error);
    res.send(getMenu() + getStyle() + getChatbotWidget() + '<div class="container"><h1 style="color: red;">❌ Hiba történt!</h1></div>');
  }
});

app.get('/kijelentkezes', (req, res) => {
  res.send(`${getMenu()}${getStyle()}${getChatbotWidget()}<div class="container"><h1 style="color: #667eea;">👋 Kijelentkezés...</h1></div><script>localStorage.removeItem('bejelentkezve'); setTimeout(() => { window.location.href = '/'; }, 1000);</script>`);
});
function getChatbotWidget() {
  return `
    <style>
      #chatbot-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6);
        font-size: 30px;
        color: white;
        z-index: 1000;
        transition: all 0.3s;
      }
      #chatbot-toggle:hover {
        transform: scale(1.1);
      }
      #chatbot-container {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 500px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        display: none;
        flex-direction: column;
        z-index: 1000;
        border: 2px solid #00d4ff;
      }
      #chatbot-container.active {
        display: flex;
      }
      #chatbot-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 15px;
        border-radius: 18px 18px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #chatbot-header h3 {
        color: white;
        margin: 0;
        font-size: 18px;
      }
      #chatbot-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
      }
      #chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .chat-message {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 15px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .chat-message.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        align-self: flex-end;
      }
      .chat-message.bot {
        background: #2a2a40;
        color: #00d4ff;
        align-self: flex-start;
        border: 1px solid #00d4ff;
      }
      #chatbot-input-container {
        padding: 15px;
        background: #16213e;
        border-radius: 0 0 18px 18px;
        display: flex;
        gap: 10px;
      }
      #chatbot-input {
        flex: 1;
        padding: 12px;
        border: 2px solid #00d4ff;
        border-radius: 10px;
        background: #1a1a2e;
        color: white;
        font-size: 14px;
      }
      #chatbot-input:focus {
        outline: none;
        border-color: #667eea;
      }
      #chatbot-send {
        padding: 12px 20px;
        background: linear-gradient(135deg, #00d4ff 0%, #667eea 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
      }
      #chatbot-send:hover {
        transform: scale(1.05);
      }
    </style>
    
    <button id="chatbot-toggle">🤖</button>
    
    <div id="chatbot-container">
      <div id="chatbot-header">
        <h3>💬 Claude AI</h3>
        <button id="chatbot-close">×</button>
      </div>
      <div id="chatbot-messages">
        <div class="chat-message bot">
          Szia! 👋 Claude vagyok, az AI asszisztensed! Miben segíthetek?
        </div>
      </div>
      <div id="chatbot-input-container">
        <input type="text" id="chatbot-input" placeholder="Írj egy üzenetet...">
        <button id="chatbot-send">Küld</button>
      </div>
    </div>
    
    <script>
      (function() {
        const toggle = document.getElementById('chatbot-toggle');
        const container = document.getElementById('chatbot-container');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        const messages = document.getElementById('chatbot-messages');
        
        toggle.addEventListener('click', () => {
          container.classList.toggle('active');
        });
        
        close.addEventListener('click', () => {
          container.classList.remove('active');
        });
        
        function addMessage(text, isUser) {
          const msg = document.createElement('div');
          msg.className = 'chat-message ' + (isUser ? 'user' : 'bot');
          msg.textContent = text;
          messages.appendChild(msg);
          messages.scrollTop = messages.scrollHeight;
        }
        
        function getBotResponse(userMessage) {
          const lower = userMessage.toLowerCase();
          
          if (lower.includes('szia') || lower.includes('hello') || lower.includes('helló')) {
            return 'Szia! 😊 Miben segíthetek ma?';
          } else if (lower.includes('hogy vagy')) {
            return 'Nagyon jól vagyok, köszönöm! 🤖 És te?';
          } else if (lower.includes('ki vagy')) {
            return 'Claude vagyok, egy AI asszisztens! Az Anthropic készített. 🧠';
          } else if (lower.includes('segít')) {
            return 'Persze! Segíthetek programozásban, kérdésekre válaszolni, vagy csak beszélgetni! 💬';
          } else if (lower.includes('kösz') || lower.includes('köszön')) {
            return 'Szívesen! 😊 Bármikor!';
          } else if (lower.includes('viszlát') || lower.includes('bye')) {
            return 'Viszlát! Jó napot! 👋';
          } else if (lower.includes('játék') || lower.includes('game')) {
            return 'Próbáld ki a Tengerimalac Kaland játékot! 🐹 Vagy a többi játékot a Játékok menüben! 🎮';
          } else {
            const responses = [
              'Érdekes kérdés! 🤔 Mondj többet!',
              'Értem! 💡 Folytasd!',
              'Nagyon jó! 🚀 Mit gondolsz erről?',
              'Figyelek! 👂 Mondj még!',
              'Jó kérdés! 💭'
            ];
            return responses[Math.floor(Math.random() * responses.length)];
          }
        }
        
        function handleSend() {
          const text = input.value.trim();
          if (!text) return;
          
          addMessage(text, true);
          input.value = '';
          
          setTimeout(() => {
            const response = getBotResponse(text);
            addMessage(response, false);
          }, 500);
        }
        
        send.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') handleSend();
        });
      })();
    </script>
  `;
}

app.get('/', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>🌟 Üdvözöllek a weboldalamon!</h1><p style="text-align: center; font-size: 20px;">Használd a menüt fent, hogy felfedezd az oldalaimat!</p></div>');
});

app.get('/rolam', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>👦 Rólam</h1><p>🎂 <strong>Én egy 8 éves gyerek vagyok</strong>, és a kedvenc hobbim a <strong>programozás</strong>!</p><p>💻 Imádok számítógépezni és új dolgokat tanulni. Ez a weboldal az első projektem, amit apukámmal együtt csináltunk.</p><p>🎮 Készítettem játékokat is, próbáld ki őket a Játékok menüpontban!</p><p>😊 Nagyon örülök, hogy meglátogattad a weboldalt! Remélem tetszik!</p></div>');
});

app.get('/a_weboldalrol', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>ℹ️ A weboldalról</h1><p>🛠️ Ezt a weboldalt <strong>apukámmal</strong> csináltam.</p><p>⏰ <strong>NAGYON</strong> sokat dolgoztunk rajta, úgyhogy remélem, tetszik!</p><p>💡 Használtunk <strong>Node.js</strong>-t, <strong>MongoDB</strong>-t és sok-sok HTML, CSS meg JavaScript kódot.</p><p>🚀 Ez az első weboldalam, de remélem még sok mást is fogok csinálni!</p></div>');
});

app.get('/jatekok', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>🎮 Játékok</h1><p style="text-align: center;">Válassz egy játékot és jó szórakozást!</p><div style="text-align: center; margin-top: 30px;"><a href="/tengerimalac-jatek" class="game-button">🐹 Tengerimalac Kaland</a><a href="/tetris" class="game-button">🟦 Tetris</a><a href="/snake" class="game-button">🐍 Snake</a><a href="/labirintus" class="game-button">🎯 Labirintus</a></div></div>');
});

app.get('/bejelentkezes', (req, res) => {
  const html = `${getMenu()}${getStyle()}${getChatbotWidget()}<style>.login-container { max-width: 400px; margin: 50px auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); } .login-form input { width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #667eea; border-radius: 8px; font-size: 16px; } .login-btn { width: 100%; padding: 15px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 10px; } .login-btn:hover { background: #5568d3; } .switch-link { text-align: center; margin-top: 20px; color: #667eea; } .switch-link a { color: #667eea; font-weight: bold; text-decoration: underline; }</style><div class="login-container"><h1 style="color: #667eea; text-align: center;">🔐 Bejelentkezés</h1><form class="login-form" action="/api/login" method="POST"><input type="text" name="felhasznalonev" placeholder="Felhasználónév" required><input type="password" name="jelszo" placeholder="Jelszó" required><button type="submit" class="login-btn">Belépés</button></form><div class="switch-link">Nincs még fiókod? <a href="/regisztracio">Regisztrálj itt!</a></div></div>`;
  res.send(html);
});

app.get('/regisztracio', (req, res) => {
  const html = `${getMenu()}${getStyle()}${getChatbotWidget()}<style>.reg-container { max-width: 500px; margin: 50px auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); } .reg-form input { width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #667eea; border-radius: 8px; font-size: 16px; } .file-input-wrapper { margin: 20px 0; padding: 20px; border: 2px dashed #667eea; border-radius: 8px; text-align: center; cursor: pointer; } .preview-img { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea; display: none; margin: 20px auto; } .default-avatar { width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 60px; font-weight: bold; margin: 20px auto; } .reg-btn { width: 100%; padding: 15px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 10px; } .reg-btn:hover { background: #5568d3; } .error-msg { color: red; text-align: center; margin: 10px 0; display: none; }</style><div class="reg-container"><h1 style="color: #667eea; text-align: center;">📝 Regisztráció</h1><form class="reg-form" id="regForm" onsubmit="return handleRegister(event)"><input type="text" id="felhasznalonev" name="felhasznalonev" placeholder="Felhasználónév" required minlength="3"><input type="password" id="jelszo" name="jelszo" placeholder="Jelszó" required minlength="4"><div class="file-input-wrapper" onclick="document.getElementById('profilkep').click()">📷 Kattints ide profilkép feltöltéséhez<br><small>(opcionális, max 500 KB)</small></div><input type="file" id="profilkep" accept="image/png,image/jpeg,image/gif" style="display: none;" onchange="previewImage(event)"><p style="text-align: center; margin: 20px 0; color: #667eea; font-weight: bold;">Így fog kinézni:</p><img id="preview" class="preview-img" alt="Előnézet"><div id="defaultAvatar" class="default-avatar">?</div><div class="error-msg" id="errorMsg"></div><button type="submit" class="reg-btn">Regisztráció</button></form><div style="text-align: center; margin-top: 20px; color: #667eea;"><p>Van már fiókod? <a href="/bejelentkezes" style="color: #667eea; font-weight: bold; text-decoration: underline;">Jelentkezz be itt!</a></p></div></div><script>let profilkepData = null; document.getElementById('felhasznalonev').addEventListener('input', function(e) { const nev = e.target.value; if (nev && !profilkepData) { document.getElementById('defaultAvatar').textContent = nev.charAt(0).toUpperCase(); } }); function previewImage(event) { const file = event.target.files[0]; if (!file) return; if (file.size > 512000) { document.getElementById('errorMsg').textContent = '⚠️ A kép túl nagy! Maximum 500 KB lehet.'; document.getElementById('errorMsg').style.display = 'block'; event.target.value = ''; return; } document.getElementById('errorMsg').style.display = 'none'; const reader = new FileReader(); reader.onload = function(e) { profilkepData = e.target.result; document.getElementById('preview').src = profilkepData; document.getElementById('preview').style.display = 'block'; document.getElementById('defaultAvatar').style.display = 'none'; }; reader.readAsDataURL(file); } async function handleRegister(event) { event.preventDefault(); const felhasznalonev = document.getElementById('felhasznalonev').value; const jelszo = document.getElementById('jelszo').value; const data = { felhasznalonev, jelszo, profilkep: profilkepData }; try { const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (result.siker) { alert('✅ Sikeres regisztráció! Most bejelentkezhetsz.'); window.location.href = '/bejelentkezes'; } else { document.getElementById('errorMsg').textContent = '❌ ' + result.uzenet; document.getElementById('errorMsg').style.display = 'block'; } } catch (error) { document.getElementById('errorMsg').textContent = '❌ Hiba történt!'; document.getElementById('errorMsg').style.display = 'block'; } return false; }</script>`;
  res.send(html);
});

app.post('/api/register', async (req, res) => {
  try {
    const { felhasznalonev, jelszo, profilkep } = req.body;
    const letezik = await db.collection('users').findOne({ felhasznalonev });
    
    if (letezik) {
      return res.json({ siker: false, uzenet: 'Ez a felhasználónév már foglalt!' });
    }
    
    const ujFelhasznalo = {
      felhasznalonev,
      jelszo,
      profilkep: profilkep || null,
      hatter: null,
      letrehozva: new Date()
    };
    
    await db.collection('users').insertOne(ujFelhasznalo);
    console.log('Új felhasználó regisztrálva:', felhasznalonev);
    res.json({ siker: true });
  } catch (error) {
    console.error('Regisztrációs hiba:', error);
    res.json({ siker: false, uzenet: 'Szerver hiba történt!' });
  }
});

app.post('/api/update-profile', async (req, res) => {
  try {
    const { felhasznalonev, profilkep, hatter } = req.body;
    await db.collection('users').updateOne(
      { felhasznalonev },
      { $set: { profilkep: profilkep || null, hatter: hatter || null } }
    );
    res.json({ siker: true });
  } catch (error) {
    console.error('Profil frissítési hiba:', error);
    res.json({ siker: false });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { felhasznalonev, jelszo } = req.body;
    const felhasznalo = await db.collection('users').findOne({ felhasznalonev, jelszo });
    
    if (!felhasznalo) {
      return res.send(getMenu() + getStyle() + getChatbotWidget() + '<div class="container"><h1 style="color: red;">❌ Sikertelen bejelentkezés!</h1><p>Hibás felhasználónév vagy jelszó.</p><a href="/bejelentkezes" style="color: #667eea; font-weight: bold;">← Próbáld újra</a></div>');
    }
    
    res.send(`${getMenu()}${getStyle()}${getChatbotWidget()}<div class="container"><h1 style="color: green;">✅ Sikeres bejelentkezés!</h1><p>Üdvözöllek, <strong>${felhasznalo.felhasznalonev}</strong>!</p><p>Átirányítás...</p></div><script>localStorage.setItem('bejelentkezve', JSON.stringify({ felhasznalonev: '${felhasznalo.felhasznalonev}', profilkep: ${felhasznalo.profilkep ? `'${felhasznalo.profilkep.replace(/'/g, "\\'")}'` : 'null'}, hatter: ${felhasznalo.hatter ? `'${felhasznalo.hatter.replace(/'/g, "\\'")}'` : 'null'} })); setTimeout(() => { window.location.href = '/'; }, 1500);</script>`);
  } catch (error) {
    console.error('Bejelentkezési hiba:', error);
    res.send(getMenu() + getStyle() + getChatbotWidget() + '<div class="container"><h1 style="color: red;">❌ Hiba történt!</h1></div>');
  }
});

app.get('/kijelentkezes', (req, res) => {
  res.send(`${getMenu()}${getStyle()}${getChatbotWidget()}<div class="container"><h1 style="color: #667eea;">👋 Kijelentkezés...</h1></div><script>localStorage.removeItem('bejelentkezve'); setTimeout(() => { window.location.href = '/'; }, 1000);</script>`);
});
