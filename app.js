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
  return `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
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
      .profile-link {
        cursor: pointer !important;
      }
      .profile-link:hover {
        background: #667eea !important;
        color: white !important;
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
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
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
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }
      .game-button:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
      }
      .emoji {
        font-size: 40px;
        display: block;
        margin-bottom: 10px;
      }
      
      /* Profil Modal */
      #profile-modal {
        display: none;
        position: fixed;
        z-index: 2000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      #profile-modal.active {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .profile-modal-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .profile-avatar-large {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        margin: 0 auto 20px;
        border: 5px solid #667eea;
        object-fit: cover;
        display: block;
      }
      .profile-avatar-default {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        margin: 0 auto 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 80px;
        font-weight: bold;
        border: 5px solid #667eea;
      }
      .profile-name {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 20px;
      }
      .profile-close {
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 28px;
        cursor: pointer;
        color: #667eea;
        font-weight: bold;
      }
      .profile-close:hover {
        color: #764ba2;
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
    
    <!-- Profil Modal -->
    <div id="profile-modal">
      <div class="profile-modal-content" style="position: relative;">
        <span class="profile-close" onclick="closeProfileModal()">×</span>
        <div id="profile-content"></div>
      </div>
    </div>
    
    <script>
      (function() {
        const bejelentkezve = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
        if (bejelentkezve) {
          const profilkepHTML = bejelentkezve.profilkep 
            ? '<img src="' + bejelentkezve.profilkep + '" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px; object-fit: cover; cursor: pointer;" onclick="openProfileModal()">'
            : '<span style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; line-height: 30px; font-weight: bold; margin-right: 5px; vertical-align: middle; cursor: pointer; font-size: 16px;" onclick="openProfileModal()">' + bejelentkezve.felhasznalonev.charAt(0).toUpperCase() + '</span>';
          
          document.getElementById('auth-menu').innerHTML = 
            profilkepHTML + 
            '<span style="color: #667eea; font-weight: bold; margin-right: 10px;">' + bejelentkezve.felhasznalonev + '</span>' +
            '<a href="/kijelentkezes">🚪 Kilépés</a>';
        }
      })();
      
      window.openProfileModal = function() {
        const userData = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
        if (!userData) return;
        
        const profileImg = userData.profilkep 
          ? '<img src="' + userData.profilkep + '" class="profile-avatar-large" alt="Profilkép">'
          : '<div class="profile-avatar-default">' + userData.felhasznalonev.charAt(0).toUpperCase() + '</div>';
        
        document.getElementById('profile-content').innerHTML = 
          profileImg +
          '<div class="profile-name">' + userData.felhasznalonev + '</div>' +
          '<p style="text-align: center; color: #999;">Üdvözöllek a profilodban! 👋</p>';
        
        document.getElementById('profile-modal').classList.add('active');
      };
      
      window.closeProfileModal = function() {
        document.getElementById('profile-modal').classList.remove('active');
      };
      
      document.getElementById('profile-modal').addEventListener('click', function(e) {
        if (e.target === this) closeProfileModal();
      });
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
        box-shadow: 0 6px 30px rgba(102, 126, 234, 0.8);
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
        width: 30px;
        height: 30px;
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
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .chat-message.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 5px;
      }
      .chat-message.bot {
        background: #2a2a40;
        color: #00d4ff;
        align-self: flex-start;
        border: 1px solid #00d4ff;
        border-bottom-left-radius: 5px;
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
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
      }
      #chatbot-send {
        padding: 12px 20px;
        background: linear-gradient(135deg, #00d4ff 0%, #667eea 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s;
      }
      #chatbot-send:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(0, 212, 255, 0.5);
      }
      #chatbot-messages::-webkit-scrollbar {
        width: 8px;
      }
      #chatbot-messages::-webkit-scrollbar-track {
        background: #1a1a2e;
      }
      #chatbot-messages::-webkit-scrollbar-thumb {
        background: #667eea;
        border-radius: 10px;
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
          } else if (lower.includes('oldal')) {
            return 'Ez egy szuper weboldal amit egy 8 éves programozó csinált! Nézz körül! 🌟';
          } else {
            const responses = [
              'Érdekes kérdés! 🤔 Mondj többet!',
              'Értem! Fejlesztenek engem, hogy még okosabb legyek! 🚀',
              'Demo módban vagyok, de hamarosan teljes Claude AI leszek! 🤖',
              'Figyelek! 👂 Folytasd!',
              'Jó kérdés! Mit gondolsz erről? 💭'
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
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>ℹ️ A weboldalról</h1><p>🛠️ Ezt a weboldalt <strong>apukámmal</strong> (meg az AI-al) csináltam.</p><p>⏰ <strong>NAGYON</strong> sokat dolgoztunk rajta, úgyhogy remélem, tetszik!</p><p>💡 Használtunk <strong>Node.js</strong>-t, <strong>MongoDB</strong>-t és sok-sok HTML, CSS meg JavaScript kódot.</p><p>🚀 Ez az első weboldalam, de remélem még sok mást is fogok csinálni!</p></div>');
});

app.get('/jatekok', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>🎮 Játékok</h1><p style="text-align: center;">Válassz egy játékot és jó szórakozást!</p><div style="text-align: center; margin-top: 30px;">' +
    '<a href="/tengerimalac-jatek" class="game-button"><span class="emoji">🐹</span>Tengerimalac Kaland</a>' +
    '<a href="/tetris" class="game-button"><span class="emoji">🟦</span>Tetris</a>' +
    '<a href="/snake" class="game-button"><span class="emoji">🐍</span>Snake</a>' +
    '<a href="/labirintus" class="game-button"><span class="emoji">🎯</span>Labirintus</a></div></div>');
});

app.get('/bejelentkezes', (req, res) => {
  const html = `
    ${getMenu()}
    ${getStyle()}
    ${getChatbotWidget()}
    <style>
      .login-container {
        max-width: 400px;
        margin: 50px auto;
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      .login-form input {
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        border: 2px solid #667eea;
        border-radius: 8px;
        font-size: 16px;
      }
      .login-btn {
        width: 100%;
        padding: 15px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 10px;
      }
      .login-btn:hover { background: #5568d3; }
      .switch-link {
        text-align: center;
        margin-top: 20px;
        color: #667eea;
      }
      .switch-link a {
        color: #667eea;
        font-weight: bold;
        text-decoration: underline;
      }
    </style>
    <div class="login-container">
      <h1 style="color: #667eea; text-align: center;">🔐 Bejelentkezés</h1>
      <form class="login-form" action="/api/login" method="POST">
        <input type="text" name="felhasznalonev" placeholder="Felhasználónév" required>
        <input type="password" name="jelszo" placeholder="Jelszó" required>
        <button type="submit" class="login-btn">Belépés</button>
      </form>
      <div class="switch-link">
        Nincs még fiókod? <a href="/regisztracio">Regisztrálj itt!</a>
      </div>
    </div>
  `;
  res.send(html);
});

app.get('/regisztracio', (req, res) => {
  const html = `
    ${getMenu()}
    ${getStyle()}
    ${getChatbotWidget()}
    <style>
      .reg-container {
        max-width: 500px;
        margin: 50px auto;
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      .reg-form input {
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        border: 2px solid #667eea;
        border-radius: 8px;
        font-size: 16px;
      }
      .file-input-wrapper {
        margin: 20px 0;
        padding: 20px;
        border: 2px dashed #667eea;
        border-radius: 8px;
        text-align: center;
        cursor: pointer;
      }
      .preview-container { margin: 20px 0; text-align: center; }
      .preview-img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #667eea;
        display: none;
      }
      .default-avatar {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 60px;
        font-weight: bold;
        margin: 0 auto;
      }
      .reg-btn {
        width: 100%;
        padding: 15px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 10px;
      }
      .reg-btn:hover { background: #5568d3; }
      .switch-link {
        text-align: center;
        margin-top: 20px;
        color: #667eea;
      }
      .switch-link a {
        color: #667eea;
        font-weight: bold;
        text-decoration: underline;
      }
      .error-msg {
        color: red;
        text-align: center;
        margin: 10px 0;
        display: none;
      }
    </style>
    <div class="reg-container">
      <h1 style="color: #667eea; text-align: center;">📝 Regisztráció</h1>
      <form class="reg-form" id="regForm" onsubmit="return handleRegister(event)">
        <input type="text" id="felhasznalonev" name="felhasznalonev" placeholder="Felhasználónév" required minlength="3">
        <input type="password" id="jelszo" name="jelszo" placeholder="Jelszó" required minlength="4">
        
        <div class="file-input-wrapper" onclick="document.getElementById('profilkep').click()">
          📷 Kattints ide profilkép feltöltéséhez<br>
          <small>(opcionális, max 500 KB, GIF animációk támogatottak!)</small>
        </div>
        <input type="file" id="profilkep" accept="image/png,image/jpeg,image/gif" style="display: none;" onchange="previewImage(event)">
        
        <div class="preview-container">
          <p><strong>Így fog kinézni:</strong></p>
          <img id="preview" class="preview-img" alt="Előnézet">
          <div id="defaultAvatar" class="default-avatar">?</div>
        </div>
        
        <div class="error-msg" id="errorMsg"></div>
        
        <button type="submit" class="reg-btn">Regisztráció</button>
      </form>
      <div class="switch-link">
        Van már fiókod? <a href="/bejelentkezes">Jelentkezz be itt!</a>
      </div>
    </div>
    
    <script>
      let profilkepData = null;
      
      document.getElementById('felhasznalonev').addEventListener('input', function(e) {
        const nev = e.target.value;
        if (nev && !profilkepData) {
          document.getElementById('defaultAvatar').textContent = nev.charAt(0).toUpperCase();
        }
      });
      
      function previewImage(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.size > 512000) {
          document.getElementById('errorMsg').textContent = '⚠️ A kép túl nagy! Maximum 500 KB lehet.';
          document.getElementById('errorMsg').style.display = 'block';
          event.target.value = '';
          return;
        }
