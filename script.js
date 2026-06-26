const supabaseUrl = 'https://kzdahrsvfqyqfqiruqzh.supabase.co';
const supabaseAnonKey = 'sb_publishable_zinH0IDMddUTR6SckYabJg_ZOe8F8eD';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

function formatName(p) {
    return p.surnom || p.prenom + ' ' + p.nom;
}

async function getParticipants() {
    let localParticipants = JSON.parse(localStorage.getItem('participants') || '[]');
    let changed = false;
    localParticipants = localParticipants.map(p => {
        if (!p.id) { p.id = Date.now() + Math.random(); changed = true; }
        return p;
    });
    if (changed) saveParticipants(localParticipants);

    try {
        const { data, error } = await supabaseClient.from('participants').select('*');
        if (error) throw error;
        if (Array.isArray(data)) {
            for (const localP of localParticipants) {
                const exists = data.some(p => p.id === localP.id ||
                    (p.prenom === localP.prenom && p.nom === localP.nom && p.surnom === localP.surnom));
                if (!exists) {
                    const { error: insertError } = await supabaseClient
                        .from('participants')
                        .insert({
                            prenom: localP.prenom,
                            nom: localP.nom,
                            surnom: localP.surnom,
                            present: false
                        });
                    if (insertError) console.error('Erreur lors de linsertion de participants dans Supabase :', insertError);
                }
            }
            const { data: refreshedData, error: refreshError } = await supabaseClient.from('participants').select('*');
            if (refreshError) throw refreshError;
            return refreshedData || [];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des participants de Supabase :', error);
    }
    return localParticipants;
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

async function getRemainingParticipants() {
    const all = await getParticipants();
    const used = getUsedIds();
    return all.filter(p => !used.includes(p.id));
}

async function getUsedParticipants() {
    const all = await getParticipants();
    const used = getUsedIds();
    return all.filter(p => used.includes(p.id));
}

function addParticipant() {
    const addButton = document.getElementById('addButton');
    const inputForm = document.getElementById('inputForm');
    addButton.style.display = 'none';
    inputForm.style.display = 'block';
}

async function resetForm() {
    document.getElementById('inputForm').style.display = 'none';
    document.getElementById('addButton').style.display = 'block';
    document.getElementById('prenom').value = '';
    document.getElementById('nom').value = '';
    document.getElementById('surnom').value = '';
}

async function submitForm() {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const surnom = document.getElementById('surnom').value.trim();
    
    if (!prenom || !nom) {
        alert('Veuillez remplir au moins le prénom et le nom');
        return;
    }
    
    const id = Date.now();
    const participantData = { id, prenom, nom, surnom: surnom || null, present: false };
    console.log('Attempting to save participant:', participantData);
    try {
        console.log('Calling Supabase insert with:', participantData);
        const { error } = await supabaseClient.from('participants').insert(participantData);
        if (error) {
            console.error('Erreur lors de linsertion de participants dans Supabase :', error);
            const participants = JSON.parse(localStorage.getItem('participants') || '[]');
            participants.push(participantData);
            saveParticipants(participants);
            alert('Participant sauvegardé localement (erreur serveur)');
        }
    } catch (error) {
        console.error('Erreur lors de linsertion de participants dans Supabase :', error);
        const participants = JSON.parse(localStorage.getItem('participants') || '[]');
        participants.push(participantData);
        saveParticipants(participants);
        alert('Participant sauvegardé localement (erreur serveur)');
    }
    await resetForm();
}

let spinInterval = null;

async function renderUsedParticipants() {
    const container = document.getElementById('usedList');
    if (!container) return;
    const used = await getUsedParticipants();
    container.innerHTML = used.map(p =>
        '<span class="used-participant">' + formatName(p) + '</span>'
    ).join('');
}

async function tirerAuSort() {
    const remaining = await getRemainingParticipants();
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

// Initialisation et gestion des participants
async function initApp() {
    console.log('Initialisation de l\'application...');
    await renderParticipantList();
    await renderDicoEnfants();
    console.log('Application initialisée avec succès');
}

async function renderDicoEnfants() {
    const container = document.getElementById('motsList');
    if (!container) return;
    try {
        let words = await getDicoEnfants();
        words = words.filter(w => !w.is_used);
        if (words.length === 0) {
            container.innerHTML = '<p>Aucun mot disponible dans le dictionnaire pour enfants !</p>';
            return;
        }
        container.innerHTML = words.map(w =>
            '<div class="mot-item"><span class="mot-text">' + w.mot + '</span>' +
            (w.definition ? '<span class="mot-def">' + w.definition + '</span>' : '') +
            (w.image ? '<img src="' + w.image + '" alt="' + w.mot + '" class="mot-image">' : '') +
            '</div>'
        ).join('');
    } catch (error) {
        console.error('Erreur lors du rendu des mots:', error);
        container.innerHTML = '<p>Erreur lors du chargement des mots.</p>';
    }
}

async function renderParticipantList() {
    const container = document.getElementById('participantTable');
    if (!container) return;
    try {
        const participants = await getParticipants();
        if (participants.length === 0) {
            container.innerHTML = '<p>Aucun participant pour le moment.</p>';
            return;
        }
        const rows = participants.map(p =>
            '<div class="participant-row">' +
            '<span class="participant-name">' + formatName(p) + '</span>' +
            '<span class="participant-status">' + (p.present ? 'Présent' : 'Absent') + '</span>' +
            '</div>'
        ).join('');
        container.innerHTML = rows;
    } catch (error) {
        console.error('Erreur lors du rendu de la liste des participants:', error);
        container.innerHTML = '<p>Erreur lors du chargement des participants.</p>';
    }
}

    let wordsInterval = null;

async function tirerUnMot() {
    const display = document.getElementById('motDisplay');
    const listContainer = document.getElementById('motsList');
    if (!display || !listContainer) return;
    
    if (wordsInterval) clearInterval(wordsInterval);
    try {
        let words = await getDicoEnfants();
        words = words.filter(w => !w.is_used);
        
        if (words.length === 0) {
            display.textContent = 'Tous les mots ont été utilisés !';
            setTimeout(() => renderDicoEnfants(), 2000);
            return;
        }
        
        let currentIndex = Math.floor(Math.random() * words.length);
        const currentWord = words[currentIndex];
        
        wordsInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % words.length;
            display.textContent = words[currentIndex].mot;
        }, 80);
        
        setTimeout(async () => {
            clearInterval(wordsInterval);
            wordsInterval = null;
            display.textContent = '🎉 ' + currentWord.mot + ' 🎉';
            
            try {
                await supabaseClient
                    .from('dico_enfants')
                    .update({ is_used: true, used_at: new Date().toISOString() })
                    .eq('id', currentWord.id);
            } catch (error) {
                console.error('Erreur lors du marquage du mot comme utilisé dans Supabase :', error);
            }
            
            renderDicoEnfants();
        }, 1200);
    } catch (error) {
        console.error('Erreur lors de la sélection du mot:', error);
        display.textContent = 'Erreur lors du chargement des mots';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function addParticipant() {
    const addButton = document.getElementById('addButton');
    const inputForm = document.getElementById('inputForm');
    if (addButton && inputForm) {
        addButton.style.display = 'none';
        inputForm.style.display = 'block';
    }
}

async function resetForm() {
    const inputForm = document.getElementById('inputForm');
    const addButton = document.getElementById('addButton');
    if (inputForm && addButton) {
        inputForm.style.display = 'none';
        addButton.style.display = 'block';
    }
}

async function submitForm() {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const surnom = document.getElementById('surnom').value.trim();
    
    if (!prenom || !nom) {
        alert('Veuillez remplir au moins le prénom et le nom');
        return;
    }
    
    const id = Date.now();
    const participantData = { id, prenom, nom, surnom: surnom || null, present: false };
    console.log('Attempting to save participant:', participantData);
    try {
        console.log('Calling Supabase insert with:', participantData);
        const { error } = await supabaseClient.from('participants').insert(participantData);
        if (error) {
            console.error('Erreur lors de linsertion de participants dans Supabase :', error);
            const participants = JSON.parse(localStorage.getItem('participants') || '[]');
            participants.push(participantData);
            saveParticipants(participants);
            alert('Participant sauvegardé localement (erreur serveur)');
        }
    } catch (error) {
        console.error('Erreur lors de linsertion de participants dans Supabase :', error);
        const participants = JSON.parse(localStorage.getItem('participants') || '[]');
        participants.push(participantData);
        saveParticipants(participants);
        alert('Participant sauvegardé localement (erreur serveur)');
    }
    await resetForm();
}