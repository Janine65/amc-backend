const { Anlaesse } = require("../db");
const { Op,
  Sequelize
} = require("sequelize");


module.exports = {
  getData: function (req, res, next) {
    let isWhere = [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("anlaesse.datum")), { [Op.gte]: global.Parameter.get("CLUBJAHR") - 1 })];
    if (req.query) {
      
      if (req.query.istkegeln)
        isWhere.push({"istkegeln": req.query.istkegeln})
    }
    Anlaesse.findAll({
      attributes: {include:"longname"},
      where: isWhere,
      include: [
        { model: Anlaesse, as: 'linkedEvent', required: false, attributes: [["longname", "vorjahr"]] }],
      order: ["datum"]
    })
      .then((data) => res.json(data));
  },

  getOverviewData: async function (req, res, next) {
    // get a json file with the following information to display on first page:
    // count of anlaesse im system_param jahr
    // count of SAM_Mitglieder
    // count of not SAM_Mitglieder

    let arResult = [{ label: 'Total Anlässe', value: 0 }, { label: 'Zukünftige Anlässe', value: 0 }]
    let total = await Anlaesse.count({
      where: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), global.Parameter.get("CLUBJAHR")),
      { "status": 1 },
      { "istsamanlass": false },
      { "nachkegeln": false }]
    });
    arResult[0].value = total;
    total = await Anlaesse.count({
      where: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), global.Parameter.get("CLUBJAHR")),
      { "datum": { [Op.gte]: Sequelize.fn("NOW") } },
      { "status": 1 },
      { "istsamanlass": false },
      { "nachkegeln": false }]
    });
    arResult[1].value = total;

    res.json(arResult);
  },

  getOneData: function (req, res, next) {
    Anlaesse.findByPk(req.param.id).then((data) => res.json(data));
  },

  getFKData: function (req, res, next) {
		Anlaesse.findAll({ 
			attributes: ["id", ["longname", "value"]],
			where: [
	//			{"status": 1 },
				Sequelize.where(Sequelize.fn('LOWER', Sequelize.col("longname")), {[Op.substring]: (req.query.filter != null ? req.query.filter.value : '')})],
			order: [["datum","DESC"]]
			 })
		.then(data => res.json(data))
		.catch(e => next(e));		
  },

  removeData: function (req, res, next) {
    const data = JSON.parse(req.body);
    if (data == undefined) {
      throw Error("Record not correct");
    }
    console.info("delete: ", data);
    Anlaesse.findByPk(data.id)
      .then((anlass) =>
        anlass.destroy()
          .then((obj) =>
            res.json({
              id: obj.id,
            })
          )
          .catch(e => next(e))
      )
      .catch((e) => next(e));
  },

  addData: async function (req, res, next) {
    let data = JSON.parse(req.body);
		data.id = null;
    console.info("insert: ", data);
    const obj = await Anlaesse.create(data);
    res.json(obj)
  },

  updateData: async function (req, res, next) {
    let data = JSON.parse(req.body);
    if (data.id == 0 || data.id == null) {
      // insert
      data.id = null;
      let newRec = Anlaesse.build(data);
      newRec.isNewRecord = true;
      console.info("insert: anlass", data);
      try {
        const obj = await newRec.save();
        return res.json(obj);
      } catch (err) {
        return res.json(err);
      }
      
    } else {
      // update
      console.info("update: ", data);
      
      Anlaesse.findByPk(data.id)
        .then((anlass) =>
          anlass.update(data)
            .then((obj) =>
              res.json(obj)
            )
            .catch(e => next(e))
        )
        .catch(e => next(e));
    }
  },

};

