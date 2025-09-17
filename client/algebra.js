// Helpers

// Takes Two relations and checks if they have the same attributes
// Used in minus and interesct
function checkCompatibility(relationOne, relationTwo){
   for (let attribute of relationOne.attributes) {
        if (!relationTwo.attributes.includes(attribute)) {
            return false;
        }
    }
    return true
}

// Checks if two rows have the same values
function rowEquals(rowOne, rowTwo) {
    for (let i = 0; i < rowOne.length; i++) {
        if (!rowOne.includes(rowTwo[i])){
            return false
        }
    }
    return true
}

// Operations

function select(relation, column, sign, value){
    // console.dir(relation)

    let newRelation = {name:'[' +relation.name + "_select_" + column + sign + value + ']', attributes:relation.attributes, tuples:[]}
    let columnIndex = -1
    for (let i = 0; i < relation.attributes.length; i++) {
        if (relation.attributes[i] === column) {
            columnIndex = i
            break
        }
    }
    if (columnIndex < 0){
        console.log("Not a valid column for selection")
        return null
    }

    switch (sign){
        case '>=':
            for (let tuple of relation.tuples) {
                if (tuple[columnIndex] >= value) {
                    newRelation.tuples.push(tuple)
                }
            }
            break
        case '<=':
            for (let tuple of relation.tuples) {
                if (tuple[columnIndex] <= value) {
                    newRelation.tuples.push(tuple)
                }
            }
            break
        case '>':
            for (let tuple of relation.tuples) {
                if (tuple[columnIndex] > value) {
                    newRelation.tuples.push(tuple)
                }
            }
            break
        case '<':
            for (let tuple of relation.tuples) {
                if (tuple[columnIndex] < value) {
                    newRelation.tuples.push(tuple)
                }
            }
            break
        case '=':
            for (let tuple of relation.tuples) {
                if (tuple[columnIndex] == value) {
                    newRelation.tuples.push(tuple)
                }
            }
            break
        default:
            console.log("Not a valid comparison operation")
            return null
    }
    return newRelation
}

function project(relation, columns) {
    let columnsList = columns.split(",")

    let newRelation = {name: "[" + relation.name + '_Project_' + columns + "]", attributes:[], tuples:[]}
    for (let index of relation.tuples) {
        newRelation.tuples.push([])
    }

    for (let i = 0; i < relation.attributes.length; i++) {
        if (columnsList.includes(relation.attributes[i])) {
            newRelation.attributes.push(relation.attributes[i])
            for (let k = 0; k < relation.tuples.length; k++) {
                newRelation.tuples[k].push(relation.tuples[k][i])
            }
        }
    }
    return newRelation
}

function join(relationOne, relationTwo, compareOne, compareTwo) {
    let indexOfAttribute1 = relationOne.attributes.indexOf(compareOne)
    let indexOfAttribute2 = relationTwo.attributes.indexOf(compareTwo)
    if (indexOfAttribute1 === undefined || indexOfAttribute2 === undefined) {
        console.log("Invalid Attribute")
        return null
    }

    let newRelation = {name: '[' + relationOne.name + "_join_"+compareOne+"="+compareTwo+"_" + relationTwo.name + ']', attributes: relationOne.attributes, tuples: []}
    newRelation.attributes = newRelation.attributes.concat(relationTwo.attributes)

    for (let tupleOne of relationOne.tuples) {
        for (let tupleTwo of relationTwo.tuples){
            if (tupleOne[indexOfAttribute1] === tupleTwo[indexOfAttribute2]){
                let newRelationTuple = tupleOne.concat(tupleTwo)
                newRelation.tuples.push(newRelationTuple)
                break
            }
        }
    }
    return newRelation
}

// Everything in both tables no duplicates
function union(relationOne, relationTwo) {
    // compare attributes
    if (!checkCompatibility(relationOne, relationTwo)){
        console.log('Attributes must be compatiable')
        return null
    }

    let newRelation = {name: '[' +relationOne.name + "_union_" + relationTwo.name + ']', attributes:relationOne.attributes, tuples: []}
    for (let tuple of relationOne.tuples) {
        newRelation.tuples.push(tuple)
    }

    for (let rowTwo of relationTwo.tuples) {
        let inRelationOne = false
        for (let rowOne of relationOne.tuples) {
            if (rowEquals(rowOne, rowTwo)){
                inRelationOne = true
                break
            }
        }
        if (!inRelationOne) {
            newRelation.tuples.push(rowTwo)
        }
    }

    // console.dir(newRelation)
    return newRelation
}

// Only shows rows which are in both tables
function intersect(relationOne, relationTwo) {
    // compare attributes
    if (!checkCompatibility(relationOne, relationTwo)){
        console.log('Attributes must be compatiable')
        return null
    }
    // console.log("Intersect On:")
    // console.dir(relationOne)
    // console.dir(relationTwo)

    let newRelation = {name:'[' +relationOne.name+"_intersect_" + relationTwo.name +']', attributes:relationOne.attributes, tuples: []}

    for (let rowOne of relationOne.tuples) {
        let inRelationOne = false
        for (let rowTwo of relationTwo.tuples) {
            if (rowEquals(rowOne, rowTwo)){
                inRelationOne = true
                break
            }
        }
        if (inRelationOne) {
            newRelation.tuples.push(rowOne)
        }
    }

    // console.dir(newRelation)
    return newRelation
}

// Removes rows from table one which are in table two
function minus(relationOne, relationTwo) {
    // compare attributes
    if (!checkCompatibility(relationOne, relationTwo)){
        console.log('Attributes must be compatiable')
        return null
    }

    let newRelation = {name: '['+relationOne.name + "_minus_" + relationTwo.name + ']', attributes:relationOne.attributes, tuples: []}

    // Compare the tuples
    for (let rowOne of relationOne.tuples) {
        let inRelationOne = false
        for (let rowTwo of relationTwo.tuples) {
            if (rowEquals(rowOne, rowTwo)){
                inRelationOne = true
                break
            }
        }
        if (!inRelationOne) {
            newRelation.tuples.push(rowOne)
        }
    }

    // console.dir(newRelation)
    return newRelation
}
