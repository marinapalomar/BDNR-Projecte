
// QUERIES PROJECTE MONGODB

use ProjecteMongoDB

// 1. Les 5 publicacions amb major preu. Mostrar només el títol i preu.
db.publicacions.aggregate([
  { $project: { titol: 1, preu: 1, _id: 0 } },
  { $sort: { preu: -1 } },
  { $limit: 5 }
])


// 2. Valor màxim, mínim i mitjà del preus de les publicacions de l’editorial Juniper. FALTAAAAAAA
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
         genere: "$_id",
         total: 1
      }
   },
   {$sort: {total: -1, genere: 1}}
])

// 5. Per cada editorial, mostrar el recompte de col·leccions finalitzades i no finalitzades.
db.colleccions.aggregate([
{
    $group: {_id: "$Editorial.Nom", finalitzats: {$sum: {$cond: [{ $eq: ["$tancada", true] }, 1, 0]}},
                                    no_finalitzats: {$sum: {$cond: [{ $eq: ["$tancada", false] }, 1, 0]}}}
    
}])

// 6. Mostrar les 2 col·leccions ja finalitzades amb més publicacions. Mostrar 
// editorial i nom col·lecció.
db.colleccions.aggregate([
    {$match: {tancada: true}},
    {$group: { _id: { nom: "$Nom", editorial: "$Editorial.Nom" }, total_publicacions: {$sum: {$size: "$ISBN"}}}},
    {$sort: {total_publicacions: -1}},
    {$limit: 2},
    {$project: {"_id.nom": 1, "_id.editorial": 1}}
])
//De moment ho fem així pel problema de any_inici. Sino, fer project i ya
db.colleccions.aggregate([
{$group: {_id: {collection: "$Nom", editorial: "$Editorial.Nom"},
 total_publicacions: {$sum: {$size: "$ISBN"}}}},
 {$match: {tancada: true}},
 {$sort: {total_publicacions: -1}},
 {$limit: 2},
 {$project: {"_id.editorial": 1, "_id.collection": 1}}])


// 7. Mostrar el país d’origen de l’artista o artistes que han fet més guions.
db.artistes.aggregate([
  {
    $lookup: {
      from: "publicacions",
      localField: "Nom_artistic",
      foreignField: "guionistes",
      as: "guiones"}},
      {$unwind: "$guiones"},
  {
    $group: {
      _id: {nom: "$Nom_artistic", pais: "$pais"}, num_guiones: {$sum: 1}}},
  {
    $sort: {
      num_guiones: -1
    }
  },
  {
    $limit: 1
  },
  {$project: {"_id.pais": 1}}
])


// 8. Mostrar les publicacions amb tots els personatges de tipus “heroe”. FALTAAAAAAA
db.publicacions.aggregate([ 
    { $unwind: "$personatges" }, 
    { $match: { "personatges.tipus": "heroe" } }, 
    { $group: { _id: "$_id", personatges: { $addToSet: "$personatges._id" } } }]), 
    { $lookup: { from: "personatges", localField: "personatges", foreignField: "_id", as: "personatges_info" } }, 
    { $match: { personatges_info: { $size: { $eq: { $size: "$personatges" } } } } }, 
    { $project: { personatges: 0 } } ])

// 9. Modificar el preu de les publicacions amb stock superior a 20 exemplars i incrementar-lo un 25%. 
db.publicacions.updateMany( { stock: { $gt: 20 } }, { $mul: { preu: 1.25 } } )
db.publicacions.aggregate([{$project: {stock: 1, preu:1}}])

// 10. Mostrar ISBN i títol de les publicacions conjuntament amb tota la seva 
// informació dels personatges
db.publicacions.aggregate([{$project: {_id:0, ISBN:1, titol: 1, personatges:1}}])
