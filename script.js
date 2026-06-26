const supabaseUrl = 'https://kzdahrsvfqyqfqiruqzh.supabase.co';
const supabaseAnonKey = 'sb_publishable_zinH0IDMddUTR6SckYabJg_ZOe8F8eD';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

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

function submitForm() {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const surnom = document.getElementById('surnom').value.trim();
    
    if (!prenom || !nom) {
        alert('Veuillez remplir au moins le prénom et le nom');
        return;
    }
    
    const data = {
        prenom: prenom,
        nom: nom,
        surnom: surnom || null
    };
    
    console.log('Participant ajouté:', data);
    resetForm();
}
