app.get('/letoltes', (req, res) => {
  const html = `
    ${getMenu()}
    ${getStyle()}
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
      .download-header {
        text-align: center;
        margin-bottom: 50px;
      }
      .download-header h1 {
        color: #667eea;
        font-size: 48px;
        margin-bottom: 20px;
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
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        transition: all 0.3s;
      }
      .version-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
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
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
      <div class="download-header">
        <h1>📥 Letöltések</h1>
        <p>Válassz a web demo és az alkalmazás verzió között!</p>
      </div>
      
      <div class="versions-grid">
        <div class="version-card">
          <div class="emoji">🌐</div>
          <h2>Web Demo</h2>
          <p>A weboldalunk böngészőben használható verziója</p>
          <ul class="features-list">
            <li>Korlátozott AI chatbot</li>
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
            <li>Teljes Claude AI chatbot</li>
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
            <td><span class="cross">✗</span></td>
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
      "description": "Desktop alkalmazás - Teljes verzió",
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
    const readmeContent = `# Üdvözöllek az Alkalmazásban! 🚀

## Telepítés
1. Telepítsd a Node.js-t
2. Futtasd: npm install
3. Indítsd el: npm start

## Mi van benne?
✅ Teljes Claude AI chatbot
✅ Profilkezelés
✅ Offline mód
✅ Összes játék
✅ Dark/Light téma

Élvezd! 😊
`;
    
    archive.append(readmeContent, { name: 'elso-weboldalam-app/README.md' });
    
    // main.js (Electron fő fájl)
    const mainJsContent = `const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL('http://localhost:3000');
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;
    
    archive.append(mainJsContent, { name: 'elso-weboldalam-app/main.js' });
    
    // .gitignore
    const gitignore = `node_modules/
*.log
.DS_Store
dist/
build/
`;
    
    archive.append(gitignore, { name: 'elso-weboldalam-app/.gitignore' });
    
    // FEATURES.md
    const features = `# Desktop App Funkciók 🎉

## AI Chatbot
- Teljes Claude AI integráció
- Real-time válaszok
- Chat história

## Profilkezelés
- Profil fül
- Profilkép feltöltés
- Beállítások

## Offline Mód
- Helyi adatok mentése
- Offline játékok

## Játékok
- Tengerimalac Kaland 🐹
- Tetris 🟦
- Snake 🐍
- Labirintus 🎯

## Témák
- Dark mode 🌙
- Light mode ☀️
`;
    
    archive.append(features, { name: 'elso-weboldalam-app/FEATURES.md' });
    
    archive.finalize();
    
  } catch (error) {
    console.error('Download hiba:', error);
    res.status(500).send('Hiba: ' + error.message);
  }
});

// ============================================
// LETÖLTÉSI STATISZTIKÁK
// ============================================
app.post('/api/download-stat', async (req, res) => {
  try {
    const { osType, appVersion } = req.body;
    await db.collection('downloads').insertOne({
      osType,
      appVersion,
      downloadTime: new Date(),
      ip: req.ip
    });
    console.log(`📥 Letöltés: ${osType} | v${appVersion}`);
    res.json({ siker: true });
  } catch (error) {
    res.json({ siker: false });
  }
});
// ============================================
// PROFIL OLDAL
// ============================================
app.get('/profil', (req, res) => {
  const html = `
    ${getMenu()}
    ${getStyle()}
    ${getChatbotWidget()}
    <style>
      .profil-container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      .profil-header {
        display: flex;
        align-items: center;
        margin-bottom: 50px;
        padding-bottom: 30px;
        border-bottom: 2px solid #667eea;
      }
      .profil-pic-container {
        position: relative;
        margin-right: 40px;
      }
      .profil-pic {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        border: 5px solid #667eea;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 60px;
        font-weight: bold;
        object-fit: cover;
      }
      .profil-pic-upload {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 50px;
        height: 50px;
        background: #667eea;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 24px;
        transition: all 0.3s;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      .profil-pic-upload:hover {
        transform: scale(1.1);
        background: #5568d3;
      }
      .profil-info h1 {
        color: #667eea;
        font-size: 32px;
        margin-bottom: 10px;
      }
      .profil-tabs {
        display: flex;
        gap: 20px;
        margin-bottom: 40px;
        border-bottom: 2px solid #eee;
      }
      .profil-tab {
        padding: 15px 25px;
        background: none;
        border: none;
        font-size: 16px;
        font-weight: bold;
        color: #999;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
      }
      .profil-tab.active {
        color: #667eea;
        border-bottom-color: #667eea;
      }
      .tab-content {
        display: none;
      }
      .tab-content.active {
        display: block;
      }
      .form-group {
        margin-bottom: 25px;
      }
      .form-group label {
        display: block;
        color: #667eea;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #eee;
        border-radius: 8px;
        font-size: 16px;
      }
      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.2);
      }
      .save-btn {
        padding: 15px 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
      }
      .save-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }
      .stat-card {
        background: #f5f5f5;
        padding: 25px;
        border-radius: 12px;
        text-align: center;
        border-left: 4px solid #667eea;
      }
      .stat-card .number {
        font-size: 32px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 10px;
      }
      .settings-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: #f5f5f5;
        margin-bottom: 15px;
        border-radius: 10px;
      }
      .toggle-switch {
        position: relative;
        width: 50px;
        height: 25px;
        background: #ccc;
        border-radius: 25px;
        cursor: pointer;
      }
      .toggle-switch.active {
        background: #667eea;
      }
      .toggle-switch .slider {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 19px;
        height: 19px;
        background: white;
        border-radius: 50%;
        transition: all 0.3s;
      }
      .toggle-switch.active .slider {
        left: 28px;
      }
      .danger-zone {
        background: #fff3cd;
        padding: 20px;
        border-radius: 10px;
        border-left: 4px solid #ff6b6b;
        margin-top: 40px;
      }
      .delete-btn {
        padding: 10px 20px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
      }
      .delete-btn:hover {
        background: #ff5252;
      }
    </style>
    
    <div class="profil-container">
      <div class="profil-header">
        <div class="profil-pic-container">
          <div id="profilPic" class="profil-pic">?</div>
          <div class="profil-pic-upload" onclick="document.getElementById('picInput').click()">
            📷
          </div>
          <input type="file" id="picInput" accept="image/*" style="display: none;" onchange="uploadProfilePic(event)">
        </div>
        <div class="profil-info">
          <h1 id="profilNev">Felhasználó</h1>
          <p id="profilEmail">email@example.com</p>
          <p id="profilRegisztracio">Regisztrálva: 2024-01-01</p>
        </div>
      </div>
      
      <div class="profil-tabs">
        <button class="profil-tab active" onclick="switchTab('altalanos')">⚙️ Általános</button>
        <button class="profil-tab" onclick="switchTab('jelszomene')">🔐 Jelszó</button>
        <button class="profil-tab" onclick="switchTab('statisztika')">📊 Statisztika</button>
        <button class="profil-tab" onclick="switchTab('beallitasok')">🎨 Beállítások</button>
      </div>
      
      <div id="altalanos" class="tab-content active">
        <h2 style="color: #667eea; margin-bottom: 25px;">Profil Információk</h2>
        <div class="form-group">
          <label>Felhasználónév</label>
          <input type="text" id="felhasznalonev" readonly>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="email" placeholder="email@example.com">
        </div>
        <div class="form-group">
          <label>Bio</label>
          <textarea id="bio" placeholder="Írj valamit magadról..." rows="4"></textarea>
        </div>
        <button class="save-btn" onclick="saveProfil()">💾 Mentés</button>
      </div>
      
      <div id="jelszomene" class="tab-content">
        <h2 style="color: #667eea; margin-bottom: 25px;">Jelszó Megváltoztatása</h2>
        <div class="form-group">
          <label>Jelenlegi Jelszó</label>
          <input type="password" id="jelszoMost" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label>Új Jelszó</label>
          <input type="password" id="jelszouJ" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label>Jelszó Megerősítés</label>
          <input type="password" id="jelszuMegerosites" placeholder="••••••••">
        </div>
        <button class="save-btn" onclick="changePassword()">🔒 Megváltoztatás</button>
      </div>
      
      <div id="statisztika" class="tab-content">
        <h2 style="color: #667eea; margin-bottom: 25px;">Statisztika</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="number" id="uzenetekSzama">0</div>
            <div class="label">Üzenetek</div>
          </div>
          <div class="stat-card">
            <div class="number" id="jatekokSzama">0</div>
            <div class="label">Játékok</div>
          </div>
          <div class="stat-card">
            <div class="number" id="gyozelmek">0</div>
            <div class="label">Győzelmek</div>
          </div>
        </div>
      </div>
      
      <div id="beallitasok" class="tab-content">
        <h2 style="color: #667eea; margin-bottom: 25px;">Beállítások</h2>
        
        <div class="settings-option">
          <label>🌙 Dark Mód</label>
          <div class="toggle-switch" id="darkModeToggle" onclick="toggleDarkMode()">
            <div class="slider"></div>
          </div>
        </div>
        
        <div class="settings-option">
          <label>🔔 Értesítések</label>
          <div class="toggle-switch active" id="notificationsToggle" onclick="toggleNotifications()">
            <div class="slider"></div>
          </div>
        </div>
        
        <div class="danger-zone">
          <h3>⚠️ Veszélyes Zóna</h3>
          <button class="delete-btn" onclick="confirmDelete()">🗑️ Fiók Törlése</button>
        </div>
      </div>
    </div>
    
    <script>
      function loadProfilData() {
        const userData = JSON.parse(localStorage.getItem('bejelentkezve') || '{}');
        document.getElementById('felhasznalonev').value = userData.felhasznalonev || 'Felhasználó';
        document.getElementById('profilNev').textContent = userData.felhasznalonev || 'Felhasználó';
        
        if (userData.profilkep) {
          document.getElementById('profilPic').innerHTML = '<img src="' + userData.profilkep + '" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">';
        } else {
          document.getElementById('profilPic').textContent = (userData.felhasznalonev || 'F').charAt(0).toUpperCase();
        }
      }
      
      function switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.profil-tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        event.target.classList.add('active');
      }
      
      function saveProfil() { alert('✅ Profil mentve!'); }
      
      function changePassword() {
        const jelszoMost = document.getElementById('jelszoMost').value;
        const jelszouJ = document.getElementById('jelszouJ').value;
        const jelszuMegerosites = document.getElementById('jelszuMegerosites').value;
        
        if (!jelszoMost || !jelszouJ || !jelszuMegerosites) {
          alert('❌ Töltsd ki az összes mezőt!');
          return;
        }
        if (jelszouJ !== jelszuMegerosites) {
          alert('❌ A jelszavak nem egyeznek!');
          return;
        }
        alert('✅ Jelszó megváltoztatva!');
      }
      
      function toggleDarkMode() {
        document.getElementById('darkModeToggle').classList.toggle('active');
      }
      
      function toggleNotifications() {
        document.getElementById('notificationsToggle').classList.toggle('active');
      }
      
      function uploadProfilePic(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
          const userData = JSON.parse(localStorage.getItem('bejelentkezve') || '{}');
          userData.profilkep = e.target.result;
          localStorage.setItem('bejelentkezve', JSON.stringify(userData));
          document.getElementById('profilPic').innerHTML = '<img src="' + e.target.result + '" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">';
          alert('✅ Profilkép feltöltve!');
        };
        reader.readAsDataURL(file);
      }
      
      function confirmDelete() {
        if (confirm('⚠️ Biztosan törlöd a fiókodat?')) {
          alert('❌ Fiók törölve!');
          localStorage.removeItem('bejelentkezve');
          window.location.href = '/';
        }
      }
      
      loadProfilData();
    </script>
  `;
  res.send(html);
});
// ============================================
// HUGGING FACE AI CHATBOT (INGYENES, REGISZTRÁCIÓS NÉLKÜL)
// ============================================

// Chat történet tárolása memóriában
let chatHistories = {};

app.get('/chat', (req, res) => {
  const html = `
    ${getMenu()}
    ${getStyle()}
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
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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
        transition: all 0.3s;
      }
      .chat-send-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
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
          console.error('Chat hiba:', error);
        }
        
        sendBtn.disabled = false;
        inputField.focus();
      }
    </script>
  `;
  res.send(html);
});

// ============================================
// AI CHAT API ENDPOINT (Hugging Face)
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
