const dicoEnfant = [
    { mot: "Chat", categorie: "Animal" },
    { mot: "Chien", categorie: "Animal" },
    { mot: "Soleil", categorie: "Nature" },
    { mot: "Lune", categorie: "Nature" },
    { mot: "Fleur", categorie: "Nature" },
    { mot: "Arbre", categorie: "Nature" },
    { mot: "Pomme", categorie: "Fruit" },
    { mot: "Banane", categorie: "Fruit" },
    { mot: "Fraise", categorie: "Fruit" },
    { mot: "Maison", categorie: "Objet" },
    { mot: "Voiture", categorie: "Objet" },
    { mot: "Ballon", categorie: "Jouet" },
    { mot: "Poupée", categorie: "Jouet" },
    { mot: "Livre", categorie: "Objet" },
    { mot: "Étoile", categorie: "Nature" },
    { mot: "Arc-en-ciel", categorie: "Nature" },
    { mot: "Papillon", categorie: "Animal" },
    { mot: "Poisson", categorie: "Animal" },
    { mot: "Oiseau", categorie: "Animal" },
    { mot: "Lapin", categorie: "Animal" },
    { mot: "Gâteau", categorie: "Nourriture" },
    { mot: "Glace", categorie: "Nourriture" },
    { mot: "Chocolat", categorie: "Nourriture" },
    { mot: "Biscuit", categorie: "Nourriture" },
    { mot: "Eau", categorie: "Nature" },
    { mot: "Montagne", categorie: "Nature" },
    { mot: "Rivière", categorie: "Nature" },
    { mot: "Nuage", categorie: "Nature" },
    { mot: "Vent", categorie: "Nature" },
    { mot: "Bateau", categorie: "Objet" },
    { mot: "Avion", categorie: "Objet" },
    { mot: "Train", categorie: "Objet" },
    { mot: "Vélo", categorie: "Objet" },
    { mot: "Tambour", categorie: "Jouet" },
    { mot: "Marionnette", categorie: "Jouet" },
    { mot: "Cerf-volant", categorie: "Jouet" },
    { mot: "Lego", categorie: "Jouet" },
    { mot: "Crayon", categorie: "Objet" },
    { mot: "Peinture", categorie: "Objet" },
    { mot: "Cartable", categorie: "Objet" },
];

function motAleatoire() {
    const index = Math.floor(Math.random() * dicoEnfant.length);
    return dicoEnfant[index];
}

document.addEventListener('DOMContentLoaded', function() {
    const btnAdd = document.querySelector('.btn-add');
    const btnSubmit = document.querySelector('.btn-submit');
    const btnCancel = document.querySelector('.btn-cancel');
    const btnNav = document.querySelector('.btn-nav');
    const btnWord = document.querySelector('.btn-word');
    const addOneBtn = document.querySelector('.add-one-btn');
    const inputForm = document.querySelector('.input-form');
    const wordDisplay = document.querySelector('.dico-word');
    const catDisplay = document.querySelector('.dico-cat');

    if (btnAdd && btnSubmit && btnCancel && btnNav && btnWord && addOneBtn && inputForm && wordDisplay && catDisplay) {

        btnAdd.addEventListener('click', function() {
            addOneBtn.style.display = 'none';
            inputForm.style.display = 'block';
        });

        btnSubmit.addEventListener('click', function() {
            const prenom = document.querySelector('.field-prenom').value.trim();
            const nom = document.querySelector('.field-nom').value.trim();
            const surnom = document.querySelector('.field-surnom').value.trim();

            if (!prenom || !nom) {
                alert('Veuillez remplir au moins le prénom et le nom');
                return;
            }

            const data = { prenom, nom, surnom: surnom || null };
            console.log('Participant ajouté:', data);
            alert(`✅ Participant ajouté : ${prenom} ${nom}`);

            inputForm.style.display = 'none';
            addOneBtn.style.display = 'block';
            document.querySelector('.field-prenom').value = '';
            document.querySelector('.field-nom').value = '';
            document.querySelector('.field-surnom').value = '';
        });

        btnCancel.addEventListener('click', function() {
            inputForm.style.display = 'none';
            addOneBtn.style.display = 'block';
            document.querySelector('.field-prenom').value = '';
            document.querySelector('.field-nom').value = '';
            document.querySelector('.field-surnom').value = '';
        });

        btnNav.addEventListener('click', function() {
            window.location.href = 'reunion.html';
        });

        btnWord.addEventListener('click', function() {
            const resultat = motAleatoire();
            wordDisplay.textContent = resultat.mot;
            catDisplay.textContent = 'Catégorie : ' + resultat.categorie;
            wordDisplay.style.transform = 'scale(1.1)';
            setTimeout(() => { wordDisplay.style.transform = 'scale(1)'; }, 200);
        });

    }
});
