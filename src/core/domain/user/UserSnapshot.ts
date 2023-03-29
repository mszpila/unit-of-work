export class UserSnapshot {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly numberOfVehicles: number,
    public readonly version: number,
  ) {}
}