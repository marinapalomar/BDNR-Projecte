
// QUERIES PROJECTE MONGODB

use ProjecteMongoDB

// 1. Les 5 publicacions amb major preu. Mostrar només el títol i preu.
db.publicacions.aggregate([
  { $project: { titol: 1, preu: 1, _id: 0 } },
  { $sort: { preu: -1 } },
  { $limit: 5 }
])


// 2. Valor màxim, mínim i mitjà del preus de les publicacions de l’editorial Juniper 
// Books
db.publicacions.aggregate([
  {
    $lookup: {
      from: "colleccions",
      localField: "ISBN",
      foreignField: "ISBN",
      as: "Editorial"
    }
  },
  {
    $match: {
      "Editorial.nom": "Juniper Books"
    }
  },
  {
    $group: {
      _id: null,
      maxPrice: { $max: "$preu" },
      minPrice: { $min: "$preu" },
      avgPrice: { $avg: "$preu" }
    }
  }
])


// 3. Artistes (nom artístic) que participen en més de 5 publicacions com a dibuixant.
db.publicacions.aggregate([
  {
    $match: {
      "dibuixants": { $exists: true } 
    }
  },
  {
    $unwind: "$dibuixants" 
  },
  {
    $group: {
      _id: "$dibuixants",
      count: { $sum: 1 } 
    }
  },
  {
    $match: {
      count: { $gt: 5 } 
    }
  },
  {
    $project: {
      _id: 0,
      "nom artistic": "$_id" 
    }
  }
])


// 4. Numero de col·leccions per gènere. Mostra gènere i número total. 


// 5. Per cada editorial, mostrar el recompte de col·leccions finalitzades i no 
// finalitzades.


// 6. Mostrar les 2 col·leccions ja finalitzades amb més publicacions. Mostrar 
// editorial i nom col·lecció.


// 7. Mostrar el país d’origen de l’artista o artistes que han fet més guions.


// 8. Mostrar les publicacions amb tots els personatges de tipus “heroe”.


// 9. Modificar el preu de les publicacions de primera edició i incrementar-lo un 25%.


// 10. Mostrar ISBN i títol de les publicacions conjuntament amb tota la seva 
// informació dels personatges
