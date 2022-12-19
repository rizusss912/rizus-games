import { Model } from 'objection';

export class PassportModel extends Model {
	created_at!: string;
	updated_at!: string;
	deleted_at!: string;

	$beforeInsert() {
		this.created_at = new Date().toISOString();
	}

	$beforeUpdate() {
		this.updated_at = new Date().toISOString();
	}
}
