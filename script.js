const supabaseUrl = 'https://kzdahrsvfqyqfqiruqzh.supabase.co';
const supabaseAnonKey = 'sb_publishable_zinH0IDMddUTR6SckYabJg_ZOe8F8eD';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Cache local des participants - la seule source de vérité est Supabase
let participantsCache = [];

// ===== CRUD SUPABASE =====

async function loadParticipants() {
    const { data, error } = await supabaseClient
        .from('participants')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Erreur chargement participants:', error);
        if (error.code === 'PGRST301' || error.code === '404') {
            alert('⚠️ La table "participants" n\'existe pas encore.\nDemande au collaborateur d\'exécuter setup.sql dans le SQL Editor du Dashboard Supabase.');
        }
        return [];
    }
    participantsCache = data || [];
    return participantsCache;
}

async function insertParticipant(prenom, nom, surnom) {
    const { data, error } = await supabaseClient
        .from('participants')
        .insert({ prenom, nom, surnom: surnom || null })
        .select();

    if (error) {
        console.error('Erreur insertion:', error);
        alert('Erreur lors de l\'enregistrement dans Supabase');
        return null;
    }
    return data[0];
}

async function updatePresent(id, present) {
    const { error } = await supabaseClient
        .from('participants')
        .update({ present })
        .eq('id', id);

    if (error) console.error('Erreur mise à jour present:', error);
}

async function deleteParticipant(id) {
    if (!confirm('Supprimer ce participant ?')) return;
    try {
        const { error } = await supabaseClient.from('participants').delete().eq('id', id);
        if (error) throw error;
        alert('Participant supprimé !');
        await renderParticipantTable();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
    }
}

async function toggleSelect(id, currentSelected, checkboxEl) {
    const newSelected = !currentSelected;
    try {
        await supabaseClient.from('participants').update({ selected: newSelected }).eq('id', id);
    } catch (error) {
        console.error('Erreur update select:', error);
    }
    if (checkboxEl) {
        checkboxEl.checked = newSelected;
        checkboxEl.classList.toggle('selected', newSelected);
    }
    const row = checkboxEl ? checkboxEl.closest('.participant-row') : null;
    if (row) {
        row.classList.toggle('selected', newSelected);
    }
}

// ===== Fonctions utilitaires pour la logique local =====

function getParticipants() {
    return participantsCache;
}

function saveParticipants(participants) {
    participantsCache = participants;
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

function formatName(p) {
    if (p.surnom) {
        return p.prenom + ' ' + p.nom + ' <span class="surnom">(' + p.surnom + ')</span>';
    }
    return p.prenom + ' ' + p.nom;
}

// ===== Interface (index.html) =====

function addParticipant() {
    const addButton = document.getElementById('addButton');
    const inputForm = document.getElementById('inputForm');
    if (addButton) addButton.style.display = 'none';
    if (inputForm) inputForm.style.display = 'block';
}

function resetForm() {
    const inputForm = document.getElementById('inputForm');
    const addButton = document.getElementById('addButton');
    if (inputForm && addButton) {
        inputForm.style.display = 'none';
        addButton.style.display = 'block';
    }
    const prenom = document.getElementById('prenom');
    const nom = document.getElementById('nom');
    const surnom = document.getElementById('surnom');
    if (prenom) prenom.value = '';
    if (nom) nom.value = '';
    if (surnom) surnom.value = '';
}

async function submitForm() {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const surnom = document.getElementById('surnom').value.trim();

    if (!prenom || !nom) {
        alert('Veuillez remplir au moins le prénom et le nom');
        return;
    }

    const participant = await insertParticipant(prenom, nom, surnom);
    if (!participant) return;

    await refreshParticipantTable();
    resetForm();
}

async function refreshParticipantTable() {
    await renderParticipantTable();
}

async function renderParticipantTable() {
    const container = document.getElementById('participantTable');
    if (!container) return;

    const participants = await loadParticipants();

    if (participants.length === 0) {
        container.innerHTML = '<div class="empty-message">Aucun participant pour le moment</div>';
        return;
    }

    let html = '';
    participants.forEach(p => {
        const presentChecked = p.present ? 'checked' : '';
        const cls = p.present ? 'present' : '';
        const selectedCls = p.selected ? 'selected' : '';
        html += '<div class="participant-row ' + cls + ' ' + selectedCls + '" data-id="' + p.id + '">' +
            '<label class="checkbox-label">' +
            '<input type="checkbox" class="participant-checkbox" ' + presentChecked +
            ' onchange="togglePresent(' + p.id + ', ' + p.present + ', this)">' +
            '<span class="checkbox-custom"></span>' +
            '</label>' +
            '<span class="participant-info">' +
            '<span class="prenom-nom">' + formatName(p) + '</span>' +
            '</span>' +
            '<button class="delete-btn" onclick="deleteParticipant(' + p.id + ') ">🗑️</button>' +
            '</div>';
    });
    container.innerHTML = html;
}

async function togglePresent(id, currentPresent, checkboxEl) {
    const newPresent = !currentPresent;
    await updatePresent(id, newPresent);

    if (checkboxEl) {
        checkboxEl.checked = newPresent;
        checkboxEl.classList.toggle('checked', newPresent);
    }

    const row = checkboxEl ? checkboxEl.closest('.participant-row') : null;
    if (row) {
        row.classList.toggle('present', newPresent);
    }
}

// ===== Roulette (reunion.html) =====

let spinInterval = null;

function renderUsedParticipants() {
    const container = document.getElementById('usedList');
    if (!container) return;
    const used = getUsedParticipants();
    container.innerHTML = used.map(p =>
        '<span class="used-participant">' + p.prenom + ' ' + p.nom + '</span>'
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
    const names = remaining.map(p => p.prenom + ' ' + p.nom);

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
            display.textContent = '🎉 ' + winner.prenom + ' ' + winner.nom + ' 🎉';
            renderUsedParticipants();
            if (btn) btn.disabled = false;
        }
    }, 80);
}

// ===== Initialisation =====

document.addEventListener('DOMContentLoaded', async function() {
    participantsCache = await loadParticipants();

    const participantTable = document.getElementById('participantTable');
    if (participantTable) {
        await renderParticipantTable();

        const btnAdd = document.querySelector('.btn-add');
        const btnSubmit = document.querySelector('.btn-submit');
        const btnCancel = document.querySelector('.btn-cancel');

        if (btnAdd) {
            btnAdd.addEventListener('click', addParticipant);
        }
        if (btnSubmit) {
            btnSubmit.addEventListener('click', submitForm);
        }
        if (btnCancel) {
            btnCancel.addEventListener('click', resetForm);
        }
    }

    const usedList = document.getElementById('usedList');
    if (usedList) {
        renderUsedParticipants();
    }
});