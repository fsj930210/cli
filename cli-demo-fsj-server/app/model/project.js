module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ProjectSchema = new Schema({
    name: { type: String  },
    value: { type: String  },
    npmName: { type: String},
    version: { type: String },
    team: {type: String },
    ignore: { type: Array }
  });

  return mongoose.model('project', ProjectSchema);
}