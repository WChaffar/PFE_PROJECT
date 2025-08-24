import os
import pymongo
#from dotenv import load_dotenv

# Charger les variables d'environnement depuis un fichier .env
#load_dotenv()

def get_db_connection():
    """
    Établit une connexion à MongoDB et retourne la base de données.
    """
    try:
        mongo_uri="mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/?retryWrites=true&w=majority&appName=PFECluster"
        if mongo_uri is None:
            raise ValueError("L'URI de MongoDB n'est pas définie dans le fichier .env")
        
        # Créer une connexion à MongoDB
        client = pymongo.MongoClient(mongo_uri)
        
        db = client["PFEDB"]
        
        #print("Connexion à MongoDB réussie")
        return db
    except Exception as e:
        print(f"Erreur de connexion à MongoDB : {e}")
        return None
