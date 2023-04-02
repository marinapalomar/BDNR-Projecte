
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
    }}])
// ,
//   {
//     $match: {
//       "Editorial.nom": "Juniper Books"
//     }
//   },
//   {
//     $group: {
//       _id: null,
//       maxPrice: { $max: "$preu" },
//       minPrice: { $min: "$preu" },
//       avgPrice: { $avg: "$preu" }
//     }
//   }
// ])


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
db.colleccions.aggregate([
   { $unwind: "$genere" },
   {
      $group: {
         _id: "$genere",
         total: { $sum: 1 }
      }
   },
   {
      $project: {
         _id: 0,
         genero: "$_id",
         total: 1
      }
   }
])

// 5. Per cada editorial, mostrar el recompte de col·leccions finalitzades i no finalitzades.
db.colleccions.aggregate([
    {$group : {
        _id: ["$Editorial.Nom","$tancada"],
        count: { $sum: 1 }
    }}])

// 6. Mostrar les 2 col·leccions ja finalitzades amb més publicacions. Mostrar 
// editorial i nom col·lecció.
db.colleccions.aggregate([
    {$match: {tancada: true}},
    {$group: { _id: { nom: "$Nom", editorial: "$Editorial.Nom" }, total_publicacions: {$sum: {$size: "$ISBN"}}}},
    {$sort: {total_publicacions: -1}},
    {$limit: 2}
])
//De moment ho fem així pel problema de any_inici. Sino, fer project i ya


// 7. Mostrar el país d’origen de l’artista o artistes que han fet més guions.
db.artistes.aggregate([
  {
    $lookup: {
      from: "publicacions",
      localField: "Nom_artistic",
      foreignField: "guionistes",
      as: "guiones"
    }
  },
  {
    $unwind: "$guiones"
  },
  {
    $group: {
      _id: "$pais",
      num_guiones: {
        $sum: {
          $cond: [
            { $isArray: "$guiones.guionistes" },
            { $size: "$guiones.guionistes" },
            0
          ]
        }
      }
    }
  },
  {
    $sort: {
      num_guiones: -1
    }
  },
  {
    $limit: 1
  }
])


// 8. Mostrar les publicacions amb tots els personatges de tipus “heroe”.


// 9. Modificar el preu de les publicacions de primera edició i incrementar-lo un 25%.


// 10. Mostrar ISBN i títol de les publicacions conjuntament amb tota la seva 
// informació dels personatges
