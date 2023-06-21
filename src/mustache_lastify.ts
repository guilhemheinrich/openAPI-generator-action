export default function addLastPropertyJson(something: any, lastable = false, from_array = false) {
    let deep_copy: any
    if (from_array) {
        deep_copy = processFromArray(something)
    } else {
        deep_copy = JSON.parse(JSON.stringify(something))
    }
    if (Array.isArray(deep_copy)) {
        for (let index = 0;  index < deep_copy.length; index++) {
            if (index == deep_copy.length - 1) {
                deep_copy[index] = addLastPropertyJson(deep_copy[index], true, true)
            }
            deep_copy[index] = addLastPropertyJson(deep_copy[index], false, true)
        }
    } else if (typeof deep_copy === 'object' && deep_copy !== null) {
        for (let key of Object.keys(deep_copy)) {
            deep_copy[key] = addLastPropertyJson(deep_copy[key])
        }
        if (lastable) {
            deep_copy['last'] = true
        } 
    } else {
        return deep_copy
    }
    return deep_copy
}

function processFromArray(something: any) {
    let deep_copy = JSON.parse(JSON.stringify(something))
    if (Array.isArray(deep_copy) || !(typeof deep_copy === 'object' && deep_copy !== null)) {
        return {
            value: deep_copy
        }
        
    } else {
        return deep_copy
    }
    
}

// let test = addLastPropertyJson({
//     'a': 1,
//     'array': [
//         'a', 'b'
//     ],
//     'object_simple': {
//         'a': 1,
//         'b': "hello"
//     },
//     'object_complex': {
//         'array': [
//             {'name': "Carl_1"},
//             {'name': "Carl_2"},
//             {'name': "Carl_3"},
//             {'name': "Carl_4"}
//         ]
//     }
// })

// console.log(JSON.stringify(test))