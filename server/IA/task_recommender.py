import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from config.mongodb_connection import get_db_connection
import json
import sys
import argparse

# --- Connexion MongoDB --- #
db = get_db_connection()

# --- Charger les collections MongoDB --- #
users = pd.DataFrame(list(db.users.find()))
tasks = pd.DataFrame(list(db.tasks.find()))
assignments = pd.DataFrame(list(db.assignments.find()))
projects = pd.DataFrame(list(db.projects.find()))
absences = pd.DataFrame(list(db.absences.find()))

# --- Forcer types string pour les IDs connus --- #
id_like_cols = ["_id", "employee", "task", "taskId", "project", "Owner", "owner"]
for df in [users, tasks, assignments, projects, absences]:
    for col in id_like_cols:
        if col in df.columns:
            df[col] = df[col].astype(str)

# --- Helper : conversion date --- #
def parse_date(x):
    try:
        return pd.to_datetime(x)
    except Exception:
        return pd.NaT

for df, cols in [
    (projects, ["startDate", "endDate"]),
    (tasks, ["startDate", "endDate"]),
    (assignments, ["startDate", "endDate"]),
    (absences, ["startDate", "endDate"]),
]:
    for c in cols:
        if c in df.columns:
            df[c] = df[c].apply(parse_date)

# --- Vérifier chevauchement --- #
def chevauchement(d1_start, d1_end, d2_start, d2_end):
    if pd.isna(d1_start) or pd.isna(d1_end) or pd.isna(d2_start) or pd.isna(d2_end):
        return False
    return not (d1_end < d2_start or d2_end < d1_start)

# --- Vérifier si employé absent sur la période --- #
def est_absent(user_id, task_start, task_end):
    abs_user = absences[absences["employee"] == user_id]
    for _, a in abs_user.iterrows():
        if chevauchement(a.get("startDate"), a.get("endDate"), task_start, task_end):
            return True
    return False

# --- Compter charge de travail d’un employé --- #
def charge_travail(user_id, task_start, task_end):
    assign_user = assignments[assignments["employee"] == user_id]
    count = 0
    for _, a in assign_user.iterrows():
        if chevauchement(a.get("startDate"), a.get("endDate"), task_start, task_end):
            count += 1
    return count

# --- Extraire features employé/tâche --- #
def extract_features(user, task, workload):
    # --- Compétences utilisateur --- #
    if "keySkills" in user and isinstance(user["keySkills"], list):
        user_skills = [str(s).strip().lower() for s in user["keySkills"] if s]
    else:
        user_skills = [str(user.get(f"keySkills[{i}]", "")).strip().lower()
                       for i in range(12) if f"keySkills[{i}]" in user.index]
    user_skills = [s for s in user_skills if s not in ("", "nan")]

    # --- Compétences requises --- #
    if "requiredSkills" in task and isinstance(task["requiredSkills"], list):
        task_skills = [str(s).strip().lower() for s in task["requiredSkills"] if s]
    else:
        task_skills = [str(task.get(f"requiredSkills[{i}]", "")).strip().lower()
                       for i in range(12) if f"requiredSkills[{i}]" in task.index]
    task_skills = [s for s in task_skills if s not in ("", "nan")]

    skill_match = len(set(user_skills) & set(task_skills))

    # --- Certifications utilisateur --- #
    if "certifications" in user and isinstance(user["certifications"], list):
        user_certs = [str(s).strip().lower() for s in user["certifications"] if s]
    else:
        user_certs = [str(user.get(f"certifications[{i}]", "")).strip().lower()
                      for i in range(6) if f"certifications[{i}]" in user.index]
    user_certs = [s for s in user_certs if s not in ("", "nan")]

    # --- Certifications requises --- #
    if "requiredCertifications" in task and isinstance(task["requiredCertifications"], list):
        task_certs = [str(s).strip().lower() for s in task["requiredCertifications"] if s]
    else:
        task_certs = [str(task.get(f"requiredCertifications[{i}]", "")).strip().lower()
                      for i in range(6) if f"requiredCertifications[{i}]" in task.index]
    task_certs = [s for s in task_certs if s not in ("", "nan")]

    cert_match = len(set(user_certs) & set(task_certs))

    # --- Durée (jours) --- #
    duration = 0
    try:
        ts, te = task.get("startDate"), task.get("endDate")
        if pd.notna(ts) and pd.notna(te):
            ts, te = pd.to_datetime(ts), pd.to_datetime(te)

            # Supposons que ts et te soient des objets Timestamp
            # Créer une série de dates entre ts et te inclus
            all_days = pd.date_range(start=ts, end=te)
            
            # Filtrer pour ne garder que les jours de semaine (Monday=0, Sunday=6)
            working_days = all_days[all_days.dayofweek < 5]
            
            # Nombre de jours ouvrés
            duration = len(working_days)


            # ensure at least 1 day
            duration = max(1, duration)
    except Exception:
        duration = 0

    return [skill_match, cert_match, duration, workload]


# --- Construire dataset d’entraînement --- #
data = []
ok_count = 0

# Colonne de référence pour l'ID tâche dans assignments
task_ref_col = "taskId" if "taskId" in assignments.columns else ("task" if "task" in assignments.columns else None)
if task_ref_col is None:
    print("❌ Aucune colonne tâche (taskId/task) dans assignments.")
    sys.exit(1)

for _, a in assignments.iterrows():
    # Récupérer user + task corrélés
    task_row = tasks[tasks["_id"] == str(a[task_ref_col])]
    user_row = users[users["_id"] == str(a["employee"])]

    if task_row.empty or user_row.empty:
        continue

    ok_count += 1
    task = task_row.iloc[0]
    user = user_row.iloc[0]

    wl = charge_travail(user["_id"], task.get("startDate"), task.get("endDate"))
    features = extract_features(user, task, wl)
    label = 1  # positif
    data.append(features + [label])

# print(f"Assignments utilisés comme positifs: {ok_count}")

# --- Générer des négatifs artificiels --- #
negatives = []
n_neg = max(5, ok_count)  # au moins autant de négatifs que de positifs

rng = np.random.default_rng(42)
user_ids = users["_id"].astype(str).tolist()
task_ids = tasks["_id"].astype(str).tolist()

existing_pairs = set(zip(assignments["employee"].astype(str), assignments[task_ref_col].astype(str)))

tries = 0
while len(negatives) < n_neg and tries < n_neg * 20:
    tries += 1
    uid = rng.choice(user_ids)
    tid = rng.choice(task_ids)

    if (uid, tid) in existing_pairs:
        continue

    user = users[users["_id"] == uid].iloc[0]
    task = tasks[tasks["_id"] == tid].iloc[0]

    wl = charge_travail(uid, task.get("startDate"), task.get("endDate"))
    features = extract_features(user, task, wl)
    negatives.append(features + [0])  # label 0

# print(f"Négatifs artificiels ajoutés: {len(negatives)}")

# Fusionner données
data.extend(negatives)
df = pd.DataFrame(data, columns=["skill_match", "cert_match", "duration", "workload", "label"])

if df.empty:
    print("❌ Pas de données d'entraînement trouvées. Vérifie que les IDs correspondent.")
    sys.exit(1)

# --- Entraînement modèle IA --- #
X = df[["skill_match", "cert_match", "duration", "workload"]]
y = df["label"]

if len(X) > 5:
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
else:
    X_train, y_train = X, y
    X_test, y_test = X, y

model = RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42)
model.fit(X_train, y_train)

# --- Fonction principale --- #
def recommander_taches(employee_id, top_k=3):
    user_row = users[users["_id"] == str(employee_id)]
    if user_row.empty:
        return []
    user = user_row.iloc[0]

    recommandations = []
    for _, task in tasks.iterrows():
        # Filtrer si dates de la tâche invalides
        ts, te = task.get("startDate"), task.get("endDate")
        if pd.isna(ts) or pd.isna(te):
            continue

        # Exclure si l'utilisateur est absent sur cette période
        if est_absent(str(employee_id), ts, te):
            continue

        wl = charge_travail(str(employee_id), ts, te)
        features = extract_features(user, task, wl)
        X_new = pd.DataFrame([features], columns=["skill_match", "cert_match", "duration", "workload"])
        # S'assurer que predict_proba a 2 classes
        proba = model.predict_proba(X_new)[0][1] if len(model.classes_) == 2 else float(model.predict_proba(X_new)[0].max())

        # Pénaliser la surcharge de travail
        if wl > 0:
            proba = proba * (1.0 / (1.0 + wl))

        # Info projet
        project_name = ""
        proj_id = task.get("project", "")
        if isinstance(proj_id, str) and len(proj_id) > 0:
            proj_row = projects[projects["_id"] == proj_id]
            if not proj_row.empty:
                project_name = str(proj_row.iloc[0].get("projectName", ""))

        recommandations.append({
            "task_id": str(task.get("_id", "")),
            "project_id": str(task.get("project", "")),
            "task": str(task.get("taskName", "")),
            "project": project_name,
            "probabilite_succes": round(float(proba), 3),
            "dates": {
                "start": str(ts),
                "end": str(te),
            },
            "duration": features[2],
            "justification": f"{features[0]} matched skills, {features[1]} matched certifications, duration {features[2]} days, workload {wl} task(s)"
        })

    recommandations = sorted(recommandations, key=lambda x: x["probabilite_succes"], reverse=True)[:top_k]
    return recommandations

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Recommandateur de tâches pour employés")
    parser.add_argument("employee_id", help="ID de l'employé à analyser")
    parser.add_argument("--no-file", action="store_true", help="N'écrit pas le fichier recommandations.json")
    args = parser.parse_args()

    employee_id = args.employee_id
    reco = recommander_taches(employee_id)

    result_json = {"employee": employee_id, "recommendations": reco}

    # Écriture dans fichier seulement si --no-file n'est pas présent
    if not args.no_file:
        with open("recommandations.json", "w", encoding="utf-8") as f:
            json.dump(result_json, f, indent=4, ensure_ascii=False)

    # Affichage console
    sys.stdout.buffer.write(json.dumps(result_json, ensure_ascii=False).encode('utf-8'))
    sys.stdout.flush()