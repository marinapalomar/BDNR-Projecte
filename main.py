from pymongo import MongoClient
from options import Options
import json
import pandas as pd

### PARAMETRES DE CONNEXIÓ
mongoUser = ''
mongoPassword = ''
mongoDB = ''

# En execució remota
Host = 'localhost' # localhost per connexions a la màquina main
Port = 27017

### CONNEXIÓ
DSN = "mongodb://{}:{}".format(Host,Port)
conn = MongoClient(DSN)
#Selecciona la base de dades a utilitzar --> test (si es la primera vegada la crea)
bd = conn['ProjecteMongoDB']
opts = Options()
args = opts.parse()


### CREEM LES DIFERENTS COLECCIONS (si no ho estan)
ll_coleccions = ['artistes', 'publicacions', 'colleccions']

if("ProjecteMongoDB" in conn.list_database_names()):
    print("La base de dades ProjecteMongoDB existeix en MongoDB")
    print("Eliminant base de dades...")
    conn.drop_database("ProjecteMongoDB")

print("Creant base de dades...")
bd = conn['ProjecteMongoDB']
for nom_coleccio in ll_coleccions:
    if(nom_coleccio in bd.list_collection_names()):
        coll = bd.create_collection(nom_coleccio)


### CARREGUEM ELS CSV en format DataFrame per a poder
data_P = pd.read_csv("personatges.csv", delimiter=';')
data_C = pd.read_csv("coleccions.csv", delimiter=';')
data_A = pd.read_csv("artistes.csv", delimiter=';')


### TRACTAMENT ESPECIAL PER A CADA CSV I CADA COLECCIÓ

    ## ARTISTES: (referència ja feta, data_A -> json)
json_A = json.loads(data_A.to_json(orient='records'))

    ## PERSONATGES (fem una llista de diccionaris amb clau isbn per a afegir-ho despres com a embedded)
dicc_Pe = {}
for _,i in data_P.iterrows():
    if(i['isbn'] not in dicc_Pe.keys()):
        dicc_Pe[int(i['isbn'])] = [{'nom': i['nom'], 'tipus': i['tipus']}]
    else:
        dicc_Pe[int(i['isbn'])].append({'nom': i['nom'], 'tipus': i['tipus']})

    ## PUBLICACIO (separem del df principal, amb personatges ben posats ja)
atr_pu = ['ISBN', 'titol', 'stock', 'autor', 'preu', 'num_pagines', 'guionistes', 'dibuixants']
dicc_Pu = data_C[atr_pu].to_dict(orient='records')
for i in dicc_Pu:
    if(i['ISBN'] in dicc_Pe.keys()):
        i['personatges'] = dicc_Pe[i['ISBN']]
    # Canviem el format de guionistes i dibuixants (d'string a llista d'strings)
    i['guionistes'] = i['guionistes'][1:-1].split(", ")
    i['dibuixants'] = i['dibuixants'][1:-1].split(", ")
json_P = dicc_Pu

    ## SEPAREM COL·LECCIO i deixem REFERENCIA amb PUBLICACIO!
atr_c = ['NomColleccio', 'total_exemplars', 'genere', 'idioma', 'any_inici', 'tancada',
           'NomEditorial', 'responsable', 'adreca', 'pais']
data_Cp = data_C.copy()
data_Cg = data_Cp.groupby(atr_c).agg({'ISBN': lambda x: list(set(x))}).reset_index() #set per ordenar els ISBN
dicc_C = data_Cg.to_dict(orient='records')

    ## EDITORIAL dins de COL·LECCIÓ (embedded una vegada ja tinguem tot a diccionari)
# Assumim que cada colecció té sempre la mateixa editorial (cert) i per tant afegim aquestes dades al group by
for i in dicc_C:
    # Canviem el format de genere (d'string a llista d'strings) i el nom de coleccio
    i['genere'] = i['genere'][1:-1].split(", ")
    i['Nom'] = i['NomColleccio']
    del(i['NomColleccio'])
    i["Editorial"] = {"Nom": i['NomEditorial'], "responsable": i['responsable'], "adreca": i['adreca'], "pais": i["pais"]}
    del(i['NomEditorial'])
    del(i['responsable'])
    del(i['adreca'])
    del(i['pais'])
json_C = dicc_C


### Un cop ja tenim en el format que volem, inserim tot a la base de dades
bd.artistes.insert_many(json_A)
bd.publicacions.insert_many(json_P)
bd.colleccions.insert_many(json_C)


### Tanquem les connexions i el tunel
conn.close()