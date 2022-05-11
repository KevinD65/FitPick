const { model, Schema, ObjectId } = require('mongoose');

const landmarkSchema = new Schema(
	{
		_id: {
			type: ObjectId,
			required: true
		},
		id: {
			type: Number,
			required: true
		},
		name: {
			type: String,
			required: true
		},
		ownerRegion: {
			type: String,
			required: true
		}
	}
);

const Landmark = model('Landmark', landmarkSchema);
module.exports = Landmark;