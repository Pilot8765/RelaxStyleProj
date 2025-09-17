// Holds all the relations

// Seperate code into relations and Querys
function parseFullText() {
    let relations = []

    let textArea = document.getElementById('textArea')
    let text = textArea.value
    // Cleans text of duplicate spaces and newline characters
    text = text.replace(/\n{2,}/g, '\n').replace(/ {2,}/g, ' ')

    const marker = '\x1F'

    text = text.replaceAll('}', `}${marker}`).replaceAll('Query:',`${marker}Query:`)
    let parts = text.split(marker)

    // Querries done last so data isn't missing
    let queries = []
    for (let part of parts) {
        // Query can part of a relation just not its name
        part = part.replace(/^\n+/, "") // Removes '\n' char from front
        if (part === ''){
            continue
        }else if (part.startsWith('Query:')) {
            queries.push(part)
        }else{
            relations.push(parseRelations(part))
        }
    }
    textArea.value = ''
    for (let relation of relations) {
        textArea.value += prettyPrintRelation(relation)
    }

    // console.dir(relations)
    for (let query of queries) {
        parseQuerry(query, relations)
    }
}

// Process The relations and convert them into a data-structure
// Should be a dictionary of relations key name of relation value an object representing the relation
function parseRelations(relation){
    let relationLines = relation.split('\n')

    let relationDefinition = relationLines[0]

    relationLines.shift() // First describes the relation
    relationLines.pop() // Last is '}'
    
    let name = relationDefinition.substring(0, relationDefinition.indexOf('('))
    name = name.trim()

    let attributes = relationDefinition.substring(relationDefinition.indexOf('(') + 1, relationDefinition.indexOf(')'))
    attributes = attributes.split(/\s?,\s?/)

    let tuples = []


    for (let line of relationLines) {
        let data = line.split(/\s?,\s?/)
        tuples.push(data)
    }

    let relationObj = {
        name: name,
        attributes: attributes,
        tuples: tuples
    }

    // console.dir(relationObj)
    return relationObj
}

// Querry can be multiple parts seperated by '()'
//  Completed inside->out

function parseQuerry(query, relations) {
    // Takes out the inner most query
    let ogQuery = query

    query = query.slice(query.indexOf(':')+1)
    query = query.trim()
    let temp = null
    let completed = false


    while (!completed){
        let parts = []
        let partialQuery = ''
        let fullPartialQuery = ''
        query = query.trim()

        if (query.includes('(')) {
            fullPartialQuery = query.substring(query.lastIndexOf('('))
            let indexOfClosing = fullPartialQuery.indexOf(')')
            fullPartialQuery = fullPartialQuery.substring(0, indexOfClosing+1)
            
            partialQuery = fullPartialQuery.substring(1, fullPartialQuery.length - 1)
            partialQuery = partialQuery.trim()

            parts = partialQuery.split(' ')

        }else{
            completed = true
            parts = query.split(' ')
        }
        // console.log("FPQuery: " + fullPartialQuery)
        // console.log("Query: " + query)
        // console.log("PQuery: " + partialQuery)

        for (let i = 0; i < parts.length; i++) {
            let relation = getRelation(parts[i], relations)
            if (relation !== null){
                parts[i] = relation
            }
        }

        if (parts.length <= 1) { // If its just a relation
            temp = parts[0]
        }else{
            temp = doQuery(parts)
            if (temp !== null){
                relations.push(temp)
            }
        }
        if (partialQuery !== '') {
            query = query.replace(fullPartialQuery, temp.name)
        }
    }
    if (temp === null) {
        console.log("Invalid Query")
        document.getElementById('textArea').value += ogQuery + "Invalid Query\n\n"
    }else{
        displayRelation(temp, ogQuery)
    }
}

function getRelation(relationName, relations) {
    // console.dir(relations)
    for (let relation of relations) {
        if (relationName === relation.name) {
            return relation
        }
    }
    return null
}

function doQuery(queryParts) {
    const operations = ['select', 'project', 'join', 'union', 'intersect', 'minus']
    let operation = ''

    let newRelation = null
    if (typeof queryParts[0] === typeof ""){
        if (operations.includes(queryParts[0].toLowerCase())){
            operation = queryParts.shift().toLowerCase()
        }
    }else if (typeof queryParts[1] === typeof ""){
        if (operations.includes(queryParts[1].toLowerCase())) {
            operation = (queryParts.splice(1, 1))
            operation = operation[0].toLowerCase()
        }
    }
    
    // console.log('Operation: ' + operation)
    // console.dir('Parts: '+queryParts)

    switch(operation){
        case 'select':
            newRelation = select(queryParts[3], queryParts[0], queryParts[1], queryParts[2])
            break
        case 'project':
            newRelation = project(queryParts[1], queryParts[0])
            break
        case 'join':
            // console.log(queryParts)
            newRelation = join(queryParts[0], queryParts[4], queryParts[1], queryParts[3])
            break
        case 'union':
            newRelation = union(queryParts[0], queryParts[1])
            break
        case 'intersect':
            newRelation = intersect(queryParts[0], queryParts[1])
            break
        case 'minus':
            newRelation = minus(queryParts[0], queryParts[1])
            break
        default:
            console.log(operation + " is not a valid Operation")
    }

    return newRelation

}

function displayRelation(relation, query){
    console.log("Result of " + query)
    console.dir(relation)
    document.getElementById('textArea').value += query + prettyPrintRelation(relation, query)
    document.getElementById('tableArea').innerHTML += relationToTable(relation, query)
}

function prettyPrintRelation(relation){
    let relationStr = relation.name + " ("
    for (let attribute of relation.attributes) {
        relationStr += attribute + ', '
    }
    relationStr = relationStr.substring(0, relationStr.length - 2) + ") = {\n"
    for (let tuple of relation.tuples) {
        relationStr += ' '
        for (let value of tuple) {
            relationStr += value + ', '
        }
        relationStr = relationStr.substring(0, relationStr.length -2) + "\n"
    }
    relationStr += "}\n\n"
    return relationStr
}

function relationToTable(relation, query){
    let tableStr = "<p>"  + query + "</p>"
    tableStr += '<table border="1px solid black"><tr>'
    for (let attribute of relation.attributes) {
        tableStr += '<th>' + attribute + '</th>'
    }
    tableStr += '</tr>'
    for (let tuple of relation.tuples) {
        tableStr += '<tr>'
        for (let value of tuple) {
            tableStr += '<td>' + value + '</td>'
        }
        tableStr += '</tr>'
    }
    tableStr += '</table>'
    console.log("tableStr" +tableStr)
    return tableStr
}