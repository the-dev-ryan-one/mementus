
class Dog {

  name: string

constructor(name : string) {
    this.name = name
  }
}

class Cat {

  name: string
  weight: number

  constructor(name: string , weight : number) {
    this.name = name
    this.weight = weight
  }
}

class Person {

  name : string
  weight : number
  age : number

  constructor(name : string , weight : number , age : number) {

    this.name = name
    this.weight = weight
    this.age = age

  }
}

// takes a class and args and constructs any of them
// function instantiate(Ctor, ...args)

type catParams = ConstructorParameters<typeof Cat>

const objectWithcataParamConstructorTypes : catParams = ["John" , 83]
console.log(objectWithcataParamConstructorTypes)