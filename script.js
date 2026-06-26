
const supabaseUrl = 'https://kzdahrsvfqyqfqiruqzh.supabase.co';
const supabaseAnonKey = 'sb_publishable_zinH0IDMddUTR6SckYabJg_ZOe8F8eD';

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseAnonKey
);

// ====================================
// CACHE LOCAL
// ====================================

let participantsCache = [];

// ====================================
// CRUD SUPABASE
// ====================================

async function loadParticipants() {
    const { data, error } = await supabaseClient
        .from('participants')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Erreur chargement :', error);
        return [];
    }

    participantsCache = data || [];
    return participantsCache;
}

async function insertParticipant(prenom, nom, surnom) {
    const { data, error } = await supabaseClient
        .from('participants')
        .insert({
            prenom,
            nom,
            surnom: surnom || null
        })
        .select();

    if (error) {
        console.error('Erreur insertion :', error);
        alert('Erreur lors de l\'ajout.');
        return null;
    }

    return data[0];
}

async function updatePresent(id, present) {
    const { error } = await supabaseClient
        .from('participants')
        .update({ present })
        .eq('id', id);

    if (error) {
        console.error('Erreur mise à jour :', error);
    }
}

async function deleteParticipant(id) {
    if (!confirm('Supprimer ce participant ?')) return;

    const { error } = await supabaseClient
        .from('participants')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(error);
        alert('Erreur lors de la suppression.');
        return;
    }

    await renderParticipantTable();
}

// ====================================
// FONCTIONS UTILITAIRES
// ====================================

function getParticipants() {
    return participantsCache;
}

function getUsedIds() {
    return JSON.parse(localStorage.getItem('usedIds') || '[]');
}

function saveUsedIds(ids) {
    localStorage.setItem('usedIds', JSON.stringify(ids));
}

function getRemainingParticipants() {
    const used = getUsedIds();

    return participantsCache.filter(
        p => !used.includes(p.id)
    );
}

function getUsedParticipants() {
    const used = getUsedIds();

    return participantsCache.filter(
        p => used.includes(p.id)
    );
}

function formatName(p) {
    return p.surnom
        ? `${p.prenom} ${p.nom} <span class="surnom">(${p.surnom})</span>`
        : `${p.prenom} ${p.nom}`;
}

// ====================================
// FORMULAIRE
// ====================================

function addParticipant() {
    document.getElementById('addButton').style.display = 'none';
    document.getElementById('inputForm').style.display = 'block';
}

function resetForm() {
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
        alert('Veuillez remplir le prénom et le nom.');
        return;
    }

    const participant = await insertParticipant(
        prenom,
        nom,
        surnom
    );

    if (!participant) return;

    resetForm();
    await renderParticipantTable();
}

// ====================================
// AFFICHAGE DES PARTICIPANTS
// ====================================

async function renderParticipantTable() {

    const container =
        document.getElementById('participantTable');

    if (!container) return;

    const participants = await loadParticipants();

    if (participants.length === 0) {
        container.innerHTML =
            '<div class="empty-message">Aucun participant</div>';
        return;
    }

    let html = '';

    participants.forEach(p => {

        html += `
            <div class="participant-row ${p.present ? 'present' : ''}">

                <label class="checkbox-label">
                    <input
                        type="checkbox"
                        ${p.present ? 'checked' : ''}
                        onchange="togglePresent(${p.id}, ${p.present}, this)">
                    <span class="checkbox-custom"></span>
                </label>

                <span class="participant-info">
                    ${formatName(p)}
                </span>

                <button
                    class="delete-btn"
                    onclick="deleteParticipant(${p.id})">
                    🗑️
                </button>

            </div>
        `;
    });

    container.innerHTML = html;
}

async function togglePresent(id, currentPresent, checkbox) {

    const newValue = !currentPresent;

    await updatePresent(id, newValue);

    const row = checkbox.closest('.participant-row');

    if (row) {
        row.classList.toggle('present', newValue);
    }
}

// ====================================
// ROULETTE
// ====================================

let spinInterval = null;

function renderUsedParticipants() {

    const container =
        document.getElementById('usedList');

    if (!container) return;

    const used = getUsedParticipants();

    container.innerHTML = used.map(p =>
        `<span class="used-participant">
            ${p.prenom} ${p.nom}
        </span>`
    ).join('');
}

function tirerAuSort() {

    const remaining = getRemainingParticipants();

    const display =
        document.getElementById('rouletteDisplay');

    const button =
        document.querySelector('#rouletteContainer .btn');

    if (remaining.length === 0) {
        alert('Tous les participants ont déjà été tirés.');
        return;
    }

    button.disabled = true;

    let count = 0;
    const totalSpins = 25;

    spinInterval = setInterval(() => {

        const random =
            remaining[Math.floor(Math.random() * remaining.length)];

        display.textContent =
            `${random.prenom} ${random.nom}`;

        count++;

        if (count >= totalSpins) {

            clearInterval(spinInterval);

            const winner =
                remaining[Math.floor(Math.random() * remaining.length)];

            const usedIds = getUsedIds();
            usedIds.push(winner.id);

            saveUsedIds(usedIds);

            display.textContent =
                `🎉 ${winner.prenom} ${winner.nom} 🎉`;

            renderUsedParticipants();

            button.disabled = false;
        }

    }, 80);
}

// ====================================
// INITIALISATION
// ====================================

document.addEventListener('DOMContentLoaded', async () => {

    participantsCache = await loadParticipants();

    if (document.getElementById('participantTable')) {
        await renderParticipantTable();
    }

    const btnAdd = document.querySelector('.btn-add');
    const btnSubmit = document.querySelector('.btn-submit');
    const btnCancel = document.querySelector('.btn-cancel');

    if (btnAdd)
        btnAdd.addEventListener('click', addParticipant);

    if (btnSubmit)
        btnSubmit.addEventListener('click', submitForm);

    if (btnCancel)
        btnCancel.addEventListener('click', resetForm);

    if (document.getElementById('usedList')) {
        renderUsedParticipants();
    }
});