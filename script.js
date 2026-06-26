const supabaseUrl = 'https://kzdahrsvfqyqfqiruqzh.supabase.co';
const supabaseAnonKey = 'sb_publishable_zinH0IDMddUTR6SckYabJg_ZOe8F8eD';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

function getParticipants() {
    return JSON.parse(localStorage.getItem('participants') || '[]');
}

function saveParticipants(participants) {
    localStorage.setItem('participants', JSON.stringify(participants));
}

function getUsedIds() {
    return JSON.parse(localStorage.getItem('usedIds') || '[]');
}

function saveUsedIds(ids) {
    localStorage.setItem('usedIds', JSON.stringify(ids));
}

function getRemainingParticipants() {
    const all = getParticipants();
    const used = getUsedIds();
    return all.filter(p => !used.includes(p.id));
}

function getUsedParticipants() {
    const all = getParticipants();
    const used = getUsedIds();
    return all.filter(p => used.includes(p.id));
}

function addParticipant() {
    const addButton = document.getElementById('addButton');
    const inputForm = document.getElementById('inputForm');
    addButton.style.display = 'none';
    inputForm.style.display = 'block';
}

function resetForm() {
    document.getElementById('inputForm').style.display = 'none';
    document.getElementById('addButton').style.display = 'block';
    document.getElementById('prenom').value = '';
    document.getElementById('nom').value = '';
    document.getElementById('surnom').value = '';
}

function formatName(p) {
    return p.surnom || p.prenom + ' ' + p.nom;
}

function submitForm() {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const surnom = document.getElementById('surnom').value.trim();
    
    if (!prenom || !nom) {
        alert('Veuillez remplir au moins le prénom et le nom');
        return;
    }
    
    const data = { id: Date.now(), prenom, nom, surnom: surnom || null };
    const participants = getParticipants();
    participants.push(data);
    saveParticipants(participants);
    resetForm();
}

let spinInterval = null;

function renderUsedParticipants() {
    const container = document.getElementById('usedList');
    if (!container) return;
    const used = getUsedParticipants();
    container.innerHTML = used.map(p =>
        '<span class="used-participant">' + formatName(p) + '</span>'
    ).join('');
}

function tirerAuSort() {
    const remaining = getRemainingParticipants();
    const display = document.getElementById('rouletteDisplay');
    const btn = document.querySelector('#rouletteContainer .btn');

    if (remaining.length === 0) {
        alert('Tous les participants ont déjà été tirés !');
        return;
    }

    if (btn) btn.disabled = true;

    let count = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 10);
    const names = remaining.map(formatName);

    spinInterval = setInterval(() => {
        display.textContent = names[Math.floor(Math.random() * names.length)];
        count++;
        if (count >= totalSpins) {
            clearInterval(spinInterval);
            spinInterval = null;
            const winner = remaining[Math.floor(Math.random() * remaining.length)];
            const usedIds = getUsedIds();
            usedIds.push(winner.id);
            saveUsedIds(usedIds);
            display.textContent = '🎉 ' + formatName(winner) + ' 🎉';
            renderUsedParticipants();
            if (btn) btn.disabled = false;
        }
    }, 80);
}
