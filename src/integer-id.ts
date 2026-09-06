class IntegerId {

  private currentValue : number;

  constructor(startValue: number = 1 ) {
    this.currentValue = startValue;
  }

  nextId() : number {
    const allocatedValue = this.currentValue;
    this.currentValue++;
    return allocatedValue;
  }
}

export default IntegerId;
