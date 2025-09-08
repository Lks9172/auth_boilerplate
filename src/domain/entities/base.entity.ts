export type EntityId = number | string;

export abstract class Entity<T> {
  protected readonly props: T;
  protected readonly _id: EntityId;

  constructor(props: T, id?: EntityId) {
    this.props = props;
    this._id = id || this.generateId();
  }

  get id(): EntityId {
    return this._id;
  }

  protected generateId(): EntityId {
    return Date.now() + Math.random();
  }

  equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    return this._id === object._id;
  }
}

