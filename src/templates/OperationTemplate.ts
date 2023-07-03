import {Mustache_DictionaryI} from '../OperationParser'

export class OperationTemplate {
    generate: (data: Mustache_DictionaryI) => string
    constructor(generator: (data: Mustache_DictionaryI) => string) {
        this.generate = generator
    }     
 }