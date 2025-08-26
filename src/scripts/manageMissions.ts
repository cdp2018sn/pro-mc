import { executeQuery } from '../database/db';

// Fonction pour ajouter un tag
async function addTag(name: string, color: string) {
  try {
    const query = `
      INSERT INTO tags (name, color)
      VALUES (?, ?)
      RETURNING id;
    `;
    const result = await executeQuery(query, [name, color]);
    console.log(`Tag "${name}" ajouté avec succès`);
    return result[0].id;
  } catch (error) {
    console.error(`Erreur lors de l'ajout du tag "${name}":`, error);
    throw error;
  }
}

// Fonction pour associer un tag à une mission
async function addTagToMission(missionReference: string, tagName: string) {
  try {
    // Récupérer l'ID de la mission
    const missionQuery = `
      SELECT id FROM missions WHERE reference = ?;
    `;
    const missionResult = await executeQuery(missionQuery, [missionReference]);
    if (!missionResult[0]) {
      throw new Error(`Mission "${missionReference}" non trouvée`);
    }
    const missionId = missionResult[0].id;

    // Récupérer l'ID du tag
    const tagQuery = `
      SELECT id FROM tags WHERE name = ?;
    `;
    const tagResult = await executeQuery(tagQuery, [tagName]);
    if (!tagResult[0]) {
      throw new Error(`Tag "${tagName}" non trouvé`);
    }
    const tagId = tagResult[0].id;

    // Associer le tag à la mission
    const linkQuery = `
      INSERT INTO mission_tags (mission_id, tag_id)
      VALUES (?, ?);
    `;
    await executeQuery(linkQuery, [missionId, tagId]);
    console.log(`Tag "${tagName}" associé à la mission "${missionReference}"`);
  } catch (error) {
    console.error('Erreur lors de l\'association du tag:', error);
    throw error;
  }
}

// Fonction pour mettre à jour les heures estimées d'une mission
async function updateMissionHours(missionReference: string, estimatedHours: number) {
  try {
    const query = `
      UPDATE missions 
      SET estimated_hours = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE reference = ?;
    `;
    await executeQuery(query, [estimatedHours, missionReference]);
    console.log(`Heures estimées mises à jour pour la mission "${missionReference}"`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des heures estimées:', error);
    throw error;
  }
}

// Fonction pour afficher les détails d'une mission avec ses tags
async function showMissionDetails(missionReference: string) {
  try {
    const query = `
      SELECT 
        m.*,
        GROUP_CONCAT(t.name) as tags
      FROM missions m
      LEFT JOIN mission_tags mt ON m.id = mt.mission_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE m.reference = ?
      GROUP BY m.id;
    `;
    const result = await executeQuery(query, [missionReference]);
    console.log('\nDétails de la mission:');
    console.table(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    throw error;
  }
}

// Exemple d'utilisation
async function main() {
  try {
    // 1. Créer quelques tags
    await addTag('Urgent', '#FF0000');
    await addTag('RGPD', '#00FF00');
    await addTag('Audit', '#0000FF');

    // 2. Associer des tags à la première mission
    const missionRef = 'MIS-764952-1CF'; // Référence de la mission RGPD
    await addTagToMission(missionRef, 'RGPD');
    await addTagToMission(missionRef, 'Urgent');

    // 3. Mettre à jour les heures estimées
    await updateMissionHours(missionRef, 40); // 40 heures estimées

    // 4. Afficher les détails mis à jour
    await showMissionDetails(missionRef);

  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
  }
}

// Exécuter le script
main(); 