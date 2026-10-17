const Company = require('../../models/Company');

exports.getCompanyDetails = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({});
    }

    res.json({
      success: true,
      data: company,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCompanyDetails = async (req, res, next) => {
  try {
    const updateData = req.body;
    let company = await Company.findOne();

    if (!company) {
      company = await Company.create(updateData);
    } else {
      await company.update(updateData);
    }

    res.json({
      success: true,
      message: 'Company details updated successfully',
      data: company,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyForAdmin = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({});
    }

    res.json({
      success: true,
      data: company,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};
