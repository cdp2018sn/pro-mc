const typesDocuments = [
  "rapport",
  "lettre-decision",
  "lettre-procureur",
  "notification-recu",
  // autres types existants
];

<select name="typeDocument" required>
  <option value="">Sélectionner le type</option>
  {typesDocuments.map(type => (
    <option key={type} value={type}>
      {type === "lettre-decision" && "Lettre de décision"}
      {type === "lettre-procureur" && "Lettre au procureur"}
      {type === "notification-recu" && "Notification reçu"}
      {type === "rapport" && "Rapport"}
      {/* Ajoutez d'autres labels si besoin */}
    </option>
  ))}
</select>