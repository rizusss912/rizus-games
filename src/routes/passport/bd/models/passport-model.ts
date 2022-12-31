import { Model } from 'objection';

export class PassportModel extends Model {
	createdAt!: string;
	updatedAt!: string;
	deletedAt!: string;

	$beforeInsert() {
		this.createdAt = new Date().toISOString();
	}

	$beforeUpdate() {
		this.updatedAt = new Date().toISOString();
	}

	public get createdAtDate(): Date {
		return new Date(this.createdAt);
	}

	public get updatedAtDate(): Date {
		return new Date(this.createdAt);
	}

	public get createdAtTime(): number {
		return this.createdAtDate.getTime();
	}

	public get updatedAtTime(): number {
		return this.updatedAtDate.getTime();
	}
}
