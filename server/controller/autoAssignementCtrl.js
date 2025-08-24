const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { spawn } = require('child_process');
const path = require('path');

const getRecommandations = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const scriptPath = path.join(__dirname, '..', 'IA', 'task_recommender.py');

    const python = spawn('python', [scriptPath, userId ,"--no-file"]);

    let dataBuffer = '';

    // Lire stdout chunk par chunk et concaténer en UTF-8
    python.stdout.on('data', (chunk) => {
        dataBuffer += chunk.toString('utf-8');
    });

    // Quand le script se termine, parser le JSON
    python.stdout.on('end', () => {
        try {
            const recommendationData = JSON.parse(dataBuffer);
            console.log(JSON.stringify(recommendationData, null, 2)); // Affiche correctement les accents
            res.json(recommendationData);
        } catch (err) {
            console.error('Erreur parsing JSON :', err);
            res.status(500).send("Erreur JSON");
        }
    });

    python.stderr.on('data', (data) => {
        console.error(`Erreur : ${data.toString()}`);
        res.status(500).send("Erreur lors de l'exécution du modèle.");
    });
});

module.exports = {
    getRecommandations
};
