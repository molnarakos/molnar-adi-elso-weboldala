// ============================================
// ÖSSZES REQUIRE AZ ELEJÉN
// ============================================
const express = require('express');
const { MongoClient } = require('mongodb');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();

// ============================================
// KONFIGURÁCIÓ
// ============================================
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = 'elso-weboldalam';
let db;
let uzenetekCollection;
let jatekAllapotCollection;
let chatHistories = {};

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.urlencoded({ extended: true, limit: '10tb' }));
app.use(express.json({ limit: '10tb' }));

// ============================================
// SERVER INDÍTÁS
// ============================================
app.listen(port, '0.0.0.0', () => {
  console.log(`Az oldal fut a porton: ${port}`);
});

// ============================================
// MONGODB CSATLAKOZÁS
// ============================================
MongoClient.connect(mongoUrl)
  .then(client => {
    console.log('Sikeresen csatlakoztunk a MongoDB-hez!');
    db = client.db(dbName);
    uzenetekCollection = db.collection('uzenetek');
    jatekAllapotCollection = db.collection('jatek_allapot');
    scheduleMessageWallReset();
  })
  .catch(error => {
    console.error('MongoDB kapcsolódási hiba:', error);
    console.log('Az oldal MongoDB nélkül fut.');
  });

// ============================================
// ÜZENŐFAL RESETELÉS FÜGGVÉNY
// ============================================
function scheduleMessageWallReset() {
  schedule.scheduleJob('0 0 * * *', async () => {
    try {
      const deletedCount = await uzenetekCollection.deleteMany({});
      console.log(`✅ Üzenőfal resetelve! ${deletedCount.deletedCount} üzenet törölve. Idő: ${new Date().toLocaleString('hu-HU')}`);
    } catch (error) {
      console.error('❌ Hiba az üzenőfal resetelése közben:', error);
    }
  });
  console.log('📅 Üzenőfal reset ütemezve minden nap 00:00-kor');
}

// ============================================
// STYLE FÜGGVÉNY
// ============================================
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
      }
    </style>
  `;
}

// ============================================
// MENU FÜGGVÉNY
// ============================================
function getMenu() {
  return `
    <nav>
      <a href="/">🏠 Főoldal</a>
      <a href="/rolam">👤 Rólam</a>
      <a href="/a_weboldalrol">ℹ️ A weboldalról</a>
      <a href="/jatekok">🎮 Játékok</a>
      <a href="/uzenofal">💬 Üzenőfal</a>
      <a href="/letoltes">📥 Letöltés</a>
      <a href="/chat">💬 AI Chatbot</a>
      <span id="auth-menu">
        <a href="/bejelentkezes">🔐 Bejelentkezés</a>
      </span>
    </nav>
    <script>
      (function() {
        const bejelentkezve = JSON.parse(localStorage.getItem('bejelentkezve') || 'null');
        if (bejelentkezve) {
          const profilkepHTML = bejelentkezve.profilkep 
            ? '<img src="' + bejelentkezve.profilkep + '" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px; object-fit: cover;">'
            : '<span style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; line-height: 30px; font-weight: bold; margin-right: 5px;">' + bejelentkezve.felhasznalonev.charAt(0).toUpperCase() + '</span>';
          
          document.getElementById('auth-menu').innerHTML = 
            profilkepHTML + 
            '<span style="color: #667eea; font-weight: bold; margin-right: 10px;">' + bejelentkezve.felhasznalonev + '</span>' +
            '<a href="/profil">👤 Profil</a>' +
            '<a href="/kijelentkezes">🚪 Kilépés</a>';
        }
      })();
    </script>
  `;
}

// ============================================
// CHATBOT WIDGET FÜGGVÉNY
// ============================================
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
        font-size: 30px;
        z-index: 1000;
      }
    </style>
    <button id="chatbot-toggle" onclick="alert('🤖 Chatbot demo!')">🤖</button>
  `;
}
// ============================================
// GET ROUTES
// ============================================
app.get('/', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>🌟 Üdvözöllek!</h1><p style="text-align: center; font-size: 20px;">Fedezd fel az oldalaimat!</p></div>');
});

app.get('/rolam', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>👦 Rólam</h1><p>🎂 Én egy 8 éves gyerek vagyok és a kedvenc hobbim a programozás!</p><p>💻 Imádok számítógépezni és új dolgokat tanulni!</p><p>🎮 Ez az első weboldalam!</p></div>');
});

app.get('/a_weboldalrol', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>ℹ️ A weboldalról</h1><p>🛠️ Ezt a weboldalt apukámmal és az AI-al csináltam.</p><p>💡 Használtunk Node.js-t, MongoDB-t és sok HTML, CSS meg JavaScript kódot.</p><p>🚀 Ez az első weboldalam!</p></div>');
});

app.get('/jatekok', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>🎮 Játékok</h1><p style="text-align: center;">Hamarosan érkeznek!</p></div>');
});

app.get('/bejelentkezes', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>🔐 Bejelentkezés</h1><p>Hamarosan elérhető!</p></div>');
});

app.get('/kijelentkezes', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>👋 Kijelentkezés...</h1></div><script>localStorage.removeItem("bejelentkezve"); setTimeout(() => { window.location.href = "/"; }, 1000);</script>');
});

app.get('/profil', (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>👤 Profil</h1><p>Profil oldal - Teljes verzió!</p></div>');
});

// ============================================
// LETÖLTÉS OLDAL
// ============================================
app.get('/letoltes', (req, res) => {
  const html = `
    ${getStyle()}
    ${getMenu()}
    ${getChatbotWidget()}
    <style>
      .download-container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      .versions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 40px;
      }
      .version-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px;
        border-radius: 20px;
        color: white;
        text-align: center;
        transition: all 0.3s;
      }
      .version-card:hover {
        transform: translateY(-10px);
      }
      .version-card h2 {
        font-size: 32px;
        margin-bottom: 15px;
      }
      .version-card .emoji {
        font-size: 60px;
        margin-bottom: 20px;
      }
      .features-list {
        text-align: left;
        margin: 25px 0;
        padding: 20px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        font-size: 14px;
      }
      .features-list li {
        margin: 8px 0;
        list-style: none;
        padding-left: 25px;
      }
      .features-list li:before {
        content: "✓ ";
        font-weight: bold;
      }
      .download-btn {
        padding: 15px 40px;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 10px;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
        transition: all 0.3s;
      }
      .download-btn:hover {
        transform: scale(1.05);
      }
      .comparison-table {
        width: 100%;
        margin-top: 30px;
        border-collapse: collapse;
      }
      .comparison-table th,
      .comparison-table td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      .comparison-table th {
        background: #667eea;
        color: white;
      }
      .check { color: green; font-weight: bold; }
      .cross { color: #ccc; font-weight: bold; }
    </style>
    
    <div class="download-container">
      <div style="text-align: center; margin-bottom: 50px;">
        <h1>📥 Letöltések</h1>
        <p>Válassz verzió között!</p>
      </div>
      
      <div class="versions-grid">
        <div class="version-card">
          <div class="emoji">🌐</div>
          <h2>Web Demo</h2>
          <p>Böngészőben használható verzió</p>
          <ul class="features-list">
            <li>AI Chatbot</li>
            <li>Felhasználók kezelés</li>
            <li>Üzenőfal</li>
            <li>Játékok</li>
          </ul>
          <button class="download-btn" onclick="alert('Már használod! 🎉')">Már használod</button>
        </div>
        
        <div class="version-card">
          <div class="emoji">💻</div>
          <h2>Desktop App</h2>
          <p>Teljes verzió Windows/Mac/Linux-ra</p>
          <ul class="features-list">
            <li>Teljes AI Chatbot</li>
            <li>Profilok kezelése</li>
            <li>Offline mód</li>
            <li>Összes játék</li>
          </ul>
          <a href="/api/download-app" class="download-btn">Letöltés (v1.0)</a>
        </div>
      </div>
      
      <h2 style="color: #667eea; margin-top: 50px;">📊 Verzió Összehasonlítás</h2>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Funkció</th>
            <th>Web Demo</th>
            <th>Desktop App</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>AI Chatbot</td>
            <td><span class="check">✓</span></td>
            <td><span class="check">✓</span></td>
          </tr>
          <tr>
            <td>Profilkezelés</td>
            <td><span class="cross">✗</span></td>
            <td><span class="check">✓</span></td>
          </tr>
          <tr>
            <td>Offline Mód</td>
            <td><span class="cross">✗</span></td>
            <td><span class="check">✓</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  res.send(html);
});

// ============================================
// DESKTOP APP LETÖLTÉS API
// ============================================
app.get('/api/download-app', (req, res) => {
  try {
    const filename = 'elso-weboldalam-app-v1.0.zip';
    const filepath = path.join(__dirname, filename);
    
    const output = fs.createWriteStream(filepath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      res.download(filepath, filename, (err) => {
        if (err) console.error('Download hiba:', err);
        fs.unlink(filepath, (unlinkErr) => {
          if (unlinkErr) console.error('Fájl törlés hiba:', unlinkErr);
        });
      });
    });
    
    archive.on('error', (err) => { throw err; });
    archive.pipe(output);
    
    // package.json
    const packageJson = {
      "name": "elso-weboldalam-app",
      "version": "1.0.0",
      "description": "Desktop App - Teljes verzió",
      "main": "main.js",
      "author": "8 éves programozó",
      "dependencies": {
        "electron": "^latest",
        "express": "^4.18.2",
        "mongodb": "^5.0.0",
        "node-schedule": "^2.1.1"
      },
      "scripts": {
        "start": "electron ."
      }
    };
    
    archive.append(JSON.stringify(packageJson, null, 2), { name: 'elso-weboldalam-app/package.json' });
    
    // README.md
    const readmeContent = `# 🎉 Desktop App - Teljes Verzió

## Telepítés

1. Node.js telepítése: https://nodejs.org/
2. Parancssor: npm install
3. Indítás: npm start

## Mi van benne?

✅ Desktop App (Electron)
✅ Express szerver
✅ AI Chatbot
✅ Profil oldal
✅ Offline módban működik

## Élvezd! 🚀
`;
    
    archive.append(readmeContent, { name: 'elso-weboldalam-app/README.md' });
    
    // main.js (Electron fő fájl)
    const mainJsContent = `const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const express = require('express');

const expressApp = express();
const port = 3000;

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());

expressApp.get('/', (req, res) => {
  res.send('<h1>🎉 Desktop App - Teljes Verzió!</h1><p>Üdvözöllek! 🚀</p>');
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:3000');
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  expressApp.listen(port, () => {
    console.log(\`Express szerver fut a \${port}-es porton\`);
  });
  
  createWindow();
  
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
`;
    
    archive.append(mainJsContent, { name: 'elso-weboldalam-app/main.js' });
    
    // .gitignore
    const gitignore = `node_modules/
*.log
.DS_Store
`;
    
    archive.append(gitignore, { name: 'elso-weboldalam-app/.gitignore' });
    
    archive.finalize();
    
  } catch (error) {
    console.error('Download hiba:', error);
    res.status(500).send('Hiba: ' + error.message);
  }
});

// ============================================
// ÜZENŐFAL OLDAL
// ============================================
app.get('/uzenofal', async (req, res) => {
  res.send(getStyle() + getMenu() + getChatbotWidget() + '<div class="container"><h1>💬 Üzenőfal</h1><p>Üzenetek: 0</p></div>');
});
// ============================================
// AI CHATBOT OLDAL (HUGGING FACE API)
// ============================================
app.get('/chat', (req, res) => {
  const html = `
    ${getStyle()}
    ${getMenu()}
    <style>
      .chat-page-container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        padding: 20px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        height: 80vh;
        display: flex;
        flex-direction: column;
      }
      .chat-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #667eea;
      }
      .chat-header h1 {
        color: #667eea;
        font-size: 32px;
        margin: 0;
      }
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        background: #f9f9f9;
        border-radius: 15px;
        margin-bottom: 20px;
      }
      .message {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 15px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .message.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 5px;
      }
      .message.bot {
        background: white;
        color: #333;
        align-self: flex-start;
        border: 1px solid #ddd;
        border-bottom-left-radius: 5px;
      }
      .message.loading {
        color: #999;
        font-style: italic;
      }
      .chat-input-container {
        display: flex;
        gap: 10px;
      }
      .chat-input {
        flex: 1;
        padding: 12px 15px;
        border: 2px solid #667eea;
        border-radius: 10px;
        font-size: 16px;
      }
      .chat-input:focus {
        outline: none;
        border-color: #5568d3;
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.2);
      }
      .chat-send-btn {
        padding: 12px 25px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
      }
      .chat-send-btn:hover {
        transform: translateY(-2px);
      }
      .chat-send-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .info-banner {
        background: #e7f3ff;
        border-left: 4px solid #2196F3;
        padding: 10px 15px;
        margin-bottom: 15px;
        border-radius: 5px;
        color: #0c5aa0;
        font-size: 14px;
      }
    </style>
    
    <div class="chat-page-container">
      <div class="chat-header">
        <h1>💬 AI Chatbot</h1>
        <p style="color: #999; margin: 5px 0;">Teljesen ingyenes, regisztráció nélkül! 🚀</p>
      </div>
      
      <div class="info-banner">
        ℹ️ Ez a chatbot publikus API-t használ. Az első válasz lassabb lehet (10-30 másodperc).
      </div>
      
      <div id="chatMessages" class="chat-messages">
        <div class="message bot">
          Szia! 👋 Én egy AI asszisztens vagyok! Kérdezz meg bármit, és segíteni fogok! 🤖
        </div>
      </div>
      
      <div class="chat-input-container">
        <input 
          type="text" 
          id="chatInput" 
          class="chat-input" 
          placeholder="Írj egy üzenetet..."
          onkeypress="if(event.key==='Enter') sendChatMessage()"
        >
        <button class="chat-send-btn" id="sendBtn" onclick="sendChatMessage()">Küld</button>
      </div>
    </div>
    
    <script>
      const messagesContainer = document.getElementById('chatMessages');
      const inputField = document.getElementById('chatInput');
      const sendBtn = document.getElementById('sendBtn');
      
      function addMessage(text, isUser) {
        const msg = document.createElement('div');
        msg.className = 'message ' + (isUser ? 'user' : 'bot');
        msg.textContent = text;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return msg;
      }
      
      async function sendChatMessage() {
        const text = inputField.value.trim();
        if (!text) return;
        
        sendBtn.disabled = true;
        addMessage(text, true);
        inputField.value = '';
        
        const loadingMsg = addMessage('Gondolkodok... ⏳', false);
        loadingMsg.classList.add('loading');
        
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              userId: 'user_' + Math.random().toString(36).substr(2, 9)
            })
          });
          
          const data = await response.json();
          
          messagesContainer.removeChild(loadingMsg);
          addMessage(data.reply, false);
          
        } catch (error) {
          messagesContainer.removeChild(loadingMsg);
          addMessage('❌ Hiba történt! Próbáld újra később.', false);
        }
        
        sendBtn.disabled = false;
        inputField.focus();
      }
    </script>
  `;
  res.send(html);
});

// ============================================
// AI CHAT API ENDPOINT (HUGGING FACE)
// ============================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.json({ reply: '❌ Üres üzenet!' });
    }
    
    // Inicializálj chat történetet ha nem létezik
    if (!chatHistories[userId]) {
      chatHistories[userId] = [];
    }
    
    // Üzenet hozzáadása a történethez
    chatHistories[userId].push({
      role: 'user',
      content: message
    });
    
    // Hugging Face Inference API hívás (ingyenes, regisztrációs nélkül)
    const apiResponse = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Te egy barátságos és hasznos AI asszisztens vagy. Magyarországon vagy, így magyarul válaszolj. Rövid és érthető válaszokat adj. Maximum 3-4 mondat.'
          },
          ...chatHistories[userId]
        ],
        max_tokens: 256,
        temperature: 0.7,
        top_p: 0.95
      })
    });
    
    const apiData = await apiResponse.json();
    
    if (!apiResponse.ok) {
      console.error('Hugging Face hiba:', apiData);
      return res.json({ 
        reply: '⚠️ AI hiba. Kérlek próbáld újra néhány másodperc múlva!'
      });
    }
    
    let aiReply = 'Sajnálom, nem sikerült válaszolni.';
    
    if (apiData.choices && apiData.choices[0] && apiData.choices[0].message) {
      aiReply = apiData.choices[0].message.content.trim();
    }
    
    // Válasz hozzáadása a történethez
    chatHistories[userId].push({
      role: 'assistant',
      content: aiReply
    });
    
    // Előzményt korlátozunk (max 10 üzenet)
    if (chatHistories[userId].length > 10) {
      chatHistories[userId] = chatHistories[userId].slice(-10);
    }
    
    res.json({ reply: aiReply });
    
  } catch (error) {
    console.error('Chat API hiba:', error);
    res.json({ 
      reply: '❌ Szerver hiba. Próbáld újra!'
    });
  }
});

// ============================================
// VÉGE - APP ÖSSZEÁLLT!
// ============================================
