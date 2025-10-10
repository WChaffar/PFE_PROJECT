const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { spawn } = require('child_process');
const path = require('path');

const getRecommandations = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { projectIds } = req.query;
    const scriptPath = path.join(__dirname, '..', 'IA', 'task_recommender.py');

    // Préparer les arguments pour le script Python
    const pythonArgs = [scriptPath, userId, "--no-file"];
    
    // Ajouter les IDs de projets si fournis
    if (projectIds) {
        pythonArgs.push("--project-ids", projectIds);
        console.log(`🎯 Running IA with filtered projects: ${projectIds}`);
    } else {
        console.log(`⚠️ Running IA without project filtering for user: ${userId}`);
    }

    const python = spawn('python', pythonArgs);

    let dataBuffer = '';
    let responseAlreadySent = false;

    // Lire stdout chunk par chunk et concaténer en UTF-8
    python.stdout.on('data', (chunk) => {
        dataBuffer += chunk.toString('utf-8');
    });

    // Quand le script se termine, parser le JSON
    python.stdout.on('end', () => {
        if (responseAlreadySent) return;
        
        try {
            const recommendationData = JSON.parse(dataBuffer);
            console.log('📊 IA Recommendations generated:', JSON.stringify(recommendationData, null, 2));
            responseAlreadySent = true;
            res.json(recommendationData);
        } catch (err) {
            console.error('Erreur parsing JSON :', err);
            responseAlreadySent = true;
            res.status(500).send("Erreur JSON");
        }
    });

    python.stderr.on('data', (data) => {
        const errorMessage = data.toString();
        console.error(`Log IA Script : ${errorMessage}`);
        
        // Ne traiter comme erreur que si c'est vraiment une erreur critique
        if (errorMessage.includes('Error:') || errorMessage.includes('Exception:')) {
            if (!responseAlreadySent) {
                responseAlreadySent = true;
                res.status(500).send("Erreur lors de l'exécution du modèle.");
            }
        }
    });

    // Gérer les erreurs de processus
    python.on('error', (error) => {
        if (!responseAlreadySent) {
            console.error('Erreur processus Python:', error);
            responseAlreadySent = true;
            res.status(500).send("Erreur lors du lancement du script IA.");
        }
    });
});

module.exports = {
    getRecommandations
};
